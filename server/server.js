import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import eventsRouter from './routes/events.js'
import authRouter from './routes/auth.js'
import contactsRouter from './routes/contacts.js'
import twoFaRouter from './routes/2fa.js'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// connect to MongoDB (if MONGO_URI provided in env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moonbase'
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.warn('MongoDB connection error:', err.message || err))

const __dirname = path.resolve();
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Mount API routes
app.use('/api/events', eventsRouter)
app.use('/api/auth', authRouter)
app.use('/api/auth/2fa', twoFaRouter)
app.use('/api/contacts', contactsRouter)

// Development helper: issue a simple JWT for testing protected routes
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/dev-token', (req, res) => {
        const email = req.query.email || 'dev@local'
        const token = jwt.sign({ email, dev: true }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' })
        res.json({ token })
    })
}

// Store accounts in memory
let accounts = [];

// GET all accounts (for crew list)
app.get('/api/accounts', (req, res) => {
    const safeAccounts = accounts.map(acc => ({
        _id: acc._id,
        fullName: acc.fullName,
        email: acc.email,
        createdAt: acc.createdAt,
        status: acc.status || 'active',
        location: acc.location || 'Command Center'
    }));
    res.json(safeAccounts);
});

// POST create new account
app.post('/api/accounts', (req, res) => {
    const { fullName, email, securityCode } = req.body;

    if (!fullName || !email || !securityCode) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (accounts.find(acc => acc.email === email)) {
        return res.status(409).json({ message: 'Email already registered' });
    }

    const newAccount = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fullName,
        email,
        securityCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        location: 'Command Center',
        __v: 0
    };

    accounts.push(newAccount);

    res.status(201).json({
        message: 'Account created successfully',
        account: newAccount
    });
});

// Simple REST logging endpoint
app.post('/api/log', (req, res) => {
    const { protocol, timestamp, broadcast, user } = req.body;
    console.log(`[LOG] protocol=${protocol} user=${user || 'unknown'} timestamp=${timestamp} broadcast=${broadcast}`);
    return res.json({ ok: true });
});

// (SPA fallback will be mounted after API routes)

import fs from 'fs';

// Subscribers storage (simple file-backed list)
const subscribersDir = path.join(__dirname, 'data')
const subscribersFile = path.join(subscribersDir, 'subscribers.json')
try {
    if (!fs.existsSync(subscribersDir)) fs.mkdirSync(subscribersDir, { recursive: true })
    if (!fs.existsSync(subscribersFile)) fs.writeFileSync(subscribersFile, JSON.stringify([]))
} catch (err) {
    console.error('Failed to ensure subscribers storage:', err)
}

app.post('/api/subscribe', (req, res) => {
    const { email, name, source } = req.body || {}
    if (!email) return res.status(400).json({ message: 'Email is required' })

    let list = []
    try {
        list = JSON.parse(fs.readFileSync(subscribersFile, 'utf8') || '[]')
    } catch (err) {
        list = []
    }

    if (list.find((s) => s.email && s.email.toLowerCase() === email.toLowerCase())) {
        return res.json({ ok: true, message: 'Already subscribed' })
    }

    const entry = { email, name: name || null, source: source || null, createdAt: new Date().toISOString() }
    list.push(entry)
    try {
        fs.writeFileSync(subscribersFile, JSON.stringify(list, null, 2))
        console.log('New subscriber:', email)
    } catch (err) {
        console.error('Failed to save subscriber:', err)
    }

    return res.status(201).json({ ok: true, subscriber: entry })
})

// POST /api/run/python -> execute provided Python code in a subprocess and return stdout/stderr
app.post('/api/run/python', async (req, res) => {
    const { code } = req.body || {}
    if (typeof code !== 'string') return res.status(400).json({ error: 'code is required' })

    // write code to a temp file
    const tmpDir = path.join(__dirname, 'tmp')
    try { if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true }) } catch (e) {}
    const filename = path.join(tmpDir, `run-${Date.now()}-${Math.random().toString(36).slice(2,8)}.py`)
    try { fs.writeFileSync(filename, code, 'utf8') } catch (err) { return res.status(500).json({ error: 'failed to write temp file' }) }

    const { spawn } = await import('child_process')
    const proc = spawn('python3', ['-u', filename], { stdio: ['ignore', 'pipe', 'pipe'] })

    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timer = setTimeout(() => {
        timedOut = true
        try { proc.kill('SIGTERM') } catch(e){}
    }, 5000) // 5s timeout

    proc.stdout.on('data', (d) => { stdout += String(d) })
    proc.stderr.on('data', (d) => { stderr += String(d) })

    proc.on('close', (code) => {
        clearTimeout(timer)
        // remove temp file
        try { fs.unlinkSync(filename) } catch (e) {}
        res.json({ ok: true, code, stdout, stderr, timedOut })
    })
    proc.on('error', (err) => {
        clearTimeout(timer)
        try { fs.unlinkSync(filename) } catch (e) {}
        res.status(500).json({ error: String(err) })
    })
})

// Create server + WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
// expose wss on app so routes can broadcast
// Removed wss exposure
// app.locals.wss = wss
let emergencyActive = false;
let emergencyTimeout = null;

wss.on('connection', (ws) => {
    console.log('🟢 WS Connected. Clients:', wss.clients.size);

    if (emergencyActive) {
        ws.send(JSON.stringify({ type: 'emergency_triggered', user: 'SYSTEM' }));
    }

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw);

            if (data.type === 'emergency_trigger') {
                if (emergencyActive) return;
                console.log('🚨 Emergency triggered by', data.user || 'unknown');
                emergencyActive = true;

                const payload = JSON.stringify({
                    type: 'emergency_triggered',
                    user: data.user || 'unknown',
                    timestamp: new Date().toISOString(),
                });

                wss.clients.forEach((client) => {
                    if (client.readyState === ws.OPEN) {
                        client.send(payload);
                    }
                });

                if (emergencyTimeout) clearTimeout(emergencyTimeout);

                emergencyTimeout = setTimeout(() => {
                    emergencyActive = false;
                    console.log('✅ Emergency cleared');
                    const clearMsg = JSON.stringify({ type: 'emergency_cleared' });
                    wss.clients.forEach((client) => {
                        if (client.readyState === ws.OPEN) {
                            client.send(clearMsg);
                        }
                    });
                    emergencyTimeout = null;
                }, 8000);
            }
        } catch (err) {
            console.error('Invalid WS message payload:', err);
        }
    });

    ws.on('close', () => {
        console.log('🔴 WS Disconnected. Clients:', wss.clients.size);
    });

    ws.on('error', (err) => console.error('WS Error:', err));
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyCBZkdhuerhNJAk_CvWm5fKWOeDG7t3b0M");
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// POST /api/ai/chat
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, systems, facilities, crew, timestamp } = req.body;

        const context = `
You are an AI assistant for a space station monitoring system.
Use telemetry data and crew/facility info to give accurate, calm, and useful answers.

SYSTEMS DATA:
${JSON.stringify(systems, null, 2)}

FACILITIES:
${JSON.stringify(facilities, null, 2)}

CREW MEMBERS:
${JSON.stringify(crew, null, 2)}

User message: ${message.content}
Time: ${timestamp}
`;

        const result = await model.generateContent(context);
        const aiResponse = result.response.text();

        res.json({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            role: 'assistant',
            content: 'I encountered an error processing your request. Please try again later.',
            error: error.message
        });
    }
});

// POST /api/auth/google -> verify id_token with Google and create/find account
app.post('/api/auth/google', async (req, res) => {
    const { id_token } = req.body || {}
    if (!id_token) return res.status(400).json({ message: 'id_token required' })

    try {
        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`)
        if (!resp.ok) {
            const text = await resp.text()
            return res.status(400).json({ message: 'Invalid token', detail: text })
        }
        const info = await resp.json()
        const email = info.email
        const fullName = info.name || info.given_name || ''
        if (!email) return res.status(400).json({ message: 'No email in token' })

        // find or create account
        let account = accounts.find(a => a.email && a.email.toLowerCase() === email.toLowerCase())
        if (!account) {
            account = {
                _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                fullName: fullName || 'Google User',
                email,
                securityCode: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active',
                location: 'Command Center',
                __v: 0
            }
            accounts.push(account)
        }

        return res.json({ ok: true, account })
    } catch (err) {
        console.error('Google token verify error', err)
        return res.status(500).json({ message: 'Token verification failed' })
    }
})

// POST /api/signup -> simple account creation for email/phone
// Simple double opt-in signup: create a pending token and require /api/confirm to activate
const pendingDir = path.join(__dirname, 'data')
const pendingFile = path.join(pendingDir, 'pending_signups.json')
try {
    if (!fs.existsSync(pendingDir)) fs.mkdirSync(pendingDir, { recursive: true })
    if (!fs.existsSync(pendingFile)) fs.writeFileSync(pendingFile, JSON.stringify([]))
} catch (err) {
    console.error('Failed to ensure pending storage:', err)
}

app.post('/api/signup', (req, res) => {
    const { email, fullName } = req.body || {}
    if (!email) return res.status(400).json({ message: 'Email is required' })
    if (accounts.find(a => a.email && a.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ message: 'Email already registered' })
    }

    // generate a short numeric code for verification
    const code = ('' + Math.floor(100000 + Math.random() * 900000)).slice(0, 6)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString() // 15 minutes

    let pending = []
    try {
        pending = JSON.parse(fs.readFileSync(pendingFile, 'utf8') || '[]')
    } catch (err) { pending = [] }

    pending = pending.filter(p => !(p.email && p.email.toLowerCase() === email.toLowerCase()))
    const entry = { email, fullName: fullName || null, code, createdAt: new Date().toISOString(), expiresAt }
    pending.push(entry)

    try {
        fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2))
        console.log('Pending signup created for', email, 'code=', code)
    } catch (err) {
        console.error('Failed to save pending signup:', err)
    }

    // In a real app: send verification email/SMS with the code or link. For dev, return the code in response.
    return res.status(200).json({ ok: true, message: 'Verification sent', code })
})

// POST /api/confirm -> verify code and activate account
app.post('/api/confirm', (req, res) => {
    const { token, email } = req.body || {}
    if (!token) return res.status(400).json({ message: 'token required' })

    let pending = []
    try { pending = JSON.parse(fs.readFileSync(pendingFile, 'utf8') || '[]') } catch (err) { pending = [] }

    const idx = pending.findIndex(p => p.code === token || (email && p.email && p.email.toLowerCase() === (email || '').toLowerCase()))
    if (idx === -1) return res.status(400).json({ message: 'Invalid or expired token' })

    const p = pending[idx]
    if (new Date(p.expiresAt) < new Date()) {
        // remove expired
        pending.splice(idx, 1)
        try { fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2)) } catch (err) {}
        return res.status(400).json({ message: 'Token expired' })
    }

    // create account
    const newAccount = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fullName: p.fullName || null,
        email: p.email,
        securityCode: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        location: 'Command Center',
        __v: 0
    }
    accounts.push(newAccount)

    // remove pending
    pending.splice(idx, 1)
    try { fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2)) } catch (err) { console.error(err) }

    console.log('Activated account for', newAccount.email)
    return res.status(201).json({ ok: true, account: newAccount })
})

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
        if (process.env.NODE_ENV === 'production') {
                res.sendFile(path.join(publicPath, 'index.html'));
        } else {
                res.status(200).send('Moonbase backend running. No static build found.');
        }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server + WS running on port ${PORT}`));
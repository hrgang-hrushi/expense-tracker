import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Admin from '../models/admin.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// POST /api/auth/register  (dev only)
router.post('/register', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Disabled' })
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const existing = await Admin.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email exists' })
    const passwordHash = await bcrypt.hash(password, 10)
    const admin = new Admin({ name, email, passwordHash })
    await admin.save()
    res.status(201).json({ message: 'Admin created' })
  } catch (err) {
    console.error('Register error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    const admin = await Admin.findOne({ email })
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, admin.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    // If admin has 2FA enabled, return a temp token to proceed with TOTP verification
    if (admin.twoFactorEnabled) {
      const tempToken = jwt.sign({ id: admin._id, email: admin.email, twoFactor: 'pending' }, JWT_SECRET, { expiresIn: '5m' })
      return res.json({ need2fa: true, tempToken })
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '8h' })
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } })
  } catch (err) {
    console.error('Login error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

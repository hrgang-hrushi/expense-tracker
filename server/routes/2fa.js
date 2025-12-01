import express from 'express'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import jwt from 'jsonwebtoken'
import Admin from '../models/admin.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// GET /api/auth/2fa/setup
// Generates a temporary secret and returns otpauthUrl and a QR data URL
router.get('/setup', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id)
    if (!admin) return res.status(404).json({ message: 'User not found' })

    const secret = speakeasy.generateSecret({ name: `Moonbase (${admin.email})`, length: 20 })

    // Save temp secret on the admin
    admin.twoFactorTempSecret = secret.base32
    await admin.save()

    const otpauthUrl = secret.otpauth_url
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl)

    // For dev: include secret in response. In production avoid returning the secret itself.
    res.json({ otpauthUrl, qrDataUrl, secret: secret.base32 })
  } catch (err) {
    console.error('2FA setup error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/2fa/verify
// Verify the code entered by the user and enable 2FA
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body
    const admin = await Admin.findById(req.user.id)
    if (!admin || !admin.twoFactorTempSecret) return res.status(400).json({ message: 'No 2FA setup in progress' })

    const verified = speakeasy.totp.verify({ secret: admin.twoFactorTempSecret, encoding: 'base32', token, window: 1 })
    if (!verified) return res.status(400).json({ message: 'Invalid code' })

    admin.twoFactorSecret = admin.twoFactorTempSecret
    admin.twoFactorTempSecret = null
    admin.twoFactorEnabled = true
    await admin.save()

    res.json({ message: '2FA enabled' })
  } catch (err) {
    console.error('2FA verify error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/2fa/login
// Complete login after password step using tempToken + TOTP token
router.post('/login', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: 'No token' })
    const parts = authHeader.split(' ')
    if (parts.length !== 2) return res.status(401).json({ message: 'Invalid header' })
    const tempToken = parts[1]

    let payload
    try { payload = jwt.verify(tempToken, JWT_SECRET) } catch (err) { return res.status(401).json({ message: 'Invalid temp token' }) }
    if (!payload || payload.twoFactor !== 'pending') return res.status(401).json({ message: 'Invalid temp token' })

    const { token } = req.body
    const admin = await Admin.findById(payload.id)
    if (!admin || !admin.twoFactorSecret) return res.status(400).json({ message: '2FA not enabled' })

    const ok = speakeasy.totp.verify({ secret: admin.twoFactorSecret, encoding: 'base32', token, window: 1 })
    if (!ok) return res.status(401).json({ message: 'Invalid 2FA token' })

    // Issue final auth token
    const finalToken = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '8h' })
    res.json({ token: finalToken, admin: { id: admin._id, name: admin.name, email: admin.email } })
  } catch (err) {
    console.error('2FA login error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

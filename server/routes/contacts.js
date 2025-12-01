import express from 'express'
import Contact from '../models/contact.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public: POST /api/contacts - submit contact form
router.post('/', async (req, res) => {
  try {
    const { fullName, email, message, phone, source } = req.body
    if (!fullName || !email) return res.status(400).json({ message: 'Name and email required' })
    const c = new Contact({ fullName, email, message, phone, source })
    const saved = await c.save()

    // Broadcast via WS if available
    try {
      const { wss } = req.app.locals
      if (wss) {
        const payload = JSON.stringify({ type: 'contact_received', contact: saved })
        wss.clients.forEach(client => { if (client.readyState === 1) client.send(payload) })
      }
    } catch (e) {
      console.warn('WS contact broadcast failed', e)
    }

    res.status(201).json(saved)
  } catch (err) {
    console.error('POST /api/contacts', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Protected: GET /api/contacts - list submissions for admins
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await Contact.find().sort({ createdAt: -1 }).lean()
    res.json(list)
  } catch (err) {
    console.error('GET /api/contacts', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Protected: GET /api/contacts/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const c = await Contact.findById(req.params.id).lean()
    if (!c) return res.status(404).json({ message: 'Not found' })
    res.json(c)
  } catch (err) {
    console.error('GET /api/contacts/:id', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Protected: PATCH /api/contacts/:id - mark read/archived or update small fields
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = {}
    if (typeof req.body.read === 'boolean') updates.read = req.body.read
    if (typeof req.body.archived === 'boolean') updates.archived = req.body.archived

    // Allow small note update optionally
    if (typeof req.body.note === 'string') updates.note = req.body.note

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid fields to update' })

    const updated = await Contact.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean()
    if (!updated) return res.status(404).json({ message: 'Not found' })

    // Broadcast via WS to admins if available
    try {
      const { wss } = req.app.locals
      if (wss) {
        const payload = JSON.stringify({ type: 'contact_updated', contact: updated })
        wss.clients.forEach(client => { if (client.readyState === 1) client.send(payload) })
      }
    } catch (bErr) {
      console.warn('WS broadcast failed for contact update', bErr)
    }

    res.json(updated)
  } catch (err) {
    console.error('PATCH /api/contacts/:id', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

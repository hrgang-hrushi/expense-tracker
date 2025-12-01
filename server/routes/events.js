import express from 'express'
import Event from '../models/event.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1 }).lean()
    res.json(events)
  } catch (err) {
    console.error('GET /api/events error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/events (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const ev = new Event(req.body)
    const saved = await ev.save()

    // Broadcast via WebSocket if available on app
    try {
      const { wss } = req.app.locals
      if (wss) {
        const payload = JSON.stringify({ type: 'event_created', event: saved })
        wss.clients.forEach(client => {
          if (client.readyState === 1) client.send(payload)
        })
      }
    } catch (bErr) {
      console.warn('WebSocket broadcast failed', bErr)
    }

    res.status(201).json(saved)
  } catch (err) {
    console.error('POST /api/events error', err)
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/events/:id (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json(updated)
  } catch (err) {
    console.error('PUT /api/events/:id error', err)
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/events/:id (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/events/:id error', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

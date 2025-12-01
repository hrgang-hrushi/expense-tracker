const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const WebSocket = require('ws')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Map locationId -> Set of ws clients
const subs = new Map()

function subscribeClient(locationId, ws) {
  if (!subs.has(locationId)) subs.set(locationId, new Set())
  subs.get(locationId).add(ws)
}

function unsubscribeClient(locationId, ws) {
  if (!subs.has(locationId)) return
  subs.get(locationId).delete(ws)
}

wss.on('connection', (ws, req) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg)
      const { action, locationId } = data
      if (action === 'subscribe' && locationId) {
        subscribeClient(locationId, ws)
        ws.send(JSON.stringify({ type: 'subscribed', locationId }))
      } else if (action === 'unsubscribe' && locationId) {
        unsubscribeClient(locationId, ws)
        ws.send(JSON.stringify({ type: 'unsubscribed', locationId }))
      }
    } catch (e) {
      console.warn('Malformed message', msg)
    }
  })

  ws.on('close', () => {
    // remove from all subs
    for (const [loc, set] of subs.entries()) {
      if (set.has(ws)) set.delete(ws)
      if (set.size === 0) subs.delete(loc)
    }
  })
})

// HTTP endpoint to emit an event to subscribers (for demo/testing)
// POST /emit { locationId: 'loc-1', slot: { id, start, bookingUrl } }
app.post('/emit', (req, res) => {
  const { locationId, slot } = req.body
  if (!locationId || !slot) return res.status(400).json({ error: 'locationId and slot required' })

  const payload = JSON.stringify({ type: 'slot_open', locationId, slot, timestamp: new Date().toISOString() })
  const clients = subs.get(locationId)
  if (!clients || clients.size === 0) {
    return res.json({ ok: true, delivered: 0 })
  }

  let delivered = 0
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
      delivered++
    }
  }

  res.json({ ok: true, delivered })
})

// Simple health
app.get('/health', (req, res) => res.json({ ok: true }))

const port = process.env.PORT || 4000
server.listen(port, () => console.log(`Mock notify server listening on http://localhost:${port}`))

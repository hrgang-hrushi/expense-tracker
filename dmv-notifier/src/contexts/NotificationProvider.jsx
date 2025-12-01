import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getSlotsForLocation } from '../services/dmvApi'

const STORAGE_KEY = 'dmv_notifier_prefs'
const WS_URL = (process.env.NODE_ENV === 'development' ? 'ws://localhost:4000' : 'ws://localhost:4000')

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [prefs, setPrefs] = useState({})
  const wsRef = useRef(null)
  const pendingSubsRef = useRef(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPrefs(JSON.parse(raw))
    } catch (e) {
      console.warn('Failed reading prefs', e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    // when prefs change, inform WS (subscribe/unsubscribe)
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // remember desired subscriptions and apply on connect
      Object.keys(prefs).forEach((loc) => pendingSubsRef.current.add(loc))
      return
    }
    // send subscribe/unsubscribe for each location
    Object.keys(prefs).forEach((loc) => {
      if (prefs[loc].enabled) ws.send(JSON.stringify({ action: 'subscribe', locationId: loc }))
    })
  }, [prefs])

  // connect websocket
  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.addEventListener('open', () => {
      // re-subscribe to enabled prefs
      Object.keys(prefs).forEach((loc) => {
        if (prefs[loc].enabled) ws.send(JSON.stringify({ action: 'subscribe', locationId: loc }))
      })
      // apply any pending subs
      for (const loc of pendingSubsRef.current) {
        ws.send(JSON.stringify({ action: 'subscribe', locationId: loc }))
      }
      pendingSubsRef.current.clear()
    })

    ws.addEventListener('message', (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data.type === 'slot_open') {
          handleIncomingEvent(data)
        }
      } catch (e) {
        console.warn('Invalid ws message', evt.data)
      }
    })

    ws.addEventListener('close', () => {
      // reconnect with backoff
      setTimeout(() => {
        // create new connection by updating ref (useEffect will not re-run); do recursive reconnect
        wsRef.current = null
        // quick reconnect logic
        if (!wsRef.current) {
          try {
            const next = new WebSocket(WS_URL)
            wsRef.current = next
          } catch (e) {
            // ignore here
          }
        }
      }, 2000)
    })

    return () => {
      try {
        ws.close()
      } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // clean up subscriptions on unload
    const handler = () => {
      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        Object.keys(prefs).forEach((loc) => {
          if (prefs[loc].enabled) ws.send(JSON.stringify({ action: 'unsubscribe', locationId: loc }))
        })
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [prefs])

  const showNotificationOrAlert = useCallback((title, body, data) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, { body, data })
        n.onclick = () => {
          if (data && data.bookingUrl) window.open(data.bookingUrl, '_blank')
        }
        return
      } catch (e) {
        console.warn('Notification failed', e)
      }
    }
    // fallback: simple in-app alert for prototype
    if (data && data.bookingUrl) {
      if (confirm(`${title}\n${body}\nOpen booking?`)) window.open(data.bookingUrl, '_blank')
    } else {
      alert(`${title}\n${body}`)
    }
  }, [])

  const handleIncomingEvent = useCallback(
    (evt) => {
      const { locationId, slot } = evt
      const pref = prefs[locationId]
      if (!pref || !pref.enabled) return
      // check muteUntil etc. (omitted for brevity)
      const title = `New DMV appointment at ${locationId}`
      const body = new Date(slot.start).toLocaleString()
      showNotificationOrAlert(title, body, { bookingUrl: slot.bookingUrl, locationId })
    },
    [prefs, showNotificationOrAlert]
  )

  const registerPref = useCallback(async (locationId, options = { frequency: 'instant' }) => {
    setPrefs((p) => ({ ...p, [locationId]: { locationId, enabled: true, frequency: options.frequency } }))
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'subscribe', locationId }))
    } else {
      pendingSubsRef.current.add(locationId)
    }
  }, [])

  const unregisterPref = useCallback(async (locationId) => {
    setPrefs((p) => {
      const copy = { ...p }
      delete copy[locationId]
      return copy
    })
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'unsubscribe', locationId }))
    }
    pendingSubsRef.current.delete(locationId)
  }, [])

  // For backwards-compat demo: a helper to fetch a slot and present it locally (keeps existing UI button working)
  const simulateEventFor = useCallback(
    async (locationId) => {
      const slots = await getSlotsForLocation(locationId)
      const slot = slots && slots[0]
      if (!slot) return
      handleIncomingEvent({ locationId, slot })
    },
    [handleIncomingEvent]
  )

  return (
    <NotificationContext.Provider value={{ prefs, registerPref, unregisterPref, simulateEventFor }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}

import { useEffect, useMemo, useState } from 'react'

// Simple types
type Peer = {
  id: string
  name: string
  color: string
  avatarLetter: string
  position: { x: number; y: number }
}

type Toast = { id: string; message: string }

// Utility: random color palette
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}

// Mock collaboration hook: simulates peers joining, movement, and basic API
export function useCollaboration({ userName = 'User' } = {}) {
  const [peers, setPeers] = useState<Peer[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [documentText, setDocumentText] = useState<string>("// Start coding collaboratively\n")
  const [docName] = useState('Untitled.js')
  const [permission, setPermission] = useState<'view'|'comment'|'edit'>('edit')

  // On mount: create a few mock peers that join after delays
  useEffect(() => {
    const timers: number[] = []
    function addMock(name: string, delay: number) {
      const t = window.setTimeout(() => {
        const p: Peer = {
          id: uid('p_'),
          name,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          avatarLetter: name[0].toUpperCase(),
          position: { x: 60 + Math.random() * 300, y: 60 + Math.random() * 200 }
        }
        setPeers((s) => [...s, p])
        pushToast(`${name} joined the file`)
      }, delay)
      timers.push(t)
    }

    addMock('Ava', 1200)
    addMock('Sam', 2500)
    addMock('Lee', 4200)

    return () => timers.forEach(clearTimeout)
  }, [])

  // Simulate peer cursor movement periodically
  useEffect(() => {
    const id = window.setInterval(() => {
      setPeers((list) =>
        list.map((p) => ({
          ...p,
          position: { x: p.position.x + (Math.random() - 0.5) * 10, y: p.position.y + (Math.random() - 0.5) * 10 }
        }))
      )
    }, 900)

    return () => clearInterval(id)
  }, [])

  function pushToast(message: string) {
    const t = { id: uid('t_'), message }
    setToasts((s) => [...s, t])
    // auto-remove
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4000)
  }

  // Mock API to generate share link
  function generateShareLink() {
    const link = `${location.origin}/join/${uid('share_')}`
    pushToast('Share link copied to clipboard (mock)')
    // emulate clipboard
    try { navigator.clipboard?.writeText(link) } catch {}
    return link
  }

  // Autosave document to localStorage
  useEffect(() => {
    try { localStorage.setItem('collab:doc', documentText) } catch {}
  }, [documentText])

  // Mock invite by email
  function inviteByEmail(email: string) {
    pushToast(`Invite sent to ${email} (mock)`)
    // also simulate immediate join
    const name = email.split('@')[0]
    const p = {
      id: uid('p_'),
      name,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      avatarLetter: name[0].toUpperCase(),
      position: { x: 120 + Math.random() * 200, y: 120 + Math.random() * 60 }
    }
    setPeers((s) => [...s, p])
    pushToast(`${name} joined the file`)
  }

  function updateLocal(newText: string) {
    setDocumentText(newText)
    // In a real system, we'd emit typing events. We'll just simulate broadcasting
  }

  // Expose actions and state
  return {
    peers,
    toasts,
    documentText,
    docName,
    generateShareLink,
    inviteByEmail,
    updateLocal,
    setPermission: (p: 'view'|'comment'|'edit') => setPermission(p),
    permission
  }
}

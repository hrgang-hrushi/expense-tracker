import React, { useEffect, useRef, useState } from 'react'

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    return null
  }
}

function EmailCapture({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE || ''

  async function submit(e) {
    e && e.preventDefault()
    if (!email) return alert('Please enter an email')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'manual' }),
      })
      await res.json()
      setLoading(false)
      setEmail('')
      setName('')
      onSuccess && onSuccess()
      alert('Thanks — you are subscribed!')
    } catch (err) {
      setLoading(false)
      console.error(err)
      alert('Subscription failed')
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
      />
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
      />
      <button type="submit" className="cta" style={{ padding: '8px 12px' }} disabled={loading}>
        {loading ? 'Saving…' : 'Subscribe'}
      </button>
    </form>
  )
}

export default function GoogleSignIn() {
  const containerRef = useRef(null)
  const [clientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
  const API_BASE = import.meta.env.VITE_API_BASE || ''
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!clientId) return

    function init() {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const payload = decodeJwt(response.credential)
          const email = payload?.email
          const name = payload?.name || payload?.given_name
          if (!email) return alert('Failed to read email from Google credential')
          try {
            await fetch(`${API_BASE}/api/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name, source: 'google' }),
            })
            setSubscribed(true)
            alert('Thanks — you are subscribed!')
          } catch (err) {
            console.error(err)
            alert('Subscription failed')
          }
        },
      })

      // render the Google Sign-In button into our container
      try {
        window.google.accounts.id.renderButton(containerRef.current, { theme: 'outline', size: 'large' })
      } catch (err) {
        // ignore render errors
      }
    }

    // If script already loaded, init immediately
    if (window.google && window.google.accounts && window.google.accounts.id) {
      init()
    } else {
      const existing = document.getElementById('google-identity')
      if (!existing) {
        // The script is added in index.html, but if it's not there we still try to add it
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true
        s.defer = true
        s.id = 'google-identity'
        s.onload = init
        document.head.appendChild(s)
      } else {
        existing.onload = init
      }
    }
  }, [clientId])

  if (!clientId) {
    return (
      <div style={{ marginTop: 16 }}>
        <EmailCapture onSuccess={() => setSubscribed(true)} />
        {subscribed && <p style={{ color: 'green' }}>Subscribed — thanks!</p>}
      </div>
    )
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div ref={containerRef} />
      {subscribed && <p style={{ color: 'green' }}>Subscribed — thanks!</p>}
    </div>
  )
}

// also export the EmailCapture so other components can render the plain subscribe form
export { EmailCapture }

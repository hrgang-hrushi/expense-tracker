import React, { useEffect, useRef, useState } from 'react'

export default function GoogleAuthButton({ onSuccess }) {
  const ref = useRef(null)
  const [clientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
  const API_BASE = import.meta.env.VITE_API_BASE || ''

  useEffect(() => {
    if (!clientId) return

    const handleResponse = async (resp) => {
      try {
        const r = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: resp.credential }),
        })
        const json = await r.json()
        if (r.ok) {
          onSuccess && onSuccess(json.account || json)
          // don't alert loudly in production; for dev it's OK
          alert('Welcome ' + (json.account?.fullName || json.account?.email || ''))
        } else {
          console.error('Google auth failed', json)
          alert('Sign-in failed')
        }
      } catch (err) {
        console.error(err)
        alert('Sign-in error')
      }
    }

    const init = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleResponse })
      try { window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large' }) } catch (e) {}
    }

    if (window.google && window.google.accounts && window.google.accounts.id) init()
    else {
      const s = document.getElementById('google-identity')
      if (s) s.onload = init
      else {
        const script = document.createElement('script')
        script.id = 'google-identity'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = init
        document.head.appendChild(script)
      }
    }
  }, [clientId])

  if (!clientId) {
    return (
      <button className="auth-btn" style={{ padding: 12, borderRadius: 10, background: '#f5f5f5' }}>
        Continue with Google
      </button>
    )
  }

  return <div ref={ref} />
}

import React, { useState } from 'react'
import { startGoogleAuth } from '../lib/oauth'

export default function GoogleAuthButton({ className, children }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flow, setFlow] = useState('')

  async function handleClick() {
    setError('')
    setLoading(true)
    try {
      // startGoogleAuth returns true when a redirect was initiated
      const ok = await startGoogleAuth()
      // If ok === true, we expect the browser to navigate away.
      if (ok) {
        setFlow('redirecting')
        // leave loading true briefly — redirect will occur
        return
      }

      // not configured or failed to redirect - show helpful message
      setError('No OAuth redirect was initiated. Check Appwrite/Google configuration or set VITE_GOOGLE_CLIENT_ID in .env.')
      setLoading(false)
    } catch (err) {
      console.error('startGoogleAuth error', err)
      setError(err?.message || String(err) || 'Unknown error starting auth')
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        className={className || 'auth-btn'}
        onClick={handleClick}
        disabled={loading}
        style={{ padding: '12px 22px', fontSize: 16, opacity: loading ? 0.8 : 1 }}
      >
        {loading ? (flow === 'redirecting' ? 'Redirecting…' : 'Starting sign in…') : (children || 'Continue with Google')}
      </button>

      {error && (
        <div style={{ marginTop: 12, color: '#ffdede', background: 'rgba(255,0,0,0.06)', padding: 10, borderRadius: 8 }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>Sign-in did not start</strong>
          <div style={{ fontSize: 13 }}>{error}</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            Try the <a href="/debug">debug page</a> for raw OAuth URLs and check DevTools for network/console errors.
          </div>
        </div>
      )}
    </div>
  )
}


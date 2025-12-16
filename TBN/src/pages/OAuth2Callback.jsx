import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initAppwrite } from '../lib/appwrite'

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [user, setUser] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Google's chosen response mode returns the id_token in the URL hash
    const hash = window.location.hash || ''
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const id_token = params.get('id_token') || params.get('idtoken')
    if (!id_token) {
      // If not present, redirect to signup page
      navigate('/signup')
      return
    }

    // Try Appwrite account.get() first when configured, otherwise fall back to id_token verification
    ;(async () => {
      const appwriteProject = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
      if (appwriteProject) {
        try {
          const acc = initAppwrite()
          if (acc) {
            try {
              const accountInfo = await acc.get()
              const u = accountInfo || {}
              const computedName = u.name || u.$id || u.displayName || u.email || ''
              setUser({ name: computedName, email: u.email || '' })
              try { localStorage.setItem('username', computedName) } catch (e) { /* ignore */ }
              setStatus('success')
              // redirect to welcome page with username in navigation state
              try {
                navigate('/welcome', { state: { username: computedName }, replace: true })
                return
              } catch (e) {
                // if navigate isn't available, just continue to render success UI
                console.warn('navigate failed', e)
                return
              }
            } catch (err) {
              console.error('Appwrite account.get failed', err)
              // fall through to id_token handling
            }
          }
        } catch (err) {
          console.error('Failed to initialize Appwrite', err)
        }
      }

      // Post the id_token to our backend to verify/create account
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || ''
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token }),
        })
        const json = await res.json()
        if (res.ok) {
          // successful auth — show success message with client name
          // backend may return user or name/email directly; handle both
          const u = json.user || json || {}
          const computedName = u.name || u.fullName || u.displayName || u.given_name || ''
          setUser({ name: computedName, email: u.email || '' })
          setStatus('success')
          // redirect to welcome page with username in navigation state
          try {
            navigate('/welcome', { state: { username: computedName }, replace: true })
            return
          } catch (e) {
            console.warn('navigate failed', e)
          }
        } else {
          console.error('Auth failed', json)
          setErrorMsg(json?.message || 'Authentication failed')
          setStatus('error')
        }
      } catch (err) {
        console.error(err)
        setErrorMsg(err.message || String(err))
        setStatus('error')
      }
    })()
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h3>Signing you in…</h3>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h3>Sign-in failed</h3>
        <p style={{ color: 'var(--muted)' }}>{errorMsg}</p>
        <div style={{ marginTop: 18 }}>
          <button className="cta" onClick={() => navigate('/signup')}>Back to sign up</button>
        </div>
      </div>
    )
  }

  // success
  const displayName = (user && (user.name || user.email)) || 'there'

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Welcome, {displayName}!</h2>
      <p style={{ color: 'var(--muted)' }}>Your account was created successfully.</p>

      <div style={{ marginTop: 18 }}>
        <p>Was this to contact us?</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <button className="cta" onClick={() => navigate('/contact-us', { state: { prefill: { name: user?.name || '', email: user?.email || '' } } })}>
            Yes — Contact us
          </button>
          <button className="cta cta--ghost" onClick={() => navigate('/')}>No — Continue</button>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { startGoogleAuth } from '../lib/oauth'
import { useLocation } from 'react-router-dom'

function ContactForm({ onDone }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE || ''

  async function submit(e) {
    e && e.preventDefault()
    if (!email) return alert('Please enter an email')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, location }),
      })
      if (res.ok) {
        alert('Thanks — we received your message. We will reach out soon.')
        setName('')
        setEmail('')
        setLocation('')
        onDone && onDone()
      } else {
        const j = await res.json().catch(() => null)
        console.error('Contact failed', j)
        alert('Submission failed')
      }
    } catch (err) {
      console.error(err)
      alert('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="cta" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Submit'}</button>
      </div>
    </form>
  )
}

export default function SignUp(){
  const location = useLocation()
  const qs = new URLSearchParams(location.search)
  const authed = qs.get('authed') === '1'
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    if (!authed) return
    // scroll to top so user sees the success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [authed])

  return (
    <div className="signup-page" style={{ maxWidth: 640, margin: '40px auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center' }}>Create an account</h2>
      <p style={{ textAlign: 'center' }}>Sign up quickly using Google.</p>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button
          className="auth-btn"
          onClick={async () => {
            const ok = await startGoogleAuth()
            if (!ok) window.alert('Google client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env')
          }}
          style={{ padding: '12px 22px', fontSize: 16 }}
        >
          Continue with Google
        </button>
      </div>

      {authed && (
        <div style={{ marginTop: 28, padding: 16, border: '1px solid #e6e6e6', borderRadius: 8, background: '#f9fff6' }}>
          <h3 style={{ marginTop: 0 }}>Signed up successfully 🎉</h3>
          <p>Was this sign up to contact us?</p>
          {!showContact ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cta" onClick={() => setShowContact(true)}>Contact us</button>
              <button onClick={() => window.location.href = '/'}>No thanks</button>
            </div>
          ) : (
            <ContactForm onDone={() => { setShowContact(false); window.location.href = '/' }} />
          )}
        </div>
      )}
    </div>
  )
}


import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OAuth2Callback(){
  const navigate = useNavigate()

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

    // Post the id_token to our backend to verify/create account
    (async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || ''
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token }),
        })
        const json = await res.json()
        if (res.ok) {
          // successful auth — navigate to dashboard or home
          navigate('/')
        } else {
          console.error('Auth failed', json)
          navigate('/signup')
        }
      } catch (err) {
        console.error(err)
        navigate('/signup')
      }
    })()
  }, [])

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h3>Signing you in…</h3>
    </div>
  )
}

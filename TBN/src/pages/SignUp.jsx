import React from 'react'

function redirectToGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  if (!clientId) {
    window.alert('Google client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env.local')
    return
  }
  const redirect = encodeURIComponent(window.location.origin + '/oauth2callback')
  const scope = encodeURIComponent('openid email profile')
  const nonce = Math.random().toString(36).slice(2)
  try { sessionStorage.setItem('oauth_nonce', nonce) } catch (e) {}
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=id_token&scope=${scope}&prompt=select_account&nonce=${nonce}`
  window.location.href = url
}

export default function SignUp(){
  return (
    <div className="signup-page" style={{ maxWidth: 640, margin: '40px auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center' }}>Create an account</h2>
      <p style={{ textAlign: 'center' }}>Sign up quickly using Google.</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button className="auth-btn" onClick={redirectToGoogle} style={{ padding: '12px 22px', fontSize: 16 }}>Continue with Google</button>
      </div>
    </div>
  )
}


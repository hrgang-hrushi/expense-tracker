import React, { useMemo } from 'react'
import GoogleAuthButton from '../components/GoogleAuthButton'

export default function SignUp(){
  const env = import.meta.env || {}
  const appwriteProject = env.VITE_APPWRITE_PROJECT_ID || ''
  const googleClient = env.VITE_GOOGLE_CLIENT_ID || ''
  const successUrl = typeof window !== 'undefined' ? window.location.origin + '/oauth2callback' : '/oauth2callback'

  const flow = useMemo(() => appwriteProject ? 'Appwrite OAuth' : (googleClient ? 'Direct Google' : 'None (no client configured)'), [appwriteProject, googleClient])

  return (
    <div className="signup-page" style={{ maxWidth: 640, margin: '40px auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center' }}>Create an account</h2>
      <p style={{ textAlign: 'center' }}>Sign up quickly using Google.</p>

      {/* Debug banner: shows which auth flow will be used and the redirect URL */}
      <div style={{ margin: '16px 0', padding: 12, borderRadius: 8, background: '#0b1220', color: '#d6e6ff', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>Auth flow</strong>
            <div style={{ color: '#bcd3ff' }}>{flow}</div>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>Redirect URL</strong>
            <div style={{ color: '#bcd3ff', maxWidth: 360, overflowWrap: 'anywhere' }}>{successUrl}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#9fb7ff' }}>Appwrite project: {appwriteProject ? 'yes' : 'no'}</div>
            <div style={{ fontSize: 12, color: '#9fb7ff' }}>Google client id: {googleClient ? 'yes' : 'no'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <GoogleAuthButton />
      </div>
    </div>
  )
}


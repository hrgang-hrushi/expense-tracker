import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './SignupSuccess.css'

export default function SignupSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const username = location.state?.username || localStorage.getItem('username') || 'Friend'
  // The gift link can be set via Vite env var VITE_GIFT_LINK or fallback to Google Docs.
  const giftUrl = import.meta.env.VITE_GIFT_LINK || 'https://docs.google.com'

  return (
    <div className="signup-success">
      <div className="ss-card">
        <h1 className="ss-heading">Hey {username} 👋</h1>
        <p className="ss-lead">Thanks for signing up — welcome to the community. Click below to redeem your welcome gift.</p>

        <div className="ss-actions">
          <a className="ss-btn ss-primary" href={giftUrl} target="_blank" rel="noreferrer">Redeem the gift</a>
          <button className="ss-btn ss-secondary" onClick={() => navigate('/')}>Go to dashboard</button>
        </div>
      </div>
    </div>
  )
}

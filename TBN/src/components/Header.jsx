import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header(){
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const onEventsClick = (e) => {
    e.preventDefault()
    // If already on home, just scroll. Otherwise navigate to home and request scroll.
    if(location.pathname === '/' ){
      const el = document.getElementById('events')
      if(el) el.scrollIntoView({ behavior: 'smooth' })
      else {
        // fallback: navigate to home with state
        navigate('/', { state: { scrollTo: 'events' } })
      }
    } else {
      navigate('/', { state: { scrollTo: 'events' } })
    }
  }

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="brand">Teen Business Network</Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <a href="/#events" onClick={onEventsClick}>Events</a>
          <Link to="/contact-us">Contact</Link>
          <a
            className="cta"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
              if (!clientId) return window.location.href = '/signup'
              const redirect = encodeURIComponent(window.location.origin + '/oauth2callback')
              const scope = encodeURIComponent('openid email profile')
              const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=id_token&scope=${scope}&prompt=select_account`
              window.location.href = url
            }}
          >
            Get started
          </a>
        </nav>
      </div>
    </header>
  )
}

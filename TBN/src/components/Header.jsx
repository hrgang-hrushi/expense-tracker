import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { startGoogleAuth } from '../lib/oauth'

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
            onClick={async (e) => {
                e.preventDefault()
                const ok = await startGoogleAuth()
                if (!ok) window.location.href = '/signup'
              }}
          >
            Get started
          </a>
        </nav>
      </div>
    </header>
  )
}

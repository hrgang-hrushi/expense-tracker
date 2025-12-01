import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Footer(){
  const navigate = useNavigate()
  const location = useLocation()

  const onEventsClick = (e) => {
    e.preventDefault()
    if(location.pathname === '/'){
      const el = document.getElementById('events')
      if(el) el.scrollIntoView({ behavior: 'smooth' })
      else navigate('/', { state: { scrollTo: 'events' } })
    } else {
      navigate('/', { state: { scrollTo: 'events' } })
    }
  }

  const onSubscribe = (e) => {
    e.preventDefault()
    // Visual-only subscribe for now
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Teen Business Network</div>
            <p className="footer-tagline">Empowering teens to build, learn, and launch together.</p>
            <div className="footer-socials">
              <a aria-label="Instagram" href="https://www.instagram.com/tbn.hyd/" target="_blank" rel="noreferrer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Explore</h4>
              <Link to="/">Home</Link>
              <a href="/ #events" onClick={onEventsClick}>Events</a>
              <Link to="/contact-us">Contact</Link>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
            </div>
            <div className="footer-col">
              <h4>Newsletter</h4>
              <form className="footer-newsletter" onSubmit={onSubscribe}>
                <input type="email" required placeholder="Your email" aria-label="Email address" />
                <button type="submit" className="cta">Subscribe</button>
              </form>
              <small className="newsletter-note">No spam. Unsubscribe anytime.</small>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Teen Business Network</p>
          <nav className="footer-bottom-nav">
            <Link to="/contact-us">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
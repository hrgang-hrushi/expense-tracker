import React from 'react'
import BlurText from './BlurText'
import { startGoogleAuth } from '../lib/oauth'

export default function Events(){
  const events = [
    {
      index: 1,
      title: 'Networking Brunch.',
      date: 'June 26th, 2025.',
      time: '2pm Onwards.',
      venue: 'This Is It Cafe, Sainikpuri, Secunderabad, Telangana 500094.',
      description: 'Meet Young founders, creators & ambitious minds over Tasty Food and Convo for FREE.',
      link: 'https://lu.ma/sho9n6iw',
      cta: 'Network Now',
      highlight: true,
    },
    {
      index: 2,
      title: 'Coming Soon.',
      date: 'NA',
      time: 'NA',
      venue: 'NA',
      description: 'NA',
      link: '#',
      cta: 'Network Now',
      highlight: false,
    },
    {
      index: 3,
      title: 'Coming Soon.',
      date: 'NA',
      time: 'NA',
      venue: 'NA',
      description: 'NA',
      link: '#',
      cta: 'Network Now',
      highlight: false,
    }
  ]

  return (
    <section id="events" className="events">
      <div className="events-header">
        <div>
          <h2><BlurText text="Upcoming Events." /></h2>
          <p><BlurText text="From power–packed talks to exclusive networking sessions — explore what’s next and never miss a chance to grow." /></p>
        </div>
        <a
          className="link-accent"
          href="/signup"
          onClick={async (e) => {
            e.preventDefault()
            const ok = await startGoogleAuth()
            if (!ok) window.location.href = '/signup'
          }}
        >
          Create account now
          <svg className="icon-ne" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 6 }}>
            <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16669M15.8334 10L10.0001 15.8334" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      <div className="event-grid">
        {events.map(evt => (
          <article key={evt.index} className={`event-card ${evt.highlight ? 'event-card--highlight' : 'event-card--dim'}`}>
            <div className="event-header">
              <div className="event-index">{evt.index}</div>
              <h3 className="event-title"><BlurText text={evt.title} /></h3>
            </div>
            <div className="event-meta">
              <p><span>Date:</span> {evt.date}</p>
              <p><span>Time:</span> {evt.time}</p>
              <p><span>Venue:</span> {evt.venue}</p>
              <p><span>Description:</span> {evt.description}</p>
            </div>
            <div className="event-actions">
              <a className={`event-cta ${evt.highlight ? '' : 'event-cta--ghost'}`} href={evt.link} target="_blank" rel="noreferrer">
                <svg className="icon-ne" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
                  <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16669M15.8334 10L10.0001 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {evt.cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

import React, { useState } from 'react'
import BlurText from './BlurText'

export default function Testimonials(){
  const items = [
    {
      quote: 'TBN makes networking effortless. Real people, real value, and an interface that just works—exactly what I needed.',
      name: 'Charan M.',
      role: 'Founder at Student X',
      avatar: 'https://framerusercontent.com/images/umNSxI3EVCYURleSxPSW4LeYCjM.png?scale-down-to=128',
      companyLogo: 'https://framerusercontent.com/images/CHEHDspkkFVLmH7O9pTqA5H6B4.png?scale-down-to=128'
    },
    {
      quote: 'TBN has enhanced my professional network and provided meaningful business exposure. Their support was integral to the success of my karting racing league, Velotorque.',
      name: 'Kshitij Patel',
      role: 'Founder at Velotorque',
      avatar: 'https://via.placeholder.com/128',
      companyLogo: null
    },
    {
      quote: 'From events to mentorship, everything is curated and high-signal. I met collaborators within a week.',
      name: 'Ananya R.',
      role: 'Student Entrepreneur',
      avatar: 'https://framerusercontent.com/images/CHEHDspkkFVLmH7O9pTqA5H6B4.png?scale-down-to=128'
    }
  ]

  const [index, setIndex] = useState(0)
  const prev = () => setIndex(i => (i - 1 + items.length) % items.length)
  const next = () => setIndex(i => (i + 1) % items.length)

  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2><BlurText text="Trusted by TBN Members Worldwide." /></h2>
        <p><BlurText text="Join a growing community that chooses TBN for real connections, premium events, and a member-first experience." /></p>
      </div>

      <div className="testimonials-frame">
        {/* Main panel */}
        <div className="testimonial-panel">
          <div className="testimonial-panel-inner">
            <div className="testimonial-top">
              <div className="testimonial-avatars">
                {items[index].companyLogo && (
                  <img className="avatar-back" src={items[index].companyLogo} alt="Company logo" />
                )}
                <img className="avatar-front" src={items[index].avatar} alt={items[index].name} />
              </div>
            </div>
            <div className="testimonial-quote">
              “{items[index].quote}”
            </div>
            <div className="testimonial-bottom">
              <div className="testimonial-author">
                <div className="author-line">
                  <strong>{items[index].name}</strong>
                  <span className="author-role">{items[index].role}</span>
                </div>
                <div className="author-sub">Member of TBN</div>
              </div>
              <div className="testimonial-count">{index + 1}/{items.length}</div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="testimonial-nav">
          <button className="nav-link" onClick={prev}><span className="chev">‹</span><span>Previous</span></button>
          <button className="nav-link" onClick={next}><span>Next</span><span className="chev">›</span></button>
        </div>
      </div>
    </section>
  )
}

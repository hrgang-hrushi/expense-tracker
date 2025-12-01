import React, { useState } from 'react'

export default function FAQ(){
  const [openIndex, setOpenIndex] = useState(null)

  // 8 FAQ items with real content
  const qas = [
    { 
      q: 'What is TBN, and why should I join?', 
      a: 'TBN is a youth-powered community that blends knowledge, networking, and growth opportunities—all in one space designed for future leaders.' 
    },
    { 
      q: "I'm not confident or experienced—can I still be a part?", 
      a: 'Absolutely. TBN is built for learners, not experts. Everyone here starts somewhere, and we grow together.' 
    },
    { 
      q: 'Who is TBN for?', 
      a: 'Students, young professionals, dreamers, and doers who are ready to learn, connect, and build their entrepreneurial mindset.' 
    },
    { 
      q: 'What do I actually get as a member?', 
      a: 'Access to Networking 101, exclusive forums, weekly business activities, surprise rewards, mentorship talks, and more—all in one place.' 
    },
    { 
      q: 'What makes TBN different from other communities?', 
      a: "We don't just offer content—we offer connections, action, and real opportunities through curated resources, forums, and events." 
    },
    { 
      q: 'Is TBN only for people in Hyderabad?', 
      a: "Not exactly. Our offline networking events are currently hosted in Hyderabad, but we're actively working to expand to the USA and beyond. If you're outside Hyderabad, you can still access all our virtual events and resources. Want to bring TBN to your city or school? Contact us—we'd love to collaborate!" 
    },
    { 
      q: 'What are the fees for transactions?', 
      a: "We optimize transaction fees to offer the best rates. You'll always see the fee before confirming a transaction." 
    },
    { 
      q: 'How do I contact you?', 
      a: "You can reach out to us anytime via email at teenbusinessnetwork@gmail.com, DM us on Instagram, or simply click the Contact Us button at the bottom of this page. We'd love to connect with you!" 
    },
  ]

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="faq">
      <div className="faq-header">
        <div>
          <h2>Your Questions, Answered</h2>
          <p>Find everything you need to know about TBN, from security to supported features.</p>
        </div>
        <a className="link-accent" href="/contact-us">
          Create account now
          <svg className="icon-ne" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 6 }}>
            <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16669M15.8334 10L10.0001 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      <div className="faq-frame">
        <div className="faq-grid">
        {qas.map((item, i) => (
          <div key={i} className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}>
            <button
              className="faq-question"
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
              aria-controls={`faq-panel-${i}`}
              id={`faq-button-${i}`}
            >
              <span>{item.q}</span>
              <span className="faq-icon" aria-hidden="true" style={{ transformOrigin: 'center' }}>
                {openIndex === i ? '−' : '+'}
              </span>
            </button>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-button-${i}`}
              hidden={openIndex !== i}
              className="faq-answer"
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 8, paddingBottom: 8 }}>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
      <div className="faq-cta">
        <h3>Ready to take your ideas further?</h3>
        <p>Join the next wave of young changemakers building, learning, and connecting through TBN. Start your journey now and unlock real-world opportunities.</p>
        <a className="cta" href="/contact-us"> 
          <svg className="icon-ne" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
            <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16669M15.8334 10L10.0001 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Contact TBN
        </a>
      </div>
    </section>
  )
}

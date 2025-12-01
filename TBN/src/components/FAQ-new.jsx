import React, { useState } from 'react'

export default function FAQ(){
  const [openIndex, setOpenIndex] = useState(null)
  
  const qas = [
    {q:'What is TBN?', a:'TBN is a youth-led entrepreneurial community connecting students with resources, events, and real networking opportunities to grow.'},
    {q:'How fast are transactions?', a:'Most transactions are processed instantly, but network congestion may cause slight delays.'},
    {q:'Is TBN secure?', a:'Yes, TBN uses top-tier security practices to keep your information safe.'},
    {q:'Do I need to verify my identity?', a:'Yes, for security and compliance, identity verification is required for certain activities.'},
    {q:'Which cryptocurrencies are supported?', a:'TBN supports a vast range of cryptocurrencies, including Bitcoin (BTC), Ethereum (ETH), and many others.'},
    {q:'Can I access TBN on mobile?', a:'Yes, TBN is fully optimized for both desktop and mobile, ensuring a seamless experience everywhere.'},
    {q:'What are the fees for transactions?', a:'Fees vary by transaction type. See our pricing page for details.'},
    {q:'How can I contact support?', a:'Our support team is available 24/7. Reach out via chat or email for any assistance.'},
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

      <div className="faq-grid">
        {qas.map((item, i) => (
          <div key={i} className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}>
            <button className="faq-question" onClick={() => toggle(i)}>
              <span>{item.q}</span>
              <span className="faq-icon">{openIndex === i ? '×' : '+'}</span>
            </button>
            {openIndex === i && (
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

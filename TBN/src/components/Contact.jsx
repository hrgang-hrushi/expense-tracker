import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import BlurText from './BlurText'

export default function Contact(){
  const { state } = useLocation()
  const prefill = (state && state.prefill) || {}
  const [name, setName] = useState(prefill.name || '')
  const [email, setEmail] = useState(prefill.email || '')
  const [locationVal, setLocationVal] = useState(prefill.location || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    try {
      // Demo POST — adapt to your API if available
      const API_BASE = import.meta.env.VITE_API_BASE || ''
      await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, location: locationVal }),
      }).catch(()=>{})
      setLoading(false)
      alert('Thanks — your message has been sent!')
      setName('')
      setEmail('')
      setLocationVal('')
    } catch (err) {
      setLoading(false)
      console.error(err)
      alert('Submission failed')
    }
  }

  return (
    <section className="contact-page" style={{padding:'80px 24px'}}>
      <div className="grid-container" style={{display:'flex',justifyContent:'center'}}>
        <div style={{width:'100%',maxWidth:900,textAlign:'center'}}>
          <h2 className="contact-heading" style={{fontSize:45,fontWeight:400,margin:0,lineHeight:'1.3'}}>
            <BlurText text="Ready to take grow your" /><br />
            <BlurText text="Network and Ideas?" />
          </h2>
          <p style={{color:'var(--muted)',maxWidth:760,margin:'18px auto 36px'}}><BlurText text="Join the next wave of young changemakers building, learning, and connecting through TBN. Start your journey now and unlock real-world opportunities." /></p>

          <div className="contact-frame" style={{margin:'0 auto',maxWidth:500}}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                <span className="visually-hidden">Name</span>
                <input className="contact-input" placeholder="Name" required value={name} onChange={(e)=>setName(e.target.value)} />
              </label>
              <label>
                <span className="visually-hidden">Email</span>
                <input className="contact-input" placeholder="Email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
              </label>
              <label>
                <span className="visually-hidden">Location</span>
                <input className="contact-input" placeholder="Location" value={locationVal} onChange={(e)=>setLocationVal(e.target.value)} />
              </label>

              <button className="cta contact-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Submit'}</button>
            </form>
          </div>

          <p style={{marginTop:28,color:'var(--muted)'}}>Or email us at <a href="mailto:teenbusinessnetwork@gmail.com" style={{color:'#00FFB2'}}>teenbusinessnetwork@gmail.com</a></p>
        </div>
      </div>
    </section>
  )
}

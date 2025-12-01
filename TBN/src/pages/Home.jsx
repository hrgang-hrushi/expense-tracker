import React, {useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import Tagline from '../components/Tagline'
import WhyTBN from '../components/WhyTBN'
import NetworkHub from '../components/NetworkHub'
import Events from '../components/Events'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'

export default function Home(){
  const location = useLocation()
  const navigate = useNavigate()

  // scroll to hash on mount or when navigated with state.scrollTo
  useEffect(()=>{
    const doScroll = (id) => {
      const el = document.getElementById(id)
      if(el) el.scrollIntoView({behavior:'smooth'})
    }

    // If navigated with state requesting a scroll (e.g. from Header), perform it
    if(location.state && location.state.scrollTo){
      const id = location.state.scrollTo
      // delay to ensure content is rendered
      requestAnimationFrame(()=> setTimeout(()=> doScroll(id), 50))
      // clear the navigation state so it doesn't re-trigger
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if(typeof window !== 'undefined' && window.location.hash){
      const id = window.location.hash.replace('#','')
      const el = document.getElementById(id)
      if(el) el.scrollIntoView({behavior:'smooth'})
    }
  },[location, navigate])

  return (
    <main>
      <Hero />
      <Tagline />
      <WhyTBN />
      <NetworkHub />
      <Events />
      <Testimonials />
      <FAQ />
    </main>
  )
}

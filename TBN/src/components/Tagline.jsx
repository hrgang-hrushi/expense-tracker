import React from 'react'
import BlurText from './BlurText'

export default function Tagline() {
  return (
    <section className="tagline-section">
      <h2 className="tagline-heading">
        <BlurText text="Built for simplicity, growth, and opportunity—empowering the next generation to connect, learn, and thrive effortlessly." delay={0.1} />
      </h2>
    </section>
  )
}

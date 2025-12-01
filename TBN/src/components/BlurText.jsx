import React, { useEffect, useRef, useState } from 'react'

export default function BlurText({ text, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            filter: isVisible ? 'blur(0px)' : 'blur(10px)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'filter 0.8s ease-out, opacity 0.8s ease-out, transform 0.8s ease-out',
            transitionDelay: isVisible ? `${delay + index * 0.05}s` : '0s',
            willChange: 'filter, opacity, transform',
            backfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

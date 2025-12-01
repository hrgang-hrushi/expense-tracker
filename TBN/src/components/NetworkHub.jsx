import React from 'react'
import { motion } from 'framer-motion'
import BlurText from './BlurText'

const tags = [
  'Ideation', 'Collaboration', 'Mentorship', 'Network', 'Growth',
  'Events', 'Accountability', 'Support', 'Opportunity', 'Talks'
]

export default function NetworkHub() {
  return (
    <section className="network-hub">
      <div className="network-hub-content">
        <motion.div 
          className="network-hub-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2><BlurText text="All Networkers, One Hub." /></h2>
          <p><BlurText text="Begin your entrepreneurial journey with TBN—because the right network changes everything." /></p>
          <a href="/contact-us" className="cta network-cta">
            <svg className="icon-ne" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M4.16675 10H15.8334M15.8334 10L10.0001 4.16669M15.8334 10L10.0001 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Become a TeenBizzer!
          </a>
        </motion.div>

        <div className="network-tags-wrapper">
          <div className="network-tags-scroll">
            {/* First set of tags */}
            <div className="network-tags-row">
              {tags.map((tag, index) => (
                <span key={`tag-1-${index}`} className="network-tag">{tag}</span>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="network-tags-row" aria-hidden="true">
              {tags.map((tag, index) => (
                <span key={`tag-2-${index}`} className="network-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="network-tags-scroll network-tags-reverse">
            {/* First set of tags (reversed order) */}
            <div className="network-tags-row">
              {[...tags].reverse().map((tag, index) => (
                <span key={`tag-3-${index}`} className="network-tag">{tag}</span>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="network-tags-row" aria-hidden="true">
              {[...tags].reverse().map((tag, index) => (
                <span key={`tag-4-${index}`} className="network-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="network-tags-scroll">
            {/* First set of tags */}
            <div className="network-tags-row">
              {tags.map((tag, index) => (
                <span key={`tag-5-${index}`} className="network-tag">{tag}</span>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="network-tags-row" aria-hidden="true">
              {tags.map((tag, index) => (
                <span key={`tag-6-${index}`} className="network-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

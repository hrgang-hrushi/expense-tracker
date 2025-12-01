import React, { useState } from 'react'
import SlotList from './SlotList'
import NotifyToggle from './NotifyToggle'

export default function LocationCard({ location, isNotifying, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      <div className="card-row">
        <div className="card-title">
          <div className="name">{location.name}</div>
          <div className="address">{location.address}</div>
        </div>

        <div className="card-actions">
          <NotifyToggle enabled={isNotifying} onChange={onToggle} />
          <button className="chev" onClick={() => setExpanded((s) => !s)}>
            {expanded ? '▾' : '▸'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="card-body">
          <SlotList slots={location.slots} />
          <a className="booking" href={location.bookingUrl} target="_blank" rel="noreferrer">
            Book at DMV
          </a>
        </div>
      )}
    </div>
  )
}

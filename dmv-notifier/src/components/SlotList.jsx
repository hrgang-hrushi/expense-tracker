import React from 'react'

export default function SlotList({ slots = [] }) {
  if (!slots || slots.length === 0) {
    return <div className="no-slots">No slots available</div>
  }

  return (
    <ul className="slot-list">
      {slots.slice(0, 3).map((s) => (
        <li key={s.id} className="slot-item">
          <div className="slot-time">{new Date(s.start).toLocaleString()}</div>
          {s.bookingUrl && (
            <a className="slot-book" href={s.bookingUrl} target="_blank" rel="noreferrer">
              Book
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

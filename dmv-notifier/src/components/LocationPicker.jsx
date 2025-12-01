import React from 'react'

export default function LocationPicker({ zip, onZipChange, onSearch }) {
  const handleKey = (e) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="location-picker">
      <input
        className="zip-input"
        placeholder="Enter ZIP code"
        value={zip}
        onChange={(e) => onZipChange(e.target.value)}
        onKeyDown={handleKey}
        inputMode="numeric"
        pattern="\\d{5}"
      />
      <button className="btn" onClick={onSearch}>
        Search
      </button>
    </div>
  )
}

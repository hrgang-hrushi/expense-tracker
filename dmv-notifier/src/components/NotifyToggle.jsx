import React from 'react'

export default function NotifyToggle({ enabled, onChange }) {
  return (
    <button
      className={enabled ? 'btn notify enabled' : 'btn notify'}
      onClick={() => onChange(!enabled)}
    >
      {enabled ? 'Notifying' : 'Notify Me'}
    </button>
  )
}

import React from 'react'

export default function NotifyToggle({ enabled, onChange }) {
  return (
    <button
      className={enabled ? 'btn notify enabled' : 'btn notify'}
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      title={enabled ? 'Disable notifications' : 'Enable notifications'}
    >
      <span className="bell" aria-hidden>
        {enabled ? '' : ''}
      </span>
      <span className="label">{enabled ? 'Notifying' : 'Notify'}</span>
    </button>
  )
}

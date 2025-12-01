import React from 'react'

export default function PresenceAvatars({ peers }: { peers: any[] }) {
  return (
    <div className="flex -space-x-2 items-center">
      {peers.slice(0, 5).map((p) => (
        <div
          key={p.id}
          title={p.name}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ring-2 ring-white dark:ring-white"
          style={{ background: p.color }}
        >
          {p.avatarLetter}
        </div>
      ))}
      {peers.length > 5 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-xs flex items-center justify-center text-gray-600 dark:text-gray-200 ring-2 ring-white">+{peers.length - 5}</div>
      )}
    </div>
  )
}

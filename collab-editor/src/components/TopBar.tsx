import React from 'react'
import PresenceAvatars from './PresenceAvatars'

type Props = {
  docName: string
  peers: any[]
  onShare: () => void
}

export default function TopBar({ docName, peers, onShare }: Props) {
  return (
  <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-[#071029] border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="text-lg font-medium">{docName}</div>
        <div className="text-sm text-gray-500">Autosaved</div>
      </div>

      <div className="flex items-center gap-4">
        <PresenceAvatars peers={peers} />

        <button
          onClick={onShare}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Share
        </button>
      </div>
    </div>
  )
}

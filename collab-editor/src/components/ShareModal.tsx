import React, { useState } from 'react'

export default function ShareModal({ open, onClose, onGenerateLink, onInviteEmail, onChangePermission }: any) {
  const [email, setEmail] = useState('')
  const [perm, setPerm] = useState('edit')
  const [link, setLink] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Share — Invite people</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <input className="flex-1 rounded border px-3 py-2" placeholder="Enter email or name" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>{ onInviteEmail(email); setEmail('') }}>Invite</button>
          </div>

          <div className="flex items-center gap-3">
            <select value={perm} onChange={(e)=>{ setPerm(e.target.value); onChangePermission(e.target.value) }} className="rounded border px-3 py-2">
              <option value="view">View</option>
              <option value="comment">Comment</option>
              <option value="edit">Edit</option>
            </select>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-2 rounded border" onClick={()=>{ const l = onGenerateLink(); setLink(l) }}>Get shareable link</button>
              {link && (
                <div className="ml-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  <span className="mr-2">{link}</span>
                  <button onClick={()=>{ try { navigator.clipboard?.writeText(link) } catch {} }} className="underline">Copy</button>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500">Link and invites are mocked in this demo.</p>
        </div>
      </div>
    </div>
  )
}

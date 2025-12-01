import React from 'react'

export type TermLine = { type: 'log' | 'error' | 'info' | 'system', text: string }

export default function Terminal({ lines = [], onClear }: { lines?: TermLine[]; onClear?: () => void }) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-4 bg-black text-gray-100 rounded p-3 font-mono text-sm" style={{ minHeight: 120 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400">Terminal</div>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="text-xs px-2 py-1 bg-gray-800 rounded">Clear</button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight: 260 }}>
        {lines.length === 0 && (
          <div className="text-gray-500">No output. Click Run to execute the code.</div>
        )}
        {lines.map((l, idx) => (
          <div key={idx} className={`whitespace-pre-wrap ${l.type === 'error' ? 'text-red-400' : l.type === 'system' ? 'text-yellow-300' : 'text-gray-100'}`}>
            {l.type === 'system' ? `» ${l.text}` : l.text}
          </div>
        ))}
      </div>
    </div>
  )
}

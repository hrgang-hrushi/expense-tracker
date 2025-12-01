import React, { useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'

type Peer = {
  id: string
  name: string
  color: string
  position: { x: number; y: number }
}

export default function Editor({ value, onChange, peers, containerClassName = '', fontSize = 14, fontFamily }: { value: string; onChange: (v: string) => void; peers: Peer[]; containerClassName?: string; fontSize?: number; fontFamily?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()

  // We render code editor and overlay peer cursors (mocked positions) on top
  // style uses CSS variables so the CodeMirror internals (which often set their
  // own font styles) can pick up the selected font and size via CSS.
  const wrapperStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
  } as React.CSSProperties

  // Create a CodeMirror theme extension that applies the selected font and size
  // directly to the editor's content. This is more reliable than passing a
  // style prop because CodeMirror sets its own internal CSS.
  const fontExtension = useMemo(() => EditorView.theme({
    '&': {
      fontFamily: fontFamily || 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
      fontSize: `${fontSize}px`,
    },
    '.cm-content': {
      fontFamily: fontFamily || 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
      fontSize: `${fontSize}px`,
    }
  }), [fontFamily, fontSize])

  return (
    <div ref={containerRef} className={`relative overflow-hidden h-full ${containerClassName}`}>
      <div className="absolute inset-0 p-4" style={wrapperStyle}>
        <CodeMirror
          value={value}
          height="100%"
          extensions={[javascript(), ...(theme === 'dark' ? [oneDark] : []), fontExtension]}
          onChange={(val) => onChange(val)}
          className={`rounded-lg h-full ${theme === 'dark' ? 'bg-[#071029] text-gray-100' : 'bg-white text-gray-900'}`}
        />
      </div>

      {/* Overlay for cursors: positions are mocked pixel coords relative to container */}
      <div className="pointer-events-none absolute inset-0">
        {peers.map((p) => (
          <div key={p.id} className="absolute fade-in" style={{ left: p.position.x, top: p.position.y }}>
            <div style={{ transform: 'translateY(-110%)' }} className="text-xs font-medium px-2 py-0.5 rounded-md text-white"
              // small label above cursor
            >
              <span style={{ background: p.color }} className="px-2 py-0.5 rounded">{p.name}</span>
            </div>
            <div style={{ width: 2, height: 18, background: p.color, borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

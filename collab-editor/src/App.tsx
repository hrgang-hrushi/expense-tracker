import React, { useState, useEffect, useCallback } from 'react'
import TopBar from './components/TopBar'
import Editor from './components/Editor'
import BottomToolbar from './components/BottomToolbar'
import ShareModal from './components/ShareModal'
import { useCollaboration } from './hooks/useCollaboration'
import Toast from './components/Toast'
import Terminal, { TermLine } from './components/Terminal'

export default function App() {
  // Collaboration hook provides peers, events, and actions
  const collab = useCollaboration({ userName: 'You' })
  const [isShareOpen, setShareOpen] = useState(false)
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('collab:fontSize')
      return raw ? Number(raw) : 14
    } catch {
      return 14
    }
  })

  const [font, setFont] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('collab:font')
      return raw || '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'
    } catch {
      return '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'
    }
  })

  useEffect(() => {
    try { localStorage.setItem('collab:fontSize', String(fontSize)) } catch {}
  }, [fontSize])

  useEffect(() => {
    try { localStorage.setItem('collab:font', font) } catch {}
  }, [font])

  // Terminal state for run output
  const [terminalLines, setTerminalLines] = useState<TermLine[]>([])

  const pushLine = useCallback((line: TermLine) => {
    setTerminalLines((s) => [...s, line])
  }, [])

  const clearTerminal = useCallback(() => setTerminalLines([]), [])

  // Run code on the backend Python runner and show stdout/stderr
  const runCode = useCallback(async (code?: string) => {
    const runSource = code ?? collab.documentText ?? ''
    pushLine({ type: 'system', text: 'Sending code to runner...' })

    try {
      const resp = await fetch('/api/run/python', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: runSource })
      })

      if (!resp.ok) {
        const txt = await resp.text()
        pushLine({ type: 'error', text: `Runner error: ${txt}` })
        return
      }

      const data = await resp.json()
      if (data.stdout) pushLine({ type: 'log', text: String(data.stdout) })
      if (data.stderr) pushLine({ type: 'error', text: String(data.stderr) })
      if (data.timedOut) pushLine({ type: 'system', text: 'Execution timed out' })
      pushLine({ type: 'system', text: 'Execution finished' })
    } catch (err:any) {
      pushLine({ type: 'error', text: String(err.message || err) })
    }
  }, [collab.documentText, pushLine])

  return (
    <div className="h-screen w-screen bg-soft dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased flex flex-col">
      <TopBar
        docName={collab.docName}
        peers={collab.peers}
        onShare={() => setShareOpen(true)}
      />

      <div className="flex-1 p-6">
        <Editor
          value={collab.documentText}
          onChange={collab.updateLocal}
          peers={collab.peers}
          // ensure canvas/editor surface is dark-capable and defaults to dark
          containerClassName="rounded-lg shadow-sm bg-white dark:bg-[#071029] h-full"
          fontSize={fontSize}
          fontFamily={font}
        />

        {/* Terminal panel showing run output */}
        <Terminal lines={terminalLines} onClear={clearTerminal} />
      </div>

      <BottomToolbar font={font} onFontChange={(f:string)=>setFont(f)} fontSize={fontSize} onOpenShare={() => setShareOpen(true)} onDownload={() => {
        const blob = new Blob([collab.documentText], { type: 'text/javascript' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'untitled.js'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }} onFontSizeChange={(s:number)=>setFontSize(s)} onRun={() => runCode()} />

      <ShareModal
        open={isShareOpen}
        onClose={() => setShareOpen(false)}
        onGenerateLink={collab.generateShareLink}
        onInviteEmail={collab.inviteByEmail}
        onChangePermission={(p: 'view' | 'comment' | 'edit') => collab.setPermission(p)}
      />

      {/* Toast area */}
      <div className="fixed top-6 right-6 z-50">
        {collab.toasts.map((t) => (
          <Toast key={t.id} message={t.message} />
        ))}
      </div>
    </div>
  )
}

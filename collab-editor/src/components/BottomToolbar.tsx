import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function BottomToolbar({ onOpenShare, onDownload, onFontSizeChange, fontSize, font, onFontChange, onRun }: { onOpenShare: () => void; onDownload?: () => void; onFontSizeChange?: (s:number)=>void; fontSize?: number; font?: string; onFontChange?: (f:string)=>void; onRun?: () => void }) {
  // onRun is now an explicit optional prop
  const [open, setOpen] = useState(false)

  const { theme, toggle } = useTheme()

  return (
    <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none">
  <div className={`w-full max-w-5xl pointer-events-auto transition-all duration-300 ${open ? 'h-64' : 'h-[60px]'} rounded-t-lg bg-white dark:bg-[#071029] shadow-md overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {/* Toggle expand */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 cursor-default">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Formatting
              </div>
              <div className="flex items-center gap-2">Extensions</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onOpenShare} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm">Share</button>
            {/* Run button - optional handler from parent via props.onRun */}
            <button onClick={() => (typeof onRun === 'function' ? onRun() : undefined)} className="ml-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm">Run</button>
          </div>
        </div>

        {/* Expanded panel content */}
        <div className={`border-t border-gray-100 dark:border-gray-700 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-[#071029] p-3 rounded">
              <div className="font-medium">Editor Settings</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Font size</div>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    aria-label="Editor font"
                    value={font ?? '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'}
                    onChange={(e) => onFontChange && onFontChange(e.target.value)}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200"
                  >
                    <option value='"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'>Fira Code</option>
                    <option value='"Source Code Pro", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'>Source Code Pro</option>
                    <option value='"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'>Roboto Mono</option>
                    <option value='Menlo, Monaco, monospace'>Monaco</option>
                    <option value='ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'>System UI</option>
                  </select>

                  <input
                    aria-label="Font size"
                    type="number"
                    min={8}
                    max={72}
                    defaultValue={fontSize ?? 14}
                    className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200"
                    id="font-size-input"
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('font-size-input') as HTMLInputElement | null
                      if (!el) return
                      const val = Number(el.value)
                      if (Number.isNaN(val) || val < 8 || val > 72) {
                        el.focus()
                        return
                      }
                      onFontSizeChange && onFontSizeChange(val)
                    }}
                    title="Apply font size"
                    className="px-3 py-1 rounded bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 text-gray-800 dark:text-gray-200"
                  >
                    ✓
                  </button>
                </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-pressed={theme === 'dark'}
              onClick={toggle}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } }}
              title="Toggle theme"
              className="bg-gray-50 dark:bg-[#071029] p-3 rounded cursor-pointer hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Toggle site theme</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-200">{theme === 'dark' ? 'Dark' : 'Light'}</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#071029] p-3 rounded">Integrations<br/><small className="text-gray-500 dark:text-gray-400">CI, linters</small></div>
            <div className="bg-gray-50 dark:bg-[#071029] p-3 rounded">File Menu<br/><small className="text-gray-500 dark:text-gray-400">Rename / Export</small>
              <div className="mt-3">
                <button onClick={()=>onDownload && onDownload()} className="px-3 py-1 bg-blue-600 text-white rounded">Download</button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#071029] p-3 rounded">Extensions<br/><small className="text-gray-500 dark:text-gray-400">Marketplace</small></div>
            <div className="bg-gray-50 dark:bg-[#071029] p-3 rounded">Advanced<br/><small className="text-gray-500 dark:text-gray-400">Preview, deploy</small></div>
          </div>
        </div>
      </div>
    </div>
  )
}

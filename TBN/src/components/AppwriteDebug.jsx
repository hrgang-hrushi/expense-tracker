import React, { useState } from 'react'
import { client, account, createGoogleSession } from '../lib/appwrite'

export default function AppwriteDebug(){
  const [pingResult, setPingResult] = useState(null)
  const [pingLoading, setPingLoading] = useState(false)

  const successUrl = `${window.location.origin}/oauth2callback`
  const failureUrl = `${window.location.origin}/?oauth_error=1`

  async function handlePing(){
    if (!client || typeof client.ping !== 'function'){
      setPingResult({ ok: false, text: 'client.ping not available (older SDK or missing client)'});
      return
    }
    setPingLoading(true)
    try{
      await client.ping()
      setPingResult({ ok: true, text: 'Ping successful' })
    }catch(err){
      setPingResult({ ok: false, text: String(err) })
    }finally{
      setPingLoading(false)
    }
  }

  function handleStartGoogle(){
    // This will redirect the browser when invoked; we only call if user confirms
    createGoogleSession(successUrl, failureUrl)
  }

  return (
    <div style={{padding:20}}>
      <h2>Appwrite Debug</h2>
      <p><strong>Endpoint:</strong> {import.meta.env.VITE_APPWRITE_ENDPOINT || 'not set'}</p>
      <p><strong>Project ID:</strong> {import.meta.env.VITE_APPWRITE_PROJECT_ID || 'not set'}</p>

      <div style={{marginTop:12}}>
        <p><strong>OAuth success URL (sent to Appwrite):</strong> <code>{successUrl}</code></p>
        <p><strong>OAuth failure URL:</strong> <code>{failureUrl}</code></p>
      </div>

      <div style={{marginTop:12}}>
        <button onClick={handlePing} disabled={pingLoading} style={{padding:'8px 12px'}}>
          {pingLoading ? 'Pinging…' : 'Ping Appwrite'}
        </button>
        {pingResult && (
          <div style={{marginTop:8}}>
            <strong>Result:</strong> {pingResult.ok ? 'OK' : 'ERROR'} — <span>{pingResult.text}</span>
          </div>
        )}
      </div>

      <div style={{marginTop:18}}>
        <button onClick={handleStartGoogle} style={{padding:'8px 12px'}}>
          Start Google OAuth (will redirect)
        </button>
        <p style={{marginTop:8,fontSize:12,color:'#666'}}>Clicking the button will redirect the browser to Appwrite/Google and is useful to reproduce the invalid-URI issue.</p>
      </div>
    </div>
  )
}

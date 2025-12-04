import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './App.css'

// Import Appwrite client and ping to verify connectivity on startup
import { client } from './lib/appwrite'

// Ping Appwrite once at startup to verify configuration
// This will log success or error to the browser console.
if (client && typeof client.ping === 'function') {
  client
    .ping()
    .then(() => {
      console.log('[Appwrite] ping OK')
    })
    .catch((err) => {
      console.warn('[Appwrite] ping failed', err)
    })
} else {
  console.log('[Appwrite] client.ping not available (missing or older SDK)')
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

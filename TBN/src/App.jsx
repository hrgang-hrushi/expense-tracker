import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import OAuth2Callback from './pages/OAuth2Callback'
import AppwriteDebug from './components/AppwriteDebug'

// Lazy-load the optional SignupSuccess page. If the file doesn't exist yet
// the dynamic import will be caught and a simple placeholder component will
// be used instead so the app doesn't crash. This lets you add the file later
// without changing routing again.
const SignupSuccess = React.lazy(() =>
  import('./pages/SignupSuccess').catch(() => {
    return {
      default: () => (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h3>Welcome page not installed</h3>
          <p style={{ color: 'var(--muted)' }}>Create <code>src/pages/SignupSuccess.jsx</code> to enable this screen.</p>
        </div>
      ),
    }
  }) )

export default function App() {
  return (
    <div className="app">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/oauth2callback" element={<OAuth2Callback />} />
          <Route
            path="/welcome"
            element={
              <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>
                <SignupSuccess />
              </Suspense>
            }
          />
          <Route path="/debug" element={<AppwriteDebug />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import OAuth2Callback from './pages/OAuth2Callback'
import AppwriteDebug from './components/AppwriteDebug'

export default function App(){
  return (
    <div className="app">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/oauth2callback" element={<OAuth2Callback />} />
          <Route path="/debug" element={<AppwriteDebug />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

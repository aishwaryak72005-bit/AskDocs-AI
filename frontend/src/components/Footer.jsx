/**
 * components/Footer.jsx
 * 
 * Footer displayed on landing, about, and other public pages.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">

          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span>📄</span>
              <span>AskDocs <strong>AI</strong></span>
            </div>
            <p className="footer-tagline">
              Upload Documents. Ask Questions.<br />Get AI-Powered Answers.
            </p>
          </div>

          {/* Links */}
          <div className="footer-links">
            <div className="footer-links-group">
              <h4>Product</h4>
              <Link to="/">Home</Link>
              <Link to="/register">Get Started</Link>
              <Link to="/about">About</Link>
            </div>
            <div className="footer-links-group">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© 2024 AskDocs AI. Built for BCA Portfolio Project.</p>
          <p>Built with React + Django + Google Gemini</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

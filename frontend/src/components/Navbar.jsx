/**
 * components/Navbar.jsx
 * 
 * Top navigation bar displayed on all pages.
 * 
 * - Shows logo and navigation links
 * - Shows "Login/Register" buttons for guests
 * - Shows user name and "Logout" for logged-in users
 * - Highlights the active page link
 */

import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false) // Mobile menu state

  const handleLogout = async () => {
    await logout()
    navigate('/')  // Redirect to landing page after logout
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">📄</div>
          <span className="navbar-logo-text">AskDocs <span className="logo-ai">AI</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
          <NavLink to="/" end className="navbar-link" onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/about" className="navbar-link" onClick={() => setMenuOpen(false)}>
            About
          </NavLink>

          {/* Show these links only if logged in */}
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Upload
              </NavLink>
              <NavLink to="/chat" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Chat
              </NavLink>
              <NavLink to="/history" className="navbar-link" onClick={() => setMenuOpen(false)}>
                History
              </NavLink>
            </>
          )}
        </div>

        {/* Auth Buttons / User Info */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            // Logged in — show user name and logout
            <div className="navbar-user">
              <div className="navbar-user-avatar">
                {/* Show first letter of user's name as avatar */}
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="navbar-user-name">{user?.full_name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            // Not logged in — show login/register
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle button */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`}></span>
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar

/**
 * pages/LoginPage.jsx
 * 
 * Login form with email + password fields.
 * On success → redirects to Dashboard.
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error when user types
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(formData)
      const { user, tokens } = response.data

      // Save tokens and update global auth state
      login(user, tokens)

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      // Show friendly error message
      const message = err.response?.data?.error || 'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">📄</div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Login to your AskDocs AI account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" white />
                  Logging in...
                </>
              ) : (
                'Login to AskDocs AI'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">or</div>

          {/* Register Link */}
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

/**
 * pages/RegisterPage.jsx
 * 
 * Registration form with name, email, password, confirm password.
 * On success → redirects to Dashboard.
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import './AuthPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const response = await authService.register(formData)
      const { user, tokens } = response.data

      // Log in immediately after registration
      login(user, tokens)
      navigate('/dashboard')
    } catch (err) {
      // Handle validation errors from backend
      const data = err.response?.data
      if (data?.error) {
        // Backend might return errors as object or string
        if (typeof data.error === 'string') {
          setError(data.error)
        } else {
          // Extract first error message from object
          const firstKey = Object.keys(data.error)[0]
          const firstError = data.error[firstKey]
          setError(Array.isArray(firstError) ? firstError[0] : firstError)
        }
      } else {
        setError('Registration failed. Please try again.')
      }
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join AskDocs AI and start asking questions</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                className="form-input"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

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
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirm_password}
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
                  Creating account...
                </>
              ) : (
                'Create My Account →'
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

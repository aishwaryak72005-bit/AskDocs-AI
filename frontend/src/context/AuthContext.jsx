/**
 * context/AuthContext.jsx
 * 
 * Global Authentication Context
 * 
 * What is Context?
 * Context lets us share data (like the logged-in user) across
 * ALL components without passing it as props every time.
 * 
 * This context stores:
 * - user → the logged-in user's info (name, email)
 * - isAuthenticated → true if user is logged in
 * - login() → function to log in
 * - logout() → function to log out
 * - loading → true while checking if user is logged in on page load
 */

import React, { createContext, useState, useEffect, useContext } from 'react'
import authService from '../services/authService'

// Create the context (think of it as a "global store")
const AuthContext = createContext(null)

/**
 * AuthProvider wraps the entire app and provides auth data
 * to all child components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)           // Current user info
  const [loading, setLoading] = useState(true)     // Loading state on app start

  // Check if user is already logged in when the app starts
  // (by reading the JWT token from localStorage)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')

      if (token) {
        try {
          // Verify token by fetching user info from backend
          const response = await authService.getCurrentUser()
          setUser(response.data.user)
        } catch (error) {
          // Token is invalid or expired — clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        }
      }

      setLoading(false) // Done checking
    }

    initAuth()
  }, [])

  /**
   * Login function — saves tokens and updates user state
   * Called from LoginPage after successful API response
   */
  const login = (userData, tokens) => {
    // Save JWT tokens in localStorage (browser storage)
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)

    // Update the global user state
    setUser(userData)
  }

  /**
   * Logout function — clears tokens and user state
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        // Tell backend to blacklist the refresh token
        await authService.logout({ refresh: refreshToken })
      }
    } catch (error) {
      // Continue logout even if API call fails
    }

    // Clear stored tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // Clear user state
    setUser(null)
  }

  // The value object is what all child components can access
  const value = {
    user,
    isAuthenticated: !!user,    // Convert to boolean
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to easily use AuthContext in any component.
 * 
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export default AuthContext

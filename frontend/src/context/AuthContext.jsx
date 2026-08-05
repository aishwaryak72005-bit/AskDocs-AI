/**
 * context/AuthContext.jsx
 * 
 * Global Authentication Context — Fixed with Persistent LocalStorage Memory
 */

import React, { createContext, useState, useEffect, useContext } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialize user immediately from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user_data')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  
  const [loading, setLoading] = useState(true)

  // Verify token on app load without wiping user state on network errors
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')

      if (token) {
        try {
          // Fetch fresh user info from backend
          const response = await authService.getCurrentUser()
          const freshUser = response.data.user
          setUser(freshUser)
          localStorage.setItem('user_data', JSON.stringify(freshUser))
        } catch (error) {
          // ONLY clear tokens if backend explicitly returned 401 Unauthorized
          if (error.response && error.response.status === 401) {
            console.warn('Session expired. Logging out...')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_data')
            setUser(null)
          } else {
            console.log('Backend waking up or offline. Keeping cached user session.')
          }
        }
      } else {
        localStorage.removeItem('user_data')
        setUser(null)
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  /**
   * Login function — saves tokens and user data in localStorage
   */
  const login = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user_data', JSON.stringify(userData))
    setUser(userData)
  }

  /**
   * Logout function — clears tokens and user state
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authService.logout({ refresh: refreshToken })
      }
    } catch (error) {
      // Ignore API logout errors
    }

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export default AuthContext

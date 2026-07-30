/**
 * components/ProtectedRoute.jsx
 * 
 * A wrapper component that protects pages from being accessed
 * by users who are not logged in.
 * 
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 * 
 * If not logged in → redirect to /login
 * If loading (checking auth) → show spinner
 * If logged in → show the page
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // While checking if user is logged in (on page refresh), show a spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated — render the protected page
  return children
}

export default ProtectedRoute

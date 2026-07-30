/**
 * App.jsx
 * 
 * Root component of the React application.
 * 
 * Sets up:
 * 1. BrowserRouter — for client-side routing
 * 2. AuthProvider — global authentication state
 * 3. All routes (pages) with their paths
 * 4. ProtectedRoute — guards auth-required pages
 */

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider wraps everything so any component can
        access the current user via useAuth() hook.
      */}
      <AuthProvider>
        <Routes>

          {/* ---- Public Routes (no login needed) ---- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* ---- Protected Routes (login required) ---- */}
          {/*
            ProtectedRoute checks if the user is logged in.
            If not, it redirects to /login.
          */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* 404 — Page not found */}
          <Route
            path="*"
            element={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                fontFamily: 'Inter, sans-serif'
              }}>
                <div style={{ fontSize: '5rem' }}>404</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page Not Found</h1>
                <a href="/" style={{ color: '#4F46E5' }}>← Go back home</a>
              </div>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

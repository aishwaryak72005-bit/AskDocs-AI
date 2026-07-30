/**
 * services/api.js
 * 
 * Axios Instance Configuration
 * 
 * This creates a pre-configured Axios instance that:
 * 1. Points to our Django backend (http://localhost:8000)
 * 2. Automatically adds the JWT token to every request
 * 3. Handles token expiry (401 errors) gracefully
 * 
 * Instead of writing the full URL every time:
 *   axios.get('http://localhost:8000/api/auth/user/', { headers: { Authorization: ... } })
 * 
 * We just write:
 *   api.get('/auth/user/')
 */

import axios from 'axios'

// Create a custom axios instance
const api = axios.create({
  baseURL: '/api',    // Vite proxy forwards this to http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * 
 * This runs BEFORE every API request.
 * It reads the JWT access token from localStorage and adds it
 * to the Authorization header automatically.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')

    if (token) {
      // Add Bearer token to every request
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response Interceptor
 * 
 * This runs AFTER every API response.
 * If we get a 401 (Unauthorized), the token is expired.
 * We clear localStorage and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,   // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — force logout
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

/**
 * services/authService.js
 * 
 * All API calls related to authentication.
 * 
 * Keeps API calls organized and reusable.
 * Components just call these functions instead of using axios directly.
 */

import api from './api'

const authService = {
  /**
   * Register a new user
   * POST /api/auth/register/
   */
  register: (data) => api.post('/auth/register/', data),

  /**
   * Login with email and password
   * POST /api/auth/login/
   */
  login: (data) => api.post('/auth/login/', data),

  /**
   * Logout (blacklist refresh token)
   * POST /api/auth/logout/
   */
  logout: (data) => api.post('/auth/logout/', data),

  /**
   * Get current logged-in user info
   * GET /api/auth/user/
   */
  getCurrentUser: () => api.get('/auth/user/'),
}

export default authService

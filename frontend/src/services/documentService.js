/**
 * services/documentService.js
 * 
 * All API calls related to document management.
 */

import api from './api'

const documentService = {
  /**
   * Get all documents for the logged-in user
   * GET /api/documents/
   */
  getDocuments: () => api.get('/documents/'),

  /**
   * Upload a new document
   * POST /api/documents/upload/
   * 
   * Note: We use multipart/form-data for file uploads (not JSON)
   */
  uploadDocument: (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/documents/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',  // Required for file uploads
      },
      onUploadProgress,  // Callback to track upload progress
    })
  },

  /**
   * Delete a document by ID
   * DELETE /api/documents/<id>/
   */
  deleteDocument: (id) => api.delete(`/documents/${id}/`),

  /**
   * Check the processing status of a document
   * GET /api/documents/<id>/status/
   */
  getDocumentStatus: (id) => api.get(`/documents/${id}/status/`),
}

export default documentService

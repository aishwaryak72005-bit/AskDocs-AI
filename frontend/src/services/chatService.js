/**
 * services/chatService.js
 * 
 * All API calls related to chat and AI Q&A.
 */

import api from './api'

const chatService = {
  /**
   * Ask a question about a document
   * POST /api/chat/ask/
   */
  askQuestion: (documentId, question) =>
    api.post('/chat/ask/', {
      document_id: documentId,
      question: question,
    }),

  /**
   * Get all chat history for the logged-in user
   * GET /api/chat/history/
   */
  getChatHistory: () => api.get('/chat/history/'),

  /**
   * Get chat history for a specific document
   * GET /api/chat/history/<doc_id>/
   */
  getDocumentChatHistory: (docId) => api.get(`/chat/history/${docId}/`),

  /**
   * Delete a specific chat entry
   * DELETE /api/chat/history/delete/<id>/
   */
  deleteChat: (id) => api.delete(`/chat/history/delete/${id}/`),
}

export default chatService

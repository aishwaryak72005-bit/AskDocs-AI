/**
 * pages/HistoryPage.jsx
 * 
 * Displays all past chat conversations in a timeline layout.
 * Shows: document name, question, AI answer, date/time.
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import chatService from '../services/chatService'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import './HistoryPage.css'

function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)  // Which answer is expanded

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await chatService.getChatHistory()
      setHistory(response.data.history)
    } catch {
      setError('Failed to load chat history.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this conversation entry?')
    if (!confirmed) return

    try {
      await chatService.deleteChat(id)
      setHistory(prev => prev.filter(item => item.id !== id))
    } catch {
      alert('Failed to delete entry.')
    }
  }

  // Format date/time
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="history-page page-wrapper">
      <Navbar />

      <div className="container">
        {/* Header */}
        <div className="history-header">
          <div>
            <h1 className="history-title">Chat History</h1>
            <p className="history-subtitle">
              {history.length} conversation{history.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link to="/chat" className="btn btn-primary">
            💬 New Chat
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="history-loading">
            <LoadingSpinner size="lg" text="Loading your history..." />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="history-empty card">
            <div className="history-empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start chatting with your documents to build your history.</p>
            <Link to="/chat" className="btn btn-primary">
              Start First Chat →
            </Link>
          </div>
        )}

        {/* History Timeline */}
        {!loading && history.length > 0 && (
          <div className="history-timeline">
            {history.map((item) => (
              <div key={item.id} className="history-item card">

                {/* Item Header */}
                <div className="history-item-header">
                  <div className="history-item-meta">
                    <span className="history-doc-badge">
                      📄 {item.document_title}
                    </span>
                    <span className="history-date">
                      🕐 {formatDate(item.created_at)}
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️
                  </button>
                </div>

                {/* Question */}
                <div className="history-question">
                  <div className="history-label">Your Question</div>
                  <p className="history-question-text">❓ {item.question}</p>
                </div>

                {/* Answer (collapsible) */}
                <div className="history-answer">
                  <div className="history-answer-header">
                    <div className="history-label">🤖 AI Answer</div>
                    <button
                      className="toggle-btn"
                      onClick={() => setExpandedId(
                        expandedId === item.id ? null : item.id
                      )}
                    >
                      {expandedId === item.id ? '▲ Collapse' : '▼ Expand'}
                    </button>
                  </div>

                  <div className={`history-answer-content ${expandedId === item.id ? 'expanded' : ''}`}>
                    <div className="ai-response-content">
                      <ReactMarkdown>
                        {expandedId === item.id
                          ? item.answer
                          : item.answer.slice(0, 200) + (item.answer.length > 200 ? '...' : '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Chat Again Button */}
                <div className="history-item-footer">
                  <Link
                    to={`/chat?doc=${item.document_id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    💬 Chat Again with this Document
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage

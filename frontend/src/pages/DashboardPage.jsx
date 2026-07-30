/**
 * pages/DashboardPage.jsx
 * 
 * Main dashboard after login.
 * Shows:
 * - Welcome message
 * - Quick stats (total docs, total chats)
 * - Action buttons (Upload, Chat, History)
 * - Recent documents list
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import documentService from '../services/documentService'
import chatService from '../services/chatService'
import Navbar from '../components/Navbar'
import DocumentCard from '../components/DocumentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State for documents and chat history counts
  const [documents, setDocuments] = useState([])
  const [totalChats, setTotalChats] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load data when page opens
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch documents and chat history at the same time
      const [docsResponse, historyResponse] = await Promise.all([
        documentService.getDocuments(),
        chatService.getChatHistory(),
      ])

      setDocuments(docsResponse.data.documents)
      setTotalChats(historyResponse.data.total)
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  // Delete a document
  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?')
    if (!confirmed) return

    try {
      await documentService.deleteDocument(documentId)
      // Remove from list without refetching
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (err) {
      alert('Failed to delete document. Please try again.')
    }
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard-page page-wrapper">
      <Navbar />

      <div className="container">

        {/* ---- Welcome Header ---- */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {getGreeting()}, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's an overview of your documents and conversations.
            </p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            📤 Upload Document
          </Link>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon">📁</div>
            <div className="stat-info">
              <div className="stat-number">{documents.length}</div>
              <div className="stat-label">Documents Uploaded</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">
                {documents.filter(d => d.status === 'ready').length}
              </div>
              <div className="stat-label">Documents Ready</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <div className="stat-number">{totalChats}</div>
              <div className="stat-label">Questions Asked</div>
            </div>
          </div>
        </div>

        {/* ---- Quick Actions ---- */}
        <div className="quick-actions card">
          <h2 className="section-heading">Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/upload" className="action-btn">
              <span className="action-btn-icon">📤</span>
              <span className="action-btn-text">Upload Document</span>
              <span className="action-btn-desc">PDF, DOCX, or TXT</span>
            </Link>
            <button
              className="action-btn"
              onClick={() => {
                const readyDoc = documents.find(d => d.status === 'ready')
                if (readyDoc) {
                  navigate(`/chat?doc=${readyDoc.id}`)
                } else {
                  navigate('/upload')
                }
              }}
            >
              <span className="action-btn-icon">💬</span>
              <span className="action-btn-text">Start Chat</span>
              <span className="action-btn-desc">Ask your documents</span>
            </button>
            <Link to="/history" className="action-btn">
              <span className="action-btn-icon">📜</span>
              <span className="action-btn-text">View History</span>
              <span className="action-btn-desc">Past conversations</span>
            </Link>
          </div>
        </div>

        {/* ---- Documents List ---- */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading">Your Documents</h2>
            {documents.length > 0 && (
              <Link to="/upload" className="btn btn-ghost btn-sm">
                + Upload New
              </Link>
            )}
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <LoadingSpinner size="lg" text="Loading your documents..." />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          ) : documents.length === 0 ? (
            // Empty state
            <div className="empty-state card">
              <div className="empty-state-icon">📭</div>
              <h3>No documents yet</h3>
              <p>Upload your first document to start asking questions.</p>
              <Link to="/upload" className="btn btn-primary">
                📤 Upload Your First Document
              </Link>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default DashboardPage

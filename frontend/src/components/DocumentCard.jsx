/**
 * components/DocumentCard.jsx
 * 
 * Displays a single document in a card format.
 * Used in Dashboard and Upload pages.
 * 
 * Props:
 * - document: The document object from the API
 * - onDelete: Function to call when delete button is clicked
 * - onChat: Function to call when chat button is clicked
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import './DocumentCard.css'

// Helper: return icon based on file type
function getFileIcon(fileType) {
  const icons = {
    pdf: '📕',
    docx: '📘',
    txt: '📄',
  }
  return icons[fileType] || '📎'
}

// Helper: return badge class based on status
function getStatusBadgeClass(status) {
  const classes = {
    pending: 'badge-warning',
    processing: 'badge-info',
    ready: 'badge-success',
    failed: 'badge-error',
  }
  return classes[status] || 'badge-info'
}

function DocumentCard({ document, onDelete }) {
  const navigate = useNavigate()

  const handleChatClick = () => {
    // Navigate to chat page with this document selected
    navigate(`/chat?doc=${document.id}`)
  }

  // Format the date nicely
  const uploadedDate = new Date(document.uploaded_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="doc-card">
      {/* File Icon + Type */}
      <div className="doc-card-header">
        <div className="doc-card-icon">
          {getFileIcon(document.file_type)}
        </div>
        <div className="doc-card-meta">
          <h3 className="doc-card-title" title={document.title}>
            {document.title}
          </h3>
          <div className="doc-card-info">
            <span className="doc-card-size">{document.file_size_display}</span>
            <span className="doc-card-dot">·</span>
            <span className="doc-card-date">{uploadedDate}</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="doc-card-status">
        <span className={`badge ${getStatusBadgeClass(document.status)}`}>
          {document.status === 'pending' && '⏳ Pending'}
          {document.status === 'processing' && '⚙️ Processing'}
          {document.status === 'ready' && '✅ Ready'}
          {document.status === 'failed' && '❌ Failed'}
        </span>

        {/* Show error hint if failed */}
        {document.status === 'failed' && document.error_message && (
          <p className="doc-card-error" title={document.error_message}>
            {document.error_message.slice(0, 60)}...
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="doc-card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={handleChatClick}
          disabled={document.status !== 'ready'}
          title={document.status !== 'ready' ? 'Document is not ready yet' : 'Start chatting'}
        >
          💬 Chat
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(document.id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

export default DocumentCard

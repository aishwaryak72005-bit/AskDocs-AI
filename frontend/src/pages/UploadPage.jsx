/**
 * pages/UploadPage.jsx
 * 
 * Document upload page with:
 * - Drag and drop zone
 * - File browser button
 * - File type and size validation
 * - Upload progress bar
 * - Success/error messages
 * - List of uploaded documents
 */

import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import documentService from '../services/documentService'
import Navbar from '../components/Navbar'
import DocumentCard from '../components/DocumentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import './UploadPage.css'

// Allowed file types
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt']
const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function UploadPage() {
  // State
  const [documents, setDocuments] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(true)

  const fileInputRef = useRef(null)

  // Load existing documents on page open
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await documentService.getDocuments()
      setDocuments(response.data.documents)
    } catch (err) {
      // Don't show error for this — just load empty
    } finally {
      setLoading(false)
    }
  }

  // Validate a file before uploading
  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type ".${ext}". Please upload PDF, DOCX, or TXT files only.`
    }

    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`
    }

    return null  // No error
  }

  // Handle file selection (from file browser or drag-drop)
  const handleFileSelect = (file) => {
    setErrorMessage('')
    setSuccessMessage('')

    const error = validateFile(file)
    if (error) {
      setErrorMessage(error)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  // File input change handler
  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFileSelect(file)
  }

  // Drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  // Upload the selected file
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await documentService.uploadDocument(
        selectedFile,
        // Track upload progress
        (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      )

      // Add new document to list
      setDocuments(prev => [response.data.document, ...prev])
      setSelectedFile(null)
      setUploadProgress(0)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setSuccessMessage(
        `✅ "${response.data.document.title}" uploaded successfully! Processing has started. It will be ready in a few moments.`
      )

      // Poll status every 3 seconds until ready
      pollDocumentStatus(response.data.document.id)
    } catch (err) {
      const message = err.response?.data?.error || 'Upload failed. Please try again.'
      setErrorMessage(message)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // Poll document status until it's ready or failed
  const pollDocumentStatus = (docId) => {
    const interval = setInterval(async () => {
      try {
        const response = await documentService.getDocumentStatus(docId)
        const { status } = response.data

        if (status === 'ready' || status === 'failed') {
          clearInterval(interval)
          // Update the document in list
          setDocuments(prev =>
            prev.map(doc =>
              doc.id === docId ? { ...doc, status } : doc
            )
          )
        }
      } catch {
        clearInterval(interval)
      }
    }, 3000)  // Check every 3 seconds

    // Stop polling after 2 minutes (safety)
    setTimeout(() => clearInterval(interval), 120000)
  }

  // Delete a document
  const handleDelete = async (docId) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?')
    if (!confirmed) return

    try {
      await documentService.deleteDocument(docId)
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
    } catch {
      alert('Failed to delete document.')
    }
  }

  return (
    <div className="upload-page page-wrapper">
      <Navbar />

      <div className="container">
        {/* Page Header */}
        <div className="upload-page-header">
          <h1 className="upload-page-title">Upload Documents</h1>
          <p className="upload-page-subtitle">
            Upload PDF, DOCX, or TXT files (up to {MAX_SIZE_MB} MB).
            Once processed, you can ask questions about them.
          </p>
        </div>

        {/* ---- Upload Zone ---- */}
        <div className="upload-zone-wrapper card">
          {/* Drag & Drop Area */}
          <div
            className={`upload-dropzone ${isDragging ? 'dropzone-dragging' : ''} ${selectedFile ? 'dropzone-selected' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />

            {selectedFile ? (
              // Show selected file info
              <div className="dropzone-file-info">
                <div className="dropzone-file-icon">
                  {selectedFile.name.endsWith('.pdf') ? '📕' :
                   selectedFile.name.endsWith('.docx') ? '📘' : '📄'}
                </div>
                <div>
                  <p className="dropzone-file-name">{selectedFile.name}</p>
                  <p className="dropzone-file-size">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              // Default empty state
              <div className="dropzone-empty">
                <div className="dropzone-icon">📤</div>
                <p className="dropzone-title">
                  {isDragging ? 'Drop it here!' : 'Drag & Drop your file here'}
                </p>
                <p className="dropzone-subtitle">or click to browse files</p>
                <p className="dropzone-hint">Supported: PDF, DOCX, TXT — Max {MAX_SIZE_MB} MB</p>
              </div>
            )}
          </div>

          {/* Error and Success Messages */}
          {errorMessage && (
            <div className="alert alert-error">
              <span>❌</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="upload-progress">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="upload-progress-text">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {/* Upload Button */}
          <div className="upload-actions">
            {selectedFile && !uploading && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedFile(null)
                  setErrorMessage('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                ✕ Remove File
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" white />
                  Uploading...
                </>
              ) : (
                '📤 Upload Document'
              )}
            </button>
          </div>
        </div>

        {/* ---- Uploaded Documents List ---- */}
        <div className="upload-documents-section">
          <h2 className="section-heading">Your Documents ({documents.length})</h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
              <LoadingSpinner size="lg" text="Loading..." />
            </div>
          ) : documents.length === 0 ? (
            <div className="upload-empty card">
              <p>No documents uploaded yet. Upload your first document above!</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default UploadPage

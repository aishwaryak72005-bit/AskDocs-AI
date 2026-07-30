/**
 * pages/ChatPage.jsx
 * 
 * The main chat interface where users ask questions about documents.
 * 
 * Features:
 * - Select which document to chat about
 * - Message bubbles (user + AI)
 * - Typing indicator while AI is thinking
 * - Auto-scroll to latest message
 * - Enter key to send
 * - Clear conversation
 * - Formatted AI responses using react-markdown
 */

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import documentService from '../services/documentService'
import chatService from '../services/chatService'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import './ChatPage.css'

function ChatPage() {
  const [searchParams] = useSearchParams()
  const docIdFromUrl = searchParams.get('doc')  // e.g., /chat?doc=3

  // State
  const [documents, setDocuments] = useState([])
  const [selectedDocId, setSelectedDocId] = useState(docIdFromUrl || '')
  const [messages, setMessages] = useState([])   // Array of {role, content}
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [docsLoading, setDocsLoading] = useState(true)
  const [error, setError] = useState('')

  // Ref for auto-scroll
  const messagesEndRef = useRef(null)

  // Load user's documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  // Load previous chat history when document is selected
  useEffect(() => {
    if (selectedDocId) {
      loadChatHistory(selectedDocId)
    } else {
      setMessages([]) // Clear messages if no doc selected
    }
  }, [selectedDocId])

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadDocuments = async () => {
    try {
      const response = await documentService.getDocuments()
      const readyDocs = response.data.documents.filter(d => d.status === 'ready')
      setDocuments(readyDocs)

      // If doc was pre-selected from URL, verify it's ready
      if (docIdFromUrl) {
        const docReady = readyDocs.find(d => d.id === parseInt(docIdFromUrl))
        if (!docReady) {
          setSelectedDocId('')
        }
      }
    } catch {
      setError('Failed to load documents.')
    } finally {
      setDocsLoading(false)
    }
  }

  const loadChatHistory = async (docId) => {
    try {
      const response = await chatService.getDocumentChatHistory(docId)
      const history = response.data.history

      // Convert history to message format (reverse to show oldest first)
      const msgs = []
      history.reverse().forEach(item => {
        msgs.push({ role: 'user', content: item.question, id: item.id })
        msgs.push({ role: 'ai', content: item.answer, id: `ai-${item.id}` })
      })
      setMessages(msgs)
    } catch {
      setMessages([])
    }
  }

  // Send a question to the AI
  const handleSend = async () => {
    if (!question.trim() || loading || !selectedDocId) return

    const userQuestion = question.trim()
    setQuestion('')
    setError('')

    // Add user message immediately to UI
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }])

    // Show typing indicator
    setLoading(true)

    try {
      const response = await chatService.askQuestion(selectedDocId, userQuestion)
      const aiAnswer = response.data.answer

      // Add AI answer to messages
      setMessages(prev => [...prev, { role: 'ai', content: aiAnswer }])
    } catch (err) {
      const message = err.response?.data?.error ||
        'The AI service is temporarily unavailable. Please try again.'

      setMessages(prev => [...prev, {
        role: 'ai',
        content: message,
        isError: true
      }])
    } finally {
      setLoading(false)
    }
  }

  // Send on Enter key (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Clear the current conversation
  const handleClearChat = () => {
    if (messages.length === 0) return
    const confirmed = window.confirm('Clear this conversation? (Chat history in database will be kept)')
    if (confirmed) setMessages([])
  }

  // Get selected document name
  const selectedDoc = documents.find(d => d.id === parseInt(selectedDocId))

  return (
    <div className="chat-page page-wrapper">
      <Navbar />

      <div className="chat-layout">

        {/* ---- LEFT SIDEBAR: Document Selector ---- */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Documents</h2>
            <Link to="/upload" className="btn btn-ghost btn-sm">+ Upload</Link>
          </div>

          {docsLoading ? (
            <div className="sidebar-loading">
              <LoadingSpinner size="sm" text="Loading..." />
            </div>
          ) : documents.length === 0 ? (
            <div className="sidebar-empty">
              <p>No ready documents.</p>
              <Link to="/upload" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                Upload First
              </Link>
            </div>
          ) : (
            <div className="doc-selector-list">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  className={`doc-selector-item ${selectedDocId === String(doc.id) ? 'doc-selector-active' : ''}`}
                  onClick={() => setSelectedDocId(String(doc.id))}
                >
                  <span className="doc-selector-icon">
                    {doc.file_type === 'pdf' ? '📕' : doc.file_type === 'docx' ? '📘' : '📄'}
                  </span>
                  <span className="doc-selector-name" title={doc.title}>
                    {doc.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- MAIN CHAT AREA ---- */}
        <div className="chat-main">

          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              {selectedDoc ? (
                <>
                  <span className="chat-header-icon">
                    {selectedDoc.file_type === 'pdf' ? '📕' :
                     selectedDoc.file_type === 'docx' ? '📘' : '📄'}
                  </span>
                  <div>
                    <h2 className="chat-header-title">{selectedDoc.title}</h2>
                    <p className="chat-header-subtitle">AI answers only from this document</p>
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="chat-header-title">Select a Document</h2>
                  <p className="chat-header-subtitle">Choose a document from the sidebar to start chatting</p>
                </div>
              )}
            </div>

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleClearChat}>
                🗑️ Clear Chat
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="chat-messages" id="chat-messages">
            {/* Empty state */}
            {messages.length === 0 && !loading && (
              <div className="chat-empty">
                {selectedDocId ? (
                  <>
                    <div className="chat-empty-icon">💬</div>
                    <h3>Start your conversation</h3>
                    <p>Ask anything about <strong>{selectedDoc?.title}</strong></p>
                    <div className="chat-suggestions">
                      <p className="suggestions-label">Try asking:</p>
                      {[
                        'What is the main topic of this document?',
                        'Summarize the key points.',
                        'What are the important dates mentioned?',
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          className="suggestion-chip"
                          onClick={() => {
                            setQuestion(suggestion)
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="chat-empty-icon">📄</div>
                    <h3>Select a document to begin</h3>
                    <p>Choose a document from the left panel to start asking questions.</p>
                  </>
                )}
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'ai' && (
                  <div className="message-avatar ai-avatar">🤖</div>
                )}

                <div className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} ${msg.isError ? 'bubble-error' : ''}`}>
                  {msg.role === 'ai' ? (
                    // Render AI response as Markdown (headings, bullets, bold, etc.)
                    <div className="ai-response-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="message-avatar user-avatar">You</div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="message-wrapper message-ai">
                <div className="message-avatar ai-avatar">🤖</div>
                <div className="bubble-ai typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-error" style={{ margin: '0 var(--space-6)' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef}></div>
          </div>

          {/* ---- Chat Input ---- */}
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                placeholder={
                  !selectedDocId
                    ? 'Select a document first...'
                    : 'Ask a question about the document... (Enter to send, Shift+Enter for newline)'
                }
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!selectedDocId || loading}
                rows={1}
              />
              <button
                className="chat-send-btn btn btn-primary"
                onClick={handleSend}
                disabled={!question.trim() || loading || !selectedDocId}
                title="Send message (Enter)"
              >
                {loading ? <LoadingSpinner size="sm" white /> : '↑'}
              </button>
            </div>
            <p className="chat-input-hint">
              🔒 AI answers only from your uploaded document
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChatPage

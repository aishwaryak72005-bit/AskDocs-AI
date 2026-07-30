/**
 * pages/LandingPage.jsx
 * 
 * Professional, World-Class Landing Page for AskDocs AI.
 * Designed with modern AI startup aesthetics (Stripe/Vercel/Linear style).
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './LandingPage.css'

const featureList = [
  {
    icon: '⚡',
    badge: 'RAG Architecture',
    title: 'Precision Context Retrieval',
    desc: 'Extracts relevant document passages in milliseconds using vector similarity search, bypassing context window limitations.'
  },
  {
    icon: '🛡️',
    badge: 'Factual Accuracy',
    title: 'Zero Hallucinations Guarantee',
    desc: 'The AI is strictly constrained to your uploaded text. If an answer is not in the document, it explicitly informs you.'
  },
  {
    icon: '📂',
    badge: 'Multi-Format Support',
    title: 'PDF, DOCX & TXT Parsing',
    desc: 'Seamlessly upload and analyze research papers, contracts, study notes, and business reports up to 20MB.'
  },
  {
    icon: '🔐',
    badge: 'Enterprise Security',
    title: 'Isolated Data Privacy',
    desc: 'All documents and chat histories are protected with JWT authentication and strict account-level data boundary rules.'
  },
  {
    icon: '📊',
    badge: 'Structured Output',
    title: 'Clean Markdown Responses',
    desc: 'AI answers are formatted with headings, bullet points, bold key terms, and code snippets for maximum readability.'
  },
  {
    icon: '📜',
    badge: 'Persistent History',
    title: 'Complete Chat Memory',
    desc: 'Revisit any previous conversation or document chat session anytime with formatted timeline history.'
  }
]

const formatPills = [
  { ext: 'PDF', label: 'Adobe Acrobat Documents', icon: '📕', bg: '#FEE2E2', color: '#DC2626' },
  { ext: 'DOCX', label: 'Microsoft Word Files', icon: '📘', bg: '#DBEAFE', color: '#2563EB' },
  { ext: 'TXT', label: 'Plain Text Notes', icon: '📄', bg: '#F3E8FF', color: '#7C3AED' }
]

function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('summary')

  return (
    <div className="landing-page page-wrapper">
      <Navbar />

      {/* ======================================================
          HERO SECTION
          ====================================================== */}
      <section className="pro-hero">
        <div className="pro-hero-glow"></div>

        <div className="container pro-hero-grid">
          
          {/* Left Column: Text & CTA */}
          <div className="pro-hero-left">
            <div className="pro-pill-badge">
              <span className="pill-dot"></span>
              <span>Next-Gen Document Intelligence</span>
            </div>

            <h1 className="pro-hero-title">
              Talk to Any Document.<br />
              <span className="pro-gradient-text">Get Instant AI Insights.</span>
            </h1>

            <p className="pro-hero-sub">
              Upload long PDFs, reports, or research notes and ask questions. 
              Our RAG engine retrieves exact passages and answers <strong>strictly from your file context</strong>.
            </p>

            {/* Auth-Aware CTA Buttons */}
            <div className="pro-hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-lg pro-btn-shadow">
                    Go to Dashboard →
                  </Link>
                  <Link to="/upload" className="btn btn-secondary btn-lg">
                    Upload Document
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg pro-btn-shadow">
                    Get Started Free →
                  </Link>
                  <Link to="/about" className="btn btn-secondary btn-lg">
                    Explore Platform
                  </Link>
                </>
              )}
            </div>

            {/* Micro Trust Stats */}
            <div className="pro-hero-metrics">
              <div className="metric-item">
                <strong>100%</strong>
                <span>Context Grounded</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <strong>20MB</strong>
                <span>Max File Capacity</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <strong>0</strong>
                <span>Data Leakage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mockup Showcase */}
          <div className="pro-hero-right">
            <div className="pro-chat-glass-card">
              
              {/* Card Top Window Controls */}
              <div className="pro-card-header">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-title">
                  <span className="file-badge">📕 CSS_Layout_Guide.pdf</span>
                </div>
                <span className="status-online">● Ready</span>
              </div>

              {/* Chat Body */}
              <div className="pro-card-body">
                <div className="chat-row user-row">
                  <div className="user-bubble-pro">
                    What is CSS Grid and when should I use it?
                  </div>
                </div>

                <div className="chat-row ai-row">
                  <div className="ai-avatar-pro">🤖</div>
                  <div className="ai-bubble-pro">
                    <div className="ai-badge-sm">AskDocs AI • Document Context</div>
                    <h3>CSS Grid Layout Overview</h3>
                    <p>Based on your <strong>CSS_Layout_Guide.pdf</strong> document:</p>
                    <ul>
                      <li>• <strong>Two-Dimensional System</strong>: Grid handles both columns and rows simultaneously.</li>
                      <li>• <strong>Complex Layouts</strong>: Best used for overall page structures and major page regions.</li>
                      <li>• <strong>Flexibility</strong>: Eliminates the need for float-based positioning hacks.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer Input Bar Preview */}
              <div className="pro-card-footer">
                <input 
                  type="text" 
                  disabled 
                  placeholder="Ask a question about CSS_Layout_Guide.pdf..." 
                  className="pro-input-preview"
                />
                <button className="btn-send-preview" disabled>→</button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================================
          FORMATS BAR
          ====================================================== */}
      <section className="pro-formats-bar">
        <div className="container pro-formats-flex">
          <span className="formats-label">Supported Document Formats:</span>
          <div className="formats-pills">
            {formatPills.map((f, i) => (
              <div key={i} className="format-pill" style={{ background: f.bg, color: f.color }}>
                <span className="format-icon">{f.icon}</span>
                <span className="format-ext">{f.ext}</span>
                <span className="format-desc">({f.label})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          FEATURES GRID SECTION
          ====================================================== */}
      <section className="pro-section">
        <div className="container">
          <div className="pro-section-head">
            <span className="sub-tag">PLATFORM CAPABILITIES</span>
            <h2 className="section-title-large">Engineered for Accuracy & Speed</h2>
            <p className="section-subtitle-text">
              Everything you need to turn static documents into interactive conversations.
            </p>
          </div>

          <div className="pro-features-grid">
            {featureList.map((f, i) => (
              <div key={i} className="pro-feature-card">
                <div className="pro-feature-top">
                  <span className="pro-feature-icon">{f.icon}</span>
                  <span className="pro-feature-badge">{f.badge}</span>
                </div>
                <h3 className="pro-feature-title">{f.title}</h3>
                <p className="pro-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          HOW IT WORKS (Interactive Steps)
          ====================================================== */}
      <section className="pro-section how-bg">
        <div className="container">
          <div className="pro-section-head">
            <span className="sub-tag">SIMPLE THREE-STEP PROCESS</span>
            <h2 className="section-title-large">How AskDocs AI Works</h2>
            <p className="section-subtitle-text">No technical setup required. Upload, ask, and receive instant answers.</p>
          </div>

          <div className="pro-steps-grid">
            <div className="pro-step-card">
              <span className="pro-step-num">01</span>
              <h3>Upload Document</h3>
              <p>Select any PDF, DOCX, or TXT file up to 20MB. Your document is processed with instant text vectorization.</p>
            </div>

            <div className="pro-step-card">
              <span className="pro-step-num">02</span>
              <h3>Ask Question</h3>
              <p>Type any question in plain English. The similarity search engine extracts the top relevant passages.</p>
            </div>

            <div className="pro-step-card">
              <span className="pro-step-num">03</span>
              <h3>Get AI Response</h3>
              <p>Receive structured answers with bullet points and bold highlights strictly based on your document content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA BANNER
          ====================================================== */}
      <section className="pro-section cta-bg">
        <div className="container">
          <div className="pro-cta-banner">
            <h2 className="cta-heading">Start Reading Documents 10x Faster</h2>
            <p className="cta-subtext">Join students, researchers, and professionals who save hours every day.</p>
            <div className="pro-cta-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
                  <Link to="/upload" className="btn btn-secondary btn-lg style-white">Upload New Document</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Create Free Account →</Link>
                  <Link to="/login" className="btn btn-secondary btn-lg style-white">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default LandingPage

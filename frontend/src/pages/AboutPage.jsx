/**
 * pages/AboutPage.jsx
 * 
 * Standard Professional SaaS "About Us" Page.
 * Styled like modern AI products (ChatPDF, Notion AI, Perplexity).
 */

import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './AboutPage.css'

const coreValues = [
  {
    icon: '🎯',
    title: 'Zero Hallucinations',
    desc: 'Our AI is strictly constrained to your uploaded files. It never fabricates answers or relies on unverified outside knowledge.'
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    desc: 'Your documents and chat history belong to you. We store data with bank-grade encryption and individual account isolation.'
  },
  {
    icon: '⚡',
    title: 'Instant Intelligence',
    desc: 'Stop skimming through hundreds of pages. Extract key insights, summaries, and exact answers in seconds.'
  },
  {
    icon: '💡',
    title: 'Simple & Intuitive',
    desc: 'No complex setup or prompt engineering required. Drag and drop your file and start asking questions immediately.'
  }
]

const targetAudience = [
  {
    role: 'Students & Learners',
    icon: '🎓',
    desc: 'Quickly analyze textbooks, research papers, lecture notes, and study guides for exam prep.'
  },
  {
    role: 'Researchers & Academics',
    icon: '🔬',
    desc: 'Extract citations, methodologies, findings, and summaries across dense academic literature.'
  },
  {
    role: 'Job Seekers & HR',
    icon: '💼',
    desc: 'Review resumes, job descriptions, company policies, and interview preparation materials.'
  },
  {
    role: 'Legal & Business Pros',
    icon: '⚖️',
    desc: 'Analyze contracts, financial reports, technical documentation, and compliance files effortlessly.'
  }
]

const howItWorks = [
  {
    step: '01',
    title: 'Upload Your Document',
    desc: 'Drag & drop any PDF, DOCX, or TXT file up to 20MB into your secure account.'
  },
  {
    step: '02',
    title: 'Ask Anything',
    desc: 'Type questions in natural language. Ask for summaries, specific terms, or key takeaways.'
  },
  {
    step: '03',
    title: 'Get Instant AI Answers',
    desc: 'Receive clear, structured responses with headings and bullet points based strictly on your document.'
  }
]

function AboutPage() {
  return (
    <div className="about-page page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <section className="saas-about-hero">
        <div className="container">
          <div className="saas-hero-content">
            <span className="saas-hero-pill">✨ Empowering Document Intelligence</span>
            <h1 className="saas-hero-title">
              Transforming How You Read &<br />
              <span className="text-primary-gradient">Understand Documents</span>
            </h1>
            <p className="saas-hero-subtitle">
              AskDocs AI is designed to eliminate information overload. We combine advanced artificial 
              intelligence with document retrieval to help you get accurate answers from long PDFs in seconds.
            </p>
          </div>
        </div>
      </section>

      <div className="container saas-about-container">

        {/* Mission Statement */}
        <section className="saas-mission-card">
          <div className="saas-mission-grid">
            <div className="saas-mission-text">
              <span className="saas-section-tag">OUR MISSION</span>
              <h2>Making Knowledge Instantly Accessible to Everyone</h2>
              <p>
                Every day, millions of students, researchers, and professionals waste countess hours manually 
                skimming through 50-page reports and dense PDFs just to find a single paragraph of information.
              </p>
              <p>
                <strong>AskDocs AI was built to solve this problem.</strong> By connecting your documents directly 
                with state-of-the-art AI language models, we turn static documents into interactive conversations.
              </p>
            </div>
            <div className="saas-mission-stat-box">
              <div className="stat-item">
                <span className="stat-num">10x</span>
                <span className="stat-label">Faster Document Review</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Context-Grounded Answers</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">0</span>
                <span className="stat-label">Outside Hallucinations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values / Features */}
        <section className="saas-values-section">
          <div className="saas-header-center">
            <span className="saas-section-tag">WHY CHOOSE US</span>
            <h2>Built on Four Core Principles</h2>
            <p>Designed from the ground up for speed, security, and absolute factual accuracy.</p>
          </div>

          <div className="values-grid">
            {coreValues.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who It's Built For */}
        <section className="saas-audience-section">
          <div className="saas-header-center">
            <span className="saas-section-tag">TARGET USERS</span>
            <h2>Who Uses AskDocs AI?</h2>
            <p>Tailored solutions for anyone who deals with complex documents daily.</p>
          </div>

          <div className="audience-grid">
            {targetAudience.map((a, i) => (
              <div key={i} className="audience-card">
                <div className="audience-icon">{a.icon}</div>
                <h3>{a.role}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Simple How It Works */}
        <section className="saas-how-section">
          <div className="saas-header-center">
            <span className="saas-section-tag">SIMPLE WORKFLOW</span>
            <h2>How AskDocs AI Works</h2>
            <p>Get started in 3 simple steps — no technical setup required.</p>
          </div>

          <div className="how-workflow-grid">
            {howItWorks.map((h, i) => (
              <div key={i} className="how-workflow-card">
                <span className="how-step-badge">{h.step}</span>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="saas-cta-banner">
          <div className="saas-cta-content">
            <h2>Experience the Future of Document Reading</h2>
            <p>Upload your first PDF or Word document today and start getting instant AI answers.</p>
            <div className="saas-cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>Login to Account</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default AboutPage

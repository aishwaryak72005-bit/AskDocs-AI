/**
 * pages/AboutPage.jsx
 * 
 * Distinct SaaS Product & FAQ Page.
 * Completely distinct from the Landing Page layout.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './AboutPage.css'

const faqs = [
  {
    q: 'How does AskDocs AI ensure 100% factual accuracy?',
    a: 'We use Retrieval-Augmented Generation (RAG). When you ask a question, the system searches your document for exact matching passages and instructs the AI model to answer strictly from that context. If the answer is not in the text, it explicitly states so.'
  },
  {
    q: 'Are my uploaded documents private and secure?',
    a: 'Yes. All files are bound strictly to your authenticated user account via JWT tokens. Your documents are never shared, never exposed publicly, and never used to train global AI models.'
  },
  {
    q: 'What document formats and file sizes are supported?',
    a: 'AskDocs AI supports PDF (.pdf), Microsoft Word (.docx), and Plain Text (.txt) files up to 20MB in size.'
  },
  {
    q: 'Can I review my past conversations?',
    a: 'Absolutely. Every question and AI answer is saved under your account in the History tab, where you can view timeline logs or delete entries anytime.'
  },
  {
    q: 'What happens if I upload a scanned PDF?',
    a: 'Currently, the system extracts digital text directly. For best results, use text-based PDFs or Word documents. Scanned image-based PDFs are planned for future OCR updates.'
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

function AboutPage() {
  const { isAuthenticated } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="about-page page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero-dark">
        <div className="container">
          <div className="about-hero-box">
            <span className="about-pill-light">🛡️ Security, Privacy & Accuracy Standard</span>
            <h1 className="about-hero-title-dark">
              About <span className="title-highlight">AskDocs AI</span>
            </h1>
            <p className="about-hero-desc-dark">
              Built to eliminate information overload by transforming static documents into intelligent, 
              interactive conversations with zero hallucinations.
            </p>
          </div>
        </div>
      </section>

      <div className="container about-body-container">

        {/* Vision & Mission Grid */}
        <section className="vision-section">
          <div className="vision-grid">
            <div className="vision-card border-primary">
              <span className="vision-tag">THE PROBLEM</span>
              <h3>Information Overload</h3>
              <p>
                Reading 50-page reports, textbooks, or research papers takes hours. Skimming often leads 
                to missing crucial clauses, data points, or exam answers.
              </p>
            </div>
            <div className="vision-card border-success">
              <span className="vision-tag green">THE SOLUTION</span>
              <h3>RAG Document Intelligence</h3>
              <p>
                AskDocs AI indexes your document in seconds, allowing you to ask natural language questions 
                and receive precise, formatted answers grounded strictly in your file text.
              </p>
            </div>
          </div>
        </section>

        {/* Who Uses Section */}
        <section className="audience-section-new">
          <div className="section-title-wrap">
            <span className="section-tag-sm">VERSATILE USE CASES</span>
            <h2>Who Uses AskDocs AI?</h2>
            <p>Designed for anyone who works with complex text documents daily.</p>
          </div>

          <div className="audience-grid-new">
            {targetAudience.map((a, i) => (
              <div key={i} className="audience-card-new">
                <div className="aud-icon">{a.icon}</div>
                <h3>{a.role}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="faq-section">
          <div className="section-title-wrap">
            <span className="section-tag-sm">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Everything You Need to Know</h2>
            <p>Common questions about security, accuracy, and document processing.</p>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`faq-item ${openFaq === idx ? 'faq-item-open' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question-row">
                  <h3>{faq.q}</h3>
                  <span className="faq-icon-toggle">{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <div className="faq-answer-content">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Contact / Action Bar */}
        <section className="about-action-bar">
          <div className="action-bar-text">
            <h3>Have more questions?</h3>
            <p>Upload a document to test accuracy firsthand or jump back to your Dashboard.</p>
          </div>
          <div className="action-bar-btn">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
            ) : (
              <Link to="/register" className="btn btn-primary">Get Started Free →</Link>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

export default AboutPage

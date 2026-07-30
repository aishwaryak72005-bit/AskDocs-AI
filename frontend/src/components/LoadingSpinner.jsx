/**
 * components/LoadingSpinner.jsx
 * 
 * Reusable loading spinner component.
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - text: Optional text to show below the spinner
 * - white: If true, uses white spinner (for dark backgrounds)
 */

import React from 'react'

function LoadingSpinner({ size = 'md', text = '', white = false }) {
  // Determine spinner size
  const sizes = {
    sm: { width: 16, height: 16, border: 2 },
    md: { width: 24, height: 24, border: 2 },
    lg: { width: 40, height: 40, border: 3 },
  }

  const { width, height, border } = sizes[size] || sizes.md

  const spinnerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    borderWidth: `${border}px`,
    borderStyle: 'solid',
    borderColor: white
      ? 'rgba(255,255,255,0.3)'
      : 'rgba(79, 70, 229, 0.2)',
    borderTopColor: white ? 'white' : 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={spinnerStyle}></div>
      {text && (
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: white ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)'
        }}>
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner

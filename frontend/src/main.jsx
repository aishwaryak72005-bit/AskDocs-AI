/**
 * main.jsx
 * 
 * Entry point of the React application.
 * This file mounts the React app into the <div id="root"> in index.html.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Mount the React app to the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

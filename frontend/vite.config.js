import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for AskDocs AI frontend.
 * 
 * proxy: forwards /api requests to Django backend during development
 * so we don't get CORS issues when running locally.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request starting with /api will be forwarded to Django
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

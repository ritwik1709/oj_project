import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: process.env.PORT || 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'online-judge-frontend-1jhg.onrender.com',
      'online-judge-frontend.onrender.com'
    ]
  },
  server: {
    host: true,
    port: process.env.PORT || 5173,
    strictPort: true
  }
})

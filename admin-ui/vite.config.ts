import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/v1/pods': 'http://localhost:8080',
      '/api/v1/probes': 'http://localhost:8080',
      '/api/v1/events': 'http://localhost:8080',
      '/api/v1/healthz': 'http://localhost:8080',
      '/api/v1/ready': 'http://localhost:8080'
    },
  },
}) 
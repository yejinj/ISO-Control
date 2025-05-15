import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/pods': 'http://localhost:8080',
      '/probes': 'http://localhost:8080',
      '/events': 'http://localhost:8080',
      '/healthz': 'http://localhost:8080',
      '/ready': 'http://localhost:8080'
    },
  },
}) 
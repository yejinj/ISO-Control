import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pods': 'http://localhost:8000',
      '/probes': 'http://localhost:8000',
      '/events': 'http://localhost:8000',
    },
  },
}) 
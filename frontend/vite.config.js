import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 80,
    host: '0.0.0.0',
    // Permitir todos los hosts (necesario para Seenode)
    allowedHosts: 'all'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
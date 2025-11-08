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
    strictPort: false,
    // Permitir todos los hosts de Seenode usando comodines
    allowedHosts: [
      '.seenode.com',
      '.run-on-seenode.com',
      'web-qpoc0u8vxvts.up-de-fra1-k8s-1.apps.run-on-seenode.com'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // ✅ Advanced CORS headers for Firebase
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    // ✅ Proxy Firebase requests (optional)
    proxy: {}
  },
  optimizeDeps: {
    force: true,
    // ✅ Pre-bundle Firebase modules
    include: ['firebase/app', 'firebase/auth']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    // ✅ Ensure proper CORS in production
    target: 'esnext',
    sourcemap: false
  }
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  base: '/',
  
  // Development Server
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true
    // ✅ REMOVED ALL HEADERS - Fixes COOP issue
  },
  
  // Production Build  
  build: {
    minify: 'esbuild',  // ✅ Changed to esbuild (faster, no extra package needed)
    sourcemap: false,
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    
    // ✅ Removed terserOptions (not needed with esbuild)
    
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  
  // Dependency Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth'
    ]
  },
  
  // Preview Server
  preview: {
    port: 3000,
    host: true,
    open: true
  }
}));

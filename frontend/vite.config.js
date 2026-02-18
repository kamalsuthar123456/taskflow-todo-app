import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // ============================================
  // 🔥 DEVELOPMENT SERVER (Local)
  // ============================================
  server: {
  port: 5173,
  strictPort: true,
  host: true,
  open: true,

  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups', 
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  }
},
  
  // ============================================
  // 🔥 PRODUCTION BUILD (Vercel/Deployment)
  // ============================================
  build: {
    minify: 'esbuild',
    sourcemap: mode === 'production' ? false : true,
    target: 'esnext',
    outDir: 'dist',
    
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
      }
    },
    
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          
          'vendor-ui': ['framer-motion', 'react-hot-toast', 'lucide-react']
        },
        
        // Better file naming for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Performance optimization
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  
  // ============================================
  // 🔥 DEPENDENCY OPTIMIZATION
  // ============================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'axios',
      'framer-motion'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // ============================================
  // 🔥 PREVIEW SERVER (npm run preview)
  // ============================================
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
    open: true
  },
  
  // ============================================
  // 🔥 ENVIRONMENT VARIABLES
  // ============================================
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production'
  }
}));

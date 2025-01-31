import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      '/vocabulary': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/small-talk': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/answers': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/bot': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
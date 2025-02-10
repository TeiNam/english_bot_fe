// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/v1': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1')
        }
      },
      host: true,
      port: 5173,
      watch: {
        usePolling: true // Docker 환경에서의 HMR을 위해 필요
      },
      historyApiFallback: true,
    },
    build: {
      sourcemap: true,
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@tanstack/react-query', 'zustand', 'axios']
          }
        }
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react']
    }
  };
});
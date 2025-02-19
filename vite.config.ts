import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { PreRenderedAsset } from 'rollup';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true
        }
    },
    build: {
        sourcemap: true,
        outDir: 'dist',
        assetsDir: 'assets',
        cssCodeSplit: true,
        modulePreload: false,
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo: PreRenderedAsset): string => {
                    let extType = assetInfo.name?.split('.').pop();
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
                        extType = 'img';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@tanstack/react-query', 'zustand', 'axios']
                }
            }
        },
        target: 'esnext',
        minify: 'esbuild',  // terser 대신 esbuild 사용
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
        include: ['react', 'react-dom', 'react-router-dom'],
        esbuildOptions: {
            target: 'esnext'
        }
    }
});
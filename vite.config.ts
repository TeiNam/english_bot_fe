import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import type {PreRenderedAsset} from 'rollup';
import type {ProxyOptions} from 'vite';
import type {IncomingMessage, ServerResponse} from 'http';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL,
                changeOrigin: true,
                secure: false,
                xfwd: true,
                configure: (proxy: any, _options: ProxyOptions) => {
                    proxy.on('proxyReq', (proxyReq: any, req: IncomingMessage, _res: ServerResponse) => {
                        // 원본 프로토콜 헤더 전달
                        if (req.headers['x-forwarded-proto']) {
                            proxyReq.setHeader('X-Forwarded-Proto', req.headers['x-forwarded-proto']);
                        }
                    });
                }
            }
        },
        watch: {
            usePolling: true
        },
        // 프록시 헤더 신뢰 설정
        strictPort: true
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
        target: 'es2020',
        minify: true,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
        include: ['react', 'react-dom', 'react-router-dom'],
        esbuildOptions: {
            target: 'es2020'
        }
    }
});
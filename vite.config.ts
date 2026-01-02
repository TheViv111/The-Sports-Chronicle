import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import type { NextFunction } from 'connect';

export default defineConfig(({ mode }) => {
  const plugins = [
    react(),
  ];

  // Add visualizer in analyze mode
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }) as any
    );
  }

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom']
    },
    base: '/',
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    server: {
      host: '::',
      port: 0,
      strictPort: false,
      open: true,
      proxy: {
        // Proxy API requests to avoid CORS issues
        '/api': {
          target: 'https://whgjiirmcbsiqhjzgldy.supabase.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // Don't cache API responses
          headers: {
            'Cache-Control': 'no-cache, must-revalidate',
            'Vary': 'Accept-Encoding'
          }
        }
      },
      fs: {
        // Allow serving files from the project root
        allow: ['..']
      }
    },
    plugins,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      // Use esbuild for faster, smaller builds
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Core React - critical, load first
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // UI components - can be deferred
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              // Supabase - can be deferred
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              // Icons - can be deferred
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              // Heavy libraries - lazy load
              if (id.includes('@splinetool')) {
                return 'spline-vendor';
              }
              if (id.includes('quill') || id.includes('react-quill')) {
                return 'editor-vendor';
              }
              if (id.includes('embla-carousel')) {
                return 'carousel-vendor';
              }
              // Utils - small, can bundle together
              if (id.includes('lodash') || id.includes('axios') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'utils-vendor';
              }
              // Analytics - lazy load
              if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
                return 'analytics-vendor';
              }
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      // Include all assets in the build
      assetsInclude: ['**/*.json'],
      // Optimize chunk size for mobile - stricter limits
      chunkSizeWarningLimit: 300,
      reportCompressedSize: false,
      cssCodeSplit: true
    }
  };
});
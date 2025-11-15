import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import vitePluginTranslations from './vite.translations';

// https://vitejs.dev/config/
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import type { NextFunction } from 'connect';

export default defineConfig(({ mode }) => {
  const plugins = [
    react({
      // Add this to support path aliases in JSX
      jsxImportSource: '@emotion/react',
    }),
    // Copy translation files to build directory
    vitePluginTranslations(),
    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/whgjiirmcbsiqhjzgldy\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: {
        name: 'The Sports Chronicle',
        short_name: 'SportsChronicle',
        description: 'Your ultimate sports news and updates',
        theme_color: '#1e293b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/The Sports Chronicle Logo-modified.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/The Sports Chronicle Logo-modified.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    // Compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
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

  // Add additional compression in production
  if (mode === 'production') {
    plugins.push(
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
      })
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
          rewrite: (path) => path.replace(/^\/api/, '')
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
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-avatar', '@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
            vendor: ['lodash', 'axios', 'clsx', 'tailwind-merge'],
            carousel: ['embla-carousel-react', 'embla-carousel-autoplay'],
            icons: ['lucide-react'],
            supabase: ['@supabase/supabase-js', '@supabase/auth-ui-react', '@supabase/auth-ui-shared']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      // Include all assets in the build
      assetsInclude: ['**/*.json']
    }
  };
});

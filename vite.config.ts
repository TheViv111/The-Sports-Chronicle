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
    react(),
    // Copy translation files to build directory
    vitePluginTranslations(),
    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline', // Inline to avoid blocking external script
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,avif}'],
        // Increase maximum file size to cache large vendor bundles
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        // Advanced caching strategies for optimal performance
        runtimeCaching: [
          {
            // Critical resources - CacheFirst with network fallback
            urlPattern: /\.(?:js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year for better performance
              },
              cacheableResponse: {
                statuses: [0, 200],
                headers: {
                  'Cache-Control': 'public, max-age=31536000, immutable'
                }
              },
              // Background sync for updates
              backgroundSync: {
                name: 'static-sync',
                options: {
                  maxRetentionTime: 24 * 60 // 24 hours
                }
              }
            }
          },
          {
            // Images with advanced caching and optimization
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
                headers: {
                  'Cache-Control': 'public, max-age=31536000, immutable'
                }
              }
            }
          },
          {
            // Fonts with aggressive caching
            urlPattern: /\.(?:woff|woff2|ttf|eot|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
                headers: {
                  'Cache-Control': 'public, max-age=31536000, immutable'
                }
              },
              // Fonts are critical, always cache first
              fetchOptions: {
                mode: 'cors',
                credentials: 'omit'
              }
            }
          },
          {
            // API with intelligent caching
            urlPattern: /^https:\/\/whgjiirmcbsiqhjzgldy\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 5 // 5 minutes for fresher content
              },
              cacheableResponse: {
                statuses: [0, 200, 404], // Cache 404s to prevent repeated failed requests
                headers: {
                  'Cache-Control': 'public, max-age=43200, must-revalidate'
                }
              },
              // Network timeout for faster fallback to cache
              networkTimeoutSeconds: 3
            }
          },
          {
            // External CDN resources
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // HTML pages - StaleWhileRevalidate for fresh content
            urlPattern: /\.(?:html|htm)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'html-pages',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days for HTML
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
          ,
          {
            urlPattern: /\/translations\/.+\.json$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'translations',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Skip waiting for immediate updates
        skipWaiting: true,
        clientsClaim: true
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

  // Add compression in production
  if (mode === 'production') {
    plugins.push(
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
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

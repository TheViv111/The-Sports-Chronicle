import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
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
  plugins: [
    react({
      babel: { 
        plugins: [["babel-plugin-react-compiler", { compilationMode: "annotation" }]],
      },
    }),
    // Visualize bundle size in production
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/bundle-analyzer.html',
    }),
    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      },
      manifest: {
        name: 'The Sports Chronicle',
        short_name: 'SportsChronicle',
        description: 'Your ultimate sports news and updates',
        theme_color: '#ffffff',
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
    // Compression for production
    mode === 'production' && viteCompression({ 
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    mode === 'production' && viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure JSON files are properly resolved
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  // Handle JSON files properly
  json: {
    stringify: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: mode !== 'production',
    emptyOutDir: true,
    // Ensure JSON files are properly handled
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor-other';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}));

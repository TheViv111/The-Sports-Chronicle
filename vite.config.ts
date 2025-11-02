import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',  // Add this line for correct base path in production
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    viteCompression({ 
      algorithm: "gzip", 
      ext: ".gz", 
      threshold: 1024,
      deleteOriginFile: false  // Keep original files
    }),
    viteCompression({ 
      algorithm: "brotliCompress", 
      ext: ".br", 
      threshold: 1024,
      deleteOriginFile: false  // Keep original files
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
}));

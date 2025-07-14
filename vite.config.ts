import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    splitVendorChunkPlugin(), // Optimisation du bundle
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Optimisation du bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk pour les librairies React
          'react-vendor': ['react', 'react-dom'],
          // Chunk pour Supabase et auth
          'supabase': ['@supabase/supabase-js'],
          // Chunk pour les icônes (grosse librairie)
          'icons': ['lucide-react'],
          // Chunk pour les utilitaires de routing
          'routing': ['wouter']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'wouter', 
      'lucide-react',
      '@supabase/supabase-js'
    ]
  }
});

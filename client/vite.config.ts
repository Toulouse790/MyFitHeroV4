import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copie index.html -> 404.html après le build (fallback SPA pour GitHub Pages)
function spa404Plugin(): Plugin {
  return {
    name: 'spa-404-copy',
    apply: 'build',
    closeBundle() {
      const src = path.resolve(__dirname, 'dist/index.html')
      const dst = path.resolve(__dirname, 'dist/404.html')
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst)
        console.log('SPA fallback: dist/404.html created')
      }
    },
  }
}

export default defineConfig({
  base: '/', // domaine custom -> base '/'
  plugins: [react(), spa404Plugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // imports du type '@/...'
    },
  },
  optimizeDeps: {
    include: [
      'lodash-es',
      'zustand',
      'zustand/middleware',
    ],
  },
  build: {
    sourcemap: true, // utile pour débug sur Pages
  },
})

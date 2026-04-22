import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    proxy: {
      '/api':       { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/portatil':  { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/ficha':     { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/reportes':  { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/ambiente':  { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/asignacion':{ target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/exportar':  { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/importar':  { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/uploads':   { target: 'http://127.0.0.1:3001', changeOrigin: true },
    }
  }
})

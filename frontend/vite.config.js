import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    // Em desenvolvimento, proxy redireciona chamadas /api para o Rails
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    } : {}
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
}))

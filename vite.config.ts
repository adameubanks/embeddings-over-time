import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'hf' ? '/' : '/embeddings-over-time/',
  plugins: [react()],
  build: {
    outDir: mode === 'hf' ? 'dist-hf' : 'dist',
    chunkSizeWarningLimit: 1000,
  },
}))

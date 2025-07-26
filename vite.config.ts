import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/embeddings-over-time/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
})

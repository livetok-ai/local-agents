import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@livetok/local-agents': path.resolve(__dirname, '../local-agents/src/index.ts')
    }
  },
  optimizeDeps: {
    include: ['@livetok/local-agents']
  },
  build: {
    commonjsOptions: {
      include: [/eventemitter3/]
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const buildTimestamp = new Date().toISOString();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  define: {
    'import.meta.env.BUILD_TIMESTAMP': JSON.stringify(buildTimestamp),
  },
})

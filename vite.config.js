
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'fantastic-bunny-scoring-subaru.trycloudflare.com',
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})

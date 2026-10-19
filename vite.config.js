
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'escape-filtering-anna-telephone.trycloudflare.com',
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})

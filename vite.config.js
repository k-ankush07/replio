
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'pvc-nuclear-connection-runtime.trycloudflare.com',
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})

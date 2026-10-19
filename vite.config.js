
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: [
<<<<<<< HEAD
      'fantastic-bunny-scoring-subaru.trycloudflare.com',
=======
      'execute-null-orchestra-link.trycloudflare.com',
>>>>>>> 208aaa82610d1169ca606ed0e058546bd9f45165
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})

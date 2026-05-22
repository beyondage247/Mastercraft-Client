import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/portal-api': {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/portal-api/, ''),
        target: 'https://mc-api-sakp.onrender.com',
      },
    },
  },
})

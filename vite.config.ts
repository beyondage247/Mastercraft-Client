import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'node:https'

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
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Connection', 'close')
          })
        },
        proxyTimeout: 60000,
        rewrite: (path) => path.replace(/^\/portal-api/, ''),
        secure: true,
        target: 'https://api.mastercraft-products.com',
        timeout: 60000,
        agent: new https.Agent({
          keepAlive: false,
        }),
      },
    },
  },
})

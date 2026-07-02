import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyTarget = 'http://localhost:5000'

const ignoreBenignProxyErrors = (proxy) => {
  proxy.on('error', (error) => {
    if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
      return
    }

    console.error('[vite] proxy error:', error)
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        configure: ignoreBenignProxyErrors,
      },
      '/socket.io': {
        target: proxyTarget,
        changeOrigin: true,
        ws: true,
        configure: ignoreBenignProxyErrors,
      },
    },
  },
})

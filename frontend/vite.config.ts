import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Redirige /auth y /socket.io al backend usando la variable de entorno
      '/auth': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
      // Importante para que Socket.IO funcione
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
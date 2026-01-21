import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api/,
            '/macros/s/AKfycbxos5-UZqu7QwYhShw5pdbo2sJewfzt6JWyWiePU3vH8iw1WErDyyWw6nNeGkDAI8bS/exec'
          ),
      },
    },
  },
})

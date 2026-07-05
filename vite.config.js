import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api/,
            '/macros/s/AKfycbywvwt7ceQAN-q9F7y5g4QQ1i7znUk85-UsYJxszUZNKoqg9KSBSDBv6VWXv2RaP-pE/exec'
          ),
      },
    },
  },
})

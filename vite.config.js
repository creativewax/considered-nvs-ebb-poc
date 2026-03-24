// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  assetsInclude: ['**/*.frag', '**/*.vert', '**/*.glsl'],
  server: {
    port: 5173,
    https: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-gsap': ['gsap'],
        },
      },
    },
  },
})

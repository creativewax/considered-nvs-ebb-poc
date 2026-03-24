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
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor-react'
          if (id.includes('node_modules/three')) return 'vendor-three'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) return 'vendor-ui'
          if (id.includes('node_modules/gsap')) return 'vendor-gsap'
        },
      },
    },
  },
})

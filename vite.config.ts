import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Map '@/...' to '<project-root>/src/...'
      '@': path.resolve(__dirname, 'src')
    },
  },
   server: {
    proxy: {
      // forward anything starting with /php to your PHP backend
      '/php': {
        target: 'http://localhost:9000', // where your PHP server runs
        changeOrigin: true,
        // optional: strip "/php" if backend paths don’t include it
        // rewrite: (path) => path.replace(/^\/php/, '')
      }
    }
  },
})

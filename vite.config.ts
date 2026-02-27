import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('framer-motion')) return 'framer';
            if (id.includes('lucide-react')) return 'lucide';
            return 'vendor';
          }
        }
      }
    }
  }
})

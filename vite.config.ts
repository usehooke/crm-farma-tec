import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-excel': ['xlsx'],
          'vendor-charts': ['recharts'],
          'vendor-framework': ['framer-motion', 'lucide-react', 'firebase/app', 'firebase/firestore']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});

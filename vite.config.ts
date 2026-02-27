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
          // Separa o que é pesado do que é o app
          'vendor-excel': ['xlsx'],
          'vendor-charts': ['recharts'],
          'vendor-core': ['framer-motion', 'lucide-react', 'firebase/app', 'firebase/firestore']
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
});

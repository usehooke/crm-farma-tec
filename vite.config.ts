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
          // Separa as bibliotecas pesadas de Excel e Gráficos do código principal
          'vendor-data': ['xlsx', 'recharts'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Ajusta o limite para o novo padrão
  },
})

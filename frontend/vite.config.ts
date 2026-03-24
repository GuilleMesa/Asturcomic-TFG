import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { // Con Vite establecemos proxy de api y assets para usar con React
      "/api": "http://localhost:8080",
      "/assets": "http://localhost:8080",
    },
  },
});

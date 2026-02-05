import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vi definierar roten som nuvarande mapp eftersom dina filer ligger där
  root: './',
  build: {
    // Vercel förväntar sig att den färdiga koden hamnar i 'dist'
    outDir: 'dist',
  },
  server: {
    // Säkerställer att preview fungerar lokalt om du testar där
    host: true
  }
})

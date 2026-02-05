import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Denna konfiguration gör att Vite kan hantera React-filer (.jsx) 
// och bygga projektet korrekt för publicering på Vercel.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Mappen där den färdiga webbsidan hamnar efter bygget
  },
  server: {
    port: 3000
  }
});

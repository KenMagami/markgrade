import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
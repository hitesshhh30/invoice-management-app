import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: './public',
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
  },
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// import { crx } from '@crxjs/vite-plugin';
// import manifest from './manifest.json';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        popup: resolve('src/popup.html'),
        background: resolve('src/background.ts'),
        content: resolve('src/content.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
  },
  server: {
    port: 5173,
    strictPort: true,
    open: '/popup.html',
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});

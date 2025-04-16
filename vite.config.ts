import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

// import { crx } from '@crxjs/vite-plugin';
// import manifest from './manifest.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': env,
    },
    plugins: [react(), tailwindcss()],
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
  };
});

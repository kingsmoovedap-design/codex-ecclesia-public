import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // CRITICAL: fixes blank screens on Render
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});

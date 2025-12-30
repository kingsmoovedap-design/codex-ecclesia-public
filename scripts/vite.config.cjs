import { defineConfig } from 'vite';

export default defineConfig({
  base: '/codex-ecclesia-public/',
  build: {
    outDir: 'dist'
  }
});


  // ------------------------------------------------------------
  // Dev Server
  // ------------------------------------------------------------
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: 'all',
    cors: true
  },

  // ------------------------------------------------------------
  // Preview Server (vite preview)
  // ------------------------------------------------------------
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: 'all',
    cors: true
  },

  // ------------------------------------------------------------
  // Build Options (Codex-friendly)
  // ------------------------------------------------------------
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: 'assets'
  },

  // ------------------------------------------------------------
  // Plugins (reserved for future Codex expansions)
  // ------------------------------------------------------------
  plugins: [
    // Example:
    // legacy(),
    // sitemapGenerator(),
    // codexKernelPlugin()
  ]
});

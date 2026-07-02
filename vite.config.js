import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    port: 5173,
    open: true,
    host: true,
  },

  build: {
    outDir: 'dist',
    // Source maps only in development — avoids exposing source in production bundle
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term cache utilisation
        manualChunks: {
          vendor: ['react', 'react-dom'],
          http: ['axios'],
        },
      },
    },
  },

  esbuild: {
    // Strip all console.* and debugger statements from the production bundle.
    // Guards: the moderatorApi console.warn and any stray logs are removed at compile time.
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))

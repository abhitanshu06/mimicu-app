import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and ReactDOM in their own chunk — loaded and cached independently
          'react-vendor': ['react', 'react-dom'],
          // Three.js core in its own chunk (~700KB min) — rarely changes, CDN-cacheable
          // Note: @react-three/fiber and @react-three/drei depend on both react and three,
          // so they stay in the main index chunk to avoid circular chunk warnings.
          'three-vendor': ['three'],
        },
      },
    },
  },
});

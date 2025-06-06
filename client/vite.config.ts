import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { isDevelopment } from './src/config/environment';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: isDevelopment,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: !isDevelopment,
        drop_debugger: !isDevelopment,
      },
    },
  },
  clearScreen: false,
  logLevel: isDevelopment ? 'info' : 'error',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
}); 
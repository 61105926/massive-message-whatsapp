import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3002,
    strictPort: true,
  },
  build: {
    // Asegurar que todos los archivos tengan hash para invalidar caché
    rollupOptions: {
      output: {
        // Generar hashes para todos los archivos
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generar manifest para tracking de versiones
    manifest: true,
    // Aumentar el límite de advertencias para chunks grandes
    chunkSizeWarningLimit: 1000,
  },
})
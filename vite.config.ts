import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3100,
    host: '127.0.0.1', // Use 127.0.0.1 to match the WaaP iframe origin
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    // Note: @mysten/sui uses subpath exports only (e.g., @mysten/sui/client)
    // so we can't include it directly - only include packages with root exports
    include: ['@mysten/dapp-kit', '@tanstack/react-query', 'viem', '@noble/secp256k1'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})

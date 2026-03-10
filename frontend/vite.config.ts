import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  define: {
    'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify('ap-south-1_jO485jnFQ'),
    'import.meta.env.VITE_COGNITO_CLIENT_ID': JSON.stringify('4g6rr38ne2qlbsqre9gjek2vms'),
    'import.meta.env.VITE_AWS_REGION': JSON.stringify('ap-south-1'),
    'import.meta.env.VITE_API_URL': JSON.stringify('https://mpc39jrp5b.execute-api.ap-south-1.amazonaws.com/dev'),
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
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
    'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify('us-east-1_pBeC76AMj'),
    'import.meta.env.VITE_COGNITO_CLIENT_ID': JSON.stringify('4a4907onrollsq8duto9474plr'),
    'import.meta.env.VITE_AWS_REGION': JSON.stringify('us-east-1'),
    'import.meta.env.VITE_API_URL': JSON.stringify('https://sbckvoyih4.execute-api.us-east-1.amazonaws.com/dev'),
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
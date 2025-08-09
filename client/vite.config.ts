import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ▼▼▼▼▼ 이 부분을 추가 ▼▼▼▼▼
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    }
  }
  // ▲▲▲▲▲ 여기까지 추가 ▲▲▲▲▲
})

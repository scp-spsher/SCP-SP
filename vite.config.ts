import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SCP-SP/', // ВОТ ЭТА СТРОКА — ТВОЙ СПАСИТЕЛЬНЫЙ КРУГ
})

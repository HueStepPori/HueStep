import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// GitHub Pages(프로덕션)일 때만 /HueStep/ 사용
const isProd = process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [react()],
  base: isProd ? '/HueStep/' : '/',   // ← 저장소명이 HueStep 이므로 여기만 교체
})

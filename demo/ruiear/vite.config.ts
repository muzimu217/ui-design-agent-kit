import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
    // showcase 拼装管线（build-pages.mjs）要求每个可发布 app 提供
    // Vite 内建依赖许可报告
    license: { fileName: 'third-party-licenses.json' },
  },
})

import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Picsum 素材工坊 API 代理（server 与 preview 共用；缩略/大图 CDN 直连不走此代理） */
const picsumProxy: Record<string, ProxyOptions> = {
  '/picsum-api': {
    target: 'https://picsum.photos',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/picsum-api/, ''),
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    // 双栈绑定：vite 默认可能只绑 ::1（IPv6），IPv4 127.0.0.1 访问会被拒
    host: true,
    proxy: picsumProxy,
  },
  preview: {
    host: true,
    proxy: picsumProxy,
  },
  build: {
    target: 'es2022',
  },
});

import { defineConfig, type HtmlTagDescriptor } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

let basePath = '/';
const configuredOrigin = process.env.SHOWCASE_SITE_ORIGIN;
const siteOrigin = configuredOrigin ? new URL(configuredOrigin) : null;
if (siteOrigin && (siteOrigin.protocol !== 'https:' || siteOrigin.username || siteOrigin.password || siteOrigin.pathname !== '/' || siteOrigin.search || siteOrigin.hash)) {
  throw new Error('SHOWCASE_SITE_ORIGIN must be an HTTPS origin without credentials or a path');
}

export default defineConfig({
  plugins: [react(), {
    name: 'workflow-social-preview',
    configResolved(config) {
      basePath = config.base;
    },
    transformIndexHtml() {
      const image = `${basePath}og-image.webp`;
      const tags: HtmlTagDescriptor[] = [{ tag: 'meta', attrs: { property: 'og:image', content: siteOrigin ? new URL(image, siteOrigin).href : image } }];
      if (siteOrigin) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: new URL(basePath, siteOrigin).href } });
      return tags;
    },
    generateBundle() {
      this.emitFile({
        type: 'asset', fileName: 'og-image.webp',
        source: readFileSync(new URL('./media/workflow-cover.webp', import.meta.url)),
      });
    },
  }],
  build: { target: 'es2022', license: { fileName: 'third-party-licenses.json' } },
});

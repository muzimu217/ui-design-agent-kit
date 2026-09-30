import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 同款根路径自答中间件（appType custom 使缺失路径真 404；本场景无资产加载，纯预防）
function serveRootHtml() {
  // 每请求现读盘：开发期 index.html 编辑即时生效（缓存会导致 HTML 改动不热更）
  const handler = (req, res, next) => {
    if (req.url === "/" || req.url.startsWith("/?")) {
      const html = readFileSync(fileURLToPath(new URL("./index.html", import.meta.url)));
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
      return;
    }
    next();
  };
  return {
    name: "serve-root-html",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  appType: "custom",
  plugins: [serveRootHtml()],
  server: { host: true },
  preview: { host: true },
});

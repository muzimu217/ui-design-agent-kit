import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 无前端路由：关掉 SPA history-fallback，让缺失资产真 404（被验收语境：GLB 请求被 block）。
// custom 模式下 Vite 不再服务 index.html——中间件自行读盘应答根路径，其余缺失路径维持 404。
function serveRootHtml() {
  const html = readFileSync(fileURLToPath(new URL("./index.html", import.meta.url)));
  const handler = (req, res, next) => {
    if (req.url === "/" || req.url.startsWith("/?")) {
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

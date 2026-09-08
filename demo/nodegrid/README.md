# NODEGRID · 全球节点云（Demo）

虚构云服务商的单页 3D 演示：首页一颗可交互的数据地球，进入后是一张
科幻风的全球网络地图——每个机房是一枚闪亮、可点开的光点节点。覆盖裸服务器、
公网 IP、IP 段等产品货架与价格展示（demo 数据，页面内标注）。

设计全链文档见本目录：`DIRECTION.md`（门A 方向稿与用户裁决）、
`PROTOTYPE.md` / `IMPLEMENTATION.md` / `ACCEPTANCE.md`（原型、实现契约、
门E 三轮验收记录）。

## 本地运行

```sh
npm ci --ignore-scripts
npm run dev
```

默认开发地址为 http://127.0.0.1:5173（本机端口紧张时请显式换端口）。
构建产物为纯静态文件：

```sh
npm run build   # → dist/
python3 -m http.server 4182 --directory dist
```

需要支持 WebGL 2 的现代浏览器；地理边界数据 `countries-110m.json` 随
`dist/` 一并分发。

[`nodegrid-layout.browser.js`](../../showcase/tests/nodegrid-layout.browser.js)
可由 Playwright MCP 的 `browser_run_code_unsafe.filename` 在展示站页面执行，
验证 375、390、768、1440px 四档的真实画布边界，避免页面隐藏横向溢出时
漏报画布裁切。该检查需真实浏览器，不等同于构建成功。

# NODEGRID

以可交互地球和全球网络地图呈现云节点分布的 3D 演示。

[快速开始](#本地运行) · [功能与边界](#功能与边界) · [验证与资料](#验证与资料)

![NODEGRID 真实桌面截图，展示地球、节点网络与进入网络的操作](screenshots/readme-desktop.webp)

> 虚构云服务商 demo。节点延迟、规格和价格均为演示数据，不是实时监控或可购买的云服务。[截图记录](../../docs/readme-media.md)

## 功能与边界

- 拖动和缩放地球，查看不同地区的节点分布。
- 进入全球网络地图，选择节点查看详情。
- 浏览裸服务器、公网 IP 和 IP 段的演示货架。

不提供账户、真实机房查询、支付或资源开通；不把演示延迟作为网络测速结果。

## 本地运行

推荐 Node.js 24。在仓库根目录进入本项目：

```sh
cd demo/nodegrid
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1 --port 5176
```

开发地址以终端输出为准；端口被占用时换一个端口。
构建产物为纯静态文件：

```sh
npm run build   # → dist/
python3 -m http.server 4182 --directory dist
```

需要支持 WebGL 2 的现代浏览器；地理边界数据 `countries-110m.json` 随
`dist/` 一并分发。

## 验证与资料

[方向记录](DIRECTION.md) · [原型记录](PROTOTYPE.md) · [实现契约](IMPLEMENTATION.md) · [历史验收](ACCEPTANCE.md)

`npm run build` 包含类型检查。本项目未配置 `npm test`；构建成功不代表 3D 交互、所有设备和素材加载都已通过浏览器验收。

[`nodegrid-layout.browser.js`](../../showcase/tests/nodegrid-layout.browser.js)
可由 Playwright MCP 的 `browser_run_code_unsafe.filename` 在展示站页面执行，
验证 375、390、768、1440px 四档的真实画布边界，避免页面隐藏横向溢出时
漏报画布裁切。该检查需真实浏览器，不等同于构建成功。

## 反馈与许可

请附所选节点、视口大小、浏览器及是否启用硬件加速。节点图文和依赖遵循各自来源与许可，参见[第三方声明](../../THIRD_PARTY_NOTICES.md)；未单独授予本项目源码许可证。

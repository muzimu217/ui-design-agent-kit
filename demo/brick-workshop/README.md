# 积木小工坊

在浏览器里选砖、搭建和保存作品的 3D 拼搭工作台。

[快速开始](#本地运行) · [能做什么](#展示范围) · [来源与证据](#来源与证据)

![积木小工坊的真实桌面工作区，包含积木选择、颜色和搭建区域](screenshots/readme-desktop.webp)

> 可运行 demo。使用离散网格与支撑规则，不是结构承重模拟器；作品只保存在本机浏览器。[截图记录](../../docs/readme-media.md)

由 UI Design Agent 工作流生成，经明确要求收录为独立 demo。源码、依赖锁、规则测试和截图都在本目录；不加入根 Agent 运行时。原独立工作区仍保留。

## 本地运行

需要 Node 20.19+（20 系）、22.12+（22 系）或 24 及以上；发布工作流使用 Node 24。

```sh
cd demo/brick-workshop
npm ci --ignore-scripts
npm run dev -- --port 5174
```

```sh
npm test
npm run typecheck
npm run build
```

## 展示范围

- 12 种程序化积木、12 色；自由拼搭和三个小挑战。
- 移动、旋转、复制、改色、拆除、撤销和重做。
- 本机保存、JSON 导入导出、真实 PNG 截图。
- `?presentation=1` 为只读自动搭建展示，不读取或修改试玩存档。

24x24 底板，最高 36 板层，400 块上限。使用离散网格和支撑规则，不模拟真实结构承重。
斜坡与拱形采用保守包围占位。存档属于当前浏览器和访问地址，不上传服务器。

## 来源与证据

[来源说明](docs/SOURCES.md)记录模型、截图和依赖来源；程序化几何体及搭建结构为本项目生成。
[原始实验验收](docs/ACCEPTANCE.md)是入库前的历史记录，不代表新展示模式或 Pages 已上线。
本轮迁移、展示与部署验证见仓库的 `docs/product-showcase.md`。

[桌面](screenshots/desktop.webp) · [手机](screenshots/mobile.webp) ·
[小屋](screenshots/house.webp) · [火箭](screenshots/rocket.webp) · [城堡](screenshots/castle.webp)

这些图片是真实运行截图转为 WebP，不含原型参考网站素材或用户私有作品。

## 反馈与许可

报告问题时附浏览器、操作步骤和预期/实际结果；作品 JSON 只分享不含私密内容的样例。
项目源码未单独授予开源许可证。依赖和素材按[来源说明](docs/SOURCES.md)及[第三方声明](../../THIRD_PARTY_NOTICES.md)分别处理。

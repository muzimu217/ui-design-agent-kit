# 产品 README 截图记录

这批图片用于仓库产品 README。使用本机隔离浏览器访问各项目构建产物，
截图保留页面实际内容；没有使用 AI 生成界面、他人产品截图或真实业务资料。
截图并不代表全流程、性能或无障碍已经验收。

## 生图尝试

2026-09-08 曾调用内置 `image_gen` 为 UI Design Agent Kit 生成一张身份概念封面，
服务返回 `503 auth_unavailable`（上游账号池不可用），没有生成可交付文件。按
生图规则未改用需要 API key 的 CLI 路径，也没有把概念图或错误占位图放入 README；
当前 README 使用真实产品截图。后续若重试，应重新检查服务状态，并把新图标为概念图，
不能替代产品运行截图。

## 采集方法

- 日期：2026-09-08。
- 构建：在各产品目录执行 `npm run build -- --base=/`。
- 浏览器：独立 Playwright 会话 `readme-audit`，1440x900，设备像素比 1。
- 状态：可构建产品的首页；游戏进入实际运行状态后截图。采集使用减少动效模式，便于静态阅读，不证明常规动效质量。
- 保存：原始 PNG 写入本地 `output/playwright/readmes/`，随后以质量 88
  转为各产品 `screenshots/readme-desktop.webp`，持久图片随源码保存。
- 截图与 Markdown 预览检查的临时本机服务器均不是线上部署。

## 来源映射

| 产品 | 本机采集地址 | 持久图片 |
| --- | --- | --- |
| 工作流成果展厅 | `http://127.0.0.1:4350/` | [桌面](../showcase/products/screenshots/readme-desktop.webp) |
| 积木小工坊 | `http://127.0.0.1:4351/` | [桌面](../demo/brick-workshop/screenshots/readme-desktop.webp) |
| 库存运营台 | `http://127.0.0.1:4352/` | [桌面](../demo/inventory-console/screenshots/readme-desktop.webp) |
| NODEGRID | `http://127.0.0.1:4353/` | [桌面](../demo/nodegrid/screenshots/readme-desktop.webp) |
| 地铁跑酷 | `http://127.0.0.1:4354/` | [桌面](../demo/subway-runner/screenshots/readme-desktop.webp) |
| FORMA One | `http://127.0.0.1:4355/` | [桌面](../demo/forma-phone-ui/screenshots/readme-desktop.webp) |
| Tempo 今日节奏 | `http://127.0.0.1:4356/` | [桌面](../demo/tempo-day/screenshots/readme-desktop.webp) |
| 一舟札记 | `http://127.0.0.1:4357/` | [桌面](../demo/blog-demo/screenshots/readme-desktop.webp) |
| 曜石 12 Pro | `http://127.0.0.1:4358/` | [桌面](../demo/phone-demo/screenshots/readme-desktop.webp) |
| 曜时 X1 | `http://127.0.0.1:4359/` | [桌面](../demo/product-demo/screenshots/readme-desktop.webp) |
| 竹与墨 | `http://127.0.0.1:4360/` | [桌面](../demo/zhumu-blog/screenshots/readme-desktop.webp) |
| AURELIS M2 | 未采用 | 当前源码缺少 `src/styles.css`，构建失败；遗留 `dist/` 是旧 FLUX UI 页面，与腕表源码不一致，禁止冒充产品图 |

主工具包 README 引用展厅截图，不将展厅当作可执行 AI 客户端。
11 个项目构建成功并采集真实截图；AURELIS M2 的媒体与构建缺口保留在其 README。
临时构建日志和预览图位于 `output/playwright/readmes/`，不作为必须随仓库
分发的证据文件；原有验收、素材来源与许可声明保持各自的范围和日期。

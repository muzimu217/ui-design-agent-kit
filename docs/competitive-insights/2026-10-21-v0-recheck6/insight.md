# v0 六检（学习循环第八十三轮）

- 日期：2026-10-21 ｜ 点档：00（开发线）｜ 检视级别：**unverified-partial**（公开首屏与能力区实看；未登录、未生成）
- 对象：v0.app（距 63 轮 10-19 共 2 天）
- 截图：01-v0-first-screen（本地留存，ADR-0002）
- 访问性：直连可达

## 机制观察（与 63 轮的 delta）

**首屏结构未变**（prompt + 4 个示例 pill：Contact Form / Image Editor / Mini Game / Finance Calculator；模板区计数：Brillance 14.7K/2.1K、Optimus 9.9K/1.5K、3D Gallery 3.6K/890）。

**新增两条能力（本轮主要 delta）**：
1. **"Create design systems"**——"Define colors, typography, and styles that…"（设计系统成为 v0 的显式能力项，此前只在文档层讨论 DS 2.0）；
2. **"Edit with design mode"**——"Fine-tune every detail with visual controls and live preview"（可视化精修模式）。

**完整能力清单**（8 项，按页面顺序）：Prompt.Build.Publish / Sync with a repo（GitHub 推送）/ Integrate with apps（自动集成，无需账号）/ Deploy to Vercel（一键上线）/ **Edit with design mode** / Start with templates / **Create design systems**。

## 判读

1. **v0 把"设计系统"从最佳实践升级为产品能力**：这是本轮最有价值的信号——本仓的 design-contract（门 C）是**强制前置**，v0 是**可选能力项**；形态不同，但"生成前先定义 DS"的共识进一步巩固（与 Figma Make 的 "design context"、Pixso 的 DS 附件、MasterGo 的 DS 驱动生成，四家已同向）。
2. **"Edit with design mode" = 生成后精修的产品化**：对应本仓门 D（修订）。四家（v0 design mode / Framer Agent-Style 双模式 / Figma Make 画布回编 / MasterGo 画布融合）都把"生成后精修"作为必备能力——**生成与精修分离已成行业标准形态**。
3. **能力项从 6 增至 8**：新增的两项都在"生成之后/之前"的**监管侧**（DS 定义、精修），而非生成侧——**平台重心向可控性迁移**，与本仓"监管层"定位同向。

## 可借鉴（③开发的依据）

- **a. DS 作为可选能力的形态**：本仓契约是强制门，不适合改成可选；但**"Define colors, typography, and styles"** 的三元表述可作为 design-contract 的对外简介句（立卡，文案类转自主）。
- **b. 本轮代码落地**：知识库 alias 字段（增量 52 引入）在工作台**不可见**——卡片只显示 title。把 alias 显示出来（"一眼稳"/"半秒动效"等场景化别名），让 v1.2 的字段真正可用（增量 53）。

## 不抄什么

- ChatGPT 计划互通入口（渠道合作，本仓无账号体系）；模板社区计数（无社区）。

## 产物级 KPI4（第十五条）

| 维度 | 本仓官网页（含介绍片） | v0 首屏（公开页） |
| --- | --- | --- |
| 桌面 | ✓ 直拍通过（含 video 元素） | ✓ 有 |
| 移动 | ✓ 520px 实测 | — 不可观测 |
| 键盘 | ✓ 12/12 | — 不可观测 |
| 对比度 | ✓ 34 项 0 低于 | — 不可观测 |
| 降动效 | ✓ 描边动画停帧 | — 不可观测 |
| 控制台 | ✓ 0 错误（video readyState=4） | — 不可观测 |
| **分** | **6/6** | **1/1 可观测**（unverified-partial） |

- 判读：第四层（验证纪律/可复核性）连续 **18 轮**无对标者；v0 本轮新增的两项能力仍在"可控性"层，未触及实测验收层。

## 下轮预告

- 增量 54 候选：知识库 alias 在官网/工作台双处可见 + 卡片检索；
- 学习候选：B 站「产品宣传片」新 sweep 或 Onlook 跟踪。

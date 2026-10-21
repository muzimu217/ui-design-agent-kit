# YouTube 评测信号 sweep（学习循环第五十七轮）

- 日期：2026-10-19 ｜ 点档：01（开发线）｜ 检视级别：**unverified-partial**（搜索结果页与视频页/简介/章节实看；未看完整视频、未做转写）
- 对象：YouTube 搜索「ai ui design agent workflow 2026」（对象池久未用项）
- 截图：01-youtube-search / 02-design-md-video（本地留存，ADR-0002）
- 访问性：youtube.com 直连可达（未登录；播放器未播）

## 机制观察（①学习 ②研究）

1. **信号强度最高的标题**：**"Your AI UI Looks Generic… This Fixes It (**DESIGN.md**)"**——Better Stack（23.3 万订阅），2026-05-07 发布，**37,828 播放 / 753 赞**。这是"AI 生成界面千篇一律"痛点与"设计契约文件"解法的**大众级验证**。
2. **章节结构（内容骨架即机制论证）**：
   - 0:00 Why AI-Generated UIs Still Look Generic（"Cursor/Claude Code/v0/Stitch 能几分钟做出整 App，但多数 AI 生成 UI 仍 generic、不一致、轻微坏掉"）
   - 0:32 What Is DESIGN.md
   - **1:10 Live Demo: Same Prompt, Different UI**（同一 prompt 两种 UI——**对照实验式演示**）
   - 2:11 How DESIGN.md Actually Works
   - 2:35 Why AI Needs Design Context
   - **3:00 DESIGN.md vs Figma vs JSON Tokens**（三方案对比）
   - 3:45 Why Developers Are Switching to DESIGN.md
   - 4:15 Pros and Cons
3. **同域其他高热信号**（同一搜索页）：UI Collective「Design with AI - Full Guide (Tools, Workflows, Design Systems)」7.9 万、「AI + Design Systems in 2026: The Workflow I Actually Use」6.2 万、「Use AI Like a Senior Designer (3 Workflows)」6.2 万；Zen van Riel「The Agentic Engineer Workflow」7.3 万；IBM Technology「Agentic AI Frameworks Explained」11 万——**"工作流 + 设计系统"是 2026 年 UI/设计类内容的双主轴**。

## 痛点→机制映射（判读）

| YouTube 信号 | 本仓既有机制 | 判读 |
| --- | --- | --- |
| "AI UI 千篇一律"（generic） | design-contract + DESIGN.md（各 demo 均有 DESIGN.md） | **完全同构**：本仓 12 个 demo 的 DESIGN.md 就是该视频主张的产物；差异=我们把契约做成**门 A/B 的强制前置**并配六维验收 |
| "Same Prompt, Different UI" 对照 | KPI4 产物级对比（同契约不同产物并排） | 同向：对照实验式证明正是我们的产物墙思路 |
| "DESIGN.md vs Figma vs JSON tokens" | 本仓 designContracts 品牌基线钉版（不走 Figma 同步） | 与视频结论同向（轻量契约文件优于重工具链） |
| "Why AI Needs Design Context" | 门 A 参考素材+设计契约摘要 | 同构 |

**结论：本轮是"设计契约"路线的大众市场验证**——独立创作者用 3.7 万播放的教程在教与我们完全相同的机制；本仓的相对优势仍在**强制门+实测证据**，而非契约概念本身。

## 可借鉴（③开发的依据）

- **a. 契约文件的可教学性（立卡）**：该视频用 8 个章节把 DESIGN.md 讲到"优缺点"，说明契约需要**面向非专家的解释层**。本仓 DESIGN.md 模板偏专业；可在 docs/ 增一页"DESIGN.md 五分钟"（面向使用者而非代理）——低风险、纯文档，**转自主排期**。
- **b. 对照实验演示法**：视频用"同 prompt 两 UI"演示价值；本仓产物墙的 KPI4 对比已是同类方法，可在产物墙增"同契约不同产物"并排位（已有 3 条产物，可复用）——转自主排期。
- **c. 本轮代码落地方向**：按用户方向裁定（艺术画面/工作台），增量 29=工作台**状态页艺术化 + 生成式微艺术背景**（reduced-motion 降级），直接落地 56 轮族谱①②④三族。

## 不抄什么

- "AI 让设计变简单"式口号叙事；不复制教程内容，仅采机制判读。

## ⑤产物级 KPI4

- 本轮对象为**内容创作者教程**（非交付产物）——按边界口径记 **0/0 可观测（不适用）**，不进产物墙对比记录。

## 下轮预告

- 增量 30 候选：契约可教学性文档 + 产物墙"同契约不同产物"并排位；
- 下一学习对象候选：recent.design 具体作品深访（Motion 族）或 v0 双日增量。

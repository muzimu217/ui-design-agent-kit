# Figma Make 三检（学习循环第六十五轮）

- 日期：2026-10-19 ｜ 点档：08（开发线）｜ 检视级别：**unverified-partial**（公开首屏与文案实看；未登录、未生成）
- 对象：figma.com/make（距 43 轮 10-17 共 2 天）
- 截图：01-figma-make-first-screen（本地留存，ADR-0002）
- 访问性：**`figma.com/figma-make` 已 404，迁移至一级路径 `figma.com/make`**——产品从"子功能"升格为"一级产品线"的信号

## 机制观察

1. **定位三词升级**："**Prototype. Polish. Ship.**"——从 10-13 时的"prompt 生成原型"扩展为**从原型到上线**的全链路叙事。
2. **本地代码库融合（新增）**："**Use Make locally to build in any codebase, then ship right to production**"（Coming soon）——Figma Make 开始支持**本地代码库**工作（此前只挂云端生成），与 Copilot Workspace/Cursor 的本地化路线合流。
3. **设计上下文为核心卖点**："Build prototypes with context" / "Add design context to all your Makes. Bring in **design systems using Make kits and npm packages**, or attach Figma frames, PDFs"——**设计系统作为上下文输入**（Make kits + npm 包），与我们的 design-contract/知识库接入同方向；"Start with design context, prompt, then edit on the canvas"=契约先行的产品化。
4. **内置 CMS**（"A built-in CMS powered by Payload"）：Make 生成前端 + Payload 管理内容——生成工具向**全栈平台**扩张（与 Lovable 六 tabs 同趋势）。
5. **客户证言**：Ticketmaster PM 背书（"shortened the path from idea to finished feature in a way I can't imagine replacing"）。

## 可借鉴

- **设计上下文 = 契约的产品化表述**：Figma Make 把我们叫"设计契约"的东西叫"design context"并做成可附加输入（kits/npm/frames/PDF）——本仓契约是门 C 强制项，形态不同但词表可借鉴（对外表述可用"design context"降低理解门槛——立卡，identity 文案类）。
- **画布编辑回环**："Copy Figma Make files to the canvas, where you can tweak until they're right"——生成物回画布精修。对应本仓：产物回门 D 修订（已有）。
- 不抄：客户证言（无客户）、CMS（非本仓身份）。

## 产物级 KPI4（第十一条）

| 维度 | 本仓官网页（v2） | Figma Make 页（公开页） |
| --- | --- | --- |
| 桌面 | ✓ 直拍通过 | ✓ 有 |
| 移动 | ✓ 520px 实测 | — 不可观测 |
| 键盘 | ✓ 12/12 | — 不可观测 |
| 对比度 | ✓ 32 项 0 低于 | — 不可观测 |
| 降动效 | ✓ 静态帧一致 | — 不可观测 |
| 控制台 | ✓ 0 错误 | — 不可观测（本会话 0 错） |
| **分** | **6/6** | **1/1 可观测**（unverified-partial） |

## 下轮预告

- 增量 35：产物墙反例卡（本轮落地）；
- 学习候选：Motion 类作品深访。

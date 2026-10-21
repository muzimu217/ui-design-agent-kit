# 对标洞察：v0 Sandbox 文档——第四十七轮学习循环

- 日期：2026-10-17 ｜ 检视级别：**unverified-partial**（文档页 headless 实拍 1 图；未实机操作）
- 证据：`v0-sandbox-2026-10-17.png`

## ① 机制（文档实据）

1. **VM 级沙箱**：VM-backed chats 运行在隔离 Vercel Sandbox 中（轻量 VM，秒级起 Node.js 全环境），承载项目文件、dev server、终端、agent 工具。
2. **显式隔离原则**：**"State from one chat never leaks into another."**——会话间状态绝不泄漏。
3. 沙箱三处可见：Preview tab（dev server 服务的 URL）/ Console panel（Logs+Terminal）/ Code viewer（可加代码评论作为下一轮 prompt 上下文）。
4. 替换旧浏览器预览的理由："couldn't run server code, API routes, or real database connections"——**真实运行环境**取代模拟预览。

## ② 研判（三条）

1. **"会话间状态不泄漏"是隔离的设计原则**——对照本仓：每轮开发线/研究线独立、每任务一份 state.json/chain.json（互不污染），**同构**。本仓的"任务级隔离"是文件级、平台是 VM 级；原则相同、粒度不同。
2. **"真实运行环境取代模拟预览"**=验收必须跑真的——本仓门 E 用真实浏览器（非 mock 截图）、五级证据禁越级声称，**同一条纪律**。平台用 VM 实现，我们用 playwright+真实构建实现。
3. **Code viewer 的评论作上下文**（10-13 changelog 已记）在 Sandbox 页再次出现——**"评论→下轮 prompt"已成平台稳定交互**，本仓门 A 反馈进契约同向。

## ③ 不抄

- VM 沙箱（无运行时）；Preview/Console/Code 三 tab 的 IDE 形态。

## ④ 对本仓落点

- K2：insight 简卡（本文件）+产物墙来源标记增量（本轮增量 20，AI 直出/人工修订血缘）+evals +2（artifact-origin-marker/provenance-not-quality）语料 111→113。
- 判读存档：**"隔离"与"真实环境验收"两条平台原则与本仓纪律同构**——我们的门径隔离（任务级）+真实浏览器验收（playwright）是同一原则的轻量实现。

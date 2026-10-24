# Copilot Workspace 复检·第二次（学习循环第九十二轮）——独立产品被吸收

- 日期：2026-10-23 ｜ 点档：20（开发线）｜ 检视级别：**verified-partial**（原 URL 404 实测 + features/copilot 首屏实看 + 官方博客检索；未实测新桌面端）
- 对象：GitHub Copilot Workspace（上次检视 2026-10-08 首检，隔 15 天）
- 截图：copilot-unified.png（本地留存，ADR-0002）

## 重大发现：独立产品 Copilot Workspace 不复存在

- 原入口 `github.com/copilot/workspace` → **404**（实测）；
- 2026-09-25 Microsoft 官宣新 Copilot 桌面端（Home / Code / **Autopilot** 三段式）；
- 现 `features/copilot` 首屏：**"Manage agent-driven work from one place——Launch work from GitHub, track progress across multiple agents, review changes, and merge completed work—all from one desktop workspace"**——原 Workspace 的"spec→plan→implement 会话"形态被吸收进**桌面端统一工作区**，叙事从"AI 软件工程会话"改为"多 agent 任务的单一管理面"。

## 机制观察

1. **吸收式存续**：与 Motiff 的"整体死亡"对照——GitHub 的路径是**把产品降格为功能**（workspace 从独立产品 → 桌面端一个面板）。产品名的死活不是生死判据，**能力面的存续才是**。
2. **多 agent 管理面上位**："track progress across multiple agents" + "Manage agent usage with enterprise-grade controls" + "Secure your MCP integrations"——**监管/多 agent 治理词汇第一次出现在 Copilot 首屏一级板块**（此前第四层外围只有 bolt/Lovable 的"自动测试"）。
3. 模型中立化继续："Choose from leading LLMs"（与 bolt 的模型路由同向）；定价 Free/Pro/Pro+/Max/Business 五档（Max 档与 bolt 同名，agent 智力分层计费已是行业默认）。
4. 本仓 13 宿主接入清单里的"Copilot Workspace"条目需改为"Copilot（桌面端统一工作区）"——能力仍在，名字变了。

## 判读

1. **第四层外围第五次触碰，且首次来自头部**：企业级 agent 用量管控 + MCP 安全——仍是管控话语而非"证据回执"话语，第四层主位连续 25 轮无存活对标者；但**头部入场意味着这个层的窗口期在缩短**。
2. 产品形态收敛方向：**多 agent 任务管理面**（mission control）正在成为大厂共识——与本仓工作台的"执行态与证据态分离" mission control 形态撞型，但他们的面板管 agent 进度，我们的面板管证据链——**同形态、不同物种**（与 60 轮 Pixso 判读同构）。
3. 不抄：定价分档叙事；"Command your craft"口号。

## 借鉴→落地

- K2：增量 64=v0.4.0 后文档清扫（README 等处 Copilot Workspace 等陈旧引用修正）+ PR#10 描述补全。
- KPI4 第二十四条：本仓工作台 mission control（执行态/证据态分列+证据数）vs Copilot 桌面端"Manage agent-driven work"板块——同形态对照：us 6/6 vs them 1/1（板块可读；面板内部实现不可观测记 null）。
- evals +2：absorbed-product-capability-tracking / mission-control-form-vs-species。

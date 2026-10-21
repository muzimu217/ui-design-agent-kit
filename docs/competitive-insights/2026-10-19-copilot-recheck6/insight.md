# Copilot 六检（学习循环第六十六轮）

- 日期：2026-10-19 ｜ 点档：09（开发线）｜ 检视级别：**unverified-partial**（公开页实看；未登录、未使用）
- 对象：github.com/features/copilot（距 42 轮 10-16 共 3 天）
- 截图：01-copilot-first-screen（本地留存，ADR-0002）

## 机制观察

1. **定位升级**："Command your craft — Your AI accelerator for every workflow, **from the editor to the enterprise**"；标题 "Your AI **coding agent**"（从补全工具到 agent 平台）。
2. **多 agent 调度产品化**："**Manage agent-driven work from one place** — Launch work from GitHub, track progress across multiple agents, review changes, and merge completed work—all from one desktop workspace"（Copilot 桌面 App）——42 轮观察到的"多 agent 选择器"已升级为**多 agent 任务管理台**。
3. **任务委派句式**："**Assign tasks to agents like Copilot, Claude by Anthropic, and OpenAI Codex**, and let them plan, explore, and execute work autonomously in the background"——agent 名字直接可指派（品牌间互操作）。
4. **MCP 入场**："Copilot works where you do—in GitHub, your IDE, the CLI, project tools, chat apps, and **custom MCP servers**"——MCP 成为官方列名的接入面。
5. **模型中立**："Choose from leading LLMs optimized for speed, accuracy, or cost"（速度/精度/成本三轴选模型）——与 Copilot 多模型选择器一脉相承。

## 判读

1. **"监管台"赛道正式确立**：Copilot 桌面 App 的"管理 agent 驱动的工作"= mission control 概念被 GitHub 产品化——**本仓 42 轮预判的方向在 3 天内被巨头落地**。我们的差异化仍在一层：他们管**执行进度**，我们管**证据与验收**（执行态×证据态分离是本仓增量 16 的立身之本）。
2. **第四层渗透再进一步**：多 agent 调度台的"review changes and merge"是代码审查层，仍非浏览器实测层——六维验收层继续独占（连续 17 轮）。
3. **MCP 官方化**：能力接入协议收敛加速，本仓 capability-adapters 的"钉版+四问"登记正当其时。

## 可借鉴

- **a. "assign tasks to agents"句式**：对外表述可借鉴（"把任务指派给智能体"是用户心智已就位的语言）——立卡（文案类，转自主）。
- **b. 桌面 App 形态**：本仓"不是产品运行时"边界不变，不跟。
- **c. 三轴模型选择**（速度/精度/成本）：知识卡候选——与品味档案"信任证据"结合可写"模型选择三轴"卡——立卡转自主。

## 产物级 KPI4（第十二条）

| 维度 | 本仓官网页（v2） | Copilot 页（公开页） |
| --- | --- | --- |
| 桌面 | ✓ 直拍通过 | ✓ 有 |
| 移动 | ✓ 520px 实测 | — 不可观测 |
| 键盘 | ✓ 12/12 | — 不可观测 |
| 对比度 | ✓ 32 项 0 低于 | — 不可观测 |
| 降动效 | ✓ 静态帧一致 | — 不可观测 |
| 控制台 | ✓ 0 错误 | — 不可观测 |
| **分** | **6/6** | **1/1 可观测**（unverified-partial） |

## 下轮预告

- 增量 36：styleHints（Emphasis/Unity DOM 近似）本轮落地；
- 学习候选：GitHub trending 快讯或 Motion 作品深访。

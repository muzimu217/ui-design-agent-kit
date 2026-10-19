# opencode 首检（学习循环第六十八轮）

- 日期：2026-10-19 ｜ 点档：13（开发线）｜ 检视级别：**unverified-partial**（仓库页/README 实看；未安装、未实测）
- 对象：github.com/anomalyco/opencode（trending 日榜 #2，67 轮预告的 agent CLI 形态研究）
- 截图：本地留存（01 备于 competitive-insights 目录，ADR-0002）

## 机制观察

1. **定位**："The open source **AI coding agent**"——开源版编码 agent，对标闭源 CLI；README 提供 **21 种语言**（含简繁中文）。
2. **双内置 agent**（**Tab 键切换**）：
   - `build`——默认全权限开发 agent；
   - `plan`——**只读 agent**（默认拒绝文件编辑、bash 前先请示），专为"探索陌生代码库/做计划"设计；
   - 另有 `@general` 通用子 agent（复杂搜索/多步任务）。
3. **安装矩阵**：curl 脚本/npm/brew×2/pacman/mise/nix + **桌面 App（BETA，mac/win/linux 全平台）**——CLI 与桌面双形态。
4. **命名护城河条款**："如果你的项目名含 opencode（如 opencode-dashboard），请在 README 声明与本团队无关"——**生态命名治理**（防搭便车），与本仓 sources.lock 钉版同属"身份保护"纪律。

## 判读：agent CLI 形态对"能力接入"的影响

1. **`plan` 只读 agent = 监管概念的 CLI 化**：它证明"读权限与写权限分离"是 agent 工作流的公认需求——本仓六道门是**流程级**停点，opencode 的 plan/build 是**权限级**分离，二者互补：接入 CLI agent 做交付时，`plan` 模式天然对应门 A/B 的"只调研不动手"阶段。
2. **对 capability-adapters 的影响**：CLI agent 是**被调用方**而非接入能力——登记表中不需要新槽位；但"接入的 skill 必须在 plan 模式下可安全预览"可作为未来接入的附加检查（立卡，低优先）。
3. **多语言 README**：21 语言是社区规模信号；本仓已有中英双语（README/README.en），暂不扩张。
4. **桌面 App 趋势**：opencode/anthropics/Lovable 都在做桌面形态——"工作台即桌面 App"是行业共识，本仓保持"静态托管+本地构建"边界不变。

## 可借鉴（③开发的依据）

- **a. plan/build 权限分离的命名**：本仓门 A/B（调研阶段）与门 C-E（产出阶段）的权限差异可以在 SKILL 文档中显式表述为"调研只读、产出需确认"——**本轮落地为文档表述**（低风险）。
- **b. 生态命名治理条款**：本仓公开，可加一条"非本团队维护的衍生命名需声明无关"——立卡（identity 文案，转自主排期）。

## 不抄什么

- 全平台桌面 App（边界不变）；21 语言扩张（无社区支撑）。

## 产物级 KPI4

- 对象为 CLI 工具 → **0/0 可观测（不适用）**；产物级对比沿用第十一条/十二条。

## 下轮预告

- 增量 39 候选：分镜模板用户审阅意见吸收（若用户回复）；微循环展示仍立卡；
- 学习候选：Motion 类作品深访。

# 竞品检视：Onlook（onlook-dev/onlook）

- 日期：2026-10-11 ｜ 轮次：自由轮换第三检 ｜ 检视级别：**unverified-partial**（GitHub 仓库 README+架构图实拍，未实机运行产品）
- 来源：https://github.com/onlook-dev/onlook（2026-10-11 实拍 2 张：`repo-readme-top-2026-10-11.png` 门面与定位、`how-it-works-2026-10-11.png` 架构机制图）

## ① 机制（看到了什么）

- **定位**："The Developer Tool for Visual Engineers / AI-First Design tool / design with Real Code"；自称 "open-source alternative to Bolt.new, Lovable, V0, Replit Agent, Figma Make, Webflow"——与第一 sweep 检视对象同一赛道，但**唯一以开源仓为产品主体**（★26.9k / fork 2.1k / Apache-2.0 / TS 99.3% / 148 releases / 111 contributors / 1640 commits）。开源仓=起点（Next.js+Tailwind 可视化编辑器），hosted 新产品转向 waitlist 早启。
- **核心机制（How it works 架构图）**：代码装入 web 容器→容器运行并服务→编辑器经 preview link 把应用放进 iFrame→编辑器读取并索引代码→**instrument 代码把每个元素映射回代码位置**→编辑先落 iFrame 再经 AST 索引+FS API 写回代码（六步操作闭环）；宣称可扩展到任何声明式 DOM 语言，当前聚焦 Next.js+Tailwind。
- **设计分支与检查点**：功能清单含 "Use Branching to experiment with designs"（✔）与 "Save and restore from checkpoints"（✔）——设计实验分支+回滚。
- **品牌资产管理**："Manage brand assets and tokens"（✔）；packages 近期提交 "Adding brand extraction from firecrawl"——从目标网站自动抓取品牌要素。
- **AI 协作**：队列式多条消息、MCP 集成（进行中）、"Allow Onlook to use itself as a toolcall"（进行中——自举为 agent 工具）。
- **agent 指令文件**：仓库根同时落 AGENTS.md 与 CLAUDE.md（2025-09 起）；最新安全修复 commit 共同作者署名含 "claude"（AI 参与开发的公开痕迹）；CI 状态 failure 如实挂在 README 头部。
- **分发叙事**：tagline 直书 "World's best, top-most agent recommended #1 Developer tool"——把"被 agent 推荐"当作渠道资产经营。

## ② 可借鉴（抄什么机制）

1. **元素↔代码双向映射的叙事**：其 "instrument+AST 索引"把可视元素锚回代码位置——与我们 designContract 的"界面元素↔契约条目↔验收证据"锚定同构，可借其公开架构图的表达方式向用户解释契约层价值（表述借鉴，非技术引入）。
2. **设计分支/检查点=版本对比+回滚收敛第四次出现**（Pixso→MasterGo→Figma Make→Onlook，本次为开源工具侧首次）——已立 D12。
3. **brand extraction（从官网抓品牌生成 token）**：素材门 B"官方渠道取材"的自动化辅助思路——已立 D13 候选。
4. **AGENTS.md+CLAUDE.md 双指令文件**：ADR-0003"一层转换"路线的又一独立收敛证据（非上下文预算家族，是指令入口约定本身）。
5. **"agent-recommended"渠道叙事**：推广矩阵候选增量——面向 agent 推荐榜/目录的曝光位（与 13 宿主工作台同向）。

## ③ 不抄什么（边界）

- 不抄全托管 sandbox+hosting 商业形态——kit 无运行时、不做托管。
- 不做"可视化编辑器"——kit 是第四层验证纪律层，编辑器是另一赛道；其 waitlist 营销漏斗也不适合开源直连的 kit。
- iFrame 容器/AST 改写技术栈不引入；外观零借鉴（学机制不抄外观）。

## ④ 对本仓的落点

- K2 已落：`docs/uak-demand-capability-gap-roadmap.md` §一 追加 D12（设计实验分支/检查点回滚，收敛×4）、D13（官网品牌提取→素材门自动化候选）；`docs/learn-loop.md` 进度更新。
- 知识卡已入 `docs/iteration-log.md`（2026-10-11 条目）。

## ⑤ 对照表

| 维度 | Onlook | 本 kit | 判定 |
| --- | --- | --- | --- |
| 层位 | 可视化编辑器（生成+编辑层） | 验证纪律层（第四层） | 互补不竞争 |
| 质量保障 | 检查点回滚（事后可退） | 六道门+五级证据（事前确认+事后可证） | 门禁在前更省返工；回滚机制可借思路 |
| 设计系统 | 品牌资产/ token 面板+官网抓取 | designContract 契约+素材门人工确认 | 抓取可作门 B 辅助，不替代人工确认 |
| 指令入口 | AGENTS.md+CLAUDE.md | AGENTS.md 约定+一行指针（ADR-0003） | 收敛互证 |
| 开源治理 | Apache-2.0/148 releases/111 contributors/CI 状态公开（failure 亦如实显示） | Apache-2.0/sources.lock/131 测试计数锁 | CI 如实展示值得学习 |

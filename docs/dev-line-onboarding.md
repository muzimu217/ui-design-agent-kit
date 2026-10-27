# 开发线接手提示词（ui-design-agent-kit 主仓）

> 用途：交给接手产品工作流开发线的智能体/人，直接粘贴开工。本文件是接手任务书，日常纪律以 AGENTS.md 为准，两者冲突时以 AGENTS.md 与冻结文档为准。

---

你是 **ui-design-agent-kit（https://github.com/muzimu217/ui-design-agent-kit）开发线负责人**。

## 这个仓库是什么

**帮人类设计更好 UI 的智能体工作流产品仓**：AI 调用技能（`.agents/skills/` 22 个）、编排工具（MCP/CLI/浏览器）、六道门人工确认流程，把口语需求变成有证据的可验收界面。**唯一重点 = 强化这个工作流**；一切开发先问"是否让工作流更好"。

## 开工先读（顺序）

1. `AGENTS.md`（仓库纪律）
2. `docs/identity-and-direction.md`（身份时间线+分层，2026-10-02 定稿）
3. `docs/chain-flow.md`（六阶段+门 A-F 工作流全文）
4. `docs/architecture.md`（边界：kit/demo/外部工作区）
5. `docs/gates.md`（门账本）+ `docs/iteration-log.md`（近期动态，对齐最新进度）
6. `docs/agent-security-baseline.md`（智能体行为安全基线：外发放行边界、能力分层表述、证据不可篡改）

## 当前状态（2026-10-27）

- **分支纪律（用户 2026-10-05 裁定）**：main 已解冻——交互会话（用户在场）可直接提交推送 main；**无人值守自动会话只在 `dev/auto` 分支工作并维持一个 dev/auto→main 开放 PR**（PR#10，2026-10-27 时 26 commits），绝不直推 main、绝不 force-push
- **验证**：`npm ci --ignore-scripts` + `npm run verify`（0 错 0 警，内含聚合审计须 complete）+ `npm test` 133/133（2026-10-27 口径，以 npm test 实际输出为准）
- **仪器清单（日常命令）**：`npm run canvas:build`（五页重建+审计聚合+引用索引+**对账自动化**）→ `npm run canvas:check`（5 页六维+axe 不可用性检查）→ `npm run wall-reconcile`（断言对账）→ `npm run adversarial:contrast` / `adversarial:a11y` / `adversarial:check`（对抗家族，本地仪器**不入 CI**——3ced712 教训）→ `npm run audit:report`（8 项 finding 聚合）→ `npm run submission:check`（参赛文档数字对账）；改计数必同笔：goal/eval-report/paper/submission/quality-monitor（doc-drift 守卫锁定，漏改即红）
- **研究线**：独立仓在 `~/Documents/Projects/uak-research`（GitHub `muzimu217/uak-research`，私有；2026-10-06 由 `~/dev` 迁入备份区，原路径已删）；本仓不做任何研究工作，`research/` 已于 10-03 迁出
- **新机工具链**：Node 26/npm 11（Homebrew）；视频剪辑链路=ffmpeg-full + Python 3.12 venv（统一进 `~/.zshenv`——注意常规 brew ffmpeg **不带** libass/drawtext 字幕滤镜）；Playwright 用系统 Chrome（`channel:"chrome"`，bundled chromium 未下载，必要时传 executablePath 指向 ms-playwright 缓存）
- **近期动态**：2026-10-19 v0.4.0 发布（tag+Release）；10-24 起参赛材料三件齐备（repo/165s 视频/作品介绍 PDF，`npm run submission:check` 可重建，**10-31 截止**）；10-25 产物墙第 5 件 canvas-workbench-live 入墙+对抗家族三件套（contrast/a11y/append-only，均带负自测）+wall-reconcile 接入 build 链；10-26 Figma 产品线大扩容+"Figma agent"独立产品（第四层外围巨头化，判读演进见 iteration-log 106-110 轮）；**排程**：Motiff 关窗终验（11-01 后）、Lovable 七检（~11-05）、impeccable re-vendor（待用户裁决）

## 你的工作

产品工作流的持续开发完善，按 identity-and-direction 分层：

1. **指令层**（`.agents/skills/`）：技能打磨、上游钉版升级评估（`tooling/sources.lock.json`）
2. **验证层**（`scripts/` `tests/` `evals/`）：评测扩量、真实执行、守卫强化
3. **案例层**（`demo/` `showcase/`）：按 `docs/gates.md` 门径收录新案例（可视化产物无门径豁免）
4. 具体待办先读 `docs/iteration-log.md` 与门账本对齐，勿凭记忆开工

## 硬纪律

1. **分支纪律（2026-10-05 用户裁定，替代原"只进 test/*"）**：交互会话可直提 main；无人值守会话只在 `dev/auto` 分支 + 维持开放 PR；绝不 force-push
2. **并行会话常在**：提交须选择性暂存（显式 add 路径），**绝不 `add -A`**；不碰他人未提交 WIP
3. **一切结论挂证据路径**；功能 100 ≠ 样式达标，界面必须真跑链路 + 浏览器取证（Playwright/chrome-devtools MCP；禁 file://，用 http）
4. **五级证据等级**（Installed ≠ … ≠ VisuallyVerified）不得越级声称
5. 每次任务生成门禁图（`npm run diagram`）；本地服务用完即关
6. 网络：github 走 `127.0.0.1:7897` 代理；gh CLI token 失效时降级 curl 公共 API 并如实记录

## 版本记录

- v1（2026-10-03）：研究线分离当日定稿。
- v2（2026-10-06）：当前状态刷新——main 解冻后分支纪律（dev/auto+PR）、新机工具链、video-edit 路由接入、双线定时任务；硬纪律 #1 同步用户 2026-10-05 裁定。
- v3（2026-10-08）：测试口径补 10-08 复跑标注（123/123，以实际输出为准）；开工先读新增 `docs/agent-security-baseline.md`（D1-02）。
- v4（2026-10-27）：20 天时效同步——验证口径 133/133、仪器清单节新增（对抗三件套/对账自动化/索引/参赛对账及 doc-drift 同笔清单）、近期动态补至 10-27（v0.4.0/参赛/第 5 产物/第四层邻居演进/排程项）、Playwright 系统 Chrome 备注。

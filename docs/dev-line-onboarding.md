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

## 当前状态（2026-10-03）

- **分支纪律**：main 冻结（用户令，无授权不得合并/推送）；开发在 `test/uak-p2-restructure`（含研究线迁出后的瘦身 + 身份重构）
- **验证**：`npm test` 96/96、`npm run verify` ok（3 个既有 warning 为已知不阻断）
- **研究线已整体迁出**至 `~/dev/uak-research` 独立仓——**本仓不做任何研究工作，`research/` 已删除**

## 你的工作

产品工作流的持续开发完善，按 identity-and-direction 分层：

1. **指令层**（`.agents/skills/`）：技能打磨、上游钉版升级评估（`tooling/sources.lock.json`）
2. **验证层**（`scripts/` `tests/` `evals/`）：评测扩量、真实执行、守卫强化
3. **案例层**（`demo/` `showcase/`）：按 `docs/gates.md` 门径收录新案例（可视化产物无门径豁免）
4. 具体待办先读 `docs/iteration-log.md` 与门账本对齐，勿凭记忆开工

## 硬纪律

1. **面分支冻结**：改动只进 `test/*` 分支；合并/推送需用户明示授权
2. **并行会话常在**：提交须选择性暂存（显式 add 路径），**绝不 `add -A`**；不碰他人未提交 WIP
3. **一切结论挂证据路径**；功能 100 ≠ 样式达标，界面必须真跑链路 + 浏览器取证（Playwright/chrome-devtools MCP；禁 file://，用 http）
4. **五级证据等级**（Installed ≠ … ≠ VisuallyVerified）不得越级声称
5. 每次任务生成门禁图（`npm run diagram`）；本地服务用完即关
6. 网络：github 走 `127.0.0.1:7897` 代理；gh CLI token 失效时降级 curl 公共 API 并如实记录

## 版本记录

- v1（2026-10-03）：研究线分离当日定稿。

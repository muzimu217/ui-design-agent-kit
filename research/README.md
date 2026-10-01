# Research Layer（研究层）

> 本目录是研究优先重建（2026-09-30 用户裁决）的单一真相源：
> **先研究问题与可发表证据；工作工具 = 实验载体；知识包 = 附属服务层。**
> 本目录与既有 `docs/`、`paper/`（旧论文，已封存不动）互不干扰。

## 使用入口

- **先看总架构**：[`architecture.md`](architecture.md)——原 UAK 主架构 + 研究适配层关系图。
- **要做首次人工测试**：[`formative/first-human-test-guide.md`](formative/first-human-test-guide.md)——只测试 P1 访谈流程和材料，不冒充 C0/C1 runner 测试。
- **整理归档**：[`tool-and-document-inventory.md`](tool-and-document-inventory.md)——现行文档、规格、工具和明确缺口的单一索引。

| 文件 | 内容 | 状态 |
| --- | --- | --- |
| [plan-preregistration-v1.md](plan-preregistration-v1.md) | 预注册式研究计划（RQ-A 主 + RQ-B 辅） | **v1.0 已审定冻结（2026-09-30：H2/H4 通过）** |
| [master-task-schedule.md](master-task-schedule.md) | 全阶段任务分解表 P1-P5（26 项任务+5 道门） | **P1 已放行；P3 代码仍受 P2-Gate 约束** |
| [runtime/](runtime/) | 研究仪器内核（研究包校验/R1 分配/R2 门禁状态机/R3-R4 事件链/R5 证据冻结/只读回放/C0-C1 dry-run） | **第一批已实现并全量测试通过（2026-10-01）；仅本地自检，非实验平台** |
| [platform-architecture.md](platform-architecture.md) | 平台架构规格（调度层/门禁状态机/硬 runner/条件接线/检索接口）——对应 P2-5 | **DRAFT（2026-10-01）——待用户审定** |
| [rater-protocol.md](rater-protocol.md) | 评分者协议（四维 19 型缺陷普查+功能判据+八维样式分+κ/盲法规程）——对应 P2-2 | **DRAFT（2026-10-01）——待用户审定** |
| [formative/interview-protocol.md](formative/interview-protocol.md) | 形成性访谈提纲（14 题+假设映射） | **P1 执行版草案，待审定** |
| [formative/recruitment-formative.md](formative/recruitment-formative.md) | 访谈招募材料（描述卡/问卷/防重叠名单表） | **P1 执行版草案，待审定；P1-3 未开始** |
| [formative/session-runbook.md](formative/session-runbook.md) | 访谈执行手册（场前/场中/场后+回传清单） | DRAFT（2026-10-01），访谈开始即可用 |
| [formative/p1-execution-log.md](formative/p1-execution-log.md) | P1 当前状态、证据盘点与下一步入口 | **执行台账；证据采集尚未开始** |
| [formative/session-record-template.md](formative/session-record-template.md) | 单场访谈记录与回传清单 | **执行模板** |
| [formative/p1-coding-template.md](formative/p1-coding-template.md) | P1-5 逐字编码、频率与假设映射表 | **执行模板；待转写** |
| [formative/p1-hypothesis-memo-template.md](formative/p1-hypothesis-memo-template.md) | P1-6 假设校准与 P1-Gate 认证表 | **执行模板；待编码** |
| [formative/failure-taxonomy-skeleton.md](formative/failure-taxonomy-skeleton.md) | 失败模式编码骨架（10 条先验码+编码产出要求）——P1-5 预置 | v1（2026-10-01），待转写回传开始编码 |
| [formative/data/README.md](formative/data/README.md) | 原始语料落盘层（Q 问卷回收 / F 访谈 / S 合成 三通道编号规范 + 拉取命令） | 已启用（2026-10-01，`Q-01` 已落盘） |
| [task-pool-candidates.md](task-pool-candidates.md) | 实验任务卡初选（12/71，含排除理由） | DRAFT——Phase 3 定稿冻结 |

## 已锁定决策（2026-09-30）

- 人群：前端开发者 + 非专家构建者，N≈10（组内设计）；形成性访谈另找 3-5 人，不与实验参与者重叠。
- 研究问题：RQ-A（监督点 × 验证维度的成本-检出权衡）为主，RQ-B（证据分级）为辅/可选第二实验。
- 周期：2-3 个月；受控实验路线，招募延后。
- 平台形态：混合方案——最小硬 runner（条件分配/门禁状态机/计时/证据落盘，代码强制）+ 现指令层工作流。
- 旧语料：挑 8-12 个改标准任务卡，其余封存。
- 旧论文：不撤回、封存引用，新论文另起。

## 阶段门（当前：P1 进行中——执行模板已备，P1-1/P1-2 待审定，P1-3 招募未开始）

```text
Phase 0 定题/研究计划冻结 ✅（v1.0，2026-09-30；两步验证协议生效：代理确认 → 诚实认证）
全阶段任务分解表 ✅（2026-09-30 用户放行 P1 开工）
Phase 1 形成性访谈 3-5 人 ← 当前
  ├─ P1-1 访谈提纲 formative/interview-protocol.md（DRAFT 待审定）
  ├─ P1-2 招募材料 formative/recruitment-formative.md（DRAFT 待审定，审定即可发人）
  └─ P1-3 招募（用户）→ P1-4 访谈（用户主访）→ P1-5 编码（代理）→ P1-6 校准备忘录（代理确认→用户诚实认证）⛩
Phase 2 实验设计定稿（任务卡+评分者协议+伦理材料+runner 规格）
Phase 3 平台改造：最小硬 runner + 任务卡冻结（周 5-6）【代码执行阶段】
Phase 4 受控实验 10 人 × 2 条件（周 6-9）
Phase 5 分析 + 4 页短文（周 9-12）
```

规则：每阶段产物先过用户门再进下一阶段；**P3 前零代码**（用户 2026-09-30 指定）。

## 研究仪器内核（runtime + CLI，2026-10-01 第一批）

`research/runtime/` 是纯 Node.js ESM、零新增依赖的仪器内核，只做**实验条件控制与证据完整性**，不改 UAK 主架构：

| 模块 | 职责 |
| --- | --- |
| `runtime/package-schema.mjs` | 研究包结构校验 + canonical JSON/SHA-256 哈希原语 |
| `runtime/assignment.mjs` | R1 确定性拉丁方分配（strict 默认拒绝奇数不平衡） |
| `runtime/state-machine.mjs` | R2 门禁状态机；`gate_decision` 仅 `actor:"user"` 可发 |
| `runtime/event-log.mjs` | R3/R4 带 `prevSha` 哈希链的 JSONL 事件日志；冻结后拒绝追加 |
| `runtime/evidence-store.mjs` | R5 工件安全写入、`MANIFEST.sha256` 冻结与校验 |
| `runtime/replay.mjs` | 只读回放（只折叠状态事件，永不写 run 目录） |
| `runtime/dry-run.mjs` + `runtime/fixtures/` | 固定 C0/C1 试跑（夹具 `study-package.json`、`dry-run-scenarios.json`） |

CLI 入口 `scripts/research-instrument.mjs`（每次输出一个 JSON 结果，失败退出码 1）：

```bash
npm run research:validate   # 校验并哈希冻结研究包
npm run research:test       # 只跑 tests/research-runtime.test.mjs
npm run research:dry-run    # 固定夹具 dry-run（写入 mktemp 临时目录并打印 JSON 报告）
node scripts/research-instrument.mjs dry-run research/runtime/fixtures/study-package.json --out <空目录>
node scripts/research-instrument.mjs replay <run-dir>   # 只读回放
node scripts/research-instrument.mjs verify <run-dir>   # manifest + 事件链完整性校验
```

**Dry-run 边界（硬约束）**：dry-run 只用合成试跑标签（`dryrun-pilot-*`）、固定本地夹具，不碰网络、不调模型、不接触任何真实参与者数据；其输出目录（`input/`、`timing.json`、`session.json`、`events.jsonl`、`evidence/`、`MANIFEST.sha256`）一律是**仪器自检产物，不计入 P1/P4 研究证据**，不替代真人招募、用户 Gate 裁决或 P2-Gate 后的实验平台代码阶段。

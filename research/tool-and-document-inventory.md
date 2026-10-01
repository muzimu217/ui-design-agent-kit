# 研究文档与工具归档索引

> 这是研究项目的导航页。文档仍按职责放在 `research/`、`docs/` 和 `scripts/` 原位置；本索引负责说明哪些是现行入口、哪些是规格、哪些是历史材料，避免把文件存在误认为功能已实现。

## 首次人工测试入口

1. 先读 [`formative/first-human-test-guide.md`](formative/first-human-test-guide.md)。
2. 测试记录填写 [`formative/first-human-test-report-template.md`](formative/first-human-test-report-template.md)。
3. 场中执行依据 [`formative/session-runbook.md`](formative/session-runbook.md)。
4. 受访者筛选使用 [`formative/recruitment-formative.md`](formative/recruitment-formative.md)。
5. 转写回传后，再进入 [`formative/p1-coding-template.md`](formative/p1-coding-template.md)。

## 架构与研究计划

| 路径 | 用途 | 状态 | 首测是否直接使用 |
| --- | --- | --- | --- |
| [`research/architecture.md`](architecture.md) | UAK 主架构与研究适配层总图 | 关系架构 v1 | 是，作为边界说明 |
| [`research/plan-preregistration-v1.md`](plan-preregistration-v1.md) | RQ、假设、设计、指标和风险规则 | v1.0 冻结 | 否，研究者参考 |
| [`research/runtime/`](runtime/)（含 `fixtures/`） | 仪器内核：包校验/R1 分配/R2 门禁状态机/R3-R4 事件链/R5 冻结/只读回放/C0-C1 dry-run | 第一批已实现（2026-10-01，`npm run research:test` 全绿） | 否，仅仪器自检 |
| [`research/master-task-schedule.md`](master-task-schedule.md) | P1-P5 任务与阶段门 | P1 放行，整体尚未冻结 | 否，研究者参考 |
| [`research/platform-architecture.md`](platform-architecture.md) | C0/C1 与 R1-R5 研究仪器规格 | 规格草案 | 否，尚未实现 |
| [`research/rater-protocol.md`](rater-protocol.md) | 缺陷普查、功能判据、样式评分 | 草案 | 否，P2/P5 使用 |
| [`research/task-pool-candidates.md`](task-pool-candidates.md) | 12 张实验任务候选 | 草案 | 否，P2/P3 冻结后使用 |

## P1 形成性访谈材料

| 路径 | 用途 | 状态 |
| --- | --- | --- |
| [`formative/interview-protocol.md`](formative/interview-protocol.md) | 14 个主问题与假设映射 | 执行版草案，待审定 |
| [`formative/recruitment-formative.md`](formative/recruitment-formative.md) | 招募描述卡、筛选问卷、名单表 | 执行版草案，待审定 |
| [`formative/session-runbook.md`](formative/session-runbook.md) | 场前/场中/场后操作 | 执行手册草案 |
| [`formative/session-record-template.md`](formative/session-record-template.md) | 单场记录页 | 执行模板 |
| [`formative/first-human-test-guide.md`](formative/first-human-test-guide.md) | 首次人工试跑说明 | 当前首测入口 |
| [`formative/first-human-test-report-template.md`](formative/first-human-test-report-template.md) | 首测结果与阻断项记录 | 当前首测入口 |
| [`formative/failure-taxonomy-skeleton.md`](formative/failure-taxonomy-skeleton.md) | 10 条先验失败模式 | P1-5 预置码表 |
| [`formative/p1-coding-template.md`](formative/p1-coding-template.md) | 转写编码与频率/证据表 | 等待转写 |
| [`formative/p1-hypothesis-memo-template.md`](formative/p1-hypothesis-memo-template.md) | H1-H4 校准与 P1-Gate | 等待编码 |
| [`formative/p1-execution-log.md`](formative/p1-execution-log.md) | 当前证据盘点和下一步 | 状态台账 |

## 既有 UAK 主架构与工具

| 路径/命令 | 真实覆盖范围 | 不覆盖 |
| --- | --- | --- |
| [`docs/chain-flow.md`](../docs/chain-flow.md) | UAK 六阶段、门 A-F、计划/执行与多轮验收 | 研究参与者数据采集 |
| [`docs/architecture.md`](../docs/architecture.md) | kit、demo、外部产品工作区边界 | 研究 runner |
| [`scripts/workflow-diagram/`](../scripts/workflow-diagram/) | 生成/检查/回放当前工作流图 | 研究实验条件执行 |
| `npm run diagram` / `diagram:check` | 构建和检查流程图资产 | 研究证据有效性 |
| `npm run verify` | kit 技能、配置和静态约束 | runner、访谈质量、研究结论 |
| `npm test` | 仓库自动化测试（当前 140 项 = tests/ 131 + showcase/tests/ 9） | 参与者行为、C0/C1 实验结果 |
| `scripts/research-instrument.mjs`（`npm run research:validate` / `research:dry-run` / `research:test`） | 研究仪器 CLI：包校验、确定性分配、固定夹具 dry-run、只读回放、manifest 校验（每次一个 JSON 输出，失败退出码 1） | 真实会话录制、参与者工作区、研究者控制台 |

## 明确不在当前归档中的内容

2026-10-01 第一批仪器内核落地后，`research/runtime/` + `scripts/research-instrument.mjs` 已提供：研究包校验与 canonical 哈希、R1 确定性分配、R2 门禁状态机（人工 gate 独占）、R3/R4 事件哈希链与冻结后禁写、R5 证据 manifest、只读回放、固定夹具 C0/C1 dry-run。**dry-run 输出是仪器自检产物，永不计入参与者证据。**

下列内容目前仍不存在，不能作为“已经完成”的依据：

- 面向真人会话的研究 runner / Session Orchestrator（现有内核不含会话录制接线）
- 参与者工作区
- 研究者控制台
- 真实参与者数据（P4 之前不存在；dry-run 的 `dryrun-pilot-*` 标签是合成值）
- 任何计入研究证据的实验结果（dry-run/自检输出明确排除在外）
- F-01 及后续真实转写、编码结果和 P1-Gate 裁决

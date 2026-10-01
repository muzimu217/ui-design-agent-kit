# 研究仪器内核设计

- 日期：2026-10-01
- 状态：已获用户批准进入第一批实现
- 范围：当前 `ui-design-agent-kit` 仓库内的研究适配层
- 上游关系：保留 `docs/chain-flow.md` 的 UAK 主架构；本设计实现其研究条件与证据仪器，不替换主流程。

## 1. 目标

在真人招募前，交付一套可本地运行、自测、可回放的研究仪器内核，证明以下研究可信度约束：

1. 研究包能被结构化校验并冻结，运行时不能静默改任务、条件或版本。
2. R1 条件分配确定、可复现，生成后不可变。
3. R2 门禁状态只能通过合法的人类事件推进；模型/代理不能直接写 `approve`。
4. R3/R4 形成 append-only、带 `prevSha` 的事件链，篡改可以被检测。
5. R5 为运行工件生成 SHA-256 manifest，并能在分析前检查完整性。
6. replay 只读取事件重建状态，不修改原始记录。
7. C0 与 C1 都能通过 dry-run 跑通，同时保留两条件的真实差异。

## 2. 非目标

第一批不实现：

- 参与者生产级浏览器工作区；
- 研究者控制台和在线多人协作；
- 模型 API 接入；
- 任务卡最终冻结、伦理同意书最终版本、P4 真人实验；
- 自动质量评分或自动替用户通过门禁；
- 修改 UAK 主架构、现有技能、MCP 配置、`evals/` 和并行 WIP 文件。

## 3. 目录与边界

```text
research/runtime/
  package-schema.mjs       # Study Package 结构校验与 canonical hash
  assignment.mjs           # R1 确定性拉丁方分配
  state-machine.mjs        # R2 合法状态转移与 actor 权限
  event-log.mjs            # R3/R4 事件追加、prevSha、链校验
  evidence-store.mjs       # R5 manifest、sha256、冻结/校验
  replay.mjs               # 只读事件回放
  dry-run.mjs              # C0/C1 固定夹具试跑
scripts/research-instrument.mjs  # CLI 入口
research/runtime/fixtures/
  study-package.json       # 最小合法研究包
  dry-run-scenarios.json   # C0/C1 试跑脚本
research/runtime/runs/     # 本地生成物，默认 gitignore

tests/research-runtime.test.mjs # 内核单测和端到端 dry-run
```

运行时源码保持纯 Node.js ESM，不新增依赖。所有输出路径必须限制在指定 run 目录内，禁止通过 `..` 越界。

## 4. Study Package

最小输入结构：

```json
{
  "schemaVersion": 1,
  "studyId": "uak-formative-v1",
  "studyVersion": "0.1.0",
  "frozen": true,
  "conditions": ["C0", "C1"],
  "states": [
    "idle", "intent_drafting", "GATE1_PENDING", "material_search",
    "GATE2_PENDING", "plan_frozen", "executing", "evidence_collect",
    "GATE3_PENDING", "done"
  ],
  "tasks": [{"taskId": "T1", "level": "M", "title": "..."}],
  "gates": ["GATE1", "GATE2", "GATE3"],
  "eventTypes": ["session_started", "gate_request", "gate_decision", "artifact_saved", "session_ended"]
}
```

校验要求：唯一 ID、条件只允许 C0/C1、状态与转移表一致、任务等级为 S/M/L、冻结包必须有 canonical SHA-256。运行时将包 hash 写入 run metadata，后续读取必须匹配。

## 5. R1 分配

`createAssignment({study, participantIds, taskIds, seed})` 返回不可变 JSON：

```js
{
  assignmentId,
  studyHash,
  seed,
  rows: [{participantId, taskId, condition, order}],
  createdAt
}
```

约束：同一输入和 seed 得到同一结果；参与者顺序与任务顺序平衡；生成后用 `Object.freeze` 保护内存对象，并通过文件 hash 保护持久化文件。重复写入同一 `assignmentId` 必须失败。

## 6. R2 门禁状态机

`transition(state, event, context)` 返回新状态和规范化事件，不直接改写外部状态。只有 `actor: "user"` 能产生 `gate_decision`；`agent` 只能产生 `gate_request`，`runner` 只能产生计时、日志和工件事件。

合法主线：

```text
idle → intent_drafting → GATE1_PENDING
→ material_search → GATE2_PENDING → plan_frozen
→ executing → evidence_collect → GATE3_PENDING → done
```

拒绝从 PENDING 状态退回对应草拟状态，并强制要求 `reason`。计划冻结后方向类输入触发 `stale`，不得直接继续执行。非法转移、未知 gate、无 reason 的拒绝、agent 的 approve 都必须抛出稳定错误码。

## 7. R3/R4 事件链

每条 JSONL 事件包含：

```json
{
  "schemaVersion": 1,
  "ts": "ISO-8601",
  "runId": "p01-T1-C1",
  "seq": 1,
  "actor": "user|agent|runner",
  "type": "session_started",
  "payload": {},
  "prevSha": null,
  "sha": "sha256(canonical event without sha)"
}
```

追加器只允许 seq 递增、runId 固定、prevSha 匹配当前尾部 hash；已有文件尾部损坏、重复 seq 或外部修改时拒绝追加。`verifyEventChain()` 返回具体失败位置和错误码，不修复原文件。

## 8. R5 证据封存

`freezeRun(runDir)` 扫描允许的运行目录，生成排序后的 `MANIFEST.sha256`，排除 manifest 自身和临时文件。manifest 同时记录 studyHash、assignmentHash、eventLogHash。冻结后禁止覆盖或删除已登记文件；新增文件必须显式解冻并创建新 revision，不允许静默改变既有 revision。

## 9. Replay 与 dry-run

`replayRun(runDir)` 读取冻结前或冻结后的事件链，按 seq 重建状态快照；不写入任何源文件。输出包括最终状态、已通过/拒绝的 gate、异常和事件计数。

dry-run 固定执行两条场景：

- C0：启动 → 自由执行记录 → 证据收集 → 会话结束，不产生门控提示或人工 gate approve。
- C1：启动 → 意图草拟 → 用户批准 GATE1 → 素材搜索 → 用户批准 GATE2 → 计划冻结 → 执行 → 证据收集 → 用户批准 GATE3 → 结束。

dry-run 必须同时断言：C0/C1 结果不同、C1 的 gate 事件 actor 为 user、两条事件链可校验、manifest 可生成、replay 终态正确、篡改一行后校验失败。

## 10. CLI

```text
node scripts/research-instrument.mjs validate-package <package.json>
node scripts/research-instrument.mjs assign <package.json> <participants.json> <tasks.json> --seed demo
node scripts/research-instrument.mjs dry-run <package.json> --out research/runtime/runs/dry-run-001
node scripts/research-instrument.mjs replay <run-dir>
node scripts/research-instrument.mjs verify <run-dir>
```

CLI 默认只写指定 `--out` 目录；命令失败返回非零退出码并输出稳定的机器可读错误码。`dry-run` 使用仓库内固定 fixture，不接触网络、不调用模型、不修改现有研究文档。

## 11. 验证门

- 单测：包校验、分配稳定性/平衡、合法/非法状态转移、actor 权限、事件链篡改、manifest 冻结、路径隔离。
- 端到端：C0/C1 dry-run、replay、verify 全链通过。
- 仓库回归：`npm test`、`npm run verify` 通过。
- 研究边界：生成物明确标记为 dry-run，不计入 P1/P4 研究证据，不替代真人招募和用户 Gate 裁决。

## 12. 后续路线

第一批内核和 dry-run 通过后，才设计第二批：研究者控制台、参与者工作区、任务卡冻结导入、真实会话录制接线。第二批仍需 P2-Gate 通过后才能进入 P3 实验平台代码阶段。

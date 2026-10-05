# 研究仪器第二批设计（从干跑到真实会话）

- 日期：2026-10-01
- 状态：用户已选定"继续开发仪器第二批"；推荐设计（终端形态）作为执行基线
- 上游：第一批设计 [2026-10-01-research-instrument-core-design.md](2026-10-01-research-instrument-core-design.md)；总架构 `research/architecture.md`
- 边界：提前量开发；不碰 P1/P2 研究文档实质内容；不推送远端（用户裁定）；任务卡正文导入等 P2 冻结后另批

## 1. 目标

把仪器从"固定夹具自检"升级为"可执行一场真实会话的仪器"，同时关闭第一批终审的全部遗留项：

1. **会话执行器**：一条命令驱动一场 单参与者×单任务×单条件 的真实会话；C1 门审批只经人工回调/终端输入，C0 不暴露门 API；结束自动计时、封存、自检。
2. **分配表持久化**：补上第一批规格 §5 承诺的 assignmentId 防重复写入；支持存储/加载/列出。
3. **研究者控制台**：一条命令只读扫描全部运行目录，输出每场的完整性+回放+合法性汇总。
4. **第一批硬化**：verifyRun 增加行为合法性段（verify ≠ legality 收口）；冻结检查只容忍 ENOENT；共享常量导出消除重复。

## 2. 非目标

- 任务卡正文导入与冻结（等 P2-1）；真实参与者数据；网络/模型接入；浏览器界面（用户未选浏览器方案）；任何 P1/P2 文档实质修改。

## 3. 模块与接口

```text
research/runtime/
  constants.mjs            # MANIFEST_FILENAME 等叶级共享常量（消除 event-log↔evidence-store 循环）
  assignment-store.mjs     # saveAssignment / loadAssignment / listAssignments
  session-runner.mjs       # startSession / 结束自检
  researcher-console.mjs   # scanRuns(runsRoot)
  （改造）event-log.mjs      # runDirIsFrozen 仅容忍 ENOENT；MANIFEST_FILENAME 改引 constants
  （改造）evidence-store.mjs # verifyRun 增加 legality 段；MANIFEST_FILENAME 改引 constants
  （改造）replay.mjs         # 导出 STATE_CHANGING_EVENT_TYPES
  （改造）dry-run.mjs        # 复用 replay 导出的常量
scripts/research-instrument.mjs  # 新命令 session / console；assign 增加 --save
```

### 3.1 assignment-store

- `saveAssignment(storeDir, assignment)`：规范化 JSON 写入 `<storeDir>/<assignmentId>.json`；已存在（无论内容是否相同）→ `ERR_ASSIGNMENT_EXISTS`（fail-closed，规格原文"重复写入同一 assignmentId 必须失败"）。
- `loadAssignment(storeDir, assignmentId)`：读取后重算 assignmentHash 不匹配 → `ERR_ASSIGNMENT_CORRUPT`；缺文件 → `ERR_ASSIGNMENT_MISSING`。
- `listAssignments(storeDir)`：`[{assignmentId, studyId, seed, rowCount}]`，按 assignmentId 排序。

### 3.2 session-runner

- `startSession({studyPackage, studyHash, assignment, participantId, taskId, condition, runDir, clock, decisions})`：
  - 前置校验：包冻结哈希一致；分配表含该 (participantId, taskId, condition) 行（`ERR_SESSION_UNASSIGNED`）；runDir 为空；C0 提供了 decisions → `ERR_C0_DECISIONS_PROVIDED`。
  - **门决策唯一通道是 `decisions` 异步回调**：`async ({gate, phase}) => ({decision, reason})`。调用方负责把它接到人类终端输入；runner 自身没有任何决定门的 API。拒绝必须带非空 reason（回调返回即校验）。
  - C1 事件序（全部过 EventLog 链）：session_started（payload 带 condition/participantId/taskId）→ intent_updated → gate_request GATE1 → 用户决定 → material_listed → gate_request GATE2 → 用户决定 → plan_locked → execution_started → execution_completed → evidence_collected → gate_request GATE3 → 用户决定 → session_ended。拒绝路径：PENDING reject → 回对应 drafting → 重新 request（多轮合法）。
  - C0 事件序：session_started → execution_started → execution_completed → evidence_collected → session_ended（零门事件）。
  - 工件（writeArtifact）：`input/task-card.md`（title/level + 显式"任务正文待 P2-1 冻结"标注）、`intent/card.md`、`material/candidates.md`、`plan/locked.md`、`evidence/summary.md`。内容全部从包+任务定义派生，不虚构任务正文。
  - `endSession`：freezeRun（studyHash/assignmentHash/eventLogHash）→ replayRun + verifyRun 自检；replay 出错或终态非 done → 会话报错（产物保留待查，不删除）。
- runId：`${participantId}-${taskId}-${condition}`。

### 3.3 researcher-console

- `scanRuns(runsRoot)`：递归找含 `MANIFEST.sha256` 的目录（跳过符号链接），对每个运行目录执行 verifyRun + replayRun，输出：
  `{runs:[{runDir, runId?, condition?, finalState, eventCount, gateDecisionCount, integrityOk, legalityOk, replayOk, errors}]}`
- 严格只读；不修复、不删除。

### 3.4 verifyRun 合法性段

- 在既有 integrity 语义不变的前提下新增 `legality: {ok, errors}`：把事件链用 `transition()` 折叠，任何非法转移/非法 actor（如链完整但 actor=agent 的 gate_decision）记入 legality.errors（含 seq 与错误码）。integrity ok 而 legality 不 ok 是合法输出组合——这正是"防篡改 ≠ 防伪造"边界的机器表达。

## 4. CLI

```text
research-instrument session <package.json> --assignment <assignmentId> --store <dir>
    --participant <id> --task <id> --out <dir> [--decisions approve,approve,approve]
research-instrument console <runs-root>
research-instrument assign <pkg> <participants> <tasks> --seed <seed> [--save <storeDir>]
```

- `--decisions`：脚本化门决策（测试与非交互用）；TTTY 且未提供时逐门提示人工输入（approve/reject + reason）。
- 决策数量不足/多余 → `ERR_DECISIONS_MISMATCH`。失败退出码 1，单 JSON 输出，沿用第一批约定。

## 5. 验证门

- 单测：存储防重复/防损坏；C1 全流程（含拒绝-重走多轮）端到端 freeze+replay+verify；C0 无门且拒收 decisions；verifyRun 抓"链完整但 actor 非法"的伪造事件；控制台只读扫描。
- 全量：`npm test`、`npm run verify` 绿；CLI 端到端（assign --save → session → console）实测入报告。
- 边界：所有产物只进调用方指定目录；不碰并行 WIP；不推送远端。

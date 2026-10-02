import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { CONDITIONS, assertStudyPackage, canonicalHash, sha256Hex } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";
import { assignmentHash } from "./assignment.mjs";
import { createSessionState, isTerminalState, transition } from "./state-machine.mjs";
import { EVENT_LOG_FILENAME, EventLog } from "./event-log.mjs";
import { freezeRun, verifyRun, writeArtifact } from "./evidence-store.mjs";
import { STATE_CHANGING_EVENT_TYPES, replayRun } from "./replay.mjs";

// Condition entry follows the shared state machine (batch-1, locked by
// tests): session_started doubles as the condition-entry advance, so C0 sits
// in "executing" immediately and C0's execution_started is unreachable (it is
// only legal from plan_frozen) — the executable reference here is dry-run.mjs,
// whose C0 script likewise omits it. C1 ends at the GATE3 approval (the
// machine's terminal "done"); a trailing session_ended is C0-only. The
// literal sequences in the batch-2 design §3.2 name both events, but emitting
// them would fold to illegal transitions and fail the end-of-run self-check.
const C0_SEQUENCE = Object.freeze([
  { actor: "runner", type: "execution_completed", payload: {} },
  { actor: "runner", type: "evidence_collected", payload: { path: "evidence/summary.md" } },
  { actor: "runner", type: "session_ended", payload: {} },
]);

// C1 gate rounds, in order. Each phase: refresh the phase artifact, emit the
// informational phase event, then loop gate_request → user decision until the
// gate is approved (a rejection returns the machine to the drafting state and
// the round repeats — multi-round sessions are legal and expected). GATE3 has
// no phase artifact here: evidence/summary.md is written once at freeze time
// so it can carry the final event-log hash.
const C1_GATE_PHASES = Object.freeze([
  Object.freeze({ gate: "GATE1", phase: "intent_drafting", eventType: "intent_updated", artifact: "intent/card.md" }),
  Object.freeze({ gate: "GATE2", phase: "material_search", eventType: "material_listed", artifact: "material/candidates.md" }),
  Object.freeze({
    gate: "GATE3",
    phase: "evidence_collect",
    eventType: "evidence_collected",
    artifact: "evidence/summary.md",
    // Written once at freeze time (it carries the final event-log hash), so
    // the phase loop refreshes the event but not the file.
    deferArtifact: true,
  }),
]);

const DECISIONS = Object.freeze(["approve", "reject"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function defaultClock() {
  return new Date().toISOString();
}

function invalidArgument(field, message) {
  return new ResearchRuntimeError("ERR_INVALID_ARGUMENT", message, { field });
}

// Same convention as dry-run: the run directory must be empty or absent, so a
// session can never mix its evidence into someone else's files.
async function assertRunDirEmpty(runDir) {
  let entries;
  try {
    entries = await readdir(runDir);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return;
  }
  if (entries.length > 0) {
    throw new ResearchRuntimeError("ERR_OUTPUT_DIR_NOT_EMPTY", "session run directory is not empty; refusing to write into it", {
      runDir,
      entries: [...entries].sort(),
    });
  }
}

/**
 * Resolve one gate decision through the injected callback — the only channel
 * through which a gate may open. The runner has no approval API of its own.
 * A rejection without a non-empty reason throws before anything is logged.
 */
async function resolveGateDecision(decisions, gate, phase) {
  const answer = await decisions({ gate, phase });
  if (!isPlainObject(answer) || !DECISIONS.includes(answer.decision)) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_DECISION",
      `gate decision must be one of ${DECISIONS.join(", ")}`,
      { gate, phase, received: isPlainObject(answer) ? answer.decision ?? null : typeof answer },
    );
  }
  if (answer.decision === "reject" && !isNonEmptyString(answer.reason)) {
    throw new ResearchRuntimeError("ERR_MISSING_REASON", "gate rejections require a non-empty reason", { gate, phase });
  }
  return isNonEmptyString(answer.reason) ? { decision: answer.decision, reason: answer.reason } : { decision: answer.decision };
}

// ---------------------------------------------------------------------------
// Artifacts. Everything below is derived from the frozen study package and
// the task definition only — the runner never fabricates task bodies,
// material entries, plan steps, or participant data. Real content arrives
// with the P2-1 frozen task cards and real sessions.
// ---------------------------------------------------------------------------

function taskCardContent({ study, task, condition, runId }) {
  return [
    `# 任务卡 — ${task.title}`,
    "",
    `- taskId: ${task.taskId}`,
    `- level: ${task.level}`,
    `- studyId: ${study.studyId}（v${study.studyVersion}）`,
    `- condition: ${condition}`,
    `- runId: ${runId}`,
    "",
    "> 任务正文待 P2-1 冻结：本卡由 session-runner 依据已冻结研究包生成，",
    "> 只记录任务标识、标题与层级；题面、素材与验收标准以 P2-1 冻结的任务",
    "> 正文为准，会话运行时不得虚构或即兴补写。",
    "",
  ].join("\n");
}

function intentCardContent({ study, task, runId }) {
  return [
    `# 意图卡 — ${runId}`,
    "",
    `- taskId: ${task.taskId}（${task.level}）— ${task.title}`,
    `- studyId: ${study.studyId}`,
    "- 阶段：intent_drafting（GATE1 审批对象）",
    "",
    "> 仪器占位（待真实会话）：本文件由确定性 runner 生成，仅记录会话与任务",
    "> 标识；参与者真实意图内容在 P2 真人会话批次接入后产生，此处不虚构。",
    "",
  ].join("\n");
}

function materialCandidatesContent({ study, task, runId }) {
  return [
    `# 候选素材清单 — ${runId}`,
    "",
    `- taskId: ${task.taskId}（${task.level}）— ${task.title}`,
    `- studyId: ${study.studyId}`,
    "- 阶段：material_search（GATE2 审批对象）",
    "",
    "> 仪器占位（待真实会话）：素材检索与排序尚未接入仪器；本清单不虚构",
    "> 具体素材条目，仅记录阶段上下文。",
    "",
  ].join("\n");
}

function planLockedContent({ study, task, runId }) {
  return [
    `# 锁定计划 — ${runId}`,
    "",
    `- taskId: ${task.taskId}（${task.level}）— ${task.title}`,
    `- studyId: ${study.studyId}`,
    "- 阶段：plan_frozen（GATE2 已批准；执行期计划不可变更）",
    "",
    "> 仪器占位（待真实会话）：计划步骤由真实会话产生；本文件仅记录锁定",
    "> 事实与会话标识，不虚构计划内容。",
    "",
  ].join("\n");
}

function gateDecisionRows(gateDecisions) {
  if (gateDecisions.length === 0) return "无门事件（C0 自由执行，不设审批门）。";
  const header = "| seq | gate | decision | reason | from → to |";
  const divider = "| --- | --- | --- | --- | --- |";
  const rows = gateDecisions.map((entry) =>
    `| ${entry.seq} | ${entry.gate} | ${entry.decision} | ${entry.reason ?? "—"} | ${entry.from} → ${entry.to} |`);
  return [header, divider, ...rows].join("\n");
}

function evidenceSummaryContent({
  study,
  studyHash,
  assignment,
  condition,
  runId,
  participantId,
  task,
  gateDecisions,
  eventCount,
  eventLogHash,
  finalState,
}) {
  const artifacts = ["`events.jsonl` — 防篡改事件链", "`input/task-card.md` — 任务卡（正文待 P2-1 冻结）"];
  if (condition === "C1") {
    artifacts.push("`intent/card.md` — 意图卡", "`material/candidates.md` — 候选素材清单", "`plan/locked.md` — 锁定计划");
  }
  artifacts.push("`MANIFEST.sha256` — 冻结清单");
  return [
    `# 会话证据摘要 — ${runId}`,
    "",
    "> 本摘要由 session-runner 在冻结前生成，内容仅派生自已冻结研究包与任务",
    "> 定义，不虚构任务正文或参与者数据。",
    "",
    `- Study: ${study.studyId} v${study.studyVersion}（${studyHash.slice(0, 12)}…）`,
    `- Assignment: ${assignment.assignmentId.slice(0, 12)}…`,
    `- Participant: ${participantId}`,
    `- Task: ${task.taskId}（${task.level}）— ${task.title}`,
    `- Condition: ${condition}`,
    `- Final state: ${finalState}`,
    `- Events: ${eventCount}`,
    `- eventLogHash: \`${eventLogHash}\``,
    "",
    "## 门决策",
    "",
    gateDecisionRows(gateDecisions),
    "",
    "## 产物",
    "",
    ...artifacts.map((entry) => `- ${entry}`),
    "",
  ].join("\n");
}

/**
 * Execute one 单参与者 × 单任务 × 单条件 session end to end and leave a
 * frozen, self-checked run directory behind.
 *
 * Gate decisions enter only through the injected async `decisions` callback
 * (`async ({gate, phase}) => ({decision, reason})`); the caller wires it to a
 * human. Every event — state-changing or informational — is appended to the
 * tamper-evident event log through the shared state machine. At the end the
 * run is frozen (studyHash/assignmentHash/eventLogHash) and replayed +
 * verified read-only as a self-check; a self-check failure keeps the
 * artifacts on disk for inspection and throws.
 */
export async function startSession({
  studyPackage,
  studyHash,
  assignment,
  participantId,
  taskId,
  condition,
  runDir,
  clock = defaultClock,
  decisions = null,
} = {}) {
  if (!isNonEmptyString(participantId)) throw invalidArgument("participantId", "participantId must be a non-empty string");
  if (!isNonEmptyString(taskId)) throw invalidArgument("taskId", "taskId must be a non-empty string");
  if (!CONDITIONS.includes(condition)) {
    throw invalidArgument("condition", `condition must be one of ${CONDITIONS.join(", ")}`);
  }
  if (!isNonEmptyString(runDir)) throw invalidArgument("runDir", "runDir must be a non-empty string");
  if (typeof clock !== "function") throw invalidArgument("clock", "clock must be a function returning ISO timestamps");
  if (decisions !== null && typeof decisions !== "function") {
    throw invalidArgument("decisions", "decisions must be an async callback or null");
  }

  const study = assertStudyPackage(studyPackage).package;
  const canonicalStudyHash = canonicalHash(study);
  if (!isNonEmptyString(studyHash) || studyHash !== canonicalStudyHash) {
    throw new ResearchRuntimeError(
      "ERR_STUDY_HASH_MISMATCH",
      "studyHash must match the canonical hash of the study package",
      { expected: canonicalStudyHash, received: studyHash || null },
    );
  }

  // Assignment checks run before anything touches the filesystem.
  if (!isPlainObject(assignment) || !Array.isArray(assignment.rows)) {
    throw new ResearchRuntimeError("ERR_INVALID_ASSIGNMENT", "assignment must be an object with a rows array", {
      received: assignment === null ? null : typeof assignment,
    });
  }
  if (assignmentHash(assignment) !== assignment.assignmentHash) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_ASSIGNMENT",
      "assignmentHash does not match the canonical hash of the assignment",
      { assignmentId: assignment.assignmentId ?? null },
    );
  }
  if (assignment.studyHash !== studyHash) {
    throw new ResearchRuntimeError(
      "ERR_STUDY_HASH_MISMATCH",
      "the assignment belongs to a different study hash than the package",
      { studyHash, assignmentStudyHash: assignment.studyHash ?? null },
    );
  }
  const row = assignment.rows.find((entry) =>
    isPlainObject(entry) &&
    entry.participantId === participantId &&
    entry.taskId === taskId &&
    entry.condition === condition);
  if (!row) {
    throw new ResearchRuntimeError(
      "ERR_SESSION_UNASSIGNED",
      "the assignment has no row for this participant, task, and condition",
      { participantId, taskId, condition, assignmentId: assignment.assignmentId ?? null },
    );
  }

  if (condition === "C0" && typeof decisions === "function") {
    throw new ResearchRuntimeError(
      "ERR_C0_DECISIONS_PROVIDED",
      "condition C0 has no gates; gate decisions must not be provided",
      { condition },
    );
  }
  if (condition === "C1" && typeof decisions !== "function") {
    throw invalidArgument("decisions", "condition C1 requires a decisions callback for its three gates");
  }

  const root = path.resolve(runDir);
  await assertRunDirEmpty(root);

  const task = study.tasks.find((entry) => entry.taskId === taskId);
  if (!task) {
    throw new ResearchRuntimeError("ERR_UNKNOWN_TASK", "taskId is not declared in the study package", {
      taskId,
      knownTaskIds: study.tasks.map((entry) => entry.taskId).sort(),
    });
  }

  const runId = `${participantId}-${taskId}-${condition}`;
  const eventsPath = path.join(root, EVENT_LOG_FILENAME);
  const log = new EventLog({ filePath: eventsPath, runId, clock });
  let state = createSessionState({ runId, condition, participantId, taskId });
  const gateDecisions = [];
  let eventCount = 0;

  // State-changing events are folded through the shared machine before they
  // are appended, so an illegal sequence can never reach the log (mirrors
  // dry-run's fold-then-append order).
  const emit = async (actor, type, payload = {}) => {
    let folded = null;
    if (STATE_CHANGING_EVENT_TYPES.has(type)) {
      const result = transition(state, { actor, type, payload });
      state = result.state;
      folded = result.event;
    }
    const record = await log.append({ actor, type, payload });
    eventCount = record.seq + 1;
    return { record, folded };
  };

  const runGatePhase = async ({ gate, phase, eventType, artifact, deferArtifact = false }) => {
    for (;;) {
      if (!deferArtifact) {
        const content = artifact === "intent/card.md"
          ? intentCardContent({ study, task, runId })
          : materialCandidatesContent({ study, task, runId });
        await writeArtifact(root, artifact, content);
      }
      await emit("agent", eventType, { path: artifact });
      await emit("agent", "gate_request", { gate });

      const answer = await resolveGateDecision(decisions, gate, phase);
      const payload = { gate, decision: answer.decision };
      if (answer.reason !== undefined) payload.reason = answer.reason;
      const { record, folded } = await emit("user", "gate_decision", payload);
      gateDecisions.push({
        seq: record.seq,
        gate,
        decision: answer.decision,
        reason: answer.reason ?? null,
        from: folded.from,
        to: folded.to,
      });
      if (answer.decision === "approve") return;
      // Rejected: the machine is back in the drafting state; repeat the round.
    }
  };

  await writeArtifact(root, "input/task-card.md", taskCardContent({ study, task, condition, runId }));
  await emit("runner", "session_started", { condition, participantId, taskId });

  if (condition === "C0") {
    for (const { actor, type, payload } of C0_SEQUENCE) {
      await emit(actor, type, payload);
    }
  } else {
    await runGatePhase(C1_GATE_PHASES[0]);
    await runGatePhase(C1_GATE_PHASES[1]);

    await writeArtifact(root, "plan/locked.md", planLockedContent({ study, task, runId }));
    await emit("agent", "plan_locked", { path: "plan/locked.md" });
    await emit("runner", "execution_started", {});
    await emit("runner", "execution_completed", {});

    await runGatePhase(C1_GATE_PHASES[2]);
  }

  if (!isTerminalState(state)) {
    throw new ResearchRuntimeError(
      "ERR_SESSION_INCOMPLETE",
      "the session script did not reach the terminal state; refusing to freeze a partial run",
      { runId, finalStatus: state.status },
    );
  }

  const eventLogHash = sha256Hex(await readFile(eventsPath));
  await writeArtifact(root, "evidence/summary.md", evidenceSummaryContent({
    study,
    studyHash,
    assignment,
    condition,
    runId,
    participantId,
    task,
    gateDecisions,
    eventCount,
    eventLogHash,
    finalState: state.status,
  }));

  const manifest = await freezeRun(root, {
    studyHash,
    assignmentHash: assignment.assignmentHash,
    eventLogHash,
  });

  // Self-check: replay and verify the frozen run read-only. A failure keeps
  // the artifacts on disk for inspection — never delete evidence.
  const replay = await replayRun(root);
  const verification = await verifyRun(root);
  const replayOk = replay.errors.length === 0 &&
    replay.finalState === "done" &&
    replay.gateDecisions.length === gateDecisions.length;
  const verifyOk = verification.ok;
  if (!replayOk || !verifyOk) {
    throw new ResearchRuntimeError(
      "ERR_SESSION_SELF_CHECK",
      "the frozen session failed its replay/verify self-check; artifacts kept for inspection",
      {
        runId,
        runDir: root,
        replayErrors: replay.errors,
        verificationErrors: verification.errors,
        replayedState: replay.finalState,
      },
    );
  }

  return Object.freeze({
    runId,
    runDir: root,
    finalState: state.status,
    eventCount: replay.eventCount,
    gateDecisions: Object.freeze(gateDecisions.map((entry) => Object.freeze({ ...entry }))),
    frozen: true,
    verifyOk,
    replayOk,
    studyId: study.studyId,
    studyHash,
    assignmentId: assignment.assignmentId,
    assignmentHash: assignment.assignmentHash,
    manifestFileCount: manifest.files.length,
  });
}

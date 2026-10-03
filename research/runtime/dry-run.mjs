import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CONDITIONS, assertStudyPackage, sha256Hex, stableStringify } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";
import { assertAssignmentBalanced, createAssignment } from "./assignment.mjs";
import { createSessionState, isTerminalState, transition } from "./state-machine.mjs";
import { EVENT_LOG_FILENAME, EventLog } from "./event-log.mjs";
import { MANIFEST_FILENAME, freezeRun, verifyRun, writeArtifact } from "./evidence-store.mjs";
import { STATE_CHANGING_EVENT_TYPES, replayRun } from "./replay.mjs";

export const DRY_RUN_SCHEMA_VERSION = 1;
const SCENARIO_SCHEMA_VERSION = 1;
const SCENARIOS_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "dry-run-scenarios.json",
);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function defaultClock() {
  return new Date().toISOString();
}

async function loadScenarios() {
  let raw;
  try {
    raw = await readFile(SCENARIOS_PATH, "utf8");
  } catch (error) {
    throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", "bundled dry-run scenarios are missing", {
      path: SCENARIOS_PATH,
      cause: error.code,
    });
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", "bundled dry-run scenarios are not valid JSON", {
      path: SCENARIOS_PATH,
      cause: error.message,
    });
  }
}

/**
 * Validate the scenario document against the study package before anything is
 * written: schema version, study identity, a C0 and a C1 run exactly once
 * each, every event type declared in the package vocabulary, and every run
 * cell (participant × task × condition) present in the deterministic
 * assignment. Scenario bugs must fail fast with a stable code, never produce
 * a half-written run directory that looks like evidence.
 */
function assertScenarios(scenarios, study) {
  if (!isPlainObject(scenarios) || scenarios.schemaVersion !== SCENARIO_SCHEMA_VERSION) {
    throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `scenarios must carry schemaVersion ${SCENARIO_SCHEMA_VERSION}`, {
      schemaVersion: scenarios && scenarios.schemaVersion,
    });
  }
  if (scenarios.studyId !== study.studyId) {
    throw new ResearchRuntimeError("ERR_DRY_RUN_STUDY_MISMATCH", "scenarios declare a different studyId than the package", {
      scenarios: scenarios.studyId,
      package: study.studyId,
    });
  }
  const assignmentSpec = scenarios.assignment;
  if (!isPlainObject(assignmentSpec) ||
    !Array.isArray(assignmentSpec.participantIds) || assignmentSpec.participantIds.length === 0 ||
    !Array.isArray(assignmentSpec.taskIds) || assignmentSpec.taskIds.length === 0 ||
    !isNonEmptyString(assignmentSpec.seed)) {
    throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", "scenarios.assignment needs participantIds, taskIds, and a seed", {
      assignment: assignmentSpec === undefined ? null : assignmentSpec,
    });
  }
  if (!Array.isArray(scenarios.runs) || scenarios.runs.length !== CONDITIONS.length) {
    throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `scenarios must contain exactly ${CONDITIONS.length} runs`, {
      runs: Array.isArray(scenarios.runs) ? scenarios.runs.length : null,
    });
  }

  const seenConditions = new Set();
  const declaredEventTypes = new Set(study.eventTypes);
  const knownTasks = new Map(study.tasks.map((task) => [task.taskId, task]));

  for (let index = 0; index < scenarios.runs.length; index += 1) {
    const run = scenarios.runs[index];
    const at = `scenarios.runs[${index}]`;
    if (!isPlainObject(run) || !CONDITIONS.includes(run.condition)) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at}.condition must be one of ${CONDITIONS.join(", ")}`, {
        condition: run && run.condition,
      });
    }
    if (seenConditions.has(run.condition)) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `duplicate condition in scenarios: ${run.condition}`, {
        condition: run.condition,
      });
    }
    seenConditions.add(run.condition);
    if (!isNonEmptyString(run.participantId) || !isNonEmptyString(run.taskId) || !knownTasks.has(run.taskId)) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at} must reference a known taskId and a participantId`, {
        participantId: run.participantId === undefined ? null : run.participantId,
        taskId: run.taskId === undefined ? null : run.taskId,
        knownTasks: [...knownTasks.keys()].sort(),
      });
    }
    if (typeof run.taskCard !== "string" || run.taskCard.trim() === "") {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at}.taskCard must be a non-empty markdown string`, {
        condition: run.condition,
      });
    }
    if (!Array.isArray(run.timingMarks) || run.timingMarks.length === 0 ||
      run.timingMarks.some((mark) => !isPlainObject(mark) || !isNonEmptyString(mark.label) || !Number.isFinite(mark.offsetMs))) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at}.timingMarks must be {label, offsetMs} entries`, {
        condition: run.condition,
      });
    }
    if (!Array.isArray(run.events) || run.events.length === 0) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at}.events must be a non-empty event script`, {
        condition: run.condition,
      });
    }
    if (run.events[0].type !== "session_started") {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at}.events must start with session_started`, {
        condition: run.condition,
        firstType: run.events[0].type,
      });
    }
    for (const event of run.events) {
      if (!isPlainObject(event) || !isNonEmptyString(event.actor) || !isNonEmptyString(event.type) ||
        (event.payload !== undefined && !isPlainObject(event.payload))) {
        throw new ResearchRuntimeError("ERR_DRY_RUN_SCENARIOS", `${at} events must be {actor, type, payload?} objects`, {
          condition: run.condition,
          event,
        });
      }
      if (!declaredEventTypes.has(event.type)) {
        throw new ResearchRuntimeError("ERR_UNDECLARED_EVENT_TYPE", `scenario event type is not declared in the study package: ${event.type}`, {
          condition: run.condition,
          type: event.type,
          declared: [...declaredEventTypes].sort(),
        });
      }
    }
  }
}

function gateRows(gateEvents) {
  if (gateEvents.length === 0) return "(none — this condition runs gate-free)";
  const header = "| seq | gate | decision | actor | from → to |";
  const divider = "| --- | --- | --- | --- | --- |";
  const rows = gateEvents.map((event) =>
    `| ${event.seq} | ${event.payload.gate} | ${event.payload.decision} | ${event.actor} | ${event.from} → ${event.to} |`);
  return [header, divider, ...rows].join("\n");
}

function buildSummary({ run, runId, task, study, studyHash, gateEvents, eventCount, eventLogHash, finalState }) {
  return [
    `# Dry-run evidence summary — ${runId}`,
    "",
    "> DRY-RUN OUTPUT — generated from the fixed local scenarios in",
    "> `research/runtime/fixtures/dry-run-scenarios.json`. This is instrument",
    "> self-test output, not participant evidence, and never counts toward",
    "> any P1/P4 research result.",
    "",
    `- Study: ${study.studyId} v${study.studyVersion} (${studyHash.slice(0, 12)}…)`,
    `- Condition: ${run.condition}`,
    `- Synthetic pilot label: ${run.participantId} (dry-run only, not a recruited participant)`,
    `- Task: ${run.taskId} (${task.level}) — ${task.title}`,
    `- Final state: ${finalState}`,
    `- Events: ${eventCount}`,
    `- Gate decisions: ${gateEvents.length}`,
    "",
    "## Gate decisions",
    "",
    gateRows(gateEvents),
    "",
    "## Run artifacts",
    "",
    `- \`${EVENT_LOG_FILENAME}\` — tamper-evident event chain (${eventCount} events, sha256 \`${eventLogHash}\`)`,
    "- `input/task-card.md` — dry-run task card",
    "- `timing.json` — fixed timing marks from the scenario",
    "- `session.json` — session metadata (dryRun: true)",
    `- \`${MANIFEST_FILENAME}\` — evidence manifest written by freezeRun`,
    "",
  ].join("\n");
}

async function assertOutputDirEmpty(outDir) {
  let entries;
  try {
    entries = await readdir(outDir);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return;
  }
  if (entries.length > 0) {
    throw new ResearchRuntimeError("ERR_OUTPUT_DIR_NOT_EMPTY", "dry-run output directory is not empty; refusing to write into it", {
      outDir,
      entries: [...entries].sort(),
    });
  }
}

/**
 * Execute the fixed C0/C1 dry-run scenarios end to end.
 *
 * For each condition this writes, under `<outDir>/<condition>/`: the task
 * card, session metadata, timing marks, the tamper-evident `events.jsonl`
 * (folded through the shared state machine — every event must be legal or the
 * run aborts), an evidence summary, and finally `MANIFEST.sha256` via
 * freezeRun. After freezing, the run is replayed and verified read-only as a
 * self-check; any failure throws ERR_DRY_RUN_SELF_CHECK.
 *
 * Everything is local and deterministic: no network, no model calls, and only
 * synthetic pilot labels — dry-run output is never participant evidence. The
 * output directory must be empty (or absent); nothing outside it is touched.
 */
export async function runDryRun({ studyPackage, studyHash, outDir, clock = defaultClock, scenarios = null } = {}) {
  if (!isNonEmptyString(outDir)) {
    throw new ResearchRuntimeError("ERR_INVALID_ARGUMENT", "outDir must be a non-empty string", { field: "outDir" });
  }
  if (typeof clock !== "function") {
    throw new ResearchRuntimeError("ERR_INVALID_ARGUMENT", "clock must be a function returning ISO timestamps", { field: "clock" });
  }

  const study = assertStudyPackage(studyPackage).package;
  const resolvedScenarios = scenarios === null ? await loadScenarios() : scenarios;
  assertScenarios(resolvedScenarios, study);

  // createAssignment enforces studyHash === canonicalHash(study) itself; a
  // mismatch fails here with ERR_STUDY_HASH_MISMATCH before any write.
  const assignmentSpec = resolvedScenarios.assignment;
  const assignment = createAssignment({
    study,
    studyHash,
    participantIds: assignmentSpec.participantIds,
    taskIds: assignmentSpec.taskIds,
    seed: assignmentSpec.seed,
  });
  assertAssignmentBalanced(assignment);

  const root = path.resolve(outDir);
  await assertOutputDirEmpty(root);

  const cells = new Map(assignment.rows.map((row) => [`${row.participantId}:${row.taskId}`, row]));
  const runs = [];

  for (const run of resolvedScenarios.runs) {
    const cell = cells.get(`${run.participantId}:${run.taskId}`);
    if (!cell || cell.condition !== run.condition) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_UNASSIGNED", "scenario run does not match a deterministic assignment row", {
        participantId: run.participantId,
        taskId: run.taskId,
        condition: run.condition,
        assignedCondition: cell ? cell.condition : null,
      });
    }

    const runId = `${run.participantId}-${run.taskId}-${run.condition}`;
    const runDir = path.join(root, run.condition);
    const task = study.tasks.find((entry) => entry.taskId === run.taskId);

    await writeArtifact(runDir, "input/task-card.md", `${run.taskCard}\n`);
    await writeArtifact(runDir, "session.json", `${stableStringify({
      schemaVersion: DRY_RUN_SCHEMA_VERSION,
      dryRun: true,
      runId,
      condition: run.condition,
      participantId: run.participantId,
      taskId: run.taskId,
      studyId: study.studyId,
      studyVersion: study.studyVersion,
      studyHash,
      assignmentId: assignment.assignmentId,
      assignmentHash: assignment.assignmentHash,
      createdAt: clock(),
    })}\n`);
    await writeArtifact(runDir, "timing.json", `${stableStringify({
      schemaVersion: DRY_RUN_SCHEMA_VERSION,
      runId,
      source: "dry-run-scenarios.json",
      marks: run.timingMarks,
    })}\n`);

    const eventsPath = path.join(runDir, EVENT_LOG_FILENAME);
    const log = new EventLog({ filePath: eventsPath, runId, clock });
    let state = createSessionState({ runId, condition: run.condition, participantId: run.participantId, taskId: run.taskId });
    const gateEvents = [];

    for (let index = 0; index < run.events.length; index += 1) {
      const scripted = run.events[index];
      // replayRun requires the first state-changing event to carry the session
      // info; session_started doubles as the condition-entry advance.
      const payload = scripted.type === "session_started"
        ? { ...scripted.payload, condition: run.condition, participantId: run.participantId, taskId: run.taskId }
        : (scripted.payload === undefined ? {} : scripted.payload);
      if (STATE_CHANGING_EVENT_TYPES.has(scripted.type)) {
        try {
          const result = transition(state, { actor: scripted.actor, type: scripted.type, payload });
          if (scripted.type === "gate_decision") {
            gateEvents.push({
              seq: index,
              actor: scripted.actor,
              payload,
              from: result.event.from,
              to: result.event.to,
            });
          }
          state = result.state;
        } catch (error) {
          throw new ResearchRuntimeError(
            "ERR_DRY_RUN_SCRIPT",
            `dry-run scenario event is not legal: ${error.message}`,
            { condition: run.condition, index, type: scripted.type, cause: { code: error.code, message: error.message } },
          );
        }
      }
      await log.append({ actor: scripted.actor, type: scripted.type, payload });
    }

    if (!isTerminalState(state)) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SCRIPT", "dry-run scenario must end in the terminal state", {
        condition: run.condition,
        finalStatus: state.status,
      });
    }

    const eventLogHash = sha256Hex(await readFile(eventsPath));
    await writeArtifact(runDir, "evidence/summary.md", buildSummary({
      run,
      runId,
      task,
      study,
      studyHash,
      gateEvents,
      eventCount: run.events.length,
      eventLogHash,
      finalState: state.status,
    }));

    const manifest = await freezeRun(runDir, { studyHash, assignmentHash: assignment.assignmentHash, eventLogHash });

    const replay = await replayRun(runDir);
    const verification = await verifyRun(runDir);
    if (replay.errors.length > 0 || replay.finalState !== state.status ||
      replay.gateDecisions.length !== gateEvents.length || !verification.ok) {
      throw new ResearchRuntimeError("ERR_DRY_RUN_SELF_CHECK", "frozen dry-run failed its read-only replay/verify self-check", {
        condition: run.condition,
        replayErrors: replay.errors,
        verificationErrors: verification.errors,
      });
    }

    runs.push(Object.freeze({
      condition: run.condition,
      runId,
      participantId: run.participantId,
      taskId: run.taskId,
      runDir,
      finalState: replay.finalState,
      eventCount: replay.eventCount,
      gateDecisions: replay.gateDecisions,
      gateDecisionCount: replay.gateDecisions.length,
      eventLogHash,
      manifestFileCount: manifest.files.length,
      frozen: true,
      verifyOk: true,
    }));
  }

  return Object.freeze({
    dryRun: true,
    studyId: study.studyId,
    studyVersion: study.studyVersion,
    studyHash,
    assignmentId: assignment.assignmentId,
    assignmentHash: assignment.assignmentHash,
    outDir: root,
    // Deliberately a plain (sortable) array: the mandated test does
    // `report.conditions.sort()` in place, so freezing it would throw.
    conditions: resolvedScenarios.runs.map((run) => run.condition),
    runs: Object.freeze(runs),
  });
}

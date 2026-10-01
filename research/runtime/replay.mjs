import { readFile } from "node:fs/promises";
import path from "node:path";

import { CONDITIONS } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";
import { createSessionState, transition } from "./state-machine.mjs";
import { EVENT_LOG_FILENAME, verifyEventChain } from "./event-log.mjs";

// Only these events move the session state. Everything else in the study's
// event vocabulary (intent_updated, material_selected, artifact_saved,
// timers, ...) is informational and must not disturb the fold.
const STATE_CHANGING_TYPES = new Set([
  "session_started",
  "gate_request",
  "gate_decision",
  "execution_started",
  "execution_completed",
  "session_ended",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function countContentLines(content) {
  return content.split("\n").filter((line) => line.trim() !== "").length;
}

/**
 * Read-only replay of a run directory. Verifies the event chain, folds the
 * state-changing events through the shared state machine (never the raw
 * TRANSITIONS table — it contains dead edges the machine never emits), and
 * collects gate decisions and fold errors. Never writes to the run directory.
 *
 * The initial session is derived from the first state-changing event: its
 * payload must carry condition, participantId, and taskId alongside the fixed
 * runId. Folding stops at the first machine violation, recording its stable
 * error code and event seq.
 */
export async function replayRun(runDir) {
  if (!isNonEmptyString(runDir)) {
    throw new ResearchRuntimeError("ERR_INVALID_ARGUMENT", "runDir must be a non-empty string", { field: "runDir" });
  }

  const eventsPath = path.join(runDir, EVENT_LOG_FILENAME);
  let content;
  try {
    content = await readFile(eventsPath, "utf8");
  } catch {
    return {
      finalState: null,
      eventCount: 0,
      gateDecisions: [],
      errors: [{ code: "ERR_EVENT_LOG_MISSING", path: EVENT_LOG_FILENAME, message: `run has no ${EVENT_LOG_FILENAME} to replay` }],
    };
  }

  const chain = await verifyEventChain(eventsPath);
  if (!chain.ok) {
    return {
      finalState: null,
      eventCount: countContentLines(content),
      gateDecisions: [],
      errors: [{
        code: "ERR_EVENT_CHAIN_BROKEN",
        path: EVENT_LOG_FILENAME,
        line: chain.error.line,
        message: chain.error.message,
        details: chain.error,
      }],
    };
  }

  const errors = [];
  const gateDecisions = [];
  let state = null;

  for (const event of chain.events) {
    if (!STATE_CHANGING_TYPES.has(event.type)) continue;

    if (state === null) {
      const session = event.type === "session_started" ? event.payload : null;
      if (!isPlainObject(session) || !CONDITIONS.includes(session.condition) ||
        !isNonEmptyString(session.participantId) || !isNonEmptyString(session.taskId)) {
        errors.push({
          code: "ERR_REPLAY_SESSION_INFO",
          seq: event.seq,
          message: "the first state-changing event must be a session_started carrying condition, participantId, and taskId",
        });
        break;
      }
      state = createSessionState({
        runId: event.runId,
        condition: session.condition,
        participantId: session.participantId,
        taskId: session.taskId,
      });
    }

    try {
      const result = transition(state, { actor: event.actor, type: event.type, payload: event.payload });
      if (event.type === "gate_decision") {
        gateDecisions.push(Object.freeze({
          seq: event.seq,
          gate: event.payload.gate,
          decision: event.payload.decision,
          reason: isNonEmptyString(event.payload.reason) ? event.payload.reason : null,
          from: result.event.from,
          to: result.event.to,
        }));
      }
      state = result.state;
    } catch (error) {
      errors.push({
        code: error.code || "ERR_REPLAY_FAILED",
        seq: event.seq,
        type: event.type,
        message: error.message,
      });
      break;
    }
  }

  return {
    finalState: state === null ? null : state.status,
    eventCount: chain.events.length,
    gateDecisions,
    errors,
  };
}

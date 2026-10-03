import { CONDITIONS, GATES, STATES, TRANSITIONS } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";

export const ACTORS = Object.freeze(["user", "agent", "runner"]);

const ACTOR_EVENT_TYPES = Object.freeze({
  user: Object.freeze(["gate_decision"]),
  agent: Object.freeze(["gate_request"]),
  runner: Object.freeze(["session_started", "execution_started", "execution_completed", "session_ended"]),
});

const DECISIONS = Object.freeze(["approve", "reject"]);

const CONDITION_ENTRY_STATE = Object.freeze({ C0: "executing", C1: "intent_drafting" });

const GATE_REQUEST_SOURCES = Object.freeze({
  intent_drafting: "GATE1",
  material_search: "GATE2",
  evidence_collect: "GATE3",
});

const PENDING_GATES = Object.freeze({
  GATE1_PENDING: "GATE1",
  GATE2_PENDING: "GATE2",
  GATE3_PENDING: "GATE3",
});

const GATE_APPROVE_TARGETS = Object.freeze({
  GATE1_PENDING: "material_search",
  GATE2_PENDING: "plan_frozen",
  GATE3_PENDING: "done",
});

const GATE_REJECT_TARGETS = Object.freeze({
  GATE1_PENDING: "intent_drafting",
  GATE2_PENDING: "material_search",
  GATE3_PENDING: "evidence_collect",
});

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function illegalTransition(current, event, extra = {}) {
  return new ResearchRuntimeError(
    "ERR_ILLEGAL_TRANSITION",
    `event "${event.type}" is not legal from status "${current.status}" in condition ${current.condition}`,
    { from: current.status, condition: current.condition, type: event.type, ...extra },
  );
}

function assertSessionState(current) {
  if (!isPlainObject(current) || !STATES.includes(current.status) || !CONDITIONS.includes(current.condition)) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_SESSION",
      "current must be a session state with a known status and condition",
      {
        status: isPlainObject(current) ? current.status : null,
        condition: isPlainObject(current) ? current.condition : null,
      },
    );
  }
}

function freezeClone(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(freezeClone));
  }
  if (isPlainObject(value)) {
    const clone = {};
    for (const key of Object.keys(value)) {
      clone[key] = freezeClone(value[key]);
    }
    return Object.freeze(clone);
  }
  return value;
}

export function createSessionState({ runId, condition, participantId, taskId } = {}) {
  if (!isNonEmptyString(runId) || !isNonEmptyString(participantId) || !isNonEmptyString(taskId)) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_SESSION",
      "runId, participantId, and taskId must be non-empty strings",
      { runId: runId || null, participantId: participantId || null, taskId: taskId || null },
    );
  }
  if (!CONDITIONS.includes(condition)) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_SESSION",
      `condition must be one of ${CONDITIONS.join(", ")}`,
      { condition: condition === undefined ? null : condition },
    );
  }
  return Object.freeze({
    runId,
    condition,
    participantId,
    taskId,
    status: "idle",
    revision: 0,
  });
}

function requireKnownGate(event) {
  const gate = event.payload.gate;
  if (!GATES.includes(gate)) {
    throw new ResearchRuntimeError(
      "ERR_UNKNOWN_GATE",
      `unknown gate: ${JSON.stringify(gate === undefined ? null : gate)}`,
      { gate: gate === undefined ? null : gate, gates: [...GATES] },
    );
  }
  return gate;
}

function nextStatusFor(current, event) {
  const { type, payload } = event;

  switch (type) {
    case "session_started": {
      if (current.status !== "idle") {
        throw illegalTransition(current, event);
      }
      return CONDITION_ENTRY_STATE[current.condition];
    }

    case "gate_request": {
      const gate = requireKnownGate(event);
      if (current.condition !== "C1") {
        throw illegalTransition(current, event, { gate, reason: "condition C0 has no gates" });
      }
      const expectedGate = GATE_REQUEST_SOURCES[current.status];
      if (expectedGate !== gate) {
        throw illegalTransition(current, event, { gate, expectedGate: expectedGate || null });
      }
      return `${gate}_PENDING`;
    }

    case "gate_decision": {
      const gate = requireKnownGate(event);
      const decision = payload.decision;
      if (!DECISIONS.includes(decision)) {
        throw new ResearchRuntimeError(
          "ERR_ILLEGAL_TRANSITION",
          `gate_decision.decision must be one of ${DECISIONS.join(", ")}`,
          { gate, decision: decision === undefined ? null : decision },
        );
      }
      if (decision === "reject" && !isNonEmptyString(payload.reason)) {
        throw new ResearchRuntimeError(
          "ERR_MISSING_REASON",
          "gate rejections require a non-empty reason",
          { gate, decision },
        );
      }
      if (current.condition !== "C1") {
        throw illegalTransition(current, event, { gate, reason: "condition C0 has no gates" });
      }
      const pendingGate = PENDING_GATES[current.status];
      if (pendingGate !== gate) {
        throw illegalTransition(current, event, {
          gate,
          pendingGate: pendingGate || null,
          reason: pendingGate ? "decision targets a gate that is not pending" : "no gate is pending",
        });
      }
      return decision === "approve" ? GATE_APPROVE_TARGETS[current.status] : GATE_REJECT_TARGETS[current.status];
    }

    case "execution_started": {
      if (current.status !== "plan_frozen") {
        throw illegalTransition(current, event);
      }
      return "executing";
    }

    case "execution_completed": {
      if (current.status !== "executing") {
        throw illegalTransition(current, event);
      }
      return "evidence_collect";
    }

    case "session_ended": {
      if (current.condition !== "C0" || current.status !== "evidence_collect") {
        const extra = {};
        if (current.condition === "C1") {
          extra.reason = "C1 sessions must resolve GATE3 before ending";
        }
        throw illegalTransition(current, event, extra);
      }
      return "done";
    }

    default:
      throw illegalTransition(current, event);
  }
}

export function transition(current, event) {
  assertSessionState(current);
  if (!isPlainObject(event)) {
    throw new ResearchRuntimeError("ERR_INVALID_EVENT", "event must be an object", {
      received: event === null ? null : typeof event,
    });
  }
  if (!isNonEmptyString(event.type)) {
    throw new ResearchRuntimeError("ERR_INVALID_EVENT", "event.type must be a non-empty string", {
      type: event.type === undefined ? null : event.type,
    });
  }
  const payload = event.payload === undefined ? {} : event.payload;
  if (!isPlainObject(payload)) {
    throw new ResearchRuntimeError("ERR_INVALID_EVENT", "event.payload must be an object", {
      type: event.type,
    });
  }

  if (!ACTORS.includes(event.actor) || !ACTOR_EVENT_TYPES[event.actor].includes(event.type)) {
    throw new ResearchRuntimeError(
      "ERR_ACTOR_NOT_ALLOWED",
      `actor "${event.actor}" may not emit event "${event.type}"`,
      {
        actor: event.actor === undefined ? null : event.actor,
        type: event.type,
        allowed: ACTOR_EVENT_TYPES[event.actor] || [],
      },
    );
  }

  const normalizedEvent = { actor: event.actor, type: event.type, payload };

  if (current.status === "done") {
    throw new ResearchRuntimeError(
      "ERR_TERMINAL_STATE",
      `session ${current.runId} is already in the terminal state "done"`,
      { runId: current.runId, status: current.status, type: event.type },
    );
  }

  const next = nextStatusFor(current, normalizedEvent);
  if (!TRANSITIONS[current.status].includes(next)) {
    throw illegalTransition(current, normalizedEvent, { to: next, reason: "violates the shared transition table" });
  }

  const state = Object.freeze({
    ...current,
    status: next,
    revision: (Number.isInteger(current.revision) ? current.revision : 0) + 1,
  });

  return {
    state,
    event: Object.freeze({
      actor: normalizedEvent.actor,
      type: normalizedEvent.type,
      payload: freezeClone(normalizedEvent.payload),
      from: current.status,
      to: next,
    }),
  };
}

export function isTerminalState(state) {
  return isPlainObject(state) && state.status === "done";
}

import { createHash } from "node:crypto";
import { ResearchRuntimeError } from "./errors.mjs";

export const CONDITIONS = Object.freeze(["C0", "C1"]);
export const STATES = Object.freeze([
  "idle",
  "intent_drafting",
  "GATE1_PENDING",
  "material_search",
  "GATE2_PENDING",
  "plan_frozen",
  "executing",
  "evidence_collect",
  "GATE3_PENDING",
  "done",
]);
export const GATES = Object.freeze(["GATE1", "GATE2", "GATE3"]);

// The table is shared by the state machine in the next runtime task.
export const TRANSITIONS = Object.freeze({
  idle: Object.freeze(["intent_drafting", "executing"]),
  intent_drafting: Object.freeze(["GATE1_PENDING"]),
  GATE1_PENDING: Object.freeze(["material_search", "intent_drafting"]),
  material_search: Object.freeze(["GATE2_PENDING"]),
  GATE2_PENDING: Object.freeze(["plan_frozen", "material_search"]),
  plan_frozen: Object.freeze(["executing", "material_search", "intent_drafting"]),
  executing: Object.freeze(["evidence_collect"]),
  evidence_collect: Object.freeze(["GATE3_PENDING", "done"]),
  GATE3_PENDING: Object.freeze(["done", "evidence_collect"]),
  done: Object.freeze([]),
});

const REQUIRED_FIELDS = [
  "schemaVersion",
  "studyId",
  "studyVersion",
  "frozen",
  "conditions",
  "states",
  "tasks",
  "gates",
  "eventTypes",
];
const LEVELS = new Set(["S", "M", "L"]);
const EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]*$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function addError(errors, code, path, message) {
  errors.push({ code, path, message });
}

function addMissingFieldErrors(input, errors) {
  for (const field of REQUIRED_FIELDS) {
    if (!Object.hasOwn(input, field)) {
      addError(errors, "ERR_REQUIRED_FIELD", field, `${field} is required`);
    }
  }
}

function validatePackageShape(input) {
  const errors = [];
  if (!isPlainObject(input)) {
    addError(errors, "ERR_PACKAGE_TYPE", "$", "study package must be an object");
    return errors;
  }

  addMissingFieldErrors(input, errors);

  if (input.schemaVersion !== 1) {
    addError(errors, "ERR_SCHEMA_VERSION", "schemaVersion", "schemaVersion must be 1");
  }
  if (!isNonEmptyString(input.studyId)) {
    addError(errors, "ERR_STUDY_ID", "studyId", "studyId must be a non-empty string");
  }
  if (!isNonEmptyString(input.studyVersion)) {
    addError(errors, "ERR_STUDY_VERSION", "studyVersion", "studyVersion must be a non-empty string");
  }
  if (input.frozen !== true) {
    addError(errors, "ERR_PACKAGE_NOT_FROZEN", "frozen", "study package must be frozen");
  }

  if (!Array.isArray(input.conditions)) {
    addError(errors, "ERR_CONDITIONS_TYPE", "conditions", "conditions must be an array");
  } else {
    const seenConditions = new Set();
    for (let index = 0; index < input.conditions.length; index += 1) {
      const condition = input.conditions[index];
      if (seenConditions.has(condition)) {
        addError(errors, "ERR_DUPLICATE_CONDITION", `conditions[${index}]`, `duplicate condition: ${condition}`);
      } else {
        seenConditions.add(condition);
      }
    }
    if (!CONDITIONS.every((condition) => input.conditions.includes(condition))) {
      addError(errors, "ERR_CONDITIONS_INCOMPLETE", "conditions", "conditions must include C0 and C1");
    }
    if (input.conditions.some((condition) => !CONDITIONS.includes(condition))) {
      addError(errors, "ERR_UNKNOWN_CONDITION", "conditions", "conditions may only contain C0 and C1");
    }
  }

  if (!Array.isArray(input.states)) {
    addError(errors, "ERR_STATES_TYPE", "states", "states must be an array");
  } else if (input.states.length !== STATES.length || input.states.some((state, index) => state !== STATES[index])) {
    addError(errors, "ERR_STATE_LIST", "states", "states must match the declared state list");
  }

  if (!Array.isArray(input.tasks)) {
    addError(errors, "ERR_TASKS_TYPE", "tasks", "tasks must be an array");
  } else {
    const seenTaskIds = new Set();
    for (let index = 0; index < input.tasks.length; index += 1) {
      const task = input.tasks[index];
      const taskPath = `tasks[${index}]`;
      if (!isPlainObject(task)) {
        addError(errors, "ERR_TASK_TYPE", taskPath, "task must be an object");
        continue;
      }
      if (!isNonEmptyString(task.taskId)) {
        addError(errors, "ERR_TASK_ID", `${taskPath}.taskId`, "taskId must be a non-empty string");
      } else if (seenTaskIds.has(task.taskId)) {
        addError(errors, "ERR_DUPLICATE_ID", `${taskPath}.taskId`, `duplicate taskId: ${task.taskId}`);
      } else {
        seenTaskIds.add(task.taskId);
      }
      if (!LEVELS.has(task.level)) {
        addError(errors, "ERR_TASK_LEVEL", `${taskPath}.level`, "level must be S, M, or L");
      }
      if (!isNonEmptyString(task.title)) {
        addError(errors, "ERR_TASK_TITLE", `${taskPath}.title`, "title must be a non-empty string");
      }
    }
  }

  if (!Array.isArray(input.gates)) {
    addError(errors, "ERR_GATES_TYPE", "gates", "gates must be an array");
  } else if (input.gates.length !== GATES.length || input.gates.some((gate, index) => gate !== GATES[index])) {
    addError(errors, "ERR_GATE_LIST", "gates", "gates must include GATE1, GATE2, and GATE3 in order");
  }

  if (!Array.isArray(input.eventTypes)) {
    addError(errors, "ERR_EVENT_TYPES_TYPE", "eventTypes", "eventTypes must be an array");
  } else {
    const seenEventTypes = new Set();
    for (let index = 0; index < input.eventTypes.length; index += 1) {
      const eventType = input.eventTypes[index];
      const eventPath = `eventTypes[${index}]`;
      if (!isNonEmptyString(eventType) || !EVENT_TYPE_PATTERN.test(eventType)) {
        addError(errors, "ERR_EVENT_TYPE", eventPath, "event type must be a non-empty snake_case string");
      } else if (seenEventTypes.has(eventType)) {
        addError(errors, "ERR_DUPLICATE_ID", eventPath, `duplicate event type: ${eventType}`);
      } else {
        seenEventTypes.add(eventType);
      }
    }
    if (input.eventTypes.length === 0) {
      addError(errors, "ERR_EVENT_TYPES_EMPTY", "eventTypes", "eventTypes must not be empty");
    }
  }

  return errors;
}

function canonicalize(value, stack = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("canonical JSON does not support non-finite numbers");
    return value;
  }
  if (typeof value !== "object") throw new TypeError(`canonical JSON does not support ${typeof value}`);
  if (stack.has(value)) throw new TypeError("canonical JSON does not support circular values");
  stack.add(value);
  let result;
  if (Array.isArray(value)) {
    result = value.map((item) => canonicalize(item, stack));
  } else {
    result = {};
    for (const key of Object.keys(value).sort()) {
      const item = value[key];
      if (item !== undefined) result[key] = canonicalize(item, stack);
    }
  }
  stack.delete(value);
  return result;
}

export function stableStringify(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Hex(input) {
  return createHash("sha256").update(input).digest("hex");
}

export function canonicalHash(value) {
  return sha256Hex(stableStringify(value));
}

export function validateStudyPackage(input) {
  const errors = validatePackageShape(input);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, errors: [], hash: canonicalHash(input) };
}

export function assertStudyPackage(input) {
  const result = validateStudyPackage(input);
  if (!result.ok) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_STUDY_PACKAGE",
      "study package failed validation",
      { errors: result.errors },
    );
  }
  return { package: input, hash: result.hash };
}

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONDITIONS,
  GATES,
  STATES,
  TRANSITIONS,
  assertStudyPackage,
  canonicalHash,
  sha256Hex,
  stableStringify,
  validateStudyPackage,
} from "../research/runtime/package-schema.mjs";
import { ResearchRuntimeError } from "../research/runtime/errors.mjs";
import {
  assertAssignmentBalanced,
  assignmentHash,
  createAssignment,
} from "../research/runtime/assignment.mjs";
import {
  createSessionState,
  isTerminalState,
  transition,
} from "../research/runtime/state-machine.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixturePath = path.join(ROOT, "research/runtime/fixtures/study-package.json");

const minimalPackage = {
  schemaVersion: 1,
  studyId: "study",
  studyVersion: "1.0.0",
  frozen: true,
  conditions: ["C0", "C1"],
  states: [...STATES],
  tasks: [{ taskId: "T1", level: "M", title: "a" }],
  gates: [...GATES],
  eventTypes: ["session_started"],
};

test("canonical JSON is stable across object insertion order", () => {
  const first = { z: 2, nested: { b: true, a: null }, a: [3, "x"] };
  const second = { a: [3, "x"], nested: { a: null, b: true }, z: 2 };

  assert.equal(stableStringify(first), '{"a":[3,"x"],"nested":{"a":null,"b":true},"z":2}');
  assert.equal(stableStringify(first), stableStringify(second));
  assert.equal(sha256Hex("hello"), "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  assert.equal(canonicalHash(first), canonicalHash(second));
});

test("study fixture validates and has a stable canonical hash", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const first = assertStudyPackage(fixture);
  const second = assertStudyPackage(JSON.parse(JSON.stringify(fixture)));

  assert.equal(first.hash, second.hash);
  assert.match(first.hash, /^[a-f0-9]{64}$/);
  assert.deepEqual(first.package, fixture);
});

test("package validation rejects duplicate tasks and unfrozen packages", () => {
  const result = validateStudyPackage({
    ...minimalPackage,
    frozen: false,
    tasks: [
      { taskId: "T1", level: "M", title: "a" },
      { taskId: "T1", level: "M", title: "b" },
    ],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), [
    "ERR_PACKAGE_NOT_FROZEN",
    "ERR_DUPLICATE_ID",
  ]);
});

test("package validation rejects duplicate conditions", () => {
  const result = validateStudyPackage({ ...minimalPackage, conditions: ["C0", "C1", "C1"] });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), ["ERR_DUPLICATE_CONDITION"]);
});

test("package validation rejects unknown conditions", () => {
  const result = validateStudyPackage({ ...minimalPackage, conditions: ["C0", "C2"] });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), ["ERR_CONDITIONS_INCOMPLETE", "ERR_UNKNOWN_CONDITION"]);
});

test("package validation reports required structure errors in path order", () => {
  const result = validateStudyPackage({
    ...minimalPackage,
    schemaVersion: 2,
    studyId: "",
    studyVersion: " ",
    conditions: ["C0"],
    states: ["idle"],
    tasks: [{ taskId: "T1", level: "XL", title: "" }],
    gates: ["GATE1"],
    eventTypes: [" ", "session_started"],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.path), [
    "conditions",
    "eventTypes[0]",
    "gates",
    "schemaVersion",
    "states",
    "studyId",
    "studyVersion",
    "tasks[0].level",
    "tasks[0].title",
  ]);
});

test("package validation reports required errors once and sorts them by path then code", () => {
  const result = validateStudyPackage({});

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    { code: "ERR_REQUIRED_FIELD", path: "conditions", message: "conditions is required" },
    { code: "ERR_REQUIRED_FIELD", path: "eventTypes", message: "eventTypes is required" },
    { code: "ERR_REQUIRED_FIELD", path: "frozen", message: "frozen is required" },
    { code: "ERR_REQUIRED_FIELD", path: "gates", message: "gates is required" },
    { code: "ERR_REQUIRED_FIELD", path: "schemaVersion", message: "schemaVersion is required" },
    { code: "ERR_REQUIRED_FIELD", path: "states", message: "states is required" },
    { code: "ERR_REQUIRED_FIELD", path: "studyId", message: "studyId is required" },
    { code: "ERR_REQUIRED_FIELD", path: "studyVersion", message: "studyVersion is required" },
    { code: "ERR_REQUIRED_FIELD", path: "tasks", message: "tasks is required" },
  ]);
});

test("package validation sorts multiple errors at the same path by stable code", () => {
  const result = validateStudyPackage({
    ...minimalPackage,
    conditions: ["C0", "C2"],
    eventTypes: ["", "event", "event"],
  });

  assert.deepEqual(result.errors.map(({ code, path }) => ({ code, path })), [
    { code: "ERR_CONDITIONS_INCOMPLETE", path: "conditions" },
    { code: "ERR_UNKNOWN_CONDITION", path: "conditions" },
    { code: "ERR_EVENT_TYPE", path: "eventTypes[0]" },
    { code: "ERR_DUPLICATE_ID", path: "eventTypes[2]" },
  ]);
});

test("package validation accepts any non-empty event type string", () => {
  const result = validateStudyPackage({
    ...minimalPackage,
    eventTypes: ["Gate Decision", "事件/type.v2", "UPPER_CASE"],
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

test("canonical hashes distinguish an own __proto__ key from an ordinary key", () => {
  const first = JSON.parse('{"__proto__":{"value":1}}');
  const second = JSON.parse('{"value":1}');

  assert.notEqual(canonicalHash(first), canonicalHash(second));
  assert.equal(stableStringify(first), '{"__proto__":{"value":1}}');
});

test("assertStudyPackage throws a stable runtime error for invalid input", () => {
  assert.throws(
    () => assertStudyPackage({ ...minimalPackage, frozen: false }),
    (error) => {
      assert.ok(error instanceof ResearchRuntimeError);
      assert.equal(error.code, "ERR_INVALID_STUDY_PACKAGE");
      assert.equal(error.details.errors[0].code, "ERR_PACKAGE_NOT_FROZEN");
      return true;
    },
  );
});

test("shared vocabularies expose the C0/C1 study contract", () => {
  assert.deepEqual(CONDITIONS, ["C0", "C1"]);
  assert.deepEqual(GATES, ["GATE1", "GATE2", "GATE3"]);
  assert.deepEqual(STATES, [
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
  assert.equal(typeof TRANSITIONS, "object");
});

test("assignment is deterministic and balances C0/C1 across paired tasks", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const one = createAssignment({ study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo" });
  const two = createAssignment({ study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo" });
  assert.deepEqual(one.rows, two.rows);
  assert.equal(one.rows.filter(row => row.condition === "C0").length, 2);
  assert.equal(one.rows.filter(row => row.condition === "C1").length, 2);
});

test("assignment rows use sorted canonical order and the Latin square formula", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const assignment = createAssignment({
    study: fixture,
    studyHash,
    participantIds: ["p02", "p01"],
    taskIds: ["T2", "T1"],
    seed: "demo",
  });

  assert.deepEqual(assignment.rows, [
    { participantId: "p01", taskId: "T1", condition: "C0", order: 0 },
    { participantId: "p01", taskId: "T2", condition: "C1", order: 1 },
    { participantId: "p02", taskId: "T1", condition: "C1", order: 2 },
    { participantId: "p02", taskId: "T2", condition: "C0", order: 3 },
  ]);
  assert.ok(Object.isFrozen(assignment.rows));
  assert.ok(assignment.rows.every(row => Object.isFrozen(row)));
});

test("assignment exposes stable identifiers and a canonical assignmentHash", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const assignment = createAssignment({ study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo" });
  const reseeded = createAssignment({ study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "flip" });

  assert.equal(assignmentHash(assignment), assignment.assignmentHash);
  assert.match(assignment.assignmentHash, /^[a-f0-9]{64}$/);
  assert.match(assignment.assignmentId, /^[a-f0-9]{64}$/);
  assert.equal(assignment.studyHash, studyHash);
  assert.equal(assignment.seed, "demo");
  assert.equal(assignment.createdAt, null);
  assert.deepEqual(assignment.rows, reseeded.rows);
  assert.notEqual(assignment.assignmentId, reseeded.assignmentId);

  const reordered = {
    seed: "demo",
    createdAt: null,
    rows: assignment.rows,
    assignmentId: assignment.assignmentId,
    studyId: assignment.studyId,
    schemaVersion: assignment.schemaVersion,
    studyHash,
  };
  assert.equal(assignmentHash(reordered), assignment.assignmentHash);
  assert.ok(Object.isFrozen(assignment));
});

test("assignment rejects duplicate and unknown identifiers", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const base = { study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo" };

  assert.throws(() => createAssignment({ ...base, participantIds: ["p01", "p01"] }), /ERR_DUPLICATE_ID/);
  assert.throws(() => createAssignment({ ...base, taskIds: ["T1", "T1"] }), /ERR_DUPLICATE_ID/);
  assert.throws(() => createAssignment({ ...base, taskIds: ["T1", "T9"] }), /ERR_UNKNOWN_TASK/);
});

test("assignment rejects missing inputs and study hash mismatches", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const base = { study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo" };

  assert.throws(() => createAssignment({ ...base, participantIds: [] }), /ERR_MISSING_PARTICIPANTS/);
  assert.throws(() => createAssignment({ ...base, taskIds: [] }), /ERR_MISSING_TASKS/);
  assert.throws(() => createAssignment({ ...base, studyHash: "deadbeef" }), /ERR_STUDY_HASH_MISMATCH/);
  assert.throws(() => createAssignment({ ...base, study: { ...fixture, frozen: false } }), /ERR_INVALID_STUDY_PACKAGE/);
  assert.throws(() => createAssignment({ ...base, seed: "" }), /ERR_SEED_REQUIRED/);
});

test("assignment rejects unbalanced strict requests and asserts balance", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const base = { study: fixture, studyHash, taskIds: ["T1", "T2"], seed: "demo" };

  assert.throws(
    () => createAssignment({ ...base, participantIds: ["p01", "p02", "p03"] }),
    /ERR_UNBALANCED_ASSIGNMENT/,
  );
  const relaxed = createAssignment({ ...base, participantIds: ["p01", "p02", "p03"], strict: false });
  assert.equal(relaxed.rows.length, 6);
  assert.throws(() => assertAssignmentBalanced(relaxed), /ERR_UNBALANCED_ASSIGNMENT/);

  const balanced = createAssignment({ ...base, participantIds: ["p01", "p02"] });
  assert.equal(assertAssignmentBalanced(balanced), undefined);

  const tampered = { ...balanced, rows: balanced.rows.map(row => ({ ...row, condition: "C1" })) };
  assert.throws(() => assertAssignmentBalanced(tampered), /ERR_UNBALANCED_ASSIGNMENT/);
});

test("agent cannot approve a gate and user can complete C1", () => {
  let current = createSessionState({ runId: "r1", condition: "C1", participantId: "p01", taskId: "T1" });
  ({ state: current } = transition(current, { actor: "runner", type: "session_started", payload: {} }));
  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } }));
  assert.throws(() => transition(current, { actor: "agent", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }), /ERR_ACTOR_NOT_ALLOWED/);
  ({ state: current } = transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }));
  assert.equal(current.status, "material_search");
});

test("C1 happy path walks the full gated flow to done", () => {
  let current = createSessionState({ runId: "r1", condition: "C1", participantId: "p01", taskId: "T1" });
  const steps = [
    [{ actor: "runner", type: "session_started", payload: {} }, "intent_drafting"],
    [{ actor: "agent", type: "gate_request", payload: { gate: "GATE1" } }, "GATE1_PENDING"],
    [{ actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }, "material_search"],
    [{ actor: "agent", type: "gate_request", payload: { gate: "GATE2" } }, "GATE2_PENDING"],
    [{ actor: "user", type: "gate_decision", payload: { gate: "GATE2", decision: "approve" } }, "plan_frozen"],
    [{ actor: "runner", type: "execution_started", payload: {} }, "executing"],
    [{ actor: "runner", type: "execution_completed", payload: {} }, "evidence_collect"],
    [{ actor: "agent", type: "gate_request", payload: { gate: "GATE3" } }, "GATE3_PENDING"],
    [{ actor: "user", type: "gate_decision", payload: { gate: "GATE3", decision: "approve" } }, "done"],
  ];

  for (const [event, expectedStatus] of steps) {
    const result = transition(current, event);
    assert.equal(result.state.status, expectedStatus);
    assert.equal(result.event.to, expectedStatus);
    assert.equal(result.event.from === expectedStatus, false);
    assert.equal(result.event.actor, event.actor);
    assert.equal(result.event.type, event.type);
    assert.ok(Object.isFrozen(result.state));
    assert.ok(Object.isFrozen(result.event));
    current = result.state;
  }

  assert.equal(isTerminalState(current), true);
});

test("C0 flow runs without gate events", () => {
  let current = createSessionState({ runId: "r2", condition: "C0", participantId: "p01", taskId: "T1" });
  assert.equal(isTerminalState(current), false);
  ({ state: current } = transition(current, { actor: "runner", type: "session_started", payload: {} }));
  assert.equal(current.status, "executing");
  assert.throws(() => transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } }), /ERR_ILLEGAL_TRANSITION/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }), /ERR_ILLEGAL_TRANSITION/);
  ({ state: current } = transition(current, { actor: "runner", type: "execution_completed", payload: {} }));
  assert.equal(current.status, "evidence_collect");
  ({ state: current } = transition(current, { actor: "runner", type: "session_ended", payload: {} }));
  assert.equal(current.status, "done");
  assert.equal(isTerminalState(current), true);
});

test("gate rejects require a non-empty reason and return to the prior state", () => {
  let current = createSessionState({ runId: "r3", condition: "C1", participantId: "p02", taskId: "T2" });
  ({ state: current } = transition(current, { actor: "runner", type: "session_started", payload: {} }));
  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } }));
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "reject" } }), /ERR_MISSING_REASON/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "reject", reason: "   " } }), /ERR_MISSING_REASON/);
  ({ state: current } = transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "reject", reason: "intent unclear" } }));
  assert.equal(current.status, "intent_drafting");

  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } }));
  ({ state: current } = transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }));
  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE2" } }));
  ({ state: current } = transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE2", decision: "reject", reason: "material too thin" } }));
  assert.equal(current.status, "material_search");

  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE2" } }));
  ({ state: current } = transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE2", decision: "approve" } }));
  ({ state: current } = transition(current, { actor: "runner", type: "execution_started", payload: {} }));
  ({ state: current } = transition(current, { actor: "runner", type: "execution_completed", payload: {} }));
  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE3" } }));
  ({ state: current } = transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE3", decision: "reject", reason: "evidence incomplete" } }));
  assert.equal(current.status, "evidence_collect");
});

test("gate decisions are restricted to known, currently pending gates", () => {
  let current = createSessionState({ runId: "r4", condition: "C1", participantId: "p01", taskId: "T1" });
  ({ state: current } = transition(current, { actor: "runner", type: "session_started", payload: {} }));
  assert.throws(() => transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE9" } }), /ERR_UNKNOWN_GATE/);
  assert.throws(() => transition(current, { actor: "agent", type: "gate_request", payload: {} }), /ERR_UNKNOWN_GATE/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }), /ERR_ILLEGAL_TRANSITION/);

  ({ state: current } = transition(current, { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } }));
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE9", decision: "approve" } }), /ERR_UNKNOWN_GATE/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { decision: "approve" } }), /ERR_UNKNOWN_GATE/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE2", decision: "approve" } }), /ERR_ILLEGAL_TRANSITION/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "maybe" } }), /ERR_ILLEGAL_TRANSITION/);
});

test("actor restrictions reject transitions outside each actor's event types", () => {
  const current = createSessionState({ runId: "r5", condition: "C1", participantId: "p01", taskId: "T1" });

  assert.throws(() => transition(current, { actor: "agent", type: "session_started", payload: {} }), /ERR_ACTOR_NOT_ALLOWED/);
  assert.throws(() => transition(current, { actor: "user", type: "session_started", payload: {} }), /ERR_ACTOR_NOT_ALLOWED/);
  assert.throws(() => transition(current, { actor: "runner", type: "gate_request", payload: { gate: "GATE1" } }), /ERR_ACTOR_NOT_ALLOWED/);
  assert.throws(() => transition(current, { actor: "user", type: "gate_request", payload: { gate: "GATE1" } }), /ERR_ACTOR_NOT_ALLOWED/);
  assert.throws(() => transition(current, { actor: "runner", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }), /ERR_ACTOR_NOT_ALLOWED/);
  assert.throws(() => transition(current, { actor: "observer", type: "session_started", payload: {} }), /ERR_ACTOR_NOT_ALLOWED/);
});

test("illegal transitions and terminal states throw stable codes", () => {
  const c1 = createSessionState({ runId: "r6", condition: "C1", participantId: "p01", taskId: "T1" });
  assert.throws(() => transition(c1, { actor: "runner", type: "execution_started", payload: {} }), /ERR_ILLEGAL_TRANSITION/);
  assert.throws(() => transition(c1, { actor: "runner", type: "session_ended", payload: {} }), /ERR_ILLEGAL_TRANSITION/);

  const started = transition(c1, { actor: "runner", type: "session_started", payload: {} }).state;
  assert.throws(() => transition(started, { actor: "runner", type: "session_started", payload: {} }), /ERR_ILLEGAL_TRANSITION/);
  assert.throws(() => transition(started, { actor: "runner", type: "execution_completed", payload: {} }), /ERR_ILLEGAL_TRANSITION/);

  let done = createSessionState({ runId: "r6", condition: "C0", participantId: "p01", taskId: "T1" });
  for (const event of [
    { actor: "runner", type: "session_started", payload: {} },
    { actor: "runner", type: "execution_completed", payload: {} },
    { actor: "runner", type: "session_ended", payload: {} },
  ]) {
    ({ state: done } = transition(done, event));
  }
  assert.equal(done.status, "done");
  assert.throws(() => transition(done, { actor: "runner", type: "session_started", payload: {} }), /ERR_TERMINAL_STATE/);
  assert.throws(() => transition(done, { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } }), /ERR_TERMINAL_STATE/);
});

test("session state creation validates condition and identifiers before any transition", () => {
  const state = createSessionState({ runId: "r7", condition: "C0", participantId: "p01", taskId: "T1" });
  assert.equal(state.status, "idle");
  assert.equal(state.revision, 0);
  assert.ok(Object.isFrozen(state));

  assert.throws(() => createSessionState({ runId: "", condition: "C0", participantId: "p01", taskId: "T1" }), /ERR_INVALID_SESSION/);
  assert.throws(() => createSessionState({ runId: "r7", condition: "C2", participantId: "p01", taskId: "T1" }), /ERR_INVALID_SESSION/);
  assert.throws(() => createSessionState({ runId: "r7", condition: "C0", participantId: "p01" }), /ERR_INVALID_SESSION/);
  assert.equal(isTerminalState({ status: "done" }), true);
  assert.equal(isTerminalState(state), false);
  assert.equal(isTerminalState(null), false);
});

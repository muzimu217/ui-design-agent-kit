import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
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
import { EventLog, verifyEventChain } from "../research/runtime/event-log.mjs";
import { freezeRun, verifyRun, writeArtifact } from "../research/runtime/evidence-store.mjs";
import { replayRun } from "../research/runtime/replay.mjs";
import { runDryRun } from "../research/runtime/dry-run.mjs";

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

const FIXED_CLOCK = () => "2026-10-01T00:00:00.000Z";

function makeTempDir(prefix) {
  return mkdtemp(path.join(tmpdir(), prefix));
}

async function seedRunDir() {
  const runDir = await makeTempDir("uak-run-");
  const eventsPath = path.join(runDir, "events.jsonl");
  const log = new EventLog({ filePath: eventsPath, runId: "r-freeze", clock: FIXED_CLOCK });
  await log.append({ actor: "runner", type: "session_started", payload: { condition: "C0", participantId: "p01", taskId: "T1" } });
  await log.append({ actor: "runner", type: "execution_completed", payload: {} });
  await log.append({ actor: "runner", type: "session_ended", payload: {} });
  await writeArtifact(runDir, "input/task-card.md", "T1");
  return { runDir, eventsPath, manifestPath: path.join(runDir, "MANIFEST.sha256") };
}

async function researchMetadata(eventsPath) {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const studyHash = canonicalHash(fixture);
  const assignmentHash = createAssignment({
    study: fixture,
    studyHash,
    participantIds: ["p01", "p02"],
    taskIds: ["T1", "T2"],
    seed: "task3",
  }).assignmentHash;
  const eventLogHash = sha256Hex(await readFile(eventsPath));
  return { studyHash, assignmentHash, eventLogHash };
}

test("event log chains hashes and detects a modified line", async (t) => {
  const dir = await makeTempDir("uak-log-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const filePath = path.join(dir, "events.jsonl");

  const log = new EventLog({ filePath, runId: "r1", clock: FIXED_CLOCK });
  await log.append({ actor: "runner", type: "session_started", payload: {} });
  await log.append({ actor: "runner", type: "execution_started", payload: {} });
  assert.equal((await log.verify()).ok, true);

  const lines = (await readFile(filePath, "utf8")).trim().split("\n");
  lines[1] = lines[1].replace("execution_started", "tampered");
  await writeFile(filePath, `${lines.join("\n")}\n`);

  const broken = await verifyEventChain(filePath, "r1");
  assert.equal(broken.ok, false);
  assert.equal(broken.error.code, "ERR_SHA_MISMATCH");
  assert.equal(broken.error.line, 2);
});

test("event log stamps schema version, seq, runId, and chained prevSha fields", async (t) => {
  const dir = await makeTempDir("uak-log-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const filePath = path.join(dir, "events.jsonl");

  const log = new EventLog({ filePath, runId: "r-stamp", clock: FIXED_CLOCK });
  const first = await log.append({ actor: "runner", type: "session_started", payload: { condition: "C0", participantId: "p01", taskId: "T1" } });
  const second = await log.append({ actor: "runner", type: "execution_completed", payload: {} });

  assert.equal(first.schemaVersion, 1);
  assert.equal(first.seq, 0);
  assert.equal(first.ts, "2026-10-01T00:00:00.000Z");
  assert.equal(first.runId, "r-stamp");
  assert.equal(first.prevSha, "0".repeat(64));
  assert.match(first.sha, /^[a-f0-9]{64}$/);
  assert.equal(second.seq, 1);
  assert.equal(second.prevSha, first.sha);

  const events = await log.read();
  assert.deepEqual(events.map((event) => event.seq), [0, 1]);
  assert.equal((await verifyEventChain(filePath, "r-stamp")).ok, true);

  const mismatch = await verifyEventChain(filePath, "someone-else");
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.error.code, "ERR_RUN_ID_MISMATCH");
  assert.equal(mismatch.error.line, 1);
});

test("event log append re-verifies the file and damaged logs reject further writes", async (t) => {
  const dir = await makeTempDir("uak-log-");
  t.after(() => rm(dir, { recursive: true, force: true }));

  const filePath = path.join(dir, "events.jsonl");
  const log = new EventLog({ filePath, runId: "r3", clock: FIXED_CLOCK });
  await log.append({ actor: "runner", type: "session_started", payload: {} });
  await log.append({ actor: "runner", type: "execution_completed", payload: {} });
  const lines = (await readFile(filePath, "utf8")).trim().split("\n");
  lines[0] = lines[0].replace("session_started", "hijacked");
  await writeFile(filePath, `${lines.join("\n")}\n`);
  await assert.rejects(() => log.append({ actor: "runner", type: "session_ended", payload: {} }), /ERR_EVENT_LOG_DAMAGED/);

  const garbagePath = path.join(dir, "garbage.jsonl");
  await writeFile(garbagePath, "not-json\n");
  const garbage = await verifyEventChain(garbagePath, "r3");
  assert.equal(garbage.ok, false);
  assert.equal(garbage.error.code, "ERR_MALFORMED_LINE");
  assert.equal(garbage.error.line, 1);

  const blankPath = path.join(dir, "blank.jsonl");
  const blankLog = new EventLog({ filePath: blankPath, runId: "r3", clock: FIXED_CLOCK });
  await blankLog.append({ actor: "runner", type: "session_started", payload: {} });
  await blankLog.append({ actor: "runner", type: "execution_completed", payload: {} });
  const blankLines = (await readFile(blankPath, "utf8")).trim().split("\n");
  blankLines.splice(1, 0, "");
  await writeFile(blankPath, `${blankLines.join("\n")}\n`);
  const blank = await verifyEventChain(blankPath, "r3");
  assert.equal(blank.error.code, "ERR_MALFORMED_LINE");
  assert.equal(blank.error.line, 2);

  const seqPath = path.join(dir, "seq.jsonl");
  const seqLog = new EventLog({ filePath: seqPath, runId: "r3", clock: FIXED_CLOCK });
  await seqLog.append({ actor: "runner", type: "session_started", payload: {} });
  await seqLog.append({ actor: "runner", type: "execution_completed", payload: {} });
  const seqLines = (await readFile(seqPath, "utf8")).trim().split("\n");
  const doctored = JSON.parse(seqLines[1]);
  doctored.seq = 7;
  seqLines[1] = JSON.stringify(doctored);
  await writeFile(seqPath, `${seqLines.join("\n")}\n`);
  const seqResult = await verifyEventChain(seqPath, "r3");
  assert.equal(seqResult.error.code, "ERR_SEQ_NOT_SEQUENTIAL");
  assert.equal(seqResult.error.line, 2);
});

test("writeArtifact rejects traversal and absolute escapes while creating parent directories", async (t) => {
  const runDir = await makeTempDir("uak-run-");
  t.after(() => rm(runDir, { recursive: true, force: true }));

  await assert.rejects(() => writeArtifact(runDir, "/etc/passwd", "x"), /ERR_UNSAFE_PATH/);
  await assert.rejects(() => writeArtifact(runDir, "../escape.txt", "x"), /ERR_UNSAFE_PATH/);
  await assert.rejects(() => writeArtifact(runDir, "input/../../escape.txt", "x"), /ERR_UNSAFE_PATH/);
  await assert.rejects(() => writeArtifact(runDir, "", "x"), /ERR_UNSAFE_PATH/);

  const written = await writeArtifact(runDir, "input/nested/task-card.md", "T1");
  assert.equal(written, path.join(runDir, "input", "nested", "task-card.md"));
  assert.equal(await readFile(written, "utf8"), "T1");
});

test("freeze verifies files, blocks mutation, and replay does not alter the run", async (t) => {
  const { runDir, eventsPath, manifestPath } = await seedRunDir();
  t.after(() => rm(runDir, { recursive: true, force: true }));

  const { studyHash, assignmentHash, eventLogHash } = await researchMetadata(eventsPath);
  const manifest = await freezeRun(runDir, { studyHash, assignmentHash, eventLogHash });
  assert.deepEqual(manifest.files.map((file) => file.path), ["events.jsonl", "input/task-card.md"]);
  assert.equal((await verifyRun(runDir)).ok, true);

  await assert.rejects(() => writeArtifact(runDir, "new.txt", "x"), /ERR_RUN_FROZEN/);

  const before = await readFile(manifestPath, "utf8");
  const replay = await replayRun(runDir);
  assert.equal(replay.finalState, "done");
  assert.equal(await readFile(manifestPath, "utf8"), before);
});

test("freeze writes a sorted manifest excluding hidden and temp files and validates metadata", async (t) => {
  const { runDir, eventsPath } = await seedRunDir();
  t.after(() => rm(runDir, { recursive: true, force: true }));

  const { studyHash, assignmentHash, eventLogHash } = await researchMetadata(eventsPath);
  await writeArtifact(runDir, ".hidden/sneak.txt", "s");
  await writeArtifact(runDir, "scratch.tmp", "t");

  await assert.rejects(() => freezeRun(runDir, { assignmentHash, eventLogHash }), /ERR_INVALID_METADATA/);
  await assert.rejects(() => freezeRun(runDir, { studyHash: "nothex", assignmentHash, eventLogHash }), /ERR_INVALID_METADATA/);
  await assert.rejects(
    () => freezeRun(runDir, { studyHash, assignmentHash, eventLogHash: "0".repeat(64) }),
    /ERR_EVENTLOG_HASH_MISMATCH/,
  );

  const manifest = await freezeRun(runDir, { studyHash, assignmentHash, eventLogHash });
  assert.deepEqual(manifest.files.map((file) => file.path), ["events.jsonl", "input/task-card.md"]);
  assert.equal(manifest.metadata.eventLogHash, eventLogHash);
  assert.ok(manifest.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));

  await assert.rejects(() => freezeRun(runDir, { studyHash, assignmentHash, eventLogHash }), /ERR_RUN_FROZEN/);
});

test("verifyRun reports missing manifests, tampered files, and unlisted artifacts after freeze", async (t) => {
  const emptyDir = await makeTempDir("uak-empty-");
  t.after(() => rm(emptyDir, { recursive: true, force: true }));
  const missing = await verifyRun(emptyDir);
  assert.equal(missing.ok, false);
  assert.equal(missing.errors[0].code, "ERR_MANIFEST_MISSING");

  const { runDir, eventsPath } = await seedRunDir();
  t.after(() => rm(runDir, { recursive: true, force: true }));
  await freezeRun(runDir, await researchMetadata(eventsPath));

  const artifactPath = path.join(runDir, "input", "task-card.md");
  await writeFile(artifactPath, "T1-tampered");
  const tampered = await verifyRun(runDir);
  assert.equal(tampered.ok, false);
  assert.ok(tampered.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));

  await writeFile(artifactPath, "T1");
  await writeFile(path.join(runDir, "unlisted.txt"), "extra");
  const unlisted = await verifyRun(runDir);
  assert.ok(unlisted.errors.some((error) => error.code === "ERR_UNLISTED_FILE" && error.path === "unlisted.txt"));

  await rm(path.join(runDir, "unlisted.txt"), { force: true });
  const eventLines = (await readFile(eventsPath, "utf8")).trim().split("\n");
  eventLines[1] = eventLines[1].replace("execution_completed", "execution_vanished");
  await writeFile(eventsPath, `${eventLines.join("\n")}\n`);
  const brokenChain = await verifyRun(runDir);
  assert.ok(brokenChain.errors.some((error) => error.code === "ERR_EVENT_CHAIN_BROKEN"));
  assert.ok(brokenChain.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));
});

test("replay folds gate decisions, skips informational events, and never writes", async (t) => {
  const runDir = await makeTempDir("uak-run-");
  t.after(() => rm(runDir, { recursive: true, force: true }));
  const eventsPath = path.join(runDir, "events.jsonl");

  const log = new EventLog({ filePath: eventsPath, runId: "r-c1", clock: FIXED_CLOCK });
  const script = [
    { actor: "runner", type: "session_started", payload: { condition: "C1", participantId: "p01", taskId: "T2" } },
    { actor: "agent", type: "intent_updated", payload: { text: "operations dashboard" } },
    { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } },
    { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "reject", reason: "intent unclear" } },
    { actor: "agent", type: "gate_request", payload: { gate: "GATE1" } },
    { actor: "user", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } },
    { actor: "agent", type: "material_selected", payload: { refs: ["doc-a"] } },
    { actor: "agent", type: "gate_request", payload: { gate: "GATE2" } },
    { actor: "user", type: "gate_decision", payload: { gate: "GATE2", decision: "approve" } },
    { actor: "runner", type: "execution_started", payload: {} },
    { actor: "agent", type: "artifact_saved", payload: { path: "out/app.png" } },
    { actor: "runner", type: "execution_completed", payload: {} },
    { actor: "agent", type: "gate_request", payload: { gate: "GATE3" } },
    { actor: "user", type: "gate_decision", payload: { gate: "GATE3", decision: "approve" } },
  ];
  for (const event of script) {
    await log.append(event);
  }
  const before = await readFile(eventsPath, "utf8");

  const replay = await replayRun(runDir);
  assert.equal(replay.finalState, "done");
  assert.equal(replay.eventCount, script.length);
  assert.deepEqual(replay.errors, []);
  assert.deepEqual(replay.gateDecisions.map(({ gate, decision }) => ({ gate, decision })), [
    { gate: "GATE1", decision: "reject" },
    { gate: "GATE1", decision: "approve" },
    { gate: "GATE2", decision: "approve" },
    { gate: "GATE3", decision: "approve" },
  ]);
  assert.equal(replay.gateDecisions[0].reason, "intent unclear");
  assert.equal(replay.gateDecisions[0].from, "GATE1_PENDING");
  assert.equal(replay.gateDecisions[0].to, "intent_drafting");
  assert.equal(replay.gateDecisions[3].seq, 13);
  assert.equal(await readFile(eventsPath, "utf8"), before);
});

test("replay reports missing logs and broken chains without throwing or writing", async (t) => {
  const emptyDir = await makeTempDir("uak-empty-");
  t.after(() => rm(emptyDir, { recursive: true, force: true }));
  const missing = await replayRun(emptyDir);
  assert.equal(missing.finalState, null);
  assert.equal(missing.eventCount, 0);
  assert.deepEqual(missing.gateDecisions, []);
  assert.equal(missing.errors[0].code, "ERR_EVENT_LOG_MISSING");

  const { runDir, eventsPath } = await seedRunDir();
  t.after(() => rm(runDir, { recursive: true, force: true }));
  const tampered = (await readFile(eventsPath, "utf8")).trim().split("\n");
  tampered[0] = tampered[0].replace("session_started", "session_hacked");
  const tamperedContent = `${tampered.join("\n")}\n`;
  await writeFile(eventsPath, tamperedContent);

  const broken = await replayRun(runDir);
  assert.equal(broken.finalState, null);
  assert.equal(broken.eventCount, 3);
  assert.equal(broken.errors[0].code, "ERR_EVENT_CHAIN_BROKEN");
  assert.equal(broken.errors[0].line, 1);
  assert.equal(await readFile(eventsPath, "utf8"), tamperedContent);
});

test("replay records machine violations instead of throwing and stops folding", async (t) => {
  const runDir = await makeTempDir("uak-run-");
  t.after(() => rm(runDir, { recursive: true, force: true }));
  const log = new EventLog({ filePath: path.join(runDir, "events.jsonl"), runId: "r-bad", clock: FIXED_CLOCK });
  await log.append({ actor: "runner", type: "session_started", payload: { condition: "C0", participantId: "p01", taskId: "T1" } });
  await log.append({ actor: "user", type: "session_started", payload: {} });
  await log.append({ actor: "runner", type: "session_ended", payload: {} });

  const replay = await replayRun(runDir);
  assert.equal(replay.eventCount, 3);
  assert.equal(replay.finalState, "executing");
  assert.equal(replay.errors.length, 1);
  assert.equal(replay.errors[0].code, "ERR_ACTOR_NOT_ALLOWED");
  assert.equal(replay.errors[0].seq, 1);

  const infolessDir = await makeTempDir("uak-run-");
  t.after(() => rm(infolessDir, { recursive: true, force: true }));
  const infolessLog = new EventLog({ filePath: path.join(infolessDir, "events.jsonl"), runId: "r-info", clock: FIXED_CLOCK });
  await infolessLog.append({ actor: "runner", type: "session_started", payload: {} });
  const infoless = await replayRun(infolessDir);
  assert.equal(infoless.finalState, null);
  assert.equal(infoless.errors[0].code, "ERR_REPLAY_SESSION_INFO");
  assert.equal(infoless.eventCount, 1);
});

// ---------------------------------------------------------------------------
// Task 4: dry-run, freeze hardening, and CLI
// ---------------------------------------------------------------------------

const CLI_PATH = path.join(ROOT, "scripts", "research-instrument.mjs");
const scenariosPath = path.join(ROOT, "research/runtime/fixtures/dry-run-scenarios.json");
const HEX64 = /^[a-f0-9]{64}$/;

async function readJson(target) {
  return JSON.parse(await readFile(target, "utf8"));
}

async function loadFixture() {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  return { fixture, studyHash: canonicalHash(fixture) };
}

test("dry-run produces distinct C0/C1 frozen runs that replay correctly", async (t) => {
  const outDir = await makeTempDir("uak-dry-");
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();

  const report = await runDryRun({ studyPackage: fixture, studyHash, outDir, clock: FIXED_CLOCK });
  assert.deepEqual(report.conditions.sort(), ["C0", "C1"]);
  assert.equal(report.runs.every((run) => run.finalState === "done"), true);
  const c0 = await readJson(path.join(outDir, "C0", "MANIFEST.sha256"));
  const c1 = await readJson(path.join(outDir, "C1", "MANIFEST.sha256"));
  assert.notEqual(c0.metadata.eventLogHash, c1.metadata.eventLogHash);
  assert.equal((await replayRun(path.join(outDir, "C0"))).gateDecisions.length, 0);
  assert.equal((await replayRun(path.join(outDir, "C1"))).gateDecisions.length, 3);
});

test("dry-run writes the full output set per condition with the required gate profile", async (t) => {
  const outDir = await makeTempDir("uak-dry-");
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();
  await runDryRun({ studyPackage: fixture, studyHash, outDir, clock: FIXED_CLOCK });

  for (const condition of ["C0", "C1"]) {
    const runDir = path.join(outDir, condition);
    for (const relative of [
      "input/task-card.md",
      "timing.json",
      "session.json",
      "events.jsonl",
      "evidence/summary.md",
      "MANIFEST.sha256",
    ]) {
      const content = await readFile(path.join(runDir, relative), "utf8");
      assert.ok(content.length > 0, `${condition}/${relative} must be non-empty`);
    }
    const session = await readJson(path.join(runDir, "session.json"));
    assert.equal(session.dryRun, true);
    assert.equal(session.condition, condition);
    assert.match(session.studyHash, HEX64);
    assert.match(session.assignmentHash, HEX64);
    const timing = await readJson(path.join(runDir, "timing.json"));
    assert.ok(Array.isArray(timing.marks) && timing.marks.length > 0);
    const summary = await readFile(path.join(runDir, "evidence", "summary.md"), "utf8");
    assert.match(summary, /DRY-RUN/);
    assert.match(summary, /not participant evidence/);
  }

  const c1Lines = (await readFile(path.join(outDir, "C1", "events.jsonl"), "utf8")).trim().split("\n");
  const gateDecisions = c1Lines.map((line) => JSON.parse(line)).filter((event) => event.type === "gate_decision");
  assert.deepEqual(
    gateDecisions.map(({ actor, payload }) => `${actor}:${payload.gate}:${payload.decision}`),
    ["user:GATE1:approve", "user:GATE2:approve", "user:GATE3:approve"],
  );

  const c0Lines = (await readFile(path.join(outDir, "C0", "events.jsonl"), "utf8")).trim().split("\n");
  assert.equal(c0Lines.some((line) => line.includes("gate_decision")), false);
});

test("dry-run is deterministic under a fixed clock and refuses non-empty output directories", async (t) => {
  const first = await makeTempDir("uak-dry-");
  const second = await makeTempDir("uak-dry-");
  t.after(() => rm(first, { recursive: true, force: true }));
  t.after(() => rm(second, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();

  const one = await runDryRun({ studyPackage: fixture, studyHash, outDir: first, clock: FIXED_CLOCK });
  const two = await runDryRun({ studyPackage: fixture, studyHash, outDir: second, clock: FIXED_CLOCK });
  assert.equal(one.assignmentHash, two.assignmentHash);
  for (const condition of ["C0", "C1"]) {
    assert.equal(
      await readFile(path.join(first, condition, "MANIFEST.sha256"), "utf8"),
      await readFile(path.join(second, condition, "MANIFEST.sha256"), "utf8"),
    );
  }

  await writeFile(path.join(first, "keep.txt"), "operator file");
  await assert.rejects(
    () => runDryRun({ studyPackage: fixture, studyHash, outDir: first, clock: FIXED_CLOCK }),
    /ERR_OUTPUT_DIR_NOT_EMPTY/,
  );
  assert.equal(await readFile(path.join(first, "keep.txt"), "utf8"), "operator file");
});

test("dry-run rejects study hash mismatches and undeclared scenario events", async (t) => {
  const outDir = await makeTempDir("uak-dry-");
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();

  await assert.rejects(
    () => runDryRun({ studyPackage: fixture, studyHash: "0".repeat(64), outDir, clock: FIXED_CLOCK }),
    /ERR_STUDY_HASH_MISMATCH/,
  );
  await assert.rejects(
    () => runDryRun({ studyPackage: { ...fixture, frozen: false }, studyHash, outDir, clock: FIXED_CLOCK }),
    /ERR_INVALID_STUDY_PACKAGE/,
  );

  const scenarios = JSON.parse(await readFile(scenariosPath, "utf8"));
  scenarios.runs[0].events.push({ actor: "runner", type: "undeclared_event_type", payload: {} });
  await assert.rejects(
    () => runDryRun({ studyPackage: fixture, studyHash, outDir, clock: FIXED_CLOCK, scenarios }),
    /ERR_UNDECLARED_EVENT_TYPE/,
  );
});

test("tampering with a frozen dry-run artifact fails verifyRun", async (t) => {
  const outDir = await makeTempDir("uak-dry-");
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();
  await runDryRun({ studyPackage: fixture, studyHash, outDir, clock: FIXED_CLOCK });

  const runDir = path.join(outDir, "C0");
  const cardPath = path.join(runDir, "input", "task-card.md");
  const originalCard = await readFile(cardPath, "utf8");
  await writeFile(cardPath, `${originalCard}\ntampered`);
  const tampered = await verifyRun(runDir);
  assert.equal(tampered.ok, false);
  assert.ok(tampered.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));

  await writeFile(cardPath, originalCard);
  const eventsPath = path.join(runDir, "events.jsonl");
  const lines = (await readFile(eventsPath, "utf8")).trim().split("\n");
  lines[1] = lines[1].replace("timer_started", "timer_vanished");
  await writeFile(eventsPath, `${lines.join("\n")}\n`);
  const broken = await verifyRun(runDir);
  assert.equal(broken.ok, false);
  assert.ok(broken.errors.some((error) => error.code === "ERR_EVENT_CHAIN_BROKEN"));
  assert.ok(broken.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));
});

test("event log append refuses frozen runs and leaves the log untouched", async (t) => {
  const runDir = await makeTempDir("uak-run-");
  t.after(() => rm(runDir, { recursive: true, force: true }));
  const eventsPath = path.join(runDir, "events.jsonl");
  const log = new EventLog({ filePath: eventsPath, runId: "r-frozen", clock: FIXED_CLOCK });
  await log.append({ actor: "runner", type: "session_started", payload: { condition: "C0", participantId: "p01", taskId: "T1" } });
  await log.append({ actor: "runner", type: "execution_completed", payload: {} });
  await log.append({ actor: "runner", type: "session_ended", payload: {} });
  const before = await readFile(eventsPath, "utf8");

  await freezeRun(runDir, {
    studyHash: "1".repeat(64),
    assignmentHash: "2".repeat(64),
    eventLogHash: sha256Hex(before),
  });

  await assert.rejects(
    () => log.append({ actor: "runner", type: "session_ended", payload: {} }),
    (error) => {
      assert.ok(error instanceof ResearchRuntimeError);
      assert.equal(error.code, "ERR_RUN_FROZEN");
      return true;
    },
  );
  assert.equal(await readFile(eventsPath, "utf8"), before);
});

test("CLI validate-package exits zero on the fixture and one on invalid input", async (t) => {
  const dir = await makeTempDir("uak-cli-");
  t.after(() => rm(dir, { recursive: true, force: true }));

  const good = spawnSync(process.execPath, [CLI_PATH, "validate-package", fixturePath], { encoding: "utf8" });
  assert.equal(good.status, 0, good.stderr);
  const goodJson = JSON.parse(good.stdout);
  assert.equal(goodJson.ok, true);
  assert.equal(goodJson.studyId, "uak-formative-v1");
  assert.match(goodJson.hash, HEX64);

  const badPackagePath = path.join(dir, "bad-package.json");
  await writeFile(badPackagePath, JSON.stringify({ ...minimalPackage, frozen: false }));
  const bad = spawnSync(process.execPath, [CLI_PATH, "validate-package", badPackagePath], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  const badJson = JSON.parse(bad.stdout);
  assert.equal(badJson.ok, false);
  assert.ok(badJson.errors.some((error) => error.code === "ERR_PACKAGE_NOT_FROZEN"));

  const missing = spawnSync(process.execPath, [CLI_PATH, "validate-package", path.join(dir, "nope.json")], { encoding: "utf8" });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /ERR_CLI_INPUT/);
});

test("CLI assign emits a balanced deterministic assignment and rejects unbalanced rosters", async (t) => {
  const dir = await makeTempDir("uak-cli-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const participantsPath = path.join(dir, "participants.json");
  const tasksPath = path.join(dir, "tasks.json");
  await writeFile(participantsPath, JSON.stringify(["p02", "p01"]));
  await writeFile(tasksPath, JSON.stringify({ taskIds: ["T1", "T2"] }));

  const args = [CLI_PATH, "assign", fixturePath, participantsPath, tasksPath, "--seed", "demo"];
  const first = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(first.status, 0, first.stderr);
  const firstJson = JSON.parse(first.stdout);
  assert.equal(firstJson.ok, true);
  assert.equal(firstJson.balanced, true);
  assert.equal(firstJson.assignment.rows.length, 4);
  assert.match(firstJson.assignment.assignmentHash, HEX64);

  const second = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(JSON.parse(second.stdout).assignment.assignmentHash, firstJson.assignment.assignmentHash);

  const oddPath = path.join(dir, "odd.json");
  await writeFile(oddPath, JSON.stringify(["p01"]));
  const odd = spawnSync(
    process.execPath,
    [CLI_PATH, "assign", fixturePath, oddPath, tasksPath, "--seed", "demo"],
    { encoding: "utf8" },
  );
  assert.equal(odd.status, 1);
  assert.match(odd.stderr, /ERR_UNBALANCED_ASSIGNMENT/);
});

test("CLI dry-run freezes both conditions, replays, verifies, and refuses non-empty output", async (t) => {
  const outDir = await makeTempDir("uak-cli-dry-");
  t.after(() => rm(outDir, { recursive: true, force: true }));

  const dry = spawnSync(process.execPath, [CLI_PATH, "dry-run", fixturePath, "--out", outDir], { encoding: "utf8" });
  assert.equal(dry.status, 0, dry.stderr);
  const report = JSON.parse(dry.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.dryRun, true);
  assert.deepEqual(report.conditions, ["C0", "C1"]);
  assert.equal(report.runs.every((run) => run.finalState === "done" && run.frozen && run.verifyOk), true);

  for (const condition of ["C0", "C1"]) {
    const verify = spawnSync(process.execPath, [CLI_PATH, "verify", path.join(outDir, condition)], { encoding: "utf8" });
    assert.equal(verify.status, 0, verify.stderr);
    assert.equal(JSON.parse(verify.stdout).ok, true);
  }

  const replay = spawnSync(process.execPath, [CLI_PATH, "replay", path.join(outDir, "C1")], { encoding: "utf8" });
  assert.equal(replay.status, 0, replay.stderr);
  const replayed = JSON.parse(replay.stdout);
  assert.equal(replayed.ok, true);
  assert.equal(replayed.finalState, "done");
  assert.equal(replayed.gateDecisions.length, 3);

  const again = spawnSync(process.execPath, [CLI_PATH, "dry-run", fixturePath, "--out", outDir], { encoding: "utf8" });
  assert.equal(again.status, 1);
  assert.match(again.stderr, /ERR_OUTPUT_DIR_NOT_EMPTY/);
});

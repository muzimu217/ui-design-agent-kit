import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
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
import { MANIFEST_FILENAME } from "../research/runtime/constants.mjs";
import { EventLog, verifyEventChain } from "../research/runtime/event-log.mjs";
import {
  MANIFEST_FILENAME as MANIFEST_FILENAME_FROM_EVIDENCE_STORE,
  freezeRun,
  verifyRun,
  writeArtifact,
} from "../research/runtime/evidence-store.mjs";
import { STATE_CHANGING_EVENT_TYPES, replayRun } from "../research/runtime/replay.mjs";
import { runDryRun } from "../research/runtime/dry-run.mjs";
import { startSession } from "../research/runtime/session-runner.mjs";
import { scanRuns } from "../research/runtime/researcher-console.mjs";
import {
  listAssignments,
  loadAssignment,
  saveAssignment,
} from "../research/runtime/assignment-store.mjs";

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
  const verified = await verifyRun(runDir);
  assert.equal(verified.ok, true);
  assert.equal(verified.legality.ok, true);
  assert.deepEqual(verified.legality.errors, []);

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
  // Legality is reported on every output shape, independently of integrity.
  assert.ok(missing.legality && typeof missing.legality === "object");
  assert.equal(missing.legality.ok, true);
  assert.deepEqual(missing.legality.errors, []);

  const { runDir, eventsPath } = await seedRunDir();
  t.after(() => rm(runDir, { recursive: true, force: true }));
  await freezeRun(runDir, await researchMetadata(eventsPath));

  const artifactPath = path.join(runDir, "input", "task-card.md");
  await writeFile(artifactPath, "T1-tampered");
  const tampered = await verifyRun(runDir);
  assert.equal(tampered.ok, false);
  assert.ok(tampered.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));
  // A tampered artifact taints integrity but the (intact) event chain stays
  // legal — the two verdicts are independent axes.
  assert.equal(tampered.legality.ok, true);

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
  // An unverifiable chain cannot establish legality either — fail closed.
  assert.equal(brokenChain.legality.ok, false);
  assert.ok(brokenChain.legality.errors.length > 0);
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
  // The untouched event chain remains legal even while integrity fails.
  assert.equal(tampered.legality.ok, true);

  await writeFile(cardPath, originalCard);
  const eventsPath = path.join(runDir, "events.jsonl");
  const lines = (await readFile(eventsPath, "utf8")).trim().split("\n");
  lines[1] = lines[1].replace("timer_started", "timer_vanished");
  await writeFile(eventsPath, `${lines.join("\n")}\n`);
  const broken = await verifyRun(runDir);
  assert.equal(broken.ok, false);
  assert.ok(broken.errors.some((error) => error.code === "ERR_EVENT_CHAIN_BROKEN"));
  assert.ok(broken.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));
  assert.equal(broken.legality.ok, false);
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

// ---------------------------------------------------------------------------
// Batch 2 · Task 1: shared constants, ENOENT-only freeze tolerance, assignment store
// ---------------------------------------------------------------------------

test("constants pins the manifest filename shared by event log and evidence store", () => {
  assert.equal(typeof MANIFEST_FILENAME, "string");
  assert.equal(MANIFEST_FILENAME, "MANIFEST.sha256");
  assert.equal(MANIFEST_FILENAME_FROM_EVIDENCE_STORE, MANIFEST_FILENAME);
});

test("replay exports the state-changing event vocabulary dry-run folds against", () => {
  assert.ok(STATE_CHANGING_EVENT_TYPES instanceof Set);
  assert.deepEqual([...STATE_CHANGING_EVENT_TYPES].sort(), [
    "execution_completed",
    "execution_started",
    "gate_decision",
    "gate_request",
    "session_ended",
    "session_started",
  ]);
});

async function makeStoreAssignment(seed) {
  const { fixture, studyHash } = await loadFixture();
  return createAssignment({
    study: fixture,
    studyHash,
    participantIds: ["p01", "p02"],
    taskIds: ["T1", "T2"],
    seed,
  });
}

test("assignment store saves canonical JSON and reloads the identical assignment", async (t) => {
  const storeDir = await makeTempDir("uak-store-");
  t.after(() => rm(storeDir, { recursive: true, force: true }));
  const assignment = await makeStoreAssignment("demo");

  const saved = await saveAssignment(storeDir, assignment);
  assert.equal(saved.assignmentId, assignment.assignmentId);
  assert.equal(saved.path, path.join(storeDir, `${assignment.assignmentId}.json`));

  const raw = await readFile(saved.path, "utf8");
  assert.equal(raw, `${stableStringify(assignment)}\n`);

  const loaded = await loadAssignment(storeDir, assignment.assignmentId);
  assert.deepEqual(loaded, JSON.parse(stableStringify(assignment)));
  assert.equal(loaded.assignmentHash, assignment.assignmentHash);
  assert.equal(assignmentHash(loaded), assignment.assignmentHash);
});

test("assignment store refuses duplicate writes even when the content is byte-identical", async (t) => {
  const storeDir = await makeTempDir("uak-store-");
  t.after(() => rm(storeDir, { recursive: true, force: true }));
  const assignment = await makeStoreAssignment("demo");

  await saveAssignment(storeDir, assignment);
  const before = await readFile(path.join(storeDir, `${assignment.assignmentId}.json`), "utf8");

  await assert.rejects(
    () => saveAssignment(storeDir, assignment),
    (error) => {
      assert.ok(error instanceof ResearchRuntimeError);
      assert.equal(error.code, "ERR_ASSIGNMENT_EXISTS");
      assert.equal(error.details.assignmentId, assignment.assignmentId);
      return true;
    },
  );
  assert.equal(await readFile(path.join(storeDir, `${assignment.assignmentId}.json`), "utf8"), before);
  assert.equal((await listAssignments(storeDir)).length, 1);
});

test("assignment store reports missing and corrupt assignments on load", async (t) => {
  const storeDir = await makeTempDir("uak-store-");
  t.after(() => rm(storeDir, { recursive: true, force: true }));
  const assignment = await makeStoreAssignment("demo");
  await saveAssignment(storeDir, assignment);
  const filePath = path.join(storeDir, `${assignment.assignmentId}.json`);

  await assert.rejects(
    () => loadAssignment(storeDir, "f".repeat(64)),
    (error) => {
      assert.ok(error instanceof ResearchRuntimeError);
      assert.equal(error.code, "ERR_ASSIGNMENT_MISSING");
      return true;
    },
  );

  const tampered = JSON.parse(await readFile(filePath, "utf8"));
  tampered.seed = "flipped";
  await writeFile(filePath, `${stableStringify(tampered)}\n`);
  await assert.rejects(() => loadAssignment(storeDir, assignment.assignmentId), /ERR_ASSIGNMENT_CORRUPT/);

  await writeFile(filePath, "not-json\n");
  await assert.rejects(() => loadAssignment(storeDir, assignment.assignmentId), /ERR_ASSIGNMENT_CORRUPT/);

  const other = await makeStoreAssignment("other");
  const swappedDir = await makeTempDir("uak-store-");
  t.after(() => rm(swappedDir, { recursive: true, force: true }));
  const otherRaw = (await saveAssignment(swappedDir, other)).path;
  // A file stored under assignment's slot whose content claims a different id
  // is corruption for that slot, not a missing assignment.
  await writeFile(
    path.join(swappedDir, `${assignment.assignmentId}.json`),
    await readFile(otherRaw, "utf8"),
  );
  await assert.rejects(() => loadAssignment(swappedDir, assignment.assignmentId), /ERR_ASSIGNMENT_CORRUPT/);
});

test("assignment store rejects invalid assignments and identifiers before touching the store", async (t) => {
  const storeDir = await makeTempDir("uak-store-");
  t.after(() => rm(storeDir, { recursive: true, force: true }));
  const assignment = await makeStoreAssignment("demo");

  await assert.rejects(() => saveAssignment(storeDir, { assignmentId: "../escape", rows: [] }), /ERR_INVALID_ASSIGNMENT/);
  await assert.rejects(
    () => saveAssignment(storeDir, { ...assignment, assignmentHash: "0".repeat(64) }),
    /ERR_INVALID_ASSIGNMENT/,
  );
  await assert.rejects(() => saveAssignment(storeDir, { ...assignment, rows: [] }), /ERR_INVALID_ASSIGNMENT/);
  await assert.rejects(() => loadAssignment(storeDir, "../../etc/passwd"), /ERR_INVALID_ASSIGNMENT/);
  assert.equal(await listAssignments(storeDir).then((entries) => entries.length), 0);
});

test("listAssignments summarizes the store sorted by assignmentId and tolerates a missing directory", async (t) => {
  const storeDir = await makeTempDir("uak-store-");
  t.after(() => rm(storeDir, { recursive: true, force: true }));
  const alpha = await makeStoreAssignment("alpha");
  const beta = await makeStoreAssignment("beta");
  await saveAssignment(storeDir, beta);
  await saveAssignment(storeDir, alpha);
  await writeFile(path.join(storeDir, "notes.txt"), "operator notes");

  const expected = [alpha, beta]
    .sort((a, b) => (a.assignmentId < b.assignmentId ? -1 : 1))
    .map((entry) => ({
      assignmentId: entry.assignmentId,
      studyId: entry.studyId,
      seed: entry.seed,
      rowCount: entry.rows.length,
    }));
  const listed = await listAssignments(storeDir);
  assert.deepEqual(listed, expected);
  assert.deepEqual(listed.map((entry) => entry.assignmentId), [...listed.map((entry) => entry.assignmentId)].sort());

  const absentDir = await makeTempDir("uak-store-absent-");
  t.after(() => rm(absentDir, { recursive: true, force: true }));
  await rm(absentDir, { recursive: true, force: true });
  assert.deepEqual(await listAssignments(absentDir), []);

  const corruptDir = await makeTempDir("uak-store-");
  t.after(() => rm(corruptDir, { recursive: true, force: true }));
  await writeFile(path.join(corruptDir, `${"a".repeat(64)}.json`), "not-json\n");
  await assert.rejects(() => listAssignments(corruptDir), /ERR_ASSIGNMENT_CORRUPT/);
});

// ---------------------------------------------------------------------------
// Batch 2 · Task 2: session runner + CLI session command
// ---------------------------------------------------------------------------

async function sessionSetup(t) {
  const runDir = await makeTempDir("uak-session-");
  t.after(() => rm(runDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();
  // Rows: p01-T1 → C0, p01-T2 → C1, p02-T1 → C1, p02-T2 → C0.
  const assignment = createAssignment({
    study: fixture,
    studyHash,
    participantIds: ["p01", "p02"],
    taskIds: ["T1", "T2"],
    seed: "session-demo",
  });
  return { runDir, fixture, studyHash, assignment };
}

function decisionQueue(entries) {
  const calls = [];
  const pending = [...entries];
  return {
    calls,
    callback: async (question) => {
      calls.push(question);
      if (pending.length === 0) throw new Error("decision queue exhausted");
      return pending.shift();
    },
  };
}

async function readEventTypes(runDir) {
  const lines = (await readFile(path.join(runDir, "events.jsonl"), "utf8")).trim().split("\n");
  return lines.map((line) => JSON.parse(line));
}

test("session runner drives a C1 session from intent to a frozen, self-checked done", async (t) => {
  const { runDir, fixture, studyHash, assignment } = await sessionSetup(t);
  const gate = decisionQueue([
    { decision: "approve" },
    { decision: "approve" },
    { decision: "approve" },
  ]);

  const result = await startSession({
    studyPackage: fixture,
    studyHash,
    assignment,
    participantId: "p01",
    taskId: "T2",
    condition: "C1",
    runDir,
    clock: FIXED_CLOCK,
    decisions: gate.callback,
  });

  assert.equal(result.runId, "p01-T2-C1");
  assert.equal(result.finalState, "done");
  assert.equal(result.frozen, true);
  assert.equal(result.verifyOk, true);
  assert.equal(result.replayOk, true);
  assert.equal(result.assignmentId, assignment.assignmentId);
  assert.deepEqual(gate.calls.map(({ gate }) => gate), ["GATE1", "GATE2", "GATE3"]);
  assert.ok(gate.calls.every(({ phase }) => typeof phase === "string" && phase.length > 0));

  const replay = await replayRun(runDir);
  assert.deepEqual(replay.errors, []);
  assert.equal(replay.finalState, "done");
  assert.equal(replay.eventCount, result.eventCount);
  assert.deepEqual(
    replay.gateDecisions.map(({ gate, decision }) => `${gate}:${decision}`),
    ["GATE1:approve", "GATE2:approve", "GATE3:approve"],
  );
  const verified = await verifyRun(runDir);
  assert.equal(verified.ok, true);
  assert.equal(verified.legality.ok, true);
  assert.ok(existsSync(path.join(runDir, "MANIFEST.sha256")));

  const events = await readEventTypes(runDir);
  assert.deepEqual(
    events.map(({ actor, type }) => `${actor}:${type}`),
    [
      "runner:session_started",
      "agent:intent_updated",
      "agent:gate_request",
      "user:gate_decision",
      "agent:material_listed",
      "agent:gate_request",
      "user:gate_decision",
      "agent:plan_locked",
      "runner:execution_started",
      "runner:execution_completed",
      "agent:evidence_collected",
      "agent:gate_request",
      "user:gate_decision",
    ],
  );
  assert.deepEqual(events[0].payload, { condition: "C1", participantId: "p01", taskId: "T2" });
  assert.equal(events[1].payload.path, "intent/card.md");
  assert.deepEqual(
    events.filter(({ type }) => type === "gate_decision").map(({ payload }) => payload.gate),
    ["GATE1", "GATE2", "GATE3"],
  );
});

test("session runner writes the C1 artifact set derived from package and task only", async (t) => {
  const { runDir, fixture, studyHash, assignment } = await sessionSetup(t);
  const gate = decisionQueue([
    { decision: "approve" },
    { decision: "approve" },
    { decision: "approve" },
  ]);
  await startSession({
    studyPackage: fixture,
    studyHash,
    assignment,
    participantId: "p01",
    taskId: "T2",
    condition: "C1",
    runDir,
    clock: FIXED_CLOCK,
    decisions: gate.callback,
  });

  const card = await readFile(path.join(runDir, "input", "task-card.md"), "utf8");
  assert.match(card, /T2/);
  assert.match(card, /\bM\b/);
  assert.match(card, /任务正文待 P2-1 冻结/);
  assert.match(card, /Build a dense standards ledger/);

  for (const relative of ["intent/card.md", "material/candidates.md", "plan/locked.md", "evidence/summary.md"]) {
    const content = await readFile(path.join(runDir, relative), "utf8");
    assert.ok(content.trim().length > 0, `${relative} must be non-empty`);
  }
  const summary = await readFile(path.join(runDir, "evidence", "summary.md"), "utf8");
  assert.match(summary, /p01-T2-C1/);
  assert.match(summary, /GATE1/);
  assert.match(summary, /approve/);
});

test("session runner re-enters intent drafting after a GATE1 reject and finishes on re-approval", async (t) => {
  const { runDir, fixture, studyHash, assignment } = await sessionSetup(t);
  const gate = decisionQueue([
    { decision: "reject", reason: "intent unclear" },
    { decision: "approve" },
    { decision: "approve" },
    { decision: "approve" },
  ]);

  const result = await startSession({
    studyPackage: fixture,
    studyHash,
    assignment,
    participantId: "p01",
    taskId: "T2",
    condition: "C1",
    runDir,
    clock: FIXED_CLOCK,
    decisions: gate.callback,
  });

  assert.equal(result.finalState, "done");
  assert.deepEqual(gate.calls.map(({ gate }) => gate), ["GATE1", "GATE1", "GATE2", "GATE3"]);

  const replay = await replayRun(runDir);
  assert.deepEqual(replay.errors, []);
  assert.equal(replay.gateDecisions.length, 4);
  assert.equal(replay.gateDecisions[0].decision, "reject");
  assert.equal(replay.gateDecisions[0].reason, "intent unclear");
  assert.equal(replay.gateDecisions[0].from, "GATE1_PENDING");
  assert.equal(replay.gateDecisions[0].to, "intent_drafting");
  assert.equal(replay.gateDecisions[1].decision, "approve");
  assert.equal(replay.gateDecisions[1].to, "material_search");
  assert.equal(replay.gateDecisions[3].to, "done");

  const events = await readEventTypes(runDir);
  assert.equal(events.filter(({ type }) => type === "intent_updated").length, 2);
  const reverified = await verifyRun(runDir);
  assert.equal(reverified.ok, true);
  assert.equal(reverified.legality.ok, true);
});

test("session runner refuses reasonless and unknown gate decisions before they are logged", async (t) => {
  const { runDir, fixture, studyHash, assignment } = await sessionSetup(t);

  const reasonless = decisionQueue([{ decision: "reject" }]);
  await assert.rejects(
    () => startSession({
      studyPackage: fixture,
      studyHash,
      assignment,
      participantId: "p01",
      taskId: "T2",
      condition: "C1",
      runDir,
      clock: FIXED_CLOCK,
      decisions: reasonless.callback,
    }),
    (error) => {
      assert.ok(error instanceof ResearchRuntimeError);
      assert.equal(error.code, "ERR_MISSING_REASON");
      return true;
    },
  );
  assert.deepEqual(reasonless.calls, [{ gate: "GATE1", phase: "intent_drafting" }]);
  const events = await readEventTypes(runDir);
  assert.equal(events[events.length - 1].type, "gate_request");
  assert.equal(events.some(({ type }) => type === "gate_decision"), false);

  const secondDir = await makeTempDir("uak-session-");
  t.after(() => rm(secondDir, { recursive: true, force: true }));
  const invalid = decisionQueue([{ decision: "maybe" }]);
  await assert.rejects(
    () => startSession({
      studyPackage: fixture,
      studyHash,
      assignment,
      participantId: "p01",
      taskId: "T2",
      condition: "C1",
      runDir: secondDir,
      clock: FIXED_CLOCK,
      decisions: invalid.callback,
    }),
    /ERR_INVALID_DECISION/,
  );
});

test("session runner drives C0 gate-free and refuses scripted decisions", async (t) => {
  const { runDir, fixture, studyHash, assignment } = await sessionSetup(t);

  const result = await startSession({
    studyPackage: fixture,
    studyHash,
    assignment,
    participantId: "p01",
    taskId: "T1",
    condition: "C0",
    runDir,
    clock: FIXED_CLOCK,
  });

  assert.equal(result.runId, "p01-T1-C0");
  assert.equal(result.finalState, "done");
  assert.equal(result.frozen, true);
  assert.equal(result.verifyOk, true);
  assert.equal(result.replayOk, true);

  const events = await readEventTypes(runDir);
  assert.deepEqual(events.map(({ actor, type }) => `${actor}:${type}`), [
    "runner:session_started",
    "runner:execution_completed",
    "runner:evidence_collected",
    "runner:session_ended",
  ]);
  const replay = await replayRun(runDir);
  assert.equal(replay.finalState, "done");
  assert.equal(replay.gateDecisions.length, 0);
  const c0Verified = await verifyRun(runDir);
  assert.equal(c0Verified.ok, true);
  assert.equal(c0Verified.legality.ok, true);

  const card = await readFile(path.join(runDir, "input", "task-card.md"), "utf8");
  assert.match(card, /任务正文待 P2-1 冻结/);
  assert.ok(existsSync(path.join(runDir, "evidence", "summary.md")));
  assert.equal(existsSync(path.join(runDir, "intent")), false);

  const refusedDir = path.join(runDir, "c0-refused");
  await assert.rejects(
    () => startSession({
      studyPackage: fixture,
      studyHash,
      assignment,
      participantId: "p01",
      taskId: "T1",
      condition: "C0",
      runDir: refusedDir,
      clock: FIXED_CLOCK,
      decisions: async () => ({ decision: "approve" }),
    }),
    (error) => {
      assert.ok(error instanceof ResearchRuntimeError);
      assert.equal(error.code, "ERR_C0_DECISIONS_PROVIDED");
      return true;
    },
  );
  assert.equal(existsSync(refusedDir), false);
});

test("session runner validates assignment, study hash, and output dir before writing", async (t) => {
  const { runDir, fixture, studyHash, assignment } = await sessionSetup(t);
  const base = {
    studyPackage: fixture,
    studyHash,
    assignment,
    taskId: "T2",
    condition: "C1",
    runDir,
    clock: FIXED_CLOCK,
    decisions: decisionQueue([{ decision: "approve" }]).callback,
  };

  await assert.rejects(() => startSession({ ...base, participantId: "nobody" }), (error) => {
    assert.ok(error instanceof ResearchRuntimeError);
    assert.equal(error.code, "ERR_SESSION_UNASSIGNED");
    return true;
  });
  // p01-T1 is the C0 row; asking for C1 there is unassigned, not a run.
  await assert.rejects(() => startSession({ ...base, participantId: "p01", taskId: "T1" }), /ERR_SESSION_UNASSIGNED/);
  await assert.rejects(() => startSession({ ...base, participantId: "p01", studyHash: "0".repeat(64) }), /ERR_STUDY_HASH_MISMATCH/);
  await assert.rejects(() => startSession({ ...base, participantId: "p01", clock: "now" }), /ERR_INVALID_ARGUMENT/);
  await assert.rejects(() => startSession({ ...base, participantId: "p01", decisions: "approve" }), /ERR_INVALID_ARGUMENT/);

  const foreign = JSON.parse(stableStringify(assignment));
  foreign.studyHash = "1".repeat(64);
  foreign.assignmentHash = assignmentHash(foreign);
  await assert.rejects(() => startSession({ ...base, participantId: "p01", assignment: foreign }), /ERR_STUDY_HASH_MISMATCH/);

  const untouched = path.join(runDir, "untouched");
  await assert.rejects(
    () => startSession({ ...base, participantId: "nobody", runDir: untouched }),
    /ERR_SESSION_UNASSIGNED/,
  );
  assert.equal(existsSync(untouched), false);

  await writeFile(path.join(runDir, "keep.txt"), "operator file");
  await assert.rejects(
    () => startSession({
      ...base,
      participantId: "p01",
      decisions: decisionQueue([
        { decision: "approve" },
        { decision: "approve" },
        { decision: "approve" },
      ]).callback,
    }),
    /ERR_OUTPUT_DIR_NOT_EMPTY/,
  );
  assert.equal(await readFile(path.join(runDir, "keep.txt"), "utf8"), "operator file");
});

test("CLI assign --save persists to the store and refuses duplicate saves", async (t) => {
  const dir = await makeTempDir("uak-cli-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const storeDir = path.join(dir, "store");
  const participantsPath = path.join(dir, "participants.json");
  const tasksPath = path.join(dir, "tasks.json");
  await writeFile(participantsPath, JSON.stringify(["p02", "p01"]));
  await writeFile(tasksPath, JSON.stringify(["T1", "T2"]));

  const args = [CLI_PATH, "assign", fixturePath, participantsPath, tasksPath, "--seed", "session-cli", "--save", storeDir];
  const first = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(first.status, 0, first.stderr);
  const firstJson = JSON.parse(first.stdout);
  assert.equal(firstJson.ok, true);
  assert.match(firstJson.saved.path, new RegExp(`${firstJson.saved.assignmentId}\\.json$`));

  const loaded = await loadAssignment(storeDir, firstJson.saved.assignmentId);
  assert.equal(loaded.seed, "session-cli");
  assert.equal(loaded.rows.length, 4);

  const duplicate = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /ERR_ASSIGNMENT_EXISTS/);
});

test("CLI session runs a scripted C1 session that freezes, replays, and verifies", async (t) => {
  const dir = await makeTempDir("uak-cli-session-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const storeDir = path.join(dir, "store");
  const participantsPath = path.join(dir, "participants.json");
  const tasksPath = path.join(dir, "tasks.json");
  await writeFile(participantsPath, JSON.stringify(["p01", "p02"]));
  await writeFile(tasksPath, JSON.stringify(["T1", "T2"]));

  const assign = spawnSync(
    process.execPath,
    [CLI_PATH, "assign", fixturePath, participantsPath, tasksPath, "--seed", "session-cli", "--save", storeDir],
    { encoding: "utf8" },
  );
  assert.equal(assign.status, 0, assign.stderr);
  const { assignmentId } = JSON.parse(assign.stdout).saved;

  const outDir = path.join(dir, "run-p01-T2");
  const session = spawnSync(
    process.execPath,
    [
      CLI_PATH, "session", fixturePath,
      "--assignment", assignmentId,
      "--store", storeDir,
      "--participant", "p01",
      "--task", "T2",
      "--out", outDir,
      "--decisions", "approve,approve,approve",
    ],
    { encoding: "utf8" },
  );
  assert.equal(session.status, 0, session.stderr);
  const report = JSON.parse(session.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.command, "session");
  assert.equal(report.runId, "p01-T2-C1");
  assert.equal(report.finalState, "done");
  assert.equal(report.frozen, true);
  assert.equal(report.verifyOk, true);
  assert.equal(report.replayOk, true);
  assert.equal(report.gateDecisions.length, 3);

  const verify = spawnSync(process.execPath, [CLI_PATH, "verify", outDir], { encoding: "utf8" });
  assert.equal(verify.status, 0, verify.stderr);
  assert.equal(JSON.parse(verify.stdout).ok, true);

  const replay = spawnSync(process.execPath, [CLI_PATH, "replay", outDir], { encoding: "utf8" });
  assert.equal(replay.status, 0, replay.stderr);
  assert.equal(JSON.parse(replay.stdout).gateDecisions.length, 3);
});

test("CLI session reports scripted decision count mismatches", async (t) => {
  const dir = await makeTempDir("uak-cli-mismatch-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const storeDir = path.join(dir, "store");
  const participantsPath = path.join(dir, "participants.json");
  const tasksPath = path.join(dir, "tasks.json");
  await writeFile(participantsPath, JSON.stringify(["p01", "p02"]));
  await writeFile(tasksPath, JSON.stringify(["T1", "T2"]));
  const assign = spawnSync(
    process.execPath,
    [CLI_PATH, "assign", fixturePath, participantsPath, tasksPath, "--seed", "session-cli", "--save", storeDir],
    { encoding: "utf8" },
  );
  const { assignmentId } = JSON.parse(assign.stdout).saved;

  const sessionArgs = (outDir, decisions) =>
    spawnSync(
      process.execPath,
      [
        CLI_PATH, "session", fixturePath,
        "--assignment", assignmentId,
        "--store", storeDir,
        "--participant", "p01",
        "--task", "T2",
        "--out", outDir,
        ...(decisions === null ? [] : ["--decisions", decisions]),
      ],
      { encoding: "utf8" },
    );

  const tooFew = sessionArgs(path.join(dir, "run-too-few"), "approve,approve");
  assert.equal(tooFew.status, 1);
  assert.match(tooFew.stderr, /ERR_DECISIONS_MISMATCH/);

  const tooMany = sessionArgs(path.join(dir, "run-too-many"), "approve,approve,approve,approve");
  assert.equal(tooMany.status, 1);
  assert.match(tooMany.stderr, /ERR_DECISIONS_MISMATCH/);
  // The session itself completed and froze before the mismatch surfaced; the
  // evidence is kept for inspection, not deleted.
  assert.ok(existsSync(path.join(dir, "run-too-many", "MANIFEST.sha256")));
});

test("CLI session enforces assignment, the C0 decision ban, and non-interactive input", async (t) => {
  const dir = await makeTempDir("uak-cli-guard-");
  t.after(() => rm(dir, { recursive: true, force: true }));
  const storeDir = path.join(dir, "store");
  const participantsPath = path.join(dir, "participants.json");
  const tasksPath = path.join(dir, "tasks.json");
  await writeFile(participantsPath, JSON.stringify(["p01", "p02"]));
  await writeFile(tasksPath, JSON.stringify(["T1", "T2"]));
  const assign = spawnSync(
    process.execPath,
    [CLI_PATH, "assign", fixturePath, participantsPath, tasksPath, "--seed", "session-cli", "--save", storeDir],
    { encoding: "utf8" },
  );
  const { assignmentId } = JSON.parse(assign.stdout).saved;

  const sessionArgs = (extra) =>
    spawnSync(
      process.execPath,
      [CLI_PATH, "session", fixturePath, "--assignment", assignmentId, "--store", storeDir, ...extra],
      { encoding: "utf8" },
    );

  const unassigned = sessionArgs(["--participant", "nobody", "--task", "T2", "--out", path.join(dir, "r1"), "--decisions", "approve,approve,approve"]);
  assert.equal(unassigned.status, 1);
  assert.match(unassigned.stderr, /ERR_SESSION_UNASSIGNED/);

  const c0Decisions = sessionArgs(["--participant", "p01", "--task", "T1", "--out", path.join(dir, "r2"), "--decisions", "approve"]);
  assert.equal(c0Decisions.status, 1);
  assert.match(c0Decisions.stderr, /ERR_C0_DECISIONS_PROVIDED/);

  const c0 = sessionArgs(["--participant", "p01", "--task", "T1", "--out", path.join(dir, "r3")]);
  assert.equal(c0.status, 0, c0.stderr);
  const c0Json = JSON.parse(c0.stdout);
  assert.equal(c0Json.runId, "p01-T1-C0");
  assert.equal(c0Json.gateDecisions.length, 0);
  assert.equal(c0Json.finalState, "done");

  const noDecisions = sessionArgs(["--participant", "p01", "--task", "T2", "--out", path.join(dir, "r4")]);
  assert.equal(noDecisions.status, 1);
  assert.match(noDecisions.stderr, /ERR_CLI_USAGE/);

  const busyDir = path.join(dir, "r5");
  await mkdir(busyDir, { recursive: true });
  await writeFile(path.join(busyDir, "keep.txt"), "operator file");
  const busy = sessionArgs(["--participant", "p01", "--task", "T2", "--out", busyDir, "--decisions", "approve,approve,approve"]);
  assert.equal(busy.status, 1);
  assert.match(busy.stderr, /ERR_OUTPUT_DIR_NOT_EMPTY/);
  assert.equal(await readFile(path.join(busyDir, "keep.txt"), "utf8"), "operator file");
});

// ---------------------------------------------------------------------------
// Batch 2 · Task 3: verifyRun legality, researcher console, CLI console
// ---------------------------------------------------------------------------

test("verifyRun separates integrity from legality on a forged valid-chain gate decision", async (t) => {
  const runDir = await makeTempDir("uak-forge-");
  t.after(() => rm(runDir, { recursive: true, force: true }));
  const eventsPath = path.join(runDir, "events.jsonl");

  // The event log only enforces structure, so an agent-emitted gate_decision
  // is appendable and chains perfectly — exactly what a forger would produce.
  const log = new EventLog({ filePath: eventsPath, runId: "p01-T2-C1", clock: FIXED_CLOCK });
  await log.append({ actor: "runner", type: "session_started", payload: { condition: "C1", participantId: "p01", taskId: "T2" } });
  await log.append({ actor: "agent", type: "intent_updated", payload: { path: "intent/card.md" } });
  await log.append({ actor: "agent", type: "gate_request", payload: { gate: "GATE1" } });
  await log.append({ actor: "agent", type: "gate_decision", payload: { gate: "GATE1", decision: "approve" } });
  await writeArtifact(runDir, "input/task-card.md", "T2");

  // Freeze accepts the intact chain: tamper-evident is not forgery-proof.
  await freezeRun(runDir, await researchMetadata(eventsPath));

  const result = await verifyRun(runDir);
  assert.equal(result.ok, true, "integrity must stay green on an unmodified forged run");
  assert.deepEqual(result.errors, []);
  assert.equal(result.legality.ok, false);
  assert.equal(result.legality.errors.length, 1);
  const [legalityError] = result.legality.errors;
  assert.equal(legalityError.seq, 3);
  assert.equal(legalityError.code, "ERR_ACTOR_NOT_ALLOWED");
  assert.match(legalityError.message, /gate_decision/);

  // Replay (the runtime's own fold) reaches the same verdict at the same seq.
  const replay = await replayRun(runDir);
  assert.equal(replay.errors[0].code, "ERR_ACTOR_NOT_ALLOWED");
  assert.equal(replay.errors[0].seq, 3);
});

test("scanRuns inventories dry-run runs read-only, skips symlinks, and sorts deterministically", async (t) => {
  const outDir = await makeTempDir("uak-console-");
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();
  await runDryRun({ studyPackage: fixture, studyHash, outDir, clock: FIXED_CLOCK });

  // Clean C0/C1 runs are legal as well as intact.
  for (const condition of ["C0", "C1"]) {
    const verified = await verifyRun(path.join(outDir, condition));
    assert.equal(verified.ok, true, `${condition} integrity`);
    assert.equal(verified.legality.ok, true, `${condition} legality`);
  }

  // A symlinked run directory must never enter the scan (nor be followed).
  await symlink(path.join(outDir, "C1"), path.join(outDir, "linked-run"), "dir");
  // Non-run directories and loose files are invisible to the scanner.
  await writeFile(path.join(outDir, "operator-notes.txt"), "loose file");
  await mkdir(path.join(outDir, "not-a-run"), { recursive: true });

  // Deterministic byte-level snapshot of the whole tree, used to prove the
  // scan is strictly read-only.
  const hashTree = async (root, prefix = "") => {
    const entries = (await readdir(root, { withFileTypes: true })).filter((entry) => !entry.isSymbolicLink());
    const digests = [];
    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        digests.push(...(await hashTree(path.join(root, entry.name), relative)));
      } else if (entry.isFile()) {
        digests.push(`${relative} ${sha256Hex(await readFile(path.join(root, entry.name)))}`);
      }
    }
    return digests;
  };
  const before = await hashTree(outDir);

  const scan = await scanRuns(outDir);
  assert.ok(scan && Array.isArray(scan.runs));
  assert.deepEqual(scan.runs.map((run) => path.basename(run.runDir)), ["C0", "C1"]);

  const [c0, c1] = scan.runs;
  assert.equal(c0.condition, "C0");
  assert.equal(c0.finalState, "done");
  assert.equal(c0.eventCount > 0, true);
  assert.equal(c0.gateDecisionCount, 0);
  assert.equal(c0.integrityOk, true);
  assert.equal(c0.legalityOk, true);
  assert.equal(c0.replayOk, true);
  assert.deepEqual(c0.errors, []);

  assert.equal(c1.condition, "C1");
  assert.equal(c1.finalState, "done");
  assert.equal(c1.gateDecisionCount, 3);
  assert.equal(c1.integrityOk, true);
  assert.equal(c1.legalityOk, true);
  assert.equal(c1.replayOk, true);
  assert.deepEqual(c1.errors, []);
  assert.equal(c1.eventCount, (await replayRun(path.join(outDir, "C1"))).eventCount);

  const after = await hashTree(outDir);
  assert.deepEqual(after, before);

  const absent = await makeTempDir("uak-console-absent-");
  t.after(() => rm(absent, { recursive: true, force: true }));
  await rm(absent, { recursive: true, force: true });
  assert.deepEqual(await scanRuns(absent).then((report) => report.runs), []);
});

test("CLI console prints one JSON summary and exits 1 when a run fails a check", async (t) => {
  const outDir = await makeTempDir("uak-cli-console-");
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { fixture, studyHash } = await loadFixture();
  await runDryRun({ studyPackage: fixture, studyHash, outDir, clock: FIXED_CLOCK });

  const clean = spawnSync(process.execPath, [CLI_PATH, "console", outDir], { encoding: "utf8" });
  assert.equal(clean.status, 0, clean.stderr);
  const cleanJson = JSON.parse(clean.stdout);
  assert.equal(cleanJson.ok, true);
  assert.equal(cleanJson.command, "console");
  assert.equal(cleanJson.runs.length, 2);
  assert.ok(cleanJson.runs.every((run) => run.integrityOk && run.legalityOk && run.replayOk));

  const cardPath = path.join(outDir, "C0", "input", "task-card.md");
  await writeFile(cardPath, `${await readFile(cardPath, "utf8")}\ntampered`);

  const tampered = spawnSync(process.execPath, [CLI_PATH, "console", outDir], { encoding: "utf8" });
  assert.equal(tampered.status, 1);
  const tamperedJson = JSON.parse(tampered.stdout);
  assert.equal(tamperedJson.ok, false);
  const c0 = tamperedJson.runs.find((run) => run.condition === "C0");
  const c1 = tamperedJson.runs.find((run) => run.condition === "C1");
  assert.equal(c0.integrityOk, false);
  assert.equal(c0.legalityOk, true);
  assert.ok(c0.errors.some((error) => error.code === "ERR_FILE_HASH_MISMATCH"));
  assert.equal(c1.integrityOk, true);
  assert.equal(c1.legalityOk, true);
  assert.equal(c1.replayOk, true);
});


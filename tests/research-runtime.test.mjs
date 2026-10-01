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

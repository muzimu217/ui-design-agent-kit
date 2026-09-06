import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createE3Packet } from "../scripts/eval-e3.mjs";

const scenarios = JSON.parse(await readFile(new URL("../evals/scenarios.json", import.meta.url), "utf8"));
const suite = JSON.parse(await readFile(new URL("../evals/e3.json", import.meta.url), "utf8"));

test("E3 preparation resolves three cases without exposing the rubric or claiming execution", () => {
  const packet = createE3Packet(scenarios, suite, "test instructions");
  assert.deepEqual(packet.cases.map((item) => item.id), suite.scenarioIds);
  assert.deepEqual(Object.keys(packet).sort(), ["cases", "casesSha256", "instructions", "instructionsSha256", "mode", "suiteId"]);
  for (const item of packet.cases) {
    assert.deepEqual(Object.keys(item).sort(), ["context", "id", "request"]);
    assert.equal(item.request, scenarios.find((scenario) => scenario.id === item.id).request);
  }
});

test("E3 input hashes are reproducible and distinguish instruction changes from case changes", () => {
  const baseline = createE3Packet(scenarios, suite, "baseline");
  assert.deepEqual(createE3Packet(scenarios, suite, "baseline"), baseline);
  const candidate = createE3Packet(scenarios, suite, "candidate");
  assert.notEqual(candidate.instructionsSha256, baseline.instructionsSha256);
  assert.equal(candidate.casesSha256, baseline.casesSha256);
  const changed = structuredClone(scenarios);
  changed.find((item) => item.id === suite.scenarioIds[0]).context += " New fact.";
  const changedPacket = createE3Packet(changed, suite, "baseline");
  assert.equal(changedPacket.instructionsSha256, baseline.instructionsSha256);
  assert.notEqual(changedPacket.casesSha256, baseline.casesSha256);
});

test("E3 rejects missing, duplicate, empty, and non-decision inputs", () => {
  assert.throws(() => createE3Packet([], suite, "prompt"), /Missing/);
  assert.throws(() => createE3Packet([...scenarios, scenarios[0]], suite, "prompt"), /distinct/);
  for (const scenarioIds of [[], ["x", "x", "y"], [...suite.scenarioIds, "fourth"]]) {
    assert.throws(() => createE3Packet(scenarios, { ...suite, scenarioIds }, "prompt"), /three distinct/);
  }
  assert.throws(() => createE3Packet(scenarios, { ...suite, mode: "implementation" }, "prompt"), /decision-only/);
  assert.throws(() => createE3Packet(scenarios, suite, "  "), /instructions/);
  const incomplete = structuredClone(scenarios);
  incomplete.find((item) => item.id === suite.scenarioIds[0]).request = "";
  assert.throws(() => createE3Packet(incomplete, suite, "prompt"), /incomplete/);
});

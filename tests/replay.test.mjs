import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildEvolutionReport } from "../scripts/evolution-report.mjs";
import { inspectReplay } from "../scripts/replay.mjs";

test("blog demo replay package has anchored inputs and evidence", async () => {
  const report = await inspectReplay("demo/blog-demo/replay.json");
  assert.equal(report.ok, true, report.errors.join("; "));
  assert.equal(report.artifacts.length, 13);
  assert.equal(report.manifest.scenarioId, "reference-first-adaptation");
});

test("evolution report selects the next uncovered scenario without inventing scores", async () => {
  const scenarios = JSON.parse(await readFile(new URL("../evals/scenarios.json", import.meta.url), "utf8"));
  const report = await buildEvolutionReport();
  assert.equal(report.coverage.total, scenarios.length);
  assert.equal(report.coverage.executed, 5);
  assert.equal(report.nextScenario, "remotion-brand-animation");
  assert.equal(report.regressions.length, 0);
  assert.ok(report.recommendations.some((item) => item.includes("不自动升级")));
});

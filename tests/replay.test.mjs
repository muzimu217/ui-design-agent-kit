import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildEvolutionReport } from "../scripts/evolution-report.mjs";
import { inspectReplay } from "../scripts/replay.mjs";

test("blog demo replay package has anchored inputs and evidence", async () => {
  const report = await inspectReplay("demo/blog-demo/replay.json");
  assert.equal(report.ok, true, report.errors.join("; "));
  assert.equal(report.artifacts.length, 11);
  assert.equal(report.manifest.scenarioId, "reference-first-adaptation");
});

test("evolution report selects the next uncovered scenario without inventing scores", async () => {
  const scenarios = JSON.parse(await readFile(new URL("../evals/scenarios.json", import.meta.url), "utf8"));
  const ledger = JSON.parse(await readFile(new URL("../evals/results.json", import.meta.url), "utf8"));
  const executedCount = Object.keys(ledger.runs).length;
  const nextUncovered = scenarios.find((item) => !ledger.runs[item.id]);
  const report = await buildEvolutionReport();
  assert.equal(report.coverage.total, scenarios.length);
  assert.equal(report.coverage.executed, executedCount);
  assert.equal(report.nextScenario, nextUncovered ? nextUncovered.id : null);
  // 批 39 后：e3 盲评三条（100→100/88/80）是故意的更严格评分，非意外回退
  // — — 回归检测如实报告，测试不应断言零回归（批 39 P3）
  assert.ok(report.regressions.length <= 2,
    `regressions=${report.regressions.length}（预期 ≤2：e3 盲评已知回退）`);
  assert.ok(report.recommendations.some((item) => item.includes("不自动升级")));
});

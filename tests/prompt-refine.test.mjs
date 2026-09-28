import test from "node:test";
import assert from "node:assert/strict";
import { buildDraft, mapToOwners, pickFailing } from "../scripts/prompt-refine.mjs";

// Pure-function coverage for the S4 suggester. All fixtures are in-memory:
// the CLI writes drafts only into output/ (gitignored) and never edits
// instruction files, and these tests touch no files at all.

const SCENARIOS = [
  {
    id: "alpha",
    passCriteria: ["Measured contrast on secondary text", "A keyboard path exists"],
    failConditions: ["Claims persistence without implementation"],
  },
  {
    id: "beta-clean",
    passCriteria: ["Opens into the dashboard"],
    failConditions: [],
  },
];

const RESULTS = {
  runs: {
    alpha: [{
      date: "2026-09-25",
      score: 50,
      scores: { "Measured contrast on secondary text": 0, "A keyboard path exists": 2 },
      evidence: ["evals/runs/alpha/EVIDENCE.md"],
    }],
    "beta-clean": [{
      date: "2026-09-25",
      score: 100,
      scores: { "Opens into the dashboard": 2 },
      evidence: ["evals/runs/beta-clean/EVIDENCE.md"],
    }],
  },
};

test("criterion text maps mechanically to the instruction owners it touches", () => {
  const owners = mapToOwners("Measured contrast on secondary text");
  assert.ok(owners.some((o) => o.file === "detail-constants.md"));

  const keyboard = mapToOwners("A keyboard path exists");
  assert.ok(keyboard.some((o) => o.file === "detail-critique.md"));

  const unknown = mapToOwners("量子纠缠态的超导填充");
  assert.deepEqual(unknown, []);
});

test("pickFailing keeps scenarios with thin criteria or fail hits and skips clean ones", () => {
  const failing = pickFailing(SCENARIOS, RESULTS);
  assert.deepEqual(failing.map((item) => item.scenario.id), ["alpha"]);
  const alpha = failing[0];
  assert.deepEqual(alpha.thin, ["Measured contrast on secondary text"]);
  assert.deepEqual(alpha.failHits, []);
});

test("a fail-condition hit surfaces as a hit section with the same mapping", () => {
  const withHit = structuredClone(RESULTS);
  withHit.runs.alpha[0].failHits = ["Claims persistence without implementation"];
  withHit.runs.alpha[0].score = 0;
  const [alpha] = pickFailing(SCENARIOS, withHit);
  assert.deepEqual(alpha.failHits, ["Claims persistence without implementation"]);
  const draft = buildDraft(alpha);
  assert.match(draft, /### 命中禁区：Claims persistence without implementation/);
  assert.match(draft, /design-contract\.md/);
});

test("the draft quotes failures, names owners, and never claims authority to change instructions", () => {
  const [alpha] = pickFailing(SCENARIOS, RESULTS);
  const draft = buildDraft(alpha, { date: "2026-09-25" });
  assert.match(draft, /# 指令修订建议草稿 · alpha/);
  assert.match(draft, /### 未拿满分（0\/2）：Measured contrast on secondary text/);
  assert.match(draft, /候选归属：references\//);
  assert.match(draft, /无机械匹配|候选归属/);
  assert.match(draft, /用户裁决后才能落盘/);
  assert.doesNotMatch(draft, /已修改|已更新指令/);
});

test("an unknown-topic criterion says it needs human localization instead of guessing", () => {
  const scenario = {
    id: "gamma",
    passCriteria: ["Uses quantum-entangled padding correctly"],
    failConditions: [],
  };
  const results = { runs: { gamma: [{ date: "2026-09-25", score: 0, scores: { "Uses quantum-entangled padding correctly": 0 }, evidence: ["x.md"] }] } };
  const [gamma] = pickFailing([scenario], results);
  const draft = buildDraft(gamma);
  assert.match(draft, /无机械匹配的指令归属，需人工定位/);
});

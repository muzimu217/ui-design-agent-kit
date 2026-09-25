import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { ROOT } from "../scripts/verify.mjs";

// The workflow pipeline has drift tests (kit.test.mjs), but document-claimed
// counts did not — the 2026-09-20 master review flagged six stale-number
// sites. This tripwire closes that loop: when the corpus or executed set
// changes, the scorekeeping documents must be updated in the same change.

async function read(relative) {
  return readFile(path.join(ROOT, relative), "utf8");
}

test("documents cite the current eval corpus and execution counts", async () => {
  const scenarios = JSON.parse(await read("evals/scenarios.json"));
  const results = JSON.parse(await read("evals/results.json"));
  const total = scenarios.length;
  const executed = Object.values(results.runs).filter((runs) => runs.length > 0).length;

  const report = await read("docs/eval-report-2026-09.md");
  assert.ok(
    report.includes(`${executed}/${total}`),
    `eval-report must cite the current coverage ${executed}/${total}`,
  );

  const goal = await read("docs/goal.md");
  assert.match(goal, new RegExp(`评测场景（现 ${total} 个`), "goal.md must cite the current corpus size");

  const paper = await read("paper/uak-paper.md");
  assert.ok(
    paper.includes(`${total} scenarios`),
    `paper must carry the current corpus count (${total}) next to its release snapshot`,
  );
});

test("stale coverage claims are gone from scorekeeping documents", async () => {
  for (const file of ["docs/eval-report-2026-09.md", "docs/goal.md", "paper/uak-paper.md"]) {
    const source = await read(file);
    assert.equal(
      source.includes("15/60"),
      false,
      `${file} still cites the stale 15/60 coverage`,
    );
  }
});

test("quality-monitor metric rows stay current with the corpus and the test count", async () => {
  // R106-02 (round 110 escalation): quality-monitor cited stale numbers and
  // sat outside every drift guard. Both machine-derivable rows are locked
  // now — a corpus or test-suite change trips here until the table is
  // updated in the same change.
  const scenarios = JSON.parse(await read("evals/scenarios.json"));
  const monitor = await read("docs/quality-monitor.md");
  assert.ok(
    monitor.includes(`| 评测场景数 | ${scenarios.length}（doc-drift 测试锁口径`),
    `quality-monitor 评测场景数 row must cite the current corpus size (${scenarios.length})`,
  );

  const testFiles = (await readdir(path.join(ROOT, "tests"))).filter((name) => name.endsWith(".test.mjs"));
  let testCount = 0;
  for (const name of testFiles) {
    testCount += (await read(path.join("tests", name))).match(/^\s*test\(/gm)?.length ?? 0;
  }
  assert.ok(
    monitor.includes(`| 测试通过数 | ${testCount}/${testCount}`),
    `quality-monitor 测试通过数 row must cite the current test count (${testCount}/${testCount})`,
  );
});

test("eval-report §4.1 lists exactly the executed scenarios in the ledger", async () => {
  // R111-01: the representativeness disclosure itself carried wrong numbers
  // because no check recomputed them. The disclosure's scenario list is now
  // machine-locked to results.json: a new --record trips here until §4.1 is
  // updated in the same change.
  const results = JSON.parse(await read("evals/results.json"));
  const executed = new Set(
    Object.entries(results.runs).filter(([, runs]) => runs.length > 0).map(([id]) => id),
  );
  const report = await read("docs/eval-report-2026-09.md");
  const section = report.split("### 4.1")[1]?.split("## 五、")[0];
  assert.ok(section, "eval-report must keep a §4.1 disclosure section");
  const listed = new Set([...section.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]));
  assert.deepEqual([...listed].sort(), [...executed].sort(),
    "§4.1 scenario list must equal the ledger's executed set");
});

test("every gate section in gate-protocol carries its contract elements", async () => {
  // R104-03: the protocol's own meta-definition says a gate = entry criteria
  // + required artifact + submission format + valid verdicts, but gates D/E/F
  // were missing elements and F's nature was defined differently in three
  // places. The section-level keywords are locked here.
  const source = await read(".agents/skills/ui-design-agent/references/gate-protocol.md");
  const sectionOf = (gate) => {
    const match = source.match(new RegExp(`### 门${gate} ·[^#]*`));
    return match ? match[0] : "";
  };
  for (const gate of ["A", "B", "C", "D", "E"]) {
    const section = sectionOf(gate);
    assert.ok(section, `gate ${gate} section missing from gate-protocol.md`);
    for (const keyword of ["进入条件", "必交产物", "呈交", "有效裁决"]) {
      assert.ok(section.includes(keyword), `gate ${gate} section misses ${keyword}`);
    }
  }
  const traceGate = sectionOf("F");
  assert.ok(traceGate, "gate F section missing from gate-protocol.md");
  assert.ok(traceGate.includes("留痕"), "gate F must be defined as a trace gate (not a user stop)");
  assert.ok(traceGate.includes("必交产物"), "gate F section misses its artifact requirement");
});

test("detail-constants defers motion values to motion-contract (no rival numbers)", async () => {
  // R104-01: detail-constants once carried its own press scale and spring
  // duration, contradicting the canonical motion contract — the second
  // such conflict after stagger (R101-02). The enumerated rival pairs stay
  // locked out.
  const constants = await read(".agents/skills/ui-design-agent/references/detail-constants.md");
  assert.ok(constants.includes("Precedence meta-rule (R104-01)"),
    "detail-constants must carry the motion-contract precedence meta-rule");
  assert.doesNotMatch(constants, /scale\(0\.96\)|below 0\.95/,
    "detail-constants must not set its own press scale (motion-contract governs, near 0.98)");
  assert.doesNotMatch(constants, /duration:\s*0\.3/,
    "detail-constants must not pair a spring with duration (motion-contract forbids it)");
  const contract = await read(".agents/skills/ui-design-agent/references/motion-contract.md");
  assert.match(contract, /near scale 0\.98/, "motion-contract must keep the canonical press scale");
});

test("bilingual README case tables link the same set of case documents", async () => {
  const caseLinks = (source) => [...source.matchAll(/\((?:demo\/[a-z0-9-]+\/README\.md|showcase\/README\.md)\)/g)]
    .map((match) => match[1]).sort();
  const zh = caseLinks(await read("README.md"));
  const en = caseLinks(await read("README.en.md"));
  assert.deepEqual(zh, en, "README and README.en must link the same case documents");
});

test("known case-table warning annotations stay in both languages", async () => {
  const rowOf = (source) => source.split("\n").find((line) => line.includes("AURELIS M2"));
  const zhRow = rowOf(await read("README.md"));
  const enRow = rowOf(await read("README.en.md"));
  assert.ok(zhRow, "zh case table must list AURELIS M2");
  assert.ok(enRow, "en case table must list AURELIS M2");
  assert.ok(zhRow.includes("构建失败待修"), "zh AURELIS M2 row must keep the build-failing note");
  assert.ok(enRow.includes("build failing"), "en AURELIS M2 row must keep the build-failing note");
});

test("every evals/runs directory is accounted for by the ledger or a marker", async () => {
  const runsDir = path.join(ROOT, "evals/runs");
  const entries = await readdir(runsDir, { withFileTypes: true });
  const results = JSON.parse(await read("evals/results.json"));
  const unaccounted = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const scored = Array.isArray(results.runs[entry.name]) && results.runs[entry.name].length > 0;
    let marked = false;
    if (existsSync(path.join(runsDir, entry.name, "NON-CORPUS.md"))) {
      const marker = await read(path.join("evals/runs", entry.name, "NON-CORPUS.md"));
      marked = marker.includes("NON-CORPUS")
        && /\d{4}-\d{2}-\d{2}/.test(marker)
        && marker.includes("原因")
        && marker.length > 200;
    }
    if (!scored && !marked) unaccounted.push(entry.name);
  }
  assert.deepEqual(unaccounted, [], "run directories must have a results.json key or a substantive NON-CORPUS.md marker");
});

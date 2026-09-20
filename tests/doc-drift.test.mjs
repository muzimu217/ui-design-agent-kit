import { readFile } from "node:fs/promises";
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

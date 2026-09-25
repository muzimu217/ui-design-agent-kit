import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { ROOT } from "../scripts/verify.mjs";

// R107-02 / R103-01：eval CLI 的 usage 必须存在，R103-01 加固的失败路径必须逐项拦截。
// 全部用例走失败路径（--record 校验失败不写台账），不污染 evals/results.json。

const RUN = path.join(ROOT, "scripts/eval-run.mjs");
const VALID_SCORES = {
  "Records all three dials (DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY) with 1-10 values in the portal direction draft": 2,
  "Portal dial values fall in or near the trust-first inference row and the choice is stated, not guessed silently": 2,
  "The preserve-mode console redesign matches current dial values with motion +1 instead of re-inventing values": 2,
  "States that surface type and dials are chosen together, with dials present in the gate A submission format": 2,
};

function runCli(args) {
  try {
    const stdout = execFileSync("node", [RUN, ...args], { cwd: ROOT, encoding: "utf8", timeout: 60000 });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.status ?? 1, stdout: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

test("unknown eval flag prints usage instead of crashing on a missing helper", () => {
  const result = runCli(["--bogus"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stdout, /Usage: npm run eval/);
  assert.doesNotMatch(result.stdout, /usage is not defined/);
});

test("--record rejects evidence files that do not exist", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "eval-run-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const data = path.join(dir, "data.json");
  await writeFile(data, JSON.stringify({
    scores: VALID_SCORES,
    evidence: ["evals/runs/direction-dials-recorded/EVIDENCE.md", "evals/runs/direction-dials-recorded/NOT-EXIST.md"],
  }));
  const result = runCli(["--record", "direction-dials-recorded", "--data", data]);
  assert.notEqual(result.code, 0);
  assert.match(result.stdout, /evidence file does not exist/);
});

test("--record rejects thin full-score evidence", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "eval-run-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const data = path.join(dir, "data.json");
  await writeFile(data, JSON.stringify({
    scores: VALID_SCORES,
    evidence: ["docs/iteration-log.md"],
  }));
  const result = runCli(["--record", "direction-dials-recorded", "--data", data]);
  assert.notEqual(result.code, 0);
  assert.match(result.stdout, /full-score records need at least 3 evidence items/);
});

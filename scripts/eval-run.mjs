import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

const execFileAsync = promisify(execFile);

// Execution-scoring ledger for evals/scenarios.json (G1 in docs/goal.md).
// `npm run eval:e3` prepares blind decision-only packets and runs no grader;
// this tool is the complementary half: it records scores from real scenario
// executions so kit changes can be compared over time (docs/iteration-log.md).
//
// Rubric: each passCriterion scores 0 (missing) / 1 (partial) / 2 (done with
// evidence); any hit failCondition forces the scenario score to 0.
// Scenario score = round(100 * earned / (2 * criteria)).
// Runs may add an optional `styleReview` — the 8 detail-critique dimensions
// (0-2 each) turned into a separate style score, so "样式是否达标" is tracked
// next to the functional score instead of being folded into it.
//
// Usage:
//   npm run eval                              overview: latest score + coverage
//   npm run eval -- --check                   validate ledger vs scenarios
//   npm run eval -- --next                    next unexecuted scenario (rotation order)
//   npm run eval -- --record <id> --data <f>  record one real execution
//
// The --data file: { "round"?: string, "scores": { "<passCriteria text>": 0|1|2 },
// "failHits"?: string[], "evidence": string[], "notes"?: string,
// "styleReview"?: { "<dimension>": 0|1|2, ... } }.
// Score keys must match the scenario's passCriteria verbatim so rubric drift
// fails loudly instead of silently rescaling history.

const RUBRIC =
  "每条 passCriteria 0-2 分（0 未做 / 1 做了但不完整 / 2 有证据地做到）；" +
  "failConditions 命中任一条该场景记 0 分；场景分 = round(100 × 得分 / (2 × 条数))。";

const STYLE_DIMENSIONS = [
  "布局节奏",
  "排版",
  "对比度实测",
  "状态覆盖",
  "动效合规",
  "可供性",
  "鲁棒性",
  "一致性",
];

const scenariosPath = path.join(ROOT, "evals/scenarios.json");
const resultsPath = path.join(ROOT, "evals/results.json");

async function loadScenarios() {
  const list = JSON.parse(await readFile(scenariosPath, "utf8"));
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("evals/scenarios.json must be a nonempty array");
  }
  const ids = list.map((item) => item?.id);
  if (ids.some((id) => typeof id !== "string" || id.trim() === "")
    || new Set(ids).size !== ids.length) {
    throw new Error("Scenarios must have distinct nonempty ids");
  }
  for (const item of list) {
    if (!Array.isArray(item.passCriteria) || item.passCriteria.length === 0
      || !Array.isArray(item.failConditions)) {
      throw new Error(`Scenario ${item.id} needs nonempty passCriteria and a failConditions array`);
    }
  }
  return list;
}

async function loadResults() {
  let raw;
  try {
    raw = await readFile(resultsPath, "utf8");
  } catch {
    return { rubric: RUBRIC, runs: {} };
  }
  const parsed = JSON.parse(raw);
  if (parsed?.rubric !== RUBRIC || typeof parsed.runs !== "object" || parsed.runs === null) {
    throw new Error("evals/results.json is stale or malformed; expected the current rubric text and a runs object");
  }
  return parsed;
}

async function validateRun(run, scenario, { enforceAnchored = false } = {}) {
  const problems = [];
  const criteria = scenario.passCriteria;
  const scoreKeys = Object.keys(run?.scores ?? {});
  const missing = criteria.filter((c) => !scoreKeys.includes(c));
  const extra = scoreKeys.filter((k) => !criteria.includes(k));
  if (missing.length > 0) problems.push(`scores missing ${missing.length} passCriteria (verbatim keys required)`);
  if (extra.length > 0) problems.push(`scores have ${extra.length} keys that are not passCriteria of this scenario`);
  for (const [key, value] of Object.entries(run?.scores ?? {})) {
    if (![0, 1, 2].includes(value)) problems.push(`scores["${key.slice(0, 40)}…"] must be 0, 1, or 2`);
  }
  const failHits = run?.failHits ?? [];
  if (!Array.isArray(failHits)) problems.push("failHits must be an array");
  const unknownHits = failHits.filter((hit) => !scenario.failConditions.includes(hit));
  if (unknownHits.length > 0) problems.push(`${unknownHits.length} failHits do not match this scenario's failConditions`);
  if (!Array.isArray(run?.evidence) || run.evidence.length === 0
    || run.evidence.some((item) => typeof item !== "string" || item.trim() === "")) {
    problems.push("evidence must be a nonempty array of paths or URLs (no score without evidence)");
    return problems;
  }
  // R103-01：路径形态的 evidence 必须真实存在（相对 ROOT）；URL 与自由文本跳过存在性检查。
  // 新机制对 --record 入参与带 recordedAt 锚点的存量记录生效——历史记录不回填不破坏（--check 不追溯）。
  const pathShaped = run.evidence.filter((item) => !item.includes("://") && item.includes("/") && !/\s/.test(item));
  if (enforceAnchored || run.recordedAt) {
    for (const item of pathShaped) {
      try { await access(path.resolve(ROOT, item)); }
      catch { problems.push(`evidence file does not exist: ${item}`); }
    }
    // R103-01：满分记录必须证据更厚（≥3 条且至少 1 条为真实文件路径），防"自报满分一张嘴"。
    const score = Math.round((100 * scenario.passCriteria.reduce((sum, c) => sum + (run.scores[c] ?? 0), 0)) / (2 * scenario.passCriteria.length));
    const failZeroed = Array.isArray(run.failHits) && run.failHits.length > 0;
    if (!failZeroed && score === 100) {
      if (run.evidence.length < 3) problems.push(`full-score records need at least 3 evidence items (got ${run.evidence.length})`);
      if (pathShaped.length < 1) problems.push("full-score records need at least one file-path evidence item");
    }
  }
  if (run?.styleReview !== undefined) {
    const keys = Object.keys(run.styleReview);
    const missingDims = STYLE_DIMENSIONS.filter((d) => !keys.includes(d));
    const extraDims = keys.filter((k) => !STYLE_DIMENSIONS.includes(k));
    if (missingDims.length > 0) problems.push(`styleReview missing ${missingDims.length} dimensions (verbatim keys required)`);
    if (extraDims.length > 0) problems.push(`styleReview has ${extraDims.length} unknown dimensions`);
    for (const [key, value] of Object.entries(run.styleReview)) {
      if (![0, 1, 2].includes(value)) problems.push(`styleReview["${key}"] must be 0, 1, or 2`);
    }
  }
  return problems;
}

function computeScore(run, scenario) {
  if (Array.isArray(run.failHits) && run.failHits.length > 0) return 0;
  const total = 2 * scenario.passCriteria.length;
  const earned = scenario.passCriteria.reduce((sum, c) => sum + run.scores[c], 0);
  return Math.round((100 * earned) / total);
}

function computeStyleScore(styleReview) {
  if (!styleReview) return undefined;
  const total = 2 * STYLE_DIMENSIONS.length;
  const earned = STYLE_DIMENSIONS.reduce((sum, d) => sum + styleReview[d], 0);
  return Math.round((100 * earned) / total);
}

function printOverview(list, results) {
  const executed = list.filter((item) => (results.runs[item.id]?.length ?? 0) > 0);
  for (const item of list) {
    const runs = results.runs[item.id] ?? [];
    if (runs.length === 0) {
      console.log(`-  ${item.id}  (未真实执行)`);
      continue;
    }
    const latest = runs.at(-1);
    const style = latest.styleScore === undefined ? "" : ` · 样式 ${latest.styleScore}`;
    console.log(`${String(latest.score).padStart(3)}  ${item.id}  (${runs.length} 次记录，最近 ${latest.date}${latest.round ? ` ${latest.round}` : ""}${style})`);
  }
  const avg = executed.length === 0 ? "-" : Math.round(
    executed.reduce((sum, item) => sum + results.runs[item.id].at(-1).score, 0) / executed.length);
  console.log(`\n已真实执行 ${executed.length}/${list.length} 个场景；最近分数均值 ${avg}；rubric：${results.rubric}`);
}

async function main() {
  const args = process.argv.slice(2);
  const list = await loadScenarios();
  const results = await loadResults();

  if (args[0] === "--check") {
    const problems = [];
    for (const [id, runs] of Object.entries(results.runs)) {
      const scenario = list.find((item) => item.id === id);
      if (!scenario) {
        problems.push(`${id}: ledger references a scenario that no longer exists`);
        continue;
      }
      for (const [index, run] of runs.entries()) {
        for (const problem of await validateRun(run, scenario, { enforceAnchored: Boolean(run.recordedAt) })) problems.push(`${id}[${index}]: ${problem}`);
        const expected = computeScore(run, scenario);
        if (run.score !== expected) problems.push(`${id}[${index}]: stored score ${run.score} != recomputed ${expected}`);
        if (run.styleReview) {
          const expectedStyle = computeStyleScore(run.styleReview);
          if (run.styleScore !== expectedStyle) {
            problems.push(`${id}[${index}]: stored styleScore ${run.styleScore} != recomputed ${expectedStyle}`);
          }
        }
      }
    }
    if (problems.length > 0) {
      console.error(problems.map((line) => `✗ ${line}`).join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log(`Ledger OK: ${Object.keys(results.runs).length} executed scenarios validated against ${list.length} scenarios.`);
    return;
  }

  if (args[0] === "--next") {
    const pending = list.find((item) => (results.runs[item.id]?.length ?? 0) === 0);
    if (!pending) {
      console.log("全部场景已至少执行一次；可重跑低分场景或扩充电vals/scenarios.json。");
      return;
    }
    console.log(`下一个待执行场景（轮转序）：${pending.id}`);
    console.log(`  passCriteria ×${pending.passCriteria.length}，failConditions ×${pending.failConditions.length}`);
    console.log(`  记录：npm run eval -- --record ${pending.id} --data <jsonFile>`);
    return;
  }

  if (args[0] === "--record") {
    const id = args[1];
    const dataIndex = args.indexOf("--data");
    const dataFile = dataIndex === -1 ? undefined : args[dataIndex + 1];
    const scenario = list.find((item) => item.id === id);
    if (!scenario || !dataFile) {
      throw new Error("--record requires an existing scenario id and --data <jsonFile>");
    }
    const run = JSON.parse(await readFile(dataFile, "utf8"));
    const rerun = args.includes("--rerun");
    const date = new Date().toISOString().slice(0, 10);
    const priorSameDay = (results.runs[id] ?? []).filter((item) => item.date === date).length;
    if (priorSameDay > 0 && !rerun) {
      console.error(`✗ ${id} already has ${priorSameDay} record(s) dated ${date}; pass --rerun to record a deliberate re-execution`);
      process.exitCode = 1;
      return;
    }
    const problems = await validateRun(run, scenario, { enforceAnchored: true });
    if (problems.length > 0) {
      console.error(problems.map((line) => `✗ ${line}`).join("\n"));
      process.exitCode = 1;
      return;
    }
    let commit;
    try {
      commit = (await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: ROOT })).stdout.trim();
    } catch { commit = undefined; }
    const record = {
      date,
      recordedAt: new Date().toISOString(),
      ...(commit ? { commit } : {}),
      ...(rerun && priorSameDay > 0 ? { rerun: priorSameDay + 1 } : {}),
      ...(run.round ? { round: run.round } : {}),
      scores: run.scores,
      ...(Array.isArray(run.failHits) && run.failHits.length > 0 ? { failHits: run.failHits } : {}),
      score: computeScore(run, scenario),
      ...(run.styleReview ? { styleReview: run.styleReview, styleScore: computeStyleScore(run.styleReview) } : {}),
      evidence: run.evidence,
      ...(run.notes ? { notes: run.notes } : {}),
    };
    results.runs[id] = [...(results.runs[id] ?? []), record];
    await writeFile(resultsPath, JSON.stringify(results, null, 2) + "\n");
    console.log(`Recorded ${id}: score ${record.score} (第 ${results.runs[id].length} 次记录) → ${path.relative(ROOT, resultsPath)}`);
    return;
  }

  if (args.length === 0) {
    printOverview(list, results);
    return;
  }
  usage();
}

function usage() {
  console.error(`Usage: npm run eval
  npm run eval -- --check                       台账与语料校验（rubric 漂移、分数复算、evidence 存在性）
  npm run eval -- --next                        提示文件序首个未执行场景（仅参考）
  npm run eval -- --record <id> --data <file> [--rerun]
                                                记录一次真实执行；同场景同日重复需 --rerun`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

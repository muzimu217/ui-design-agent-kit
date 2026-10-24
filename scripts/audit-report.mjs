#!/usr/bin/env node
// audit-report — aggregate the repo's machine-checkable verdicts into one
// structured findings report (output/audit-report.json).
//
// Form adopted from cloudflare/security-audit-skill (学循环 89): findings carry
// "confirmed" (checked and passed) or "needs_validation" (checked but an exact
// fact is missing — never graded beyond that), and the report itself has
// exactly two terminal states: run_status "complete" (all findings confirmed)
// or "incomplete" (+ exact reason). Stopping mid-aggregation is not a valid
// outcome — a crash must surface as a failed invocation, not a partial report.
//
// Usage: node scripts/audit-report.mjs [--json]
// Exit 0 when the report is written with run_status "complete"; exit 1 when
// "incomplete" (the report is still written — the reason IS the deliverable).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);

const findings = [];
const add = (id, domain, status, evidence, detail) => findings.push({ id, domain, status, evidence, ...(detail ? { detail } : {}) });

async function main() {
  // ---- Phase 1: structured data integrity (counts must exist and be coherent) ----
  let scenarios = 0, kbCount = 0, capCount = 0, artCount = 0, regCount = 0;
  try {
    scenarios = (JSON.parse(await readFile(path.join(ROOT, "evals/scenarios.json"), "utf8"))).length;
    const kb = JSON.parse(await readFile(path.join(ROOT, "docs/knowledge-base/index.json"), "utf8")).cards;
    kbCount = kb.length;
    const layers = {};
    for (const c of kb) layers[c.layer] = (layers[c.layer] ?? 0) + 1;
    const layerValues = Object.values(layers);
    const balanced = layerValues.length === 3 && layerValues.every((n) => n === layerValues[0]);
    add("kb-integrity", "knowledge", balanced ? "confirmed" : "needs_validation",
      `docs/knowledge-base/index.json: ${kbCount} cards, layers=${JSON.stringify(layers)}`,
      balanced ? undefined : "三层分布不均衡——确切事实：各层卡片数不相等");
    const caps = JSON.parse(await readFile(path.join(ROOT, "canvas/capabilities.json"), "utf8")).capabilities;
    capCount = caps.length;
    const validStatus = caps.every((c) => ["adopted", "evaluating", "rejected"].includes(c.status));
    add("caps-integrity", "registry", validStatus ? "confirmed" : "needs_validation",
      `canvas/capabilities.json: ${capCount} entries, statuses valid=${validStatus}`,
      validStatus ? undefined : "存在未知 status 值");
    artCount = (JSON.parse(await readFile(path.join(ROOT, "canvas/artifacts.json"), "utf8"))).artifacts.length;
    const regs = (JSON.parse(await readFile(path.join(ROOT, "canvas/regressions.json"), "utf8"))).regressions;
    regCount = regs.length;
    const appendOnly = regs.every((r) => r.id && r.date && r.lesson);
    add("regressions-append-only", "evidence", appendOnly ? "confirmed" : "needs_validation",
      `canvas/regressions.json: ${regCount} entries, all carry id/date/lesson=${appendOnly}`,
      appendOnly ? undefined : "存在缺 id/date/lesson 的反例条目");
  } catch (e) {
    add("data-integrity", "knowledge", "needs_validation", "structured data read failed",
      String(e.message ?? e).split("\n")[0]);
  }

  // ---- Phase 2: video contracts (sfx hero + 60s, timeline) ----
  for (const [id, script, args] of [
    ["sfx-hero", "scripts/sfx-check.mjs", ["--sheet", "video-production/src/sfx-cues.json", "--json"]],
    ["sfx-60", "scripts/sfx-check.mjs", ["--sheet", "video-production/src/sfx-cues-60.json", "--json"]],
    ["timeline-60", "scripts/timeline-check.mjs", ["--json"]],
  ]) {
    try {
      const { stdout } = await run(process.execPath, [path.join(ROOT, script), ...args], { cwd: ROOT });
      const r = JSON.parse(stdout);
      add(id, "video", r.ok ? "confirmed" : "needs_validation",
        `${script}: ${r.cues ?? r.scenes ?? "?"} items, issues=${JSON.stringify(r.issues ?? [])}`,
        r.ok ? undefined : (r.issues ?? []).join("; "));
    } catch (e) {
      const detail = String(e.stderr ?? e.message ?? "").trim().split("\n").slice(-2).join("; ");
      add(id, "video", "needs_validation", `${script} failed`, detail || "invocation error");
    }
  }

  // ---- Phase 2.5: adversarial append-only (独立证据路径：git 全历史试图证伪
  // "只增不删"——当前形态检查的另一面，学循环 93 采纳的对抗验证轻量版) ----
  try {
    const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts/adversarial-append-only.mjs"), "--json"], { cwd: ROOT });
    const r = JSON.parse(stdout);
    add("regressions-history", "evidence", r.run_status === "complete" ? "confirmed" : "needs_validation",
      `${r.method}: ${r.versionsExamined} versions / ${r.entriesCurrent} entries`,
      r.run_status === "complete" ? r.verdict : (r.findings ?? []).join("; "));
  } catch (e) {
    const detail = String(e.stderr ?? e.message ?? "").trim().split("\n").slice(-2).join("; ");
    add("regressions-history", "evidence", "needs_validation", "对抗验证失败", detail);
  }

  // ---- Phase 2.6: adversarial contrast（独立引擎试图证伪对比度断言，增量 67）----
  // axe-core 的采样/背景合成/大字号阈值均与 canvas:check 的自有采样器不同——
  // 引擎不一致本身就是信号。0 违例 = 证伪失败（断言经受住对抗重测）；
  // 有违例 = 口径差异是真实的（确切节点已由脚本如实记录）。
  try {
    const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts/adversarial-contrast.mjs"), "--json"], { cwd: ROOT });
    const r = JSON.parse(stdout);
    const t = r.totals ?? {};
    add("adversarial-contrast", "canvas", r.ok ? "confirmed" : "needs_validation",
      `axe-core color-contrast ×${t.pages ?? "?"} 页: violations=${t.violations ?? "?"}, axePassed=${t.axePassed ?? "?"}, axeIncomplete=${t.axeIncomplete ?? "?"}`,
      r.ok ? undefined : String(r.verdict ?? "axe 发现违例"));
  } catch (e) {
    const detail = String(e.stderr ?? e.message ?? "").trim().split("\n").slice(-2).join("; ");
    add("adversarial-contrast", "canvas", "needs_validation", "对抗重测失败", detail);
  }

  // ---- Phase 3: submission number reconciliation ----
  try {
    const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts/build-submission-pdf.mjs"), "--check-only"], { cwd: ROOT });
    add("submission-numbers", "docs", "confirmed", stdout.trim().split("\n")[0]);
  } catch (e) {
    const detail = String(e.stderr ?? e.message ?? "").trim().split("\n").slice(-2).join("; ");
    add("submission-numbers", "docs", "needs_validation", "数字对账失败", detail);
  }

  // ---- Phase 4: git provenance (recorded as context, not a verdict) ----
  let head = "unknown", dirty = null;
  try {
    head = (await run("git", ["-C", ROOT, "rev-parse", "--short", "HEAD"])).stdout.trim();
    dirty = (await run("git", ["-C", ROOT, "status", "--porcelain"])).stdout.trim() !== "";
  } catch { /* git 不可用时如实记录 */ }

  const incomplete = findings.filter((f) => f.status !== "confirmed");
  const report = {
    run_status: incomplete.length === 0 ? "complete" : "incomplete",
    ...(incomplete.length > 0 ? { incomplete_reason: `${incomplete.length} 项 findings 未达 confirmed（明细见 findings[]）` } : {}),
    generatedAt: new Date().toISOString(),
    head,
    workingTreeDirty: dirty,
    totals: { scenarios, knowledgeCards: kbCount, capabilities: capCount, artifacts: artCount, regressions: regCount },
    findings,
    counts: {
      total: findings.length,
      confirmed: findings.filter((f) => f.status === "confirmed").length,
      needs_validation: incomplete.length,
    },
  };
  await mkdir(path.join(ROOT, "output"), { recursive: true });
  await writeFile(path.join(ROOT, "output/audit-report.json"), JSON.stringify(report, null, 1) + "\n", "utf8");
  return report;
}

const report = await main().catch((e) => ({ run_status: "incomplete", incomplete_reason: `aggregator crashed: ${String(e.stack ?? e).split("\n")[0]}`, findings: [], counts: { total: 0, confirmed: 0, needs_validation: 0 } }));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log(`audit report: run_status=${report.run_status} | ${report.counts?.confirmed ?? 0}/${report.counts?.total ?? 0} confirmed`);
  for (const f of report.findings ?? []) console.log(`  [${f.status}] ${f.id} — ${f.evidence}`);
  if (report.run_status === "incomplete") console.log(`  incomplete_reason: ${report.incomplete_reason}`);
  console.log(`  written: output/audit-report.json`);
}
process.exit(report.run_status === "complete" ? 0 : 1);

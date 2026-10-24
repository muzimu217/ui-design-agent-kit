#!/usr/bin/env node
// wall-reconcile — reconcile the artifact wall's six-dim CLAIMS against the
// live measurement receipt.
//
// 产物墙的 sixDim 是散文断言（"34 项文本全过 4.5:1"）；断言会漂移——页面改了、
// 断言没改，宣称就成了未验证的记忆（与"文档数字漂移"同类）。本脚本跑一次
// 真实 canvas:check，逐页把回执实测数（对比度抽检数/键盘可达数）与对应产物
// 的断言散文对账：回执数字出现在断言中 → confirmed；不在 → needs_validation
// （确切差异即发现内容）。学循环 94 立项，adversarial 家族第三员。
//
// Usage: node scripts/wall-reconcile.mjs [--json]
// Exit 0 all reconciled; 1 any mismatch/missing.

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);
const ART_PAGE = {
  "chain-canvas-workbench": "chain-canvas-workbench.html",
  "canvas-index-hub": "canvas-index.html",
  "mini-dashboard": "mini-dashboard.html",
  "product-site": "site.html",
};

const findings = [];
const nums = (s) => [...String(s).matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));

// Phase 1 — live receipt from the real checker
const { stdout } = await run(process.execPath, [path.join(ROOT, "canvas/check-canvas-a11y.mjs")], {
  cwd: ROOT,
  maxBuffer: 32 * 1024 * 1024,
});
const receipt = JSON.parse(stdout);
const byPage = new Map(receipt.pages.map((p) => [p.page.replace(/^output\//, ""), p]));

// Phase 2 — reconcile claims vs receipt per artifact
const artifacts = JSON.parse(await readFile(path.join(ROOT, "canvas/artifacts.json"), "utf8")).artifacts;
for (const a of artifacts) {
  const page = a.viewUrl ?? ART_PAGE[a.id];
  const p = byPage.get(page);
  if (!p) { findings.push({ id: `${a.id}`, dim: "page", status: "needs_validation", detail: `回执缺页面 ${page}` }); continue; }

  // contrast claim: 断言中的"N 项"应含回执 checked 数
  const claimContrast = String(a.sixDim?.contrast ?? "");
  const checked = p.contrast?.checked;
  if (checked !== undefined) {
    const ok = nums(claimContrast).includes(checked);
    findings.push({ id: `${a.id}`, dim: "contrast", status: ok ? "confirmed" : "needs_validation",
      detail: ok ? `断言含回执数 ${checked}` : `断言数 [${nums(claimContrast)}] 不含回执实测 ${checked}` });
  }
  // keyboard claim: 断言中的可聚焦/停留数应含回执 tabbed 或 focusableTotal
  const claimKb = String(a.sixDim?.keyboard ?? "");
  const kbNums = [p.keyboard?.tabbed, p.keyboard?.focusableTotal].filter((n) => n !== undefined);
  if (kbNums.length) {
    const claimed = nums(claimKb);
    const ok = kbNums.some((n) => claimed.includes(n));
    findings.push({ id: `${a.id}`, dim: "keyboard", status: ok ? "confirmed" : "needs_validation",
      detail: ok ? `断言含回执数 ${kbNums.join("/")}` : `断言数 [${claimed}] 不含回执实测 ${kbNums.join("/")}` });
  }
  // console claim: 回执 0 错误则断言"0 错"类表述应存在
  const errCount = (p.consoleErrors ?? []).length;
  const claimConsole = String(a.sixDim?.console ?? "");
  if (errCount === 0 && !/0\s*错|零错/.test(claimConsole)) {
    findings.push({ id: `${a.id}`, dim: "console", status: "needs_validation",
      detail: "回执 0 错误但断言未含'0 错'表述" });
  }
}

const mismatch = findings.filter((f) => f.status !== "confirmed");
const report = {
  claim: "产物墙六维断言与机验回执一致",
  method: "canvas:check 实测回执逐页对账六Dim 散文数字",
  pagesChecked: receipt.pages.length,
  findings,
  counts: { total: findings.length, confirmed: findings.length - mismatch.length, needs_validation: mismatch.length },
  run_status: mismatch.length === 0 ? "complete" : "incomplete",
  ...(mismatch.length ? { incomplete_reason: `${mismatch.length} 项断言与回执不一致（明细见 findings）` } : {}),
  generatedAt: new Date().toISOString(),
};
await (await import("node:fs/promises")).writeFile(path.join(ROOT, "output/wall-reconcile.json"), JSON.stringify(report, null, 1) + "\n", "utf8");

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`wall reconcile: run_status=${report.run_status} | ${report.counts.confirmed}/${report.counts.total} confirmed`);
  for (const f of findings) console.log(`  [${f.status}] ${f.id}.${f.dim} — ${f.detail}`);
  if (mismatch.length) console.log(`  incomplete_reason: ${report.incomplete_reason}`);
  console.log(`  written: output/wall-reconcile.json`);
}
process.exit(report.run_status === "complete" ? 0 : 1);

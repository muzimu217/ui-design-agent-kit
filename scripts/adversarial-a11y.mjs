#!/usr/bin/env node
// adversarial-a11y — 独立引擎（axe-core）对四张画布页做 WCAG 2.0 A/AA 级
// 全规则对抗扫描（增量 68，学循环 96：95 轮 contrast 单规则之后的第二扩展）。
// canvas:check 的自有检查覆盖 contrast/键盘/console/aria/别名/溢出六类，
// axe 的 wcag2a+wcag2aa 规则集看得更宽（表单标签、链接名、按钮名、图片
// alt、lang、视口缩放……）——自我口径之外的盲区由它来试。
//
// 门限语义：impact 为 serious/critical 的违例才 fail（moderate 及以下如实
// 记录不拦——best-practice 类噪音如 landmark/region 归 hint，不混入判定）。
// 定位与 adversarial-contrast 相同：本地仪器，npm run adversarial:a11y，
// **不接入 audit-report**（3ced712 的 CI 证伪教训：CI 无浏览器无构建页面）。
//
// Usage: node scripts/adversarial-a11y.mjs [--json] [--selftest] [page.html ...]
// Exit 0 全过（或自测过）；Exit 1 有 serious/critical 违例/自测失败；Exit 2 浏览器不可用。

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonOut = process.argv.includes("--json");
const selftest = process.argv.includes("--selftest");
const pages = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const GATE = new Set(["critical", "serious"]);

let chromium;
let AxeBuilder;
try {
  ({ chromium } = await import("playwright"));
  ({ AxeBuilder } = await import("@axe-core/playwright"));
} catch {
  console.error("playwright/@axe-core/playwright not installed; run npm ci --ignore-scripts first");
  process.exit(2);
}

async function launchBrowser() {
  try { return await chromium.launch({ channel: "chrome" }); } catch { /* fall through */ }
  try { return await chromium.launch(); } catch { return null; }
}

function makeServer() {
  const server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "");
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return server;
}

async function scanPage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // 冻结动画（capture-thumbs 同纪律）：入场动画中间帧会制造时序误报。
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const fmt = (list) => (list ?? []).flatMap((v) => (v.nodes ?? []).map((n) => ({
    id: v.id, impact: v.impact ?? "unknown",
    target: (n.target ?? []).join(" "),
    summary: String(n.failureSummary ?? "").split("\n")[0],
  })));
  const all = fmt(results.violations);
  return {
    page: url.replace(/^https?:\/\/[^/]+/, ""),
    gated: all.filter((n) => GATE.has(n.impact)),
    hints: all.filter((n) => !GATE.has(n.impact)).slice(0, 8),
    incomplete: (results.incomplete ?? []).reduce((n, v) => n + (v.nodes?.length ?? 0), 0),
  };
}

const browser = await launchBrowser();
if (!browser) {
  const msg = "浏览器不可用（channel:chrome 与 bundled chromium 均启动失败）";
  if (jsonOut) console.log(JSON.stringify({ run_status: "incomplete", incomplete_reason: msg, ok: false }, null, 1));
  else console.error(msg);
  process.exit(2);
}

const receipt = { ok: true, engine: "axe-core@wcag2a+wcag2aa", gate: "critical+serious", pages: [] };

if (selftest) {
  // 引擎有效性证明：无可访问名的链接（wcag2a link-name，serious）必须被抓；
  // 干净页必须被放过。夹具选 axe 能出确定判定的形态。
  const server = makeServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const badRel = "output/adversarial-a11y-selftest-bad.html";
  const goodRel = "output/adversarial-a11y-selftest-good.html";
  await writeFile(path.join(ROOT, badRel),
    "<!doctype html><html lang=\"zh\"><head><title>t</title></head><body style=\"background:#141420;color:#e6e6f0\"><main><a href=\"/x\" aria-hidden=\"true\" style=\"display:block;width:80px;height:24px\"></a></main></body></html>", "utf8");
  await writeFile(path.join(ROOT, goodRel),
    // 夹具注意：未设色的 <a> 用 UA 默认蓝（#0000EE）而非继承 body 色——首版
    // 夹具即被 axe 抓出真 contrast 违例（负自测立功第一例）。合规夹具必须
    // 显式设链接色。
    "<!doctype html><html lang=\"zh\"><head><title>t</title></head><body style=\"background:#141420;color:#e6e6f0\"><main><a href=\"/x\" style=\"color:#e6e6f0\">合规链接</a></main></body></html>", "utf8");
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const bad = await scanPage(p, `${base}/${badRel}`);
  const good = await scanPage(p, `${base}/${goodRel}`);
  await ctx.close();
  server.close();
  const caught = bad.gated.length > 0;
  const cleared = good.gated.length === 0;
  receipt.selftest = { caught, cleared, badGated: bad.gated.length, goodGated: good.gated.length };
  receipt.ok = caught && cleared;
  receipt.run_status = receipt.ok ? "complete" : "incomplete";
  if (!receipt.ok) {
    receipt.incomplete_reason = caught ? "axe 未放过合规页（引擎误报）" : `axe 未抓到无障碍名链接夹具（引擎静默，gated=${bad.gated.length}）`;
  }
} else {
  const pageList = pages.length
    ? pages
    : ["output/chain-canvas-workbench.html", "output/canvas-index.html", "output/mini-dashboard.html", "output/site.html"];
  const missing = [];
  for (const page of pageList) {
    try { await readFile(path.join(ROOT, page)); } catch { missing.push(page); }
  }
  if (missing.length) {
    receipt.ok = false;
    receipt.run_status = "incomplete";
    receipt.incomplete_reason = `构建产物缺失：${missing.join(", ")}（本环境未跑 canvas:build——对抗扫描需要已构建页面，详见 3ced712 CI 教训）`;
  } else {
    const server = makeServer();
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const base = `http://127.0.0.1:${server.address().port}`;
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    for (const page of pageList) {
      const r = await scanPage(p, `${base}/${page}`);
      receipt.pages.push(r);
      if (r.gated.length > 0) receipt.ok = false;
    }
    await ctx.close();
    server.close();
    const totalGated = receipt.pages.reduce((n, r) => n + r.gated.length, 0);
    const totalHints = receipt.pages.reduce((n, r) => n + r.hints.length, 0);
    const totalIncomplete = receipt.pages.reduce((n, r) => n + r.incomplete, 0);
    receipt.totals = { gated: totalGated, hints: totalHints, axeIncomplete: totalIncomplete, pages: receipt.pages.length };
    receipt.run_status = receipt.ok ? "complete" : "incomplete";
    receipt.verdict = receipt.ok
      ? `独立引擎 WCAG A/AA 证伪失败：${receipt.pages.length} 页 0 个 serious/critical 违例（${totalHints} 条 moderate 以下提示如实记录，${totalIncomplete} 个 axe 无法判定节点）`
      : `独立引擎发现 ${totalGated} 个 serious/critical 违例（确切节点见 pages[].gated）——自有六类检查与 WCAG 全规则存在真实盲区`;
  }
}
await browser.close();
// 回执持久化（增量 69"持久化要使用"）：真实扫描落 output/，供工作台审计区
// 渲染。自测模式不落盘（夹具噪声不入界面）。
if (!selftest) {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(path.join(ROOT, "output"), { recursive: true });
  await writeFile(path.join(ROOT, "output/adversarial-a11y.json"), JSON.stringify(receipt, null, 1) + "\n", "utf8");
}
if (jsonOut) console.log(JSON.stringify(receipt, null, 1));
else {
  console.log(`adversarial-a11y: run_status=${receipt.run_status}`);
  for (const r of receipt.pages ?? []) {
    console.log(`  ${r.page}: gated=${r.gated.length} hints=${r.hints.length} incomplete=${r.incomplete}`);
    for (const g of r.gated.slice(0, 5)) console.log(`    [${g.impact}] ${g.id} ${g.target} — ${g.summary}`);
  }
  if (receipt.selftest) console.log(`  selftest: caught=${receipt.selftest.caught} cleared=${receipt.selftest.cleared}`);
  if (receipt.verdict) console.log(`  ${receipt.verdict}`);
  if (receipt.incomplete_reason) console.log(`  incomplete_reason: ${receipt.incomplete_reason}`);
}
process.exit(receipt.ok ? 0 : 1);

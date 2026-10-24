#!/usr/bin/env node
// adversarial-contrast — 用独立引擎（axe-core）试图证伪 canvas:check 的
// "文本对比度全部 ≥4.5:1" 断言（增量 67）。两个引擎的差异本身就是信号：
// 自有采样器（check-canvas-a11y.mjs）按选择器白名单取 ≤40 个文本节点、
// 自写背景回溯；axe-core 自己遍历可达文本节点、自己的背景合成算法、
// 大字号 3:1 例外——它能看见白名单外的东西。
//
// 终态契约（同 audit-report）：complete = 独立引擎 0 违例（断言经受住证伪
// 尝试）；incomplete = 存在违例（确切节点如实记录——是否修复属裁决，脚本
// 不自动改样式）。--selftest 是引擎有效性证明：喂一个必违例页 + 一个必
// 通过页，axe 必须抓到前者、放过后者，否则引擎静默即测试无效。
//
// Usage: node scripts/adversarial-contrast.mjs [--json] [--selftest] [page.html ...]
// Exit 0 全部通过（或自测通过）；Exit 1 有违例/自测失败；Exit 2 浏览器不可用。

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonOut = process.argv.includes("--json");
const selftest = process.argv.includes("--selftest");
const pages = process.argv.slice(2).filter((a) => !a.startsWith("--"));

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
  // 与 check-canvas-a11y 同款：优先系统 Chrome，回退 bundled chromium。
  try { return await chromium.launch({ channel: "chrome" }); } catch { /* fall through */ }
  try { return await chromium.launch(); } catch { return null; }
}

// Throwaway static server for ROOT/output（与 check-canvas-a11y 同构）。
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
  // 冻结动画（capture-thumbs 同纪律）：首跑实测 axe 把入场动画的中间帧判为
  // 违例（行淡入进行中的合成色 #1b1b27~#78788b），终态全部达标——这是引擎
  // 时序误报类，不是页面缺陷。扫描前禁用动画/过渡，量的是终态。
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
  const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
  const violations = results.violations ?? [];
  const nodes = violations.flatMap((v) => (v.nodes ?? []).map((n) => ({
    target: (n.target ?? []).join(" "),
    summary: String(n.failureSummary ?? "").split("\n")[0],
  })));
  return {
    page: url.replace(/^https?:\/\/[^/]+/, ""),
    axePassed: (results.passes ?? []).reduce((n, p) => n + (p.nodes?.length ?? 0), 0),
    // axe 无法判定的节点（如白底白字它返回 incomplete 而非 violation——引擎
    // 盲区本身是数据）：不计入违例，但如实计数浮出，双引擎互证才完整。
    axeIncomplete: (results.incomplete ?? []).reduce((n, v) => n + (v.nodes?.length ?? 0), 0),
    violations: nodes.length,
    samples: nodes.slice(0, 5),
  };
}

const browser = await launchBrowser();
if (!browser) {
  const msg = "浏览器不可用（channel:chrome 与 bundled chromium 均启动失败）";
  if (jsonOut) console.log(JSON.stringify({ run_status: "incomplete", incomplete_reason: msg, ok: false }, null, 1));
  else console.error(msg);
  process.exit(2);
}

const receipt = { ok: true, engine: "axe-core@color-contrast", pages: [] };

if (selftest) {
  // 引擎有效性证明：必违例页（#777 on #fff ≈ 4.48:1，axe 确定性 violation）
  // 必须被抓，必通过页（#f2f2f2 on #111）必须被放过。不用白底白字做夹具：
  // 实测 axe 对 fg==bg 返回 incomplete 而非 violation（引擎盲区，2026-10-24
  // 负自测抓到），夹具必须选引擎能出确定判定的形态。
  const server = makeServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const badRel = "output/adversarial-contrast-selftest-bad.html";
  const goodRel = "output/adversarial-contrast-selftest-good.html";
  await writeFile(path.join(ROOT, badRel),
    "<!doctype html><html lang=\"zh\"><head><title>t</title></head><body style=\"background:#ffffff\"><p style=\"color:#777777;background:#ffffff\">contrast selftest bad 4.48to1</p></body></html>", "utf8");
  await writeFile(path.join(ROOT, goodRel),
    "<!doctype html><html lang=\"zh\"><head><title>t</title></head><body style=\"background:#111111\"><p style=\"color:#f2f2f2;background:#111111\">contrast selftest good</p></body></html>", "utf8");
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const bad = await scanPage(p, `${base}/${badRel}`);
  const good = await scanPage(p, `${base}/${goodRel}`);
  await ctx.close();
  server.close();
  const caught = bad.violations > 0;
  const cleared = good.violations === 0;
  receipt.selftest = { caught, cleared, badViolations: bad.violations, goodViolations: good.violations };
  receipt.ok = caught && cleared;
  receipt.run_status = receipt.ok ? "complete" : "incomplete";
  if (!receipt.ok) {
    receipt.incomplete_reason = caught ? "axe 未放过合规页（引擎误报）" : `axe 未抓到必违例页（引擎静默，violations=${bad.violations}）`;
  }
} else {
  const pageList = pages.length
    ? pages
    : ["output/chain-canvas-workbench.html", "output/canvas-index.html", "output/mini-dashboard.html", "output/site.html"];
  const server = makeServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  for (const page of pageList) {
    const r = await scanPage(p, `${base}/${page}`);
    receipt.pages.push(r);
    if (r.violations > 0) receipt.ok = false;
  }
  await ctx.close();
  server.close();
  const totalViolations = receipt.pages.reduce((n, r) => n + r.violations, 0);
  const totalPassed = receipt.pages.reduce((n, r) => n + r.axePassed, 0);
  const totalIncomplete = receipt.pages.reduce((n, r) => n + (r.axeIncomplete ?? 0), 0);
  receipt.totals = { violations: totalViolations, axePassed: totalPassed, axeIncomplete: totalIncomplete, pages: receipt.pages.length };
  receipt.run_status = receipt.ok ? "complete" : "incomplete";
  receipt.verdict = receipt.ok
    ? `独立引擎证伪失败：axe 在 ${receipt.pages.length} 页扫过 ${totalPassed} 个文本节点，0 个 color-contrast 违例（另有 ${totalIncomplete} 个 axe 无法判定节点如实记录）——自有断言经受住对抗重测`
    : `独立引擎发现 ${totalViolations} 个违例（确切节点见 pages[].samples；另有 ${totalIncomplete} 个 axe 无法判定节点）——自有采样器与 axe 口径存在真实差异`;
}
await browser.close();
if (jsonOut) console.log(JSON.stringify(receipt, null, 1));
else {
  console.log(`adversarial-contrast: run_status=${receipt.run_status}`);
  for (const r of receipt.pages ?? []) console.log(`  ${r.page}: violations=${r.violations} axePassed=${r.axePassed}`);
  if (receipt.selftest) console.log(`  selftest: caught=${receipt.selftest.caught} cleared=${receipt.selftest.cleared}`);
  if (receipt.verdict) console.log(`  ${receipt.verdict}`);
  if (receipt.incomplete_reason) console.log(`  incomplete_reason: ${receipt.incomplete_reason}`);
}
process.exit(receipt.ok ? 0 : 1);

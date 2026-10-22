#!/usr/bin/env node
// capture-thumbs — screenshot every artifact page for the wall's thumbnails.
//
// 产物墙此前是纯文字条目；墙条目现在携带真实构建时截图（增量 60，trending
// 墙形态的可用性参照）。截图是"构建时快照"：canvas:build 在渲染全部页面后
// 运行本脚本，产物进 output/thumbs/ 并随 distribute 进 showcase。
//
// Usage: node scripts/capture-thumbs.mjs [--json]
// Self-referential artifacts (no viewUrl) get a self-portrait from their own
// page. Pages missing on disk are recorded as skipped, not failures.

import { createServer } from "node:http";
import { readFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "output");
const THUMBS = path.join(OUT, "thumbs");
const SELF_PORTRAIT = { "canvas-index-hub": "canvas-index.html" };

const server = createServer(async (req, res) => {
  try {
    const rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "");
    const file = path.join(OUT, rel);
    if (!file.startsWith(OUT)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright not installed; run npm ci --ignore-scripts first");
  process.exit(2);
}

const artifacts = JSON.parse(await readFile(path.join(ROOT, "canvas", "artifacts.json"), "utf8")).artifacts;
const pagesOnDisk = new Set(await readdir(OUT));
await mkdir(THUMBS, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const captured = [];
const skipped = [];
for (const a of artifacts) {
  const page = a.viewUrl ?? SELF_PORTRAIT[a.id];
  if (!page) { skipped.push({ id: a.id, why: "无 viewUrl 且非自指产物" }); continue; }
  if (!pagesOnDisk.has(page)) { skipped.push({ id: a.id, why: `页面不存在: ${page}` }); continue; }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/${page}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(400); // 让描边动画/字体就位（截图是快照，非验收）
  const file = path.join(THUMBS, `${a.id}.png`);
  await p.screenshot({ path: file, fullPage: false });
  captured.push({ id: a.id, page, file: path.relative(ROOT, file) });
  await ctx.close();
}
await browser.close();
server.close();

const receipt = { ok: captured.length > 0, captured: captured.length, skipped };
if (process.argv.includes("--json")) console.log(JSON.stringify(receipt, null, 1));
else {
  for (const c of captured) console.log(`thumb: ${c.id} ← ${c.page}`);
  for (const s of skipped) console.log(`skip: ${s.id}（${s.why}）`);
  console.log(`thumbs: ${captured.length} captured → output/thumbs/`);
}
process.exit(receipt.ok ? 0 : 1);

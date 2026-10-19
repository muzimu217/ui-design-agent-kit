#!/usr/bin/env node
// check-canvas-a11y — browser-measured acceptance for canvas pages: WCAG
// contrast on real computed styles + keyboard tab-order reachability + console
// error collection. Serves the pages over a throwaway local HTTP server (file://
// is not a browser-testing protocol here) and reports a machine-readable receipt.
//
// Usage: node canvas/check-canvas-a11y.mjs [page.html ...]
// Exit 0 with all-clear receipt; exit 1 when any check fails.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["output/chain-canvas-workbench.html", "output/canvas-index.html", "output/mini-dashboard.html", "output/site.html"];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright not installed; run npm ci --ignore-scripts first");
  process.exit(2);
}

// Throwaway static server for ROOT/output.
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
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// Prefer the system Chrome (no bundled-browser download needed); fall back
// to the bundled chromium when the system channel is unavailable.
let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}
const receipt = { ok: true, pages: [] };

// Data guard — the wall's evidence registry must stay machine-checkable:
// every artifact carries all six dimensions, each dimension's prose matches
// the measured-keyword contract (guards the 2026-10-17 reducedMotion wording
// miss), and a structured compare score (when present) has a full us/them
// vector over 0/1/null plus an inspection level. --guard-fixture points the
// guard at an alternate file for self-testing; --data-only skips the browser.
const SIX_KEYS = ["desktop", "mobile", "keyboard", "contrast", "reducedMotion", "console"];
const MEASURED_RE = /通过|实测|直拍|可达|全过/;
const fixtureIdx = process.argv.indexOf("--guard-fixture");
const guardSource = fixtureIdx > -1 ? process.argv[fixtureIdx + 1] : path.join(ROOT, "canvas", "artifacts.json");
const dataOnly = process.argv.includes("--data-only");
const dataIssues = [];
try {
  const artifacts = JSON.parse(await readFile(guardSource, "utf8"));
  (artifacts.artifacts ?? []).forEach((a, i) => {
    const id = a.id ?? `#${i}`;
    const sd = a.sixDim ?? {};
    for (const k of SIX_KEYS) {
      if (!(k in sd)) dataIssues.push(`${id}: sixDim 缺 ${k}`);
      else if (!MEASURED_RE.test(String(sd[k]))) dataIssues.push(`${id}: sixDim.${k} 未含判定关键词（通过/实测/直拍/可达/全过）`);
    }
    const s = a.compare?.score;
    if (s) {
      for (const side of ["us", "them"]) {
        const m = s[side];
        if (!m || typeof m !== "object") { dataIssues.push(`${id}: compare.score.${side} 缺失`); continue; }
        for (const k of SIX_KEYS) if (!(k in m) || ![0, 1, null].includes(m[k])) dataIssues.push(`${id}: compare.score.${side}.${k} 非法（须 0/1/null）`);
      }
      if (!s.level) dataIssues.push(`${id}: compare.score 缺检视级别 level`);
    }
  });
} catch (e) {
  dataIssues.push(`artifacts 数据解析失败: ${e.message}`);
}
if (dataIssues.length) receipt.ok = false;
receipt.dataGuard = { ok: dataIssues.length === 0, source: path.relative(ROOT, guardSource) || guardSource, issues: dataIssues };

for (const page of dataOnly ? [] : pages) {
  const bg = { chromium, ctx: null, pageObj: null };
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const consoleErrors = [];
  p.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  p.on("pageerror", (err) => consoleErrors.push(String(err)));

  const url = `${base}/${page}`;
  await p.goto(url, { waitUntil: "domcontentloaded" });

  // Contrast on real computed styles of text-bearing elements.
  const contrast = await p.evaluate(() => {
    const parse = (c) => {
      const m = (c || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? [+m[1], +m[2], +m[3]] : null;
    };
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (fg, bgc) => {
      const a = lum(fg), b = lum(bgc);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const bodyBg = parse(getComputedStyle(document.body).backgroundColor) ?? [10, 10, 15];
    const samples = [];
    const nodes = document.querySelectorAll("h1, h2, p, summary, .raw, .k, .v, .st, .snote, .round, footer, code");
    let i = 0;
    for (const el of nodes) {
      if (i >= 40) break;
      const text = (el.textContent || "").trim();
      if (!text) continue;
      // effective panel background: nearest ancestor with non-transparent bg
      let bgc = bodyBg, node = el;
      while (node && node !== document.body) {
        const c = parse(getComputedStyle(node).backgroundColor);
        const alpha = (getComputedStyle(node).backgroundColor.match(/rgba\([^)]*,\s*([\d.]+)\)/) ?? [])[1];
        if (c && alpha !== "0") { bgc = c; break; }
        node = node.parentElement;
      }
      const fg = parse(getComputedStyle(el).color);
      if (!fg) continue;
      samples.push({ tag: el.tagName.toLowerCase(), ratio: +ratio(fg, bgc).toFixed(2), text: text.slice(0, 24) });
      i++;
    }
    const below = samples.filter((s) => s.ratio < 4.5);
    return { checked: samples.length, below };
  });

  // Keyboard: tab through the page, record focusable sequence.
  const total = await p.evaluate(() => document.querySelectorAll("summary, a[href], button").length);
  const seen = [];
  for (let k = 0; k < Math.min(total + 4, 30); k++) {
    await p.keyboard.press("Tab");
    const cur = await p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return { tag: el.tagName.toLowerCase(), label: (el.textContent || el.getAttribute("href") || "").trim().slice(0, 30) };
    });
    if (!cur) break;
    seen.push(cur);
  }

  const pageResult = {
    page,
    contrast,
    keyboard: { focusableTotal: total, tabbed: seen.length, sample: seen.slice(0, 6) },
    consoleErrors,
  };

  // Aria guard — status badges and level pills must carry accessible names and
  // scored tables must state their rubric inline (render-level counterpart of
  // the dataGuard above; guards the 2026-10-18 badge-legend increment).
  const ariaGuard = await p.evaluate(() => {
    const issues = [];
    const labelled = ["badge", "src", "ver", "cmp-level"];
    for (const cls of labelled) {
      document.querySelectorAll(`.${cls}`).forEach((el, i) => {
        if (!(el.getAttribute("aria-label") ?? "").trim()) issues.push(`.${cls}#${i} 缺 aria-label`);
      });
    }
    document.querySelectorAll(".cmp-table").forEach((t, i) => {
      const cap = t.querySelector("caption");
      if (!cap || !cap.textContent.trim()) issues.push(`.cmp-table#${i} 缺非空 caption（评分口径）`);
    });
    const legend = document.querySelector("#wall-legend");
    if (legend !== null && !legend.textContent.trim()) issues.push("#wall-legend 为空");
    return { ok: issues.length === 0, issues };
  });
  pageResult.ariaGuard = ariaGuard;
  if (!ariaGuard.ok) { receipt.ok = false; pageResult.fail = (pageResult.fail ? pageResult.fail + "; " : "") + "aria guard"; }

  // SVG heuristics — knowledge cards icon-single-stroke-constraint and
  // illustration-minimal-constraints turned into NON-BLOCKING hints: count
  // M commands per path (single-stroke) and distinct fill colours (colour
  // count). Hints never fail the receipt; they surface where a page exceeds
  // a constraint so a human decides whether it matters.
  const svgHints = await p.evaluate(() => {
    const hints = [];
    document.querySelectorAll("svg").forEach((svg, si) => {
      svg.querySelectorAll("path").forEach((p, pi) => {
        const d = p.getAttribute("d") ?? "";
        const mCount = (d.match(/M/gi) ?? []).length;
        if (mCount > 1) hints.push(`svg#${si} path#${pi}: ${mCount} 次 M 起笔（单笔约束为 ≤1）`);
      });
      const fills = new Set();
      svg.querySelectorAll("[fill]").forEach((el) => {
        const v = (el.getAttribute("fill") ?? "").trim();
        if (v && v !== "none") fills.add(v);
      });
      if (fills.size > 4) hints.push(`svg#${si}: ${fills.size} 种 fill 颜色（极简插画约束为 ≤4）`);
    });
    return { count: hints.length, hints: hints.slice(0, 8) };
  });
  pageResult.svgHints = svgHints;
  if (contrast.below.length > 0) { receipt.ok = false; pageResult.fail = "contrast below 4.5:1"; }
  if (consoleErrors.length > 0) { receipt.ok = false; pageResult.fail = (pageResult.fail ? pageResult.fail + "; " : "") + "console errors"; }
  receipt.pages.push(pageResult);
  await ctx.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(receipt, null, 1));
process.exit(receipt.ok ? 0 : 1);

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

// Alias names from the knowledge base — pages that render knowledge cards must
// surface every declared alias in their text. Guards the dead-data defect
// class (增量 52 stored alias without rendering it; 增量 53 surfaced it on the
// workbench, 增量 54 on the site; this keeps both surfaces honest).
let kbAliases = [];
try {
  const kbIndex = JSON.parse(await readFile(path.join(ROOT, "docs", "knowledge-base", "index.json"), "utf8"));
  kbAliases = (kbIndex.cards ?? []).map((c) => c.alias).filter(Boolean);
} catch { /* 缺文件时不设别名断言 */ }

for (const page of dataOnly ? [] : pages) {
  const bg = { chromium, ctx: null, pageObj: null };
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const consoleErrors = [];
  p.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  p.on("pageerror", (err) => consoleErrors.push(String(err)));

  const url = `${base}/${page}`;
  await p.goto(url, { waitUntil: "domcontentloaded" });

  // Contrast on real computed styles of text-bearing elements. reg-006 类修复：
  // 旧采样器按选择器白名单取 ≤40 个节点，.sst/.audit-id/超位 .st 徽标从未
  // 入样——axe-core 对抗重测（增量 67）恰好在盲区抓到 10 个真违例。现在改为
  // 全部带直接文本的元素，上限 200 并如实记 truncated 旗标（截断也是数据）。
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
    let truncated = false;
    for (const el of document.querySelectorAll("body *")) {
      if (samples.length >= 200) { truncated = true; break; }
      // 只取"直接持有文本"的元素（文本在子元素里的容器不重复采样）
      const direct = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!direct) continue;
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
      samples.push({ tag: el.tagName.toLowerCase(), cls: String(el.className && el.className.baseVal === undefined ? el.className : "").split(" ")[0] || el.tagName.toLowerCase(), ratio: +ratio(fg, bgc).toFixed(2), text: (el.textContent || "").trim().slice(0, 24) });
    }
    const below = samples.filter((s) => s.ratio < 4.5);
    return { checked: samples.length, truncated, below };
  });

  // Keyboard: tab through the page, record focusable sequence.
  const total = await p.evaluate(() => document.querySelectorAll("summary, a[href], button").length);
  const seen = [];
  // 上限 64（增量 75 类修复）：旧上限 30 曾在页面增长后静默截断 Tab 序列
  // ——"tabbed 30 / total 49"里 19 项从未被走过，"全可达"成了未验证宣称。
  for (let k = 0; k < Math.min(total + 8, 64); k++) {
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
    // 墙条目缩略图（增量 60）：任何 img 必须带 alt 属性（装饰图允许 alt=""，
    // 但不允许缺属性）——墙引入图片后立刻立此契约。
    document.querySelectorAll("img").forEach((el, i) => {
      if (!el.hasAttribute("alt")) issues.push(`img#${i}（${(el.getAttribute("src") ?? "").slice(0, 40)}）缺 alt 属性`);
    });
    return { ok: issues.length === 0, issues };
  });
  pageResult.ariaGuard = ariaGuard;
  if (!ariaGuard.ok) { receipt.ok = false; pageResult.fail = (pageResult.fail ? pageResult.fail + "; " : "") + "aria guard"; }

  // Alias guard — on a page that renders knowledge cards (.kb-table on the
  // workbench, #kb on the site), every .kb-alias chip must be a declared alias
  // carrying the contracted aria-label. Completeness is asserted cross-page
  // after the loop: the workbench intentionally renders only the recent slice,
  // the site renders all cards, so "declared but surfaced nowhere" is the
  // dead-data failure (增量 52 stored alias without rendering it).
  const aliasGuard = await p.evaluate((aliases) => {
    const kbSurface = document.querySelector(".kb-table, #kb");
    if (!kbSurface) return { ok: true, skipped: true, issues: [], present: [] };
    const issues = [];
    const present = [];
    document.querySelectorAll(".kb-alias").forEach((el, i) => {
      const t = (el.textContent ?? "").trim();
      const label = el.getAttribute("aria-label") ?? "";
      if (t && !aliases.includes(t)) issues.push(`.kb-alias#${i} 非声明别名: ${t}`);
      if (!label.startsWith("场景化别名")) issues.push(`.kb-alias#${i} aria-label 非契约格式`);
      if (t) present.push(t);
    });
    return { ok: issues.length === 0, skipped: false, issues, present };
  }, kbAliases);
  pageResult.aliasGuard = aliasGuard;
  if (!aliasGuard.ok) { receipt.ok = false; pageResult.fail = (pageResult.fail ? pageResult.fail + "; " : "") + "alias guard"; }

  // Overflow guard — horizontal scroll at any shipping width means a clipped or
  // overflowing layout. Sweeps real device widths, not just two probes: the
  // 增量 54 version tested only 520/1280 and missed 360/390/414 where the
  // four-column capability table (min-content 413px) burst the page (reg-005).
  const OVERFLOW_WIDTHS = [320, 360, 375, 390, 414, 480, 520, 600, 640, 768, 820, 1024, 1180, 1280, 1440, 1600, 1920];
  const overflowIssues = [];
  for (const w of OVERFLOW_WIDTHS) {
    await p.setViewportSize({ width: w, height: 900 });
    const delta = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (delta > 0) overflowIssues.push(`${w}px 横向溢出 ${delta}px`);
  }
  await p.setViewportSize({ width: 1280, height: 900 });
  const overflowGuard = { ok: overflowIssues.length === 0, widths: OVERFLOW_WIDTHS.length, issues: overflowIssues };
  pageResult.overflowGuard = overflowGuard;
  if (!overflowGuard.ok) { receipt.ok = false; pageResult.fail = (pageResult.fail ? pageResult.fail + "; " : "") + "overflow guard"; }

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

  // Style hints — design-seven-principles as DOM-approximation hints
  // (NON-BLOCKING, same contract as svgHints): Emphasis uniqueness via h1
  // count, Unity via distinct font families and border-radius scales. These
  // are approximations of visual judgement, so they inform, never gate.
  const styleHints = await p.evaluate(() => {
    const hints = [];
    const h1s = document.querySelectorAll("h1").length;
    if (h1s > 1) hints.push(`页面含 ${h1s} 个 h1（Emphasis 唯一性：强调元素 ≤1）`);
    const fonts = new Set();
    document.body.querySelectorAll("*").forEach((el) => {
      const f = getComputedStyle(el).fontFamily;
      if (f) fonts.add(f.split(",")[0].trim().toLowerCase());
    });
    if (fonts.size > 3) hints.push(`页面使用 ${fonts.size} 个字族（Unity：字族 ≤2 档）`);
    const radii = new Set();
    document.querySelectorAll("*").forEach((el) => {
      const r = getComputedStyle(el).borderTopLeftRadius || getComputedStyle(el).borderRadius;
      if (!r || r === "0px") return;
      // 圆（百分比）与胶囊（≥50px）是形状而非档位，豁免
      if (r.includes("%")) return;
      const px = parseFloat(r);
      if (!Number.isNaN(px) && px >= 50) return;
      radii.add(r);
    });
    if (radii.size > 4) hints.push(`页面使用 ${radii.size} 档圆角（Unity：圆角 ≤4 档，圆/胶囊不计）`);
    // 曲线族谱映射（知识卡 motion-curve-soul）：反馈场景元素（button/a）的
    // transition-timing-function 用 linear 时提示——反馈需要 ease-out 族的加速度。
    let linearFeedback = 0;
    document.querySelectorAll("button, a, summary").forEach((el) => {
      const tf = getComputedStyle(el).transitionTimingFunction;
      if (/linear/.test(tf)) linearFeedback += 1;
    });
    if (linearFeedback > 0) hints.push(`${linearFeedback} 个反馈元素（button/a/summary）transition 用 linear（曲线族谱：反馈场景禁 linear，建议 ease-out 族）`);
    return { count: hints.length, hints: hints.slice(0, 8) };
  });
  pageResult.styleHints = styleHints;
  if (contrast.below.length > 0) { receipt.ok = false; pageResult.fail = "contrast below 4.5:1"; }
  if (consoleErrors.length > 0) { receipt.ok = false; pageResult.fail = (pageResult.fail ? pageResult.fail + "; " : "") + "console errors"; }
  receipt.pages.push(pageResult);
  await ctx.close();
}

// Cross-page alias coverage — every declared alias must be surfaced on at
// least one knowledge-card page (the site renders all cards; the workbench a
// recent slice by design). Missing everywhere = dead data, fail the receipt.
// --data-only 模式没有访问任何页面，跨页断言不适用（否则 pages 为空把全部
// 别名误判为缺失，回执恒 false）。
const kbSurfaced = new Set(receipt.pages.flatMap((p) => (p.aliasGuard && !p.aliasGuard.skipped ? p.aliasGuard.present : [])));
const aliasMissing = kbAliases.filter((a) => !kbSurfaced.has(a));
const aliasApplicable = !dataOnly;
receipt.aliasCoverage = { ok: !aliasApplicable || kbAliases.length === 0 || aliasMissing.length === 0, ...(aliasApplicable ? { missing: aliasMissing } : { skipped: "data-only" }) };
if (aliasApplicable && aliasMissing.length) receipt.ok = false;

await browser.close();
server.close();
console.log(JSON.stringify(receipt, null, 1));
process.exit(receipt.ok ? 0 : 1);

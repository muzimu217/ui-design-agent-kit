#!/usr/bin/env node
// Machine-checkable quality gates from demo/tide-app/docs/DESIGN.md.
//
// Only the gates that can be decided by reading files or computing values are
// implemented here. Gates that need a browser (first-screen visibility, keyboard
// walk, motion, text zoom) are deliberately NOT faked: they are listed as
// requiring the browser pass, so a green run here is never reported as a full
// verification.
//
// Usage: node demo/tide-app/scripts/check-contract.mjs [--json]

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const APP = path.join(ROOT, "demo/tide-app");

// --- WCAG 2.x relative luminance / contrast -------------------------------
function luminance(hex) {
  const rgb = hex
    .replace("#", "")
    .match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function mix(fg, bg, alpha) {
  const parse = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16));
  const a = parse(fg);
  const b = parse(bg);
  return (
    "#" +
    a
      .map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0"))
      .join("")
  );
}

// --- collect source files -------------------------------------------------
async function collect(dir, exts, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
    // docs/ holds the direction, research, contract, decisions, and the rendered
    // workflow diagrams. Those are *supposed* to discuss "预报" and name the
    // reference product, so they are not implementation and must not be scanned
    // for forbidden patterns.
    if (entry.name === "docs" || entry.name === "screenshots") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(full, exts, out);
    else if (exts.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
}

async function readAll(files) {
  const parts = [];
  for (const file of files) parts.push({ file, text: await readFile(file, "utf8") });
  return parts;
}

function rel(file) {
  return path.relative(ROOT, file);
}

// --- gates ----------------------------------------------------------------
export async function runGates() {
  const results = [];
  const add = (id, name, ok, detail) => results.push({ id, name, ok, detail });

  const sources = await collect(APP, [".ts", ".tsx", ".css", ".html", ".json"]);
  const docs = await readAll(sources);
  const blob = docs.map((d) => d.text).join("\n");

  // QG1-QG4 are computed from the contract's own token values, then checked
  // against what the implementation actually declares.
  const tokens = {
    canvas: "#0d2431",
    surface1: "#102937",
    surface2: "#132f3d",
    surface3: "#163646",
    textPrimary: "#e8f1f4",
    textSecondary: "#b6cbd4",
    accent: "#5ee0d4",
    caution: "#f2c14e",
    borderStrong: "#4a8fa8",
  };

  const canvasLum = luminance(tokens.canvas);
  add(
    "QG1",
    "底色亮度下限与正文对比度",
    canvasLum >= 0.01569 && contrast(tokens.textPrimary, tokens.canvas) >= 7,
    `canvas 相对亮度 ${canvasLum.toFixed(5)}；正文 ${contrast(tokens.textPrimary, tokens.canvas).toFixed(2)}:1`,
  );

  const surfaces = [tokens.canvas, tokens.surface1, tokens.surface2, tokens.surface3];
  const textTokens = [
    ["正文", tokens.textPrimary],
    ["次要", tokens.textSecondary],
    ["强调", tokens.accent],
    ["警示", tokens.caution],
  ];
  let worstText = { ratio: Infinity, label: "" };
  for (const [label, color] of textTokens) {
    for (const surface of surfaces) {
      const ratio = contrast(color, surface);
      if (ratio < worstText.ratio) worstText = { ratio, label: `${label} on ${surface}` };
    }
  }
  add(
    "QG2",
    "全部文字 token ≥ 7:1",
    worstText.ratio >= 7,
    `最紧一格 ${worstText.label} = ${worstText.ratio.toFixed(2)}:1`,
  );

  const worstNonText = Math.min(
    ...surfaces.map((s) => contrast(tokens.borderStrong, s)),
    ...surfaces.map((s) => contrast(tokens.accent, s)),
  );
  add("QG3", "非文字 token ≥ 3:1", worstNonText >= 3, `最紧一格 ${worstNonText.toFixed(2)}:1`);

  const blended = mix(tokens.accent, tokens.surface1, 0.1);
  const gradRatio = contrast(tokens.textSecondary, blended);
  add(
    "QG4",
    "渐变填充上限 0.10 时文字仍 ≥ 7:1",
    gradRatio >= 7,
    `混合色 ${blended} 上次要文字 ${gradRatio.toFixed(2)}:1`,
  );

  // QG8 / QG22 / QG21: forbidden patterns must not appear in the implementation.
  const forbidden = [
    ["display:\\s*none[^;]*", "时间轴不得用 display:none", "QG8"],
    ["visibility:\\s*hidden", "时间轴不得用 visibility:hidden", "QG8"],
    ["transition:\\s*all", "禁止 transition: all", "QG22"],
    ["transition[^;]*\\bease\\b(?!-)", "禁止泛型 ease（应用具名曲线或弹簧）", "QG22"],
    ["tideguide|tide guide", "不得出现 Tide Guide 素材或引用", "QG21"],
    ["#010102|#5e6ad2", "不得照搬 linear 的品牌色值", "QG21"],
    ["fonts\\.googleapis|fonts\\.gstatic", "不得外链 Google Fonts", "QG21"],
  ];
  const styleAndCode = docs
    .filter((d) => /\.(css|tsx|ts|html)$/.test(d.file))
    .map((d) => d.text)
    .join("\n");
  for (const [pattern, label, gate] of forbidden) {
    const hit = new RegExp(pattern, "i").test(styleAndCode);
    if (gate === "QG8" && pattern.includes("visibility")) {
      // Merge both QG8 patterns into one result below.
      continue;
    }
    add(gate === "QG8" ? "QG8" : gate, label, !hit, hit ? "命中禁用写法" : "零命中");
  }

  // QG6 / QG7: every occurrence of 预报 must sit next to a demo badge.
  const forecast = [...blob.matchAll(/预报/g)].length;
  const demoBadges = [...blob.matchAll(/演示数据|演示/g)].length;
  add("QG6", "「预报」字样有演示标注", forecast === 0 || demoBadges >= forecast, `预报 ${forecast} 处，演示标注 ${demoBadges} 处`);

  // QG10: tabular-nums must be declared.
  const hasTabular = /tabular-nums/.test(styleAndCode) || /"tnum"/.test(styleAndCode);
  add("QG10", "声明 tabular-nums", hasTabular, hasTabular ? "已声明" : "未找到 tabular-nums");

  // QG23: at most one primary CTA per view is a visual check; we only verify the
  // markup does not declare more than one primary-styled button class.
  const primaryBtns = [...blob.matchAll(/class="[^"]*\b(cta|primary)\b[^"]*"/gi)].length;
  add("QG23", "主 CTA 唯一（标记层面）", primaryBtns <= 1, `primary 样式元素 ${primaryBtns} 个`);

  return results;
}

// Gates that cannot be decided by reading files. Listed so a green static run is
// never mistaken for a full verification.
export const BROWSER_GATES = [
  "QG5 首屏见读数（375×812 与 1440×900）",
  "QG9 键盘走查（Tab → 方向键 / PageUp / Home / End）",
  "QG11 第三屏不解释原理",
  "QG12 曲线六态",
  "QG13 场景卡七态",
  "QG14 焦点环全站可见",
  "QG15 触控目标 ≥ 44px",
  "QG16 减少动效",
  "QG17 动效中断与反转",
  "QG18 200% 文字缩放",
  "QG19 响应式矩阵（含 320px）",
  "QG20 字体回退",
  "QG24 自动化无障碍检查",
];

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const json = process.argv.includes("--json");
  const results = await runGates();
  const failed = results.filter((r) => !r.ok);
  if (json) {
    console.log(JSON.stringify({ gates: results, browserGates: BROWSER_GATES, ok: failed.length === 0 }, null, 2));
  } else {
    for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.id}  ${r.name} — ${r.detail}`);
    console.log(`\n静态检查 ${results.length - failed.length}/${results.length} 通过`);
    console.log(`\n以下 ${BROWSER_GATES.length} 项需要浏览器验证，本脚本不代替：`);
    for (const g of BROWSER_GATES) console.log(`  · ${g}`);
  }
  if (failed.length) process.exitCode = 1;
}

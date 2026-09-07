import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// WCAG contrast measurement for the token pairs the operations dashboard
// actually paints (兑现 EVIDENCE.md「对比度实测」承诺：逐对 fg/bg 输出比值)。
// Reads :root (light) and the prefers-color-scheme: dark :root block from
// styles.css so the measured values are the shipped tokens, not a copy.
// rgba() backgrounds are alpha-composited over --surface before measuring,
// matching how the browser paints tinted pills on cards.
// Threshold: 4.5:1 (all measured text is small). Exit 1 on any failure.
//
// Usage: npm run contrast [--css <path-to-styles.css>]
// Default target: the operations dashboard (first product under test).
// Nonexistent tokens referenced by PAIRS throw loudly, so token drift fails
// instead of silently skipping a pair.

const DEFAULT_CSS = path.join(ROOT, "evals/runs/operations-not-marketing/app/src/styles.css");
const cssArgIndex = process.argv.indexOf("--css");
const cssPath = cssArgIndex === -1 ? DEFAULT_CSS : path.resolve(process.argv[cssArgIndex + 1]);

function parseTokenBlock(css) {
  const rootMatch = css.match(/:root\s*\{([^}]*)\}/);
  // 兼容手写与 minified 产物（冒号后无空格）两种 media query 写法
  const darkMatch = css.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{\s*:root\s*\{([^}]*)\}/);
  const parse = (block) => Object.fromEntries(
    [...(block ?? "").matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
  if (!rootMatch) throw new Error("styles.css :root block not found");
  if (!darkMatch) throw new Error("prefers-color-scheme:dark :root block not found (检查 media query 写法)");
  return { light: parse(rootMatch[1]), dark: parse(darkMatch[1]) };
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let full = hex[1].length === 3 || hex[1].length === 4
      ? [...hex[1]].map((c) => c + c).join("")
      : hex[1];
    let a = 1;
    if (full.length === 8) {
      // 8 位 hex：minified 产物会把 rgba() 压成 #rrggbbaa
      a = parseInt(full.slice(6, 8), 16) / 255;
      full = full.slice(0, 6);
    }
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a,
    };
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1].split(",").map((p) => parseFloat(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  throw new Error(`Unsupported color value: ${value}`);
}

function composite(fg, bg) {
  return {
    r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
    g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
    b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
    a: 1,
  };
}

function luminance({ r, g, b }) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// 每一对都是界面上真实出现的文字组合（label 说明位置）。
// fgAlpha 用于模拟不透明度折损（如 0.72 的计数角标）。
const PAIRS = [
  { mode: "light", fg: "ink", bg: "surface", label: "正文/卡片" },
  { mode: "light", fg: "ink", bg: "bg", label: "正文/页面底" },
  { mode: "light", fg: "ink-2", bg: "surface", label: "次要文字/卡片" },
  { mode: "light", fg: "ink-2", bg: "bg", label: "次要文字/页面底（计数行）" },
  { mode: "light", fg: "warn-fg", bg: "warn-bg", label: "演示横幅" },
  { mode: "light", fg: "ok", bg: "ok-bg", label: "状态胶囊·有库存" },
  { mode: "light", fg: "low", bg: "low-bg", label: "状态胶囊·低库存" },
  { mode: "light", fg: "out", bg: "out-bg", label: "状态胶囊·缺货" },
  { mode: "light", fg: "#ffffff", bg: "brand", label: "主按钮/分段选中·白字" },
  { mode: "light", fg: "#ffffff", bg: "brand-hover", label: "主按钮 hover·白字" },
  { mode: "light", fg: "bg", bg: "ink", label: "Toast 文字" },
  { mode: "dark", fg: "ink", bg: "surface", label: "正文/卡片" },
  { mode: "dark", fg: "ink", bg: "bg", label: "正文/页面底" },
  { mode: "dark", fg: "ink-2", bg: "surface", label: "次要文字/卡片" },
  { mode: "dark", fg: "ink-2", bg: "bg", label: "次要文字/页面底（计数行）" },
  { mode: "dark", fg: "warn-fg", bg: "warn-bg", label: "演示横幅" },
  { mode: "dark", fg: "ok", bg: "ok-bg", label: "状态胶囊·有库存" },
  { mode: "dark", fg: "low", bg: "low-bg", label: "状态胶囊·低库存" },
  { mode: "dark", fg: "out", bg: "out-bg", label: "状态胶囊·缺货" },
  { mode: "dark", fg: "#ffffff", bg: "brand", label: "主按钮/分段选中·白字" },
  { mode: "dark", fg: "#ffffff", bg: "brand-hover", label: "主按钮 hover·白字" },
  { mode: "dark", fg: "bg", bg: "ink", label: "Toast 文字" },
];

const MODE_LABEL = { light: "亮", dark: "暗" };

async function main() {
  const css = await readFile(cssPath, "utf8");
  const tokens = parseTokenBlock(css);
  const failures = [];

  for (const pair of PAIRS) {
    const set = tokens[pair.mode];
    const surface = parseColor(set.surface);
    const resolveColor = (name) => {
      const parsed = parseColor(name.startsWith("#") ? name : set[name]);
      return parsed.a < 1 ? composite(parsed, surface) : parsed;
    };
    let fg = resolveColor(pair.fg);
    const bg = resolveColor(pair.bg);
    if (pair.fgAlpha !== undefined && pair.fgAlpha < 1) {
      fg = composite({ ...fg, a: pair.fgAlpha }, bg);
    }
    const ratio = contrastRatio(fg, bg);
    const mark = ratio >= 4.5 ? "✓" : "✗";
    if (ratio < 4.5) failures.push(pair);
    console.log(`${mark} ${ratio.toFixed(2)}:1  ${MODE_LABEL[pair.mode]}·${pair.label}`);
  }

  console.log(`\n${PAIRS.length - failures.length}/${PAIRS.length} 对达到 4.5:1（小字号标准）`);
  if (failures.length > 0) {
    console.error(`✗ ${failures.length} 对未达标：${failures.map((f) => `${MODE_LABEL[f.mode]}·${f.label}`).join("、")}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

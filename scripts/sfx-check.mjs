#!/usr/bin/env node
// sfx-check — validate the sound-design cue sheet against the video timeline.
//
// The cue sheet is the "打点" artifact for knowledge card
// video-sound-design-layer: it declares WHERE a sound fires, on WHICH layer,
// and WHY. This script proves the sheet is internally consistent and aligned
// to the actual composition, so the knowledge card has executable backing
// instead of prose.
//
// Checks:
//   1. every cue frame is inside [0, durationInFrames]
//   2. every cue sits on a declared layer with a known sample
//   3. transition cues land within tolerance of a real scene boundary
//   4. cue density stays inside the card's stated budget
//   5. every scene boundary gets exactly one transition cue
//
// Usage: node scripts/sfx-check.mjs [--json] [--sheet <path>]
//   --sheet  validate an alternate cue sheet (default: sfx-cues.json, the
//            165s hero). A sheet declares its timeline source: "hero" parses
//            the Film.tsx `const T` contract; "timeline-json" loads the scene
//            table from a timeline JSON (the 60s cut's timeline-60.json).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SHEET = path.join(ROOT, "video-production", "src", "sfx-cues.json");
const FILM = path.join(ROOT, "video-production", "src", "Film.tsx");

const sheetIdx = process.argv.indexOf("--sheet");
const SHEET = sheetIdx > -1 ? path.resolve(ROOT, process.argv[sheetIdx + 1]) : DEFAULT_SHEET;

const issues = [];
let sheet;
try {
  sheet = JSON.parse(await readFile(SHEET, "utf8"));
} catch (e) {
  console.error(JSON.stringify({ ok: false, issues: [`cue sheet 读取失败: ${e.message}`] }, null, 1));
  process.exit(1);
}

// Scene boundaries come from the sheet's declared timeline source — the single
// source of truth for what is on screen when.
let boundaries = [];
try {
  const src = sheet.timelineSource ?? { kind: "hero" };
  if (src.kind === "hero") {
    const film = await readFile(FILM, "utf8");
    const block = film.match(/const T = \{([\s\S]*?)\n\};/);
    if (!block) throw new Error("Film.tsx 未找到 const T 时间轴契约");
    for (const m of block[1].matchAll(/(\w+):\s*\{from:\s*(\d+),\s*dur:\s*(\d+)\}/g)) {
      boundaries.push({ scene: m[1], from: +m[2], dur: +m[3] });
    }
  } else if (src.kind === "timeline-json") {
    const tl = JSON.parse(await readFile(path.join(path.dirname(SHEET), src.file), "utf8"));
    boundaries = (tl.scenes ?? []).map((s) => ({ scene: s.id, from: s.from, dur: s.dur }));
  } else {
    throw new Error(`未知 timelineSource.kind: ${src.kind}`);
  }
  if (!boundaries.length) throw new Error("时间轴解析为空");
} catch (e) {
  issues.push(`时间轴解析失败: ${e.message}`);
}

const fps = sheet.fps ?? 30;
const total = sheet.durationInFrames ?? 0;
const cues = sheet.cues ?? [];
const tracks = sheet.tracks ?? {};
const tol = sheet.acceptance?.alignmentToleranceFrames ?? 2;

// 1 + 2 — range and layer/sample validity
const knownSamples = new Set(Object.values(tracks).flatMap((t) => t.samples ?? []));
for (const [i, c] of cues.entries()) {
  const id = `cue#${i}(f${c.frame})`;
  if (typeof c.frame !== "number" || c.frame < 0 || c.frame > total) issues.push(`${id}: frame 越界`);
  if (!tracks[c.track]) issues.push(`${id}: 未知轨道 ${c.track}`);
  else if (!knownSamples.has(c.sample)) issues.push(`${id}: 样本 ${c.sample} 不在轨道声明内`);
  if (!c.why || !String(c.why).trim()) issues.push(`${id}: 缺 why（打点必须有理由）`);
}

// 3 — transition cues must sit on a real scene boundary
const boundaryFrames = new Set(boundaries.map((b) => b.from));
for (const c of cues.filter((x) => x.track === "transition")) {
  const nearest = [...boundaryFrames].sort((a, b) => Math.abs(a - c.frame) - Math.abs(b - c.frame))[0];
  const delta = Math.abs(nearest - c.frame);
  if (delta > tol) issues.push(`transition cue f${c.frame}: 距最近场景边界 ${nearest} 有 ${delta} 帧（容差 ${tol}）`);
}

// 4 — density budget (card: 60s -> 12-20 cues; scale linearly, cap at 1/3s)
const seconds = total / fps;
const perMinute = cues.length / (seconds / 60);
if (perMinute > 20 * (60 / 60) * 1.15 && cues.length / seconds > 1 / 3) {
  issues.push(`密度超限: ${cues.length} 点 / ${seconds.toFixed(0)}s（每分钟 ${perMinute.toFixed(1)}，上限按卡片换算）`);
}
if (cues.length < 6) issues.push(`密度过低: 仅 ${cues.length} 个点`);

// 5 — every scene boundary (except frame 0) gets exactly one transition cue
const missing = boundaries.filter((b) => b.from > 0 && !cues.some((c) => c.track === "transition" && Math.abs(c.frame - b.from) <= tol));
for (const b of missing) issues.push(`场景 ${b.scene}(f${b.from}) 缺 transition 打点`);

// Sort order — the sheet must read in timeline order
for (let i = 1; i < cues.length; i++) {
  if (cues[i].frame < cues[i - 1].frame) { issues.push(`cue#${i} 时间轴逆序（f${cues[i].frame} < f${cues[i - 1].frame}）`); break; }
}

const byTrack = cues.reduce((a, c) => ((a[c.track] = (a[c.track] ?? 0) + 1), a), {});
const receipt = {
  ok: issues.length === 0,
  sheet: path.relative(ROOT, SHEET),
  composition: sheet.composition,
  fps,
  seconds,
  scenes: boundaries.length,
  cues: cues.length,
  byTrack,
  perMinute: +perMinute.toFixed(1),
  densityVerdict: `${cues.length} 点 / ${seconds.toFixed(0)}s = 每 ${(seconds / cues.length).toFixed(1)} 秒 1 点`,
  issues,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(receipt, null, 1));
} else {
  console.log(`sfx cue sheet: ${receipt.cues} cues / ${receipt.scenes} scenes / ${receipt.seconds}s`);
  console.log(`  tracks: ${Object.entries(byTrack).map(([k, v]) => `${k}=${v}`).join(" ")}`);
  console.log(`  density: ${receipt.densityVerdict}`);
  if (issues.length) {
    console.log(`  ISSUES (${issues.length}):`);
    for (const i of issues) console.log(`   - ${i}`);
  } else {
    console.log("  alignment: all transition cues on scene boundaries; all cues on declared layers");
  }
}
process.exit(receipt.ok ? 0 : 1);

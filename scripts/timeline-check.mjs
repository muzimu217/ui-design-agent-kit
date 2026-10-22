#!/usr/bin/env node
// timeline-check — validate the 60s composition contract
// (video-production/src/timeline-60.json) against the 165s hero timeline
// (Film.tsx `const T`). The 60s cut is the delivery-form second length from
// knowledge card video-sixty-second-delivery-form; this script proves the
// contract is a real re-edit, not prose:
//
//   1. totals: declared duration matches the scene table exactly
//   2. continuity: first scene starts at 0; no gaps, no overlaps
//   3. scene ids all exist in the hero timeline registry (shared skeleton)
//   4. scene order matches the hero order (re-edit = subset + trim, not shuffle)
//   5. trim-only: every scene dur <= its hero dur
//   6. captions: bounds inside the composition, inside a single scene span,
//      non-empty text, known accent, no overlap between captions
//   7. re-hook budget: >= 5 cut points (knowledge card: 60s needs >= 5)
//
// Usage: node scripts/timeline-check.mjs [--json]
// Exit 0 all green; 1 any violation.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TL = path.join(ROOT, "video-production", "src", "timeline-60.json");
const FILM = path.join(ROOT, "video-production", "src", "Film.tsx");
const ACCENTS = new Set(["cyan", "violet", "warn", "ok", "red"]);

const issues = [];
const tl = JSON.parse(await readFile(TL, "utf8"));

// Hero timeline registry
const film = await readFile(FILM, "utf8");
const block = film.match(/const T = \{([\s\S]*?)\n\};/);
if (!block) { console.error(JSON.stringify({ ok: false, issues: ["Film.tsx 未找到 const T 时间轴契约"] })); process.exit(1); }
const hero = new Map();
for (const m of block[1].matchAll(/(\w+):\s*\{from:\s*(\d+),\s*dur:\s*(\d+)\}/g)) hero.set(m[1], { from: +m[2], dur: +m[3] });

const scenes = tl.scenes ?? [];
const total = tl.durationInFrames ?? 0;
const fps = tl.fps ?? 30;

// 1 — totals
const sum = scenes.reduce((a, s) => a + s.dur, 0);
if (sum !== total) issues.push(`场景时长合计 ${sum} ≠ 声明总时长 ${total}`);
if (scenes.at(-1).from + scenes.at(-1).dur !== total) issues.push(`末场景终点 ${scenes.at(-1).from + scenes.at(-1).dur} ≠ 总时长 ${total}`);

// 2 — continuity
if (scenes[0].from !== 0) issues.push(`首场景起点 ${scenes[0].from} ≠ 0`);
for (let i = 1; i < scenes.length; i++) {
  const prevEnd = scenes[i - 1].from + scenes[i - 1].dur;
  if (scenes[i].from !== prevEnd) issues.push(`场景 ${scenes[i].id} 起点 ${scenes[i].from} ≠ 前场景终点 ${prevEnd}（缺口或重叠）`);
}

// 3 — registry membership
for (const s of scenes) {
  if (!hero.has(s.id)) issues.push(`场景 ${s.id} 不在主片时间轴契约中（骨架必须共享）`);
}

// 4 — order matches hero
const heroOrder = [...hero.entries()].sort((a, b) => a[1].from - b[1].from).map(([k]) => k);
const kept = heroOrder.filter((id) => scenes.some((s) => s.id === id));
const actual = scenes.map((s) => s.id);
if (kept.join("→") !== actual.join("→")) issues.push(`场景顺序偏离主片骨架：主片子序 ${kept.join("→")} vs 本轴 ${actual.join("→")}`);
const dropped = heroOrder.filter((id) => !scenes.some((s) => s.id === id));
const declaredDropped = (tl.dropped ?? []).map((d) => d.id).sort().join(",");
if (dropped.sort().join(",") !== declaredDropped) issues.push(`dropped 声明与实际差集不符：实际 [${dropped}] vs 声明 [${tl.dropped?.map((d) => d.id)}]`);
for (const d of tl.dropped ?? []) if (!d.why) issues.push(`dropped.${d.id} 缺 why（取舍必须有理由）`);

// 5 — trim-only
for (const s of scenes) {
  const h = hero.get(s.id);
  if (h && s.dur > h.dur) issues.push(`场景 ${s.id} 时长 ${s.dur} 超过主片 ${h.dur}（只裁不延）`);
}

// 6 — captions
const caps = tl.captions ?? [];
for (const [i, c] of caps.entries()) {
  if (c.from < 0 || c.to > total || c.from >= c.to) issues.push(`caption#${i} 越界或倒置 [${c.from},${c.to})`);
  if (!String(c.text ?? "").trim()) issues.push(`caption#${i} 空文本（静音可读要求字幕承载信息）`);
  if (!ACCENTS.has(c.accent)) issues.push(`caption#${i} 未知 accent: ${c.accent}`);
  const host = scenes.find((s) => c.from >= s.from && c.to <= s.from + s.dur);
  if (!host) issues.push(`caption#${i} 跨场景（[${c.from},${c.to}) 不落在单一场景内）`);
}
for (let i = 1; i < caps.length; i++) if (caps[i].from < caps[i - 1].to) issues.push(`caption#${i} 与前一条重叠`);

// 7 — re-hook budget
const cuts = scenes.length - 1;
if (cuts < 5) issues.push(`切点仅 ${cuts} 个（知识卡 60s 片要求 ≥5 次 re-hook）`);

const receipt = {
  ok: issues.length === 0,
  composition: tl.composition,
  seconds: total / fps,
  scenes: scenes.length,
  dropped: (tl.dropped ?? []).map((d) => d.id),
  captions: caps.length,
  cutPoints: cuts,
  density: `${(total / fps / scenes.length).toFixed(1)}s/场景`,
  issues,
};
if (process.argv.includes("--json")) console.log(JSON.stringify(receipt, null, 1));
else {
  console.log(`timeline ${receipt.composition}: ${receipt.seconds}s / ${receipt.scenes} scenes / ${receipt.captions} captions / ${receipt.cutPoints} cuts（${receipt.density}）`);
  console.log(`  dropped: ${receipt.dropped.join(", ") || "(none)"}`);
  if (issues.length) { console.log(`  ISSUES (${issues.length}):`); for (const i of issues) console.log(`   - ${i}`); }
  else console.log("  continuity/trim-only/caption-bounds/re-hook-budget: all pass");
}
process.exit(receipt.ok ? 0 : 1);

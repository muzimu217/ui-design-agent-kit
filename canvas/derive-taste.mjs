#!/usr/bin/env node
// derive-taste — recompute the taste profile from recorded signals.
//
// The profile is NOT hand-authored opinions: traits are derived from signals
// (verbatim user direction, explicit choices, accepted/rejected proposals),
// each trait carrying the signal ids that support it. This script recomputes
// confidence and adoption status so the workbench can show *why* a preference
// is being applied, and refuses to adopt anything below threshold.
//
// Usage: node canvas/derive-taste.mjs [--check]
//   --check  exit 1 if any trait is unsupported or adopts below threshold.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "canvas", "taste-profile.json");

const profile = JSON.parse(await readFile(FILE, "utf8"));
const signalIds = new Set((profile.signals ?? []).map((s) => s.id));
const thresholds = profile.thresholds ?? { adopt: 0.8, showOnly: 0.5 };
const problems = []; // hard errors: unsupported claims, dangling references
const notes = []; // self-corrected: confidence clamped down to what evidence supports

for (const t of profile.traits ?? []) {
  // 1) Every trait must cite at least one recorded signal.
  const cited = (t.evidence ?? []).filter((id) => signalIds.has(id));
  if (cited.length === 0) problems.push(`trait ${t.id}: 无可回溯信号`);
  const missing = (t.evidence ?? []).filter((id) => !signalIds.has(id));
  for (const m of missing) problems.push(`trait ${t.id}: 引用了不存在的信号 ${m}`);

  // 2) Confidence must be capped by evidence count and counter-signals.
  const cap = Math.min(0.95, 0.55 + 0.15 * cited.length);
  if (t.counterSignal) {
    // A counter-signal always pulls confidence down and must be shown.
    t.confidence = Math.min(t.confidence, cap - 0.2);
    t.status = "contested";
  } else if (t.confidence > cap) {
    // Claimed confidence above what the cited evidence supports: clamp it.
    notes.push(`trait ${t.id}: 置信度 ${t.confidence} → ${cap.toFixed(2)}（证据支持上限）`);
    t.confidence = cap;
  }
  t.confidence = Math.round(t.confidence * 100) / 100;
  if (!t.status) {
    t.status = t.confidence >= thresholds.adopt ? "adopted" : t.confidence >= thresholds.showOnly ? "shown" : "hidden";
  }

  // 3) Adoption requires threshold AND at least two independent signals.
  if (t.status === "adopted" && cited.length < 2) {
    problems.push(`trait ${t.id}: 仅 ${cited.length} 条信号却标记 adopted（采用需 ≥2 条独立信号）`);
    t.status = "shown";
  }
  t.adopted = t.status === "adopted";
}

profile.derivedAt = new Date().toISOString().slice(0, 10);
profile.summary = {
  signals: (profile.signals ?? []).length,
  traits: (profile.traits ?? []).length,
  adopted: (profile.traits ?? []).filter((t) => t.adopted).length,
  contested: (profile.traits ?? []).filter((t) => t.status === "contested").length,
};

const checkOnly = process.argv.includes("--check");
if (checkOnly) {
  if (problems.length) {
    console.error(`taste profile check failed:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(
    `taste profile OK: ${profile.summary.adopted}/${profile.summary.traits} adopted from ${profile.summary.signals} signals` +
      (notes.length ? ` · ${notes.length} confidence clamp(s) applied` : "")
  );
  process.exit(0);
}

await writeFile(FILE, JSON.stringify(profile, null, 2) + "\n");
console.log(
  `taste profile derived: ${profile.summary.adopted}/${profile.summary.traits} adopted · ${profile.summary.contested} contested · ${profile.summary.signals} signals` +
    (notes.length ? ` · ${notes.length} clamp(s)` : "")
);
for (const n of notes) console.log(`  ~ ${n}`);
for (const p of problems) console.log(`  ! ${p}`);

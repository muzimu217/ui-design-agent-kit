#!/usr/bin/env node
// uak60-probe — renderability probe for the UakIntro60 composition.
//
// The 60s cut has a machine-checked timeline contract (timeline-check) but a
// contract is not a capability: until frames come out of the actual renderer,
// the composition is "Installed", not "Visually Verified" (五级证据纪律).
// This probe renders one still per key scene into out/probe60/, then verifies
// each frame is dimensionally correct and non-degenerate (byte size + luma
// band), writing a receipt to out/uak60-probe.json.
//
// Usage: node scripts/uak60-probe.mjs [--json]
// Exit 0 all frames verified; 1 any failure. Frames are probe evidence, not a
// video deliverable — rendering the full cut stays a user decision.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VP = path.join(ROOT, "video-production");
const OUT = path.join(VP, "out", "probe60");
const run = promisify(execFile);

// One frame per scene family: hook / proof+workbench / regressions / gates(3D) / knowledge / end
const FRAMES = [45, 250, 800, 1000, 1500, 1700];

const frames = [];
const failures = [];
await mkdir(OUT, { recursive: true });

// Phase 1 — render stills via Remotion
for (const f of FRAMES) {
  const file = path.join(OUT, `frame-${f}.png`);
  try {
    await run("npx", ["remotion", "still", "UakIntro60", file, `--frame=${f}`, "--log=error"], { cwd: VP, shell: process.platform === "win32" });
    frames.push({ frame: f, file: path.relative(ROOT, file) });
  } catch (e) {
    failures.push({ frame: f, why: String(e.stderr ?? e.message ?? "").trim().split("\n").slice(-2).join("; ") });
  }
}

// Phase 2 — verify each frame: dimensions 1920×1080, byte size floor, luma in dark-theme band
const verified = [];
for (const fr of frames) {
  const abs = path.join(ROOT, fr.file);
  const size = (await readFile(abs)).length;
  let dim = "", yavg = null;
  try {
    dim = (await run("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", abs])).stdout.trim();
    const out = (await run("ffmpeg", ["-i", abs, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-f", "null", "-"], { cwd: ROOT })).stderr;
    yavg = Number((out.match(/YAVG=([0-9.]+)/) ?? [])[1] ?? 0);
  } catch (e) {
    failures.push({ frame: fr.frame, why: `ffprobe/ffmpeg failed: ${String(e.message).split("\n")[0]}` });
    continue;
  }
  const okDim = dim === "1920,1080";
  const okSize = size > 30_000; // 空白帧远小于此
  const okLuma = yavg > 8 && yavg < 200; // 非纯黑非过曝（暗色主题正常 25-45）
  if (okDim && okSize && okLuma) verified.push({ ...fr, bytes: size, dim, yavg });
  else failures.push({ frame: fr.frame, why: `dim=${dim} bytes=${size} yavg=${yavg}` });
}

const receipt = {
  composition: "UakIntro60",
  probe: "renderability stills",
  framesRequested: FRAMES.length,
  framesVerified: verified.length,
  verified,
  failures,
  run_status: verified.length === FRAMES.length ? "complete" : "incomplete",
  ...(failures.length ? { incomplete_reason: failures.map((f) => `frame ${f.frame}: ${f.why}`).join("; ") } : {}),
  note: "帧证据≠成片交付：全片渲染仍待用户放行（npx remotion render UakIntro60）",
  generatedAt: new Date().toISOString(),
};
await writeFile(path.join(VP, "out", "uak60-probe.json"), JSON.stringify(receipt, null, 1) + "\n", "utf8");

if (process.argv.includes("--json")) console.log(JSON.stringify(receipt, null, 1));
else {
  console.log(`uak60 probe: ${verified.length}/${FRAMES.length} frames verified (${receipt.run_status})`);
  for (const v of verified) console.log(`  ✓ frame ${v.frame}: ${v.dim}, ${(v.bytes / 1024).toFixed(0)}KB, YAVG=${v.yavg}`);
  for (const f of failures) console.log(`  ✗ frame ${f.frame}: ${f.why}`);
}
process.exit(receipt.run_status === "complete" ? 0 : 1);

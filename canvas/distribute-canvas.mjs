#!/usr/bin/env node
// distribute-canvas — copy the generated canvas pages into the showcase
// public/ directory so `vite build` ships them under /canvas/. Byte-identical
// copies; the showcase build then serves the latest snapshots without a manual
// copy step. Part of `npm run canvas:build` (runs last).

import { mkdir, copyFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "output");
const DST = path.join(ROOT, "showcase", "products", "public", "canvas");

const pages = ["canvas-workbench.html", "chain-canvas-workbench.html", "canvas-index.html", "mini-dashboard.html", "site.html"];
const media = ["stroke-loop.webm", "stroke-loop.gif"];
await mkdir(DST, { recursive: true });
for (const f of pages) {
  await copyFile(path.join(SRC, f), path.join(DST, f));
}
for (const f of media) {
  await copyFile(path.join(SRC, f), path.join(DST, f)).catch(() => {});
}
// 墙条目缩略图（增量 60）：构建时快照随分发进 showcase，缺失不报错（墙回退纯文字）。
try {
  const thumbs = await readdir(path.join(SRC, "thumbs"));
  await mkdir(path.join(DST, "thumbs"), { recursive: true });
  for (const f of thumbs.filter((x) => x.endsWith(".png"))) {
    await copyFile(path.join(SRC, "thumbs", f), path.join(DST, "thumbs", f));
  }
} catch { /* thumbs 未生成时跳过 */ }
const listed = await readdir(DST);
console.log(`canvas distributed to showcase: ${DST} (${listed.length} files)`);

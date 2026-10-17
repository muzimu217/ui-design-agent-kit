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

const pages = ["canvas-workbench.html", "chain-canvas-workbench.html", "canvas-index.html"];
await mkdir(DST, { recursive: true });
for (const f of pages) {
  await copyFile(path.join(SRC, f), path.join(DST, f));
}
const listed = await readdir(DST);
console.log(`canvas distributed to showcase: ${DST} (${listed.length} files)`);

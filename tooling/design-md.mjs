#!/usr/bin/env node
// Fetch DESIGN.md files from VoltAgent/awesome-design-md (MIT), pinned at the
// revision recorded in tooling/sources.lock.json (designContracts entry).
// Files are fetched on demand into a task-local directory and must never be
// committed to this repository. The upstream documents analyze publicly visible
// CSS of brand websites; they are not official brand assets.

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REPO = "VoltAgent/awesome-design-md";

async function loadLock() {
  const lock = JSON.parse(await readFile(path.join(ROOT, "tooling/sources.lock.json"), "utf8"));
  const entry = (lock.designContracts ?? []).find((item) => item.name === "awesome-design-md");
  if (!entry) throw new Error("designContracts/awesome-design-md missing from tooling/sources.lock.json");
  if (!/^[0-9a-f]{40}$/.test(entry.revision)) throw new Error("Unpinned designContracts revision");
  return entry;
}

async function ghApi(pathname) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "ui-design-agent-kit" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com${pathname}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${pathname} (set GITHUB_TOKEN or use \`gh auth status\` to check limits)`);
  }
  return response.json();
}

function printHelp() {
  console.log(`Usage: node tooling/design-md.mjs <command>

Commands:
  list                 List available brand catalogs (network required)
  pull <brand> [dest]  Fetch design-md/<brand>/DESIGN.md into <dest>
                       (default: a task-local directory under /tmp; never commit it)

The upstream revision is pinned in tooling/sources.lock.json (designContracts).`);
}

async function list() {
  const entry = await loadLock();
  const tree = await ghApi(`/repos/${REPO}/git/trees/${entry.revision}?recursive=0`);
  const catalog = tree.tree.find((item) => item.path === entry.catalogPath && item.type === "tree");
  if (!catalog) throw new Error(`Catalog path ${entry.catalogPath} not found at pinned revision`);
  const children = await ghApi(`/repos/${REPO}/contents/${entry.catalogPath}?ref=${entry.revision}`);
  const brands = children.filter((item) => item.type === "dir").map((item) => item.name);
  console.log(`awesome-design-md @ ${entry.revision.slice(0, 12)} (${brands.length} brands):\n`);
  for (const brand of brands.sort()) console.log(`  ${brand}`);
  console.log(`\nPull one: node tooling/design-md.mjs pull <brand>`);
}

async function pull(brand, destArg) {
  if (!brand || brand.includes("/") || brand.startsWith(".")) {
    throw new Error("Brand must be a single directory name under design-md/");
  }
  const entry = await loadLock();
  const dest = destArg
    ? path.resolve(destArg)
    : path.join("/tmp", `design-md-${brand}-${entry.revision.slice(0, 12)}`);
  const url = `https://raw.githubusercontent.com/${REPO}/${entry.revision}/${entry.catalogPath}/${brand}/DESIGN.md`;
  const response = await fetch(url, { headers: { "User-Agent": "ui-design-agent-kit" } });
  if (!response.ok) {
    throw new Error(`Fetch failed: HTTP ${response.status} for ${url} (run \`node tooling/design-md.mjs list\` to see valid brands)`);
  }
  const body = await response.text();
  if (!body.startsWith("---")) throw new Error("Fetched file does not look like a DESIGN.md (missing frontmatter); refusing to save");
  await mkdir(dest, { recursive: true });
  const file = path.join(dest, "DESIGN.md");
  await writeFile(file, body);
  console.log(`Saved ${file} (${Buffer.byteLength(body)} bytes, upstream revision ${entry.revision})`);
  console.log("Treat it as reference material: adapt relationships into the design contract; never ship it or its tokens without the user's material confirmation.");
}

const [command, ...rest] = process.argv.slice(2);
if (command === "list") {
  await list();
} else if (command === "pull") {
  await pull(rest[0], rest[1]);
} else {
  printHelp();
  if (command && command !== "--help" && command !== "-h") process.exitCode = 1;
}

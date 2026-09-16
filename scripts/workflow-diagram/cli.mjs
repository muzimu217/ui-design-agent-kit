#!/usr/bin/env node
// workflow-diagram — render the delivery pipeline in tooling/workflow-stages.json
// as one self-contained interactive HTML diagram.
//
// Usage:
//   node scripts/workflow-diagram/cli.mjs build [output.html] [--title <text>] [--json]
//   node scripts/workflow-diagram/cli.mjs model [--json]
//   node scripts/workflow-diagram/cli.mjs check [output.html]
//
// The pipeline JSON stays the only source of truth: edit it, re-run, and the
// diagram follows. No network access, no external renderer, no runtime deps.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, loadPipeline, buildModel } from "./model.mjs";
import { layout } from "./layout.mjs";
import { renderSvg } from "./svg.mjs";
import { renderHtml } from "./html.mjs";

const DEFAULT_OUTPUT = path.join(ROOT, "output/workflow-diagram.html");

function parseArgs(argv) {
  const flags = { json: false, title: null };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--json") flags.json = true;
    else if (token === "--title") flags.title = argv[++index];
    else if (token.startsWith("--title=")) flags.title = token.slice("--title=".length);
    else positional.push(token);
  }
  return { flags, positional };
}

async function build({ flags, positional }, root = ROOT) {
  const pipeline = await loadPipeline(root);
  const model = buildModel(pipeline, { title: flags.title ?? undefined });
  const laid = layout(model);
  const svg = renderSvg(laid, model);
  const html = renderHtml({
    svg,
    model,
    laid,
    meta: { title: model.title, generated: pipeline.updatedOn ?? "" },
  });

  const output = positional[0] ? path.resolve(positional[0]) : DEFAULT_OUTPUT;
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html, "utf8");

  return {
    output,
    bytes: Buffer.byteLength(html),
    stages: model.stages.length,
    gates: model.nodes.filter((node) => node.kind === "gate").length,
    nodes: model.nodes.length,
    edges: model.edges.length,
    size: { width: Math.round(laid.width), height: Math.round(laid.height) },
  };
}

async function check({ positional }) {
  const file = positional[0] ? path.resolve(positional[0]) : DEFAULT_OUTPUT;
  const html = await readFile(file, "utf8");
  const problems = [];
  if (!html.startsWith("<!DOCTYPE html>")) problems.push("not an HTML document");
  if (!html.includes("<svg")) problems.push("no inline SVG");
  if (/(src|href)=["']https?:\/\//i.test(html)) problems.push("references an external resource; the file must be self-contained");
  if (!html.includes('role="progressbar"')) problems.push("missing progressbar (progress must be exposed, not only drawn)");
  if (!html.includes("prefers-reduced-motion")) problems.push("missing reduced-motion handling");
  for (const stage of ["brief", "reference", "contract", "build", "verify", "deliver"]) {
    if (!html.includes(`data-stage="${stage}"`)) problems.push(`missing stage ${stage} in the rendered output`);
  }
  return { file, ok: problems.length === 0, problems };
}

function usage() {
  return `Usage: node scripts/workflow-diagram/cli.mjs <command>

Commands:
  build [output.html]   Render the pipeline to one self-contained HTML file
                        (default: output/workflow-diagram.html)
  model [--json]        Print the diagram model built from workflow-stages.json
  check [output.html]   Verify a rendered file is self-contained and complete

Options:
  --title <text>        Override the diagram title
  --json                Machine-readable result

Source of truth: tooling/workflow-stages.json (stages, gates, actors, tiers).`;
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

try {
  if (command === "build") {
    const result = await build(args);
    console.log(args.flags.json ? JSON.stringify(result, null, 2) : `${result.output}\n${result.stages} stages · ${result.gates} gates · ${result.nodes} nodes · ${(result.bytes / 1024).toFixed(0)}KB`);
  } else if (command === "model") {
    const pipeline = await loadPipeline();
    const model = buildModel(pipeline, { title: args.flags.title ?? undefined });
    console.log(JSON.stringify(model, null, 2));
  } else if (command === "check") {
    const result = await check(args);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } else {
    console.log(usage());
    if (command && command !== "--help" && command !== "-h") process.exitCode = 1;
  }
} catch (error) {
  console.error(`workflow-diagram: ${error.message}`);
  process.exitCode = 1;
}

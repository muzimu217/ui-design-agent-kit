#!/usr/bin/env node
// workflow-diagram — render the delivery pipeline in tooling/workflow-stages.json
// as one self-contained interactive HTML diagram.
//
// Usage:
//   node scripts/workflow-diagram/cli.mjs build [output.html] [--state <file>] [--title <text>] [--json]
//   node scripts/workflow-diagram/cli.mjs model [--state <file>]
//   node scripts/workflow-diagram/cli.mjs check [output.html]
//   node scripts/workflow-diagram/cli.mjs state-template [output.json]
//
// Without --state the diagram shows the process itself. With --state it shows
// where one task actually is: real stage statuses, the current stage, and the
// evidence recorded for each stage.
//
// The pipeline JSON stays the only source of truth for the process: edit it,
// re-run, and the diagram follows. No network access, no external renderer,
// no runtime deps.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, loadPipeline, buildModel } from "./model.mjs";
import { loadState, validateState } from "./state.mjs";
import { layout } from "./layout.mjs";
import { renderSvg } from "./svg.mjs";
import { renderHtml } from "./html.mjs";

const DEFAULT_OUTPUT = path.join(ROOT, "output/workflow-diagram.html");

function parseArgs(argv) {
  const flags = { json: false, title: null, state: null };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--json") flags.json = true;
    else if (token === "--title") flags.title = argv[++index];
    else if (token.startsWith("--title=")) flags.title = token.slice("--title=".length);
    else if (token === "--state") flags.state = argv[++index];
    else if (token.startsWith("--state=")) flags.state = token.slice("--state=".length);
    else positional.push(token);
  }
  return { flags, positional };
}

async function resolveState(flags, root = ROOT) {
  if (!flags.state) return null;
  const pipeline = await loadPipeline(root);
  return loadState(path.resolve(flags.state), pipeline);
}

async function build({ flags, positional }, root = ROOT) {
  const pipeline = await loadPipeline(root);
  const state = await resolveState(flags, root);
  const model = buildModel(pipeline, { title: flags.title ?? undefined, state });
  const laid = layout(model);
  const svg = renderSvg(laid, model);
  const html = renderHtml({
    svg,
    model,
    laid,
    meta: { title: model.title, generated: state?.updatedOn ?? pipeline.updatedOn ?? "" },
  });

  const output = positional[0] ? path.resolve(positional[0]) : DEFAULT_OUTPUT;
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html, "utf8");

  return {
    output,
    mode: model.mode,
    task: model.task ? model.task.name : null,
    currentStage: model.task ? model.task.currentStage : null,
    progress: model.task ? model.task.progress : null,
    bytes: Buffer.byteLength(html),
    stages: model.stages.length,
    gates: model.nodes.filter((node) => node.kind === "gate").length,
    nodes: model.nodes.length,
    edges: model.edges.length,
    size: { width: Math.round(laid.width), height: Math.round(laid.height) },
  };
}

// Emits a starting state file for a task, so a caller does not have to guess the
// shape. Every stage starts pending; fill in what actually happened.
async function stateTemplate({ positional }, root = ROOT) {
  const pipeline = await loadPipeline(root);
  const template = {
    task: "<任务名称>",
    revision: "P-<id>",
    updatedOn: new Date().toISOString().slice(0, 10),
    note: "<一句话说明这个任务>",
    stages: Object.fromEntries(
      pipeline.stages.map((stage) => [stage.id, { status: "pending", evidence: null, note: null }]),
    ),
    gates: Object.fromEntries(pipeline.gates.map((gate) => [gate.id, "pending"])),
    blockedReason: null,
  };
  validateState(template, pipeline);
  const output = positional[0] ? path.resolve(positional[0]) : path.join(ROOT, "output/task-state.json");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  return { output, stages: pipeline.stages.length, gates: pipeline.gates.length };
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
  // Status must be rendered per node, not left implicit.
  if (!/data-status="(pending|active|gated|passed|blocked)"/.test(html)) {
    problems.push("no per-node status rendered");
  }
  return { file, ok: problems.length === 0, problems };
}

function usage() {
  return `Usage: node scripts/workflow-diagram/cli.mjs <command>

Commands:
  build [output.html]     Render the pipeline to one self-contained HTML file
                          (default: output/workflow-diagram.html)
  model [--state <file>]  Print the diagram model
  check [output.html]     Verify a rendered file is self-contained and complete
  state-template [out]    Write a starter task-state file to fill in

Options:
  --state <file>          Task state JSON: real stage statuses for one task
  --title <text>          Override the diagram title
  --json                  Machine-readable result

Process source: tooling/workflow-stages.json (stages, gates, actors, tiers).
Task state shape: run \`state-template\`, or see scripts/workflow-diagram/state.mjs.`;
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

try {
  if (command === "build") {
    const result = await build(args);
    console.log(
      args.flags.json
        ? JSON.stringify(result, null, 2)
        : `${result.output}\n${result.mode === "task" ? `任务「${result.task}」· 当前 ${result.currentStage} · ${result.progress.passed}/${result.progress.total} 阶段已完成\n` : ""}${result.stages} stages · ${result.gates} gates · ${result.nodes} nodes · ${(result.bytes / 1024).toFixed(0)}KB`,
    );
  } else if (command === "model") {
    const pipeline = await loadPipeline();
    const state = await resolveState(args.flags);
    const model = buildModel(pipeline, { title: args.flags.title ?? undefined, state });
    console.log(JSON.stringify(model, null, 2));
  } else if (command === "state-template") {
    const result = await stateTemplate(args);
    console.log(args.flags.json ? JSON.stringify(result, null, 2) : `${result.output}\n${result.stages} stages · ${result.gates} gates to fill in`);
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

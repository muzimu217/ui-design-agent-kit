#!/usr/bin/env node
// render-index — build the canvas workbench entry page: one dark self-contained
// HTML linking the live gate canvas, the requirement chain page, and a summary
// of the artifact wall (canvas/artifacts.json). Offline contract identical to
// the other canvas renderers.
//
// Usage: node canvas/render-index.mjs [output.html]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function main() {
  const artifacts = JSON.parse(await readFile(path.join(ROOT, "canvas", "artifacts.json"), "utf8"));
  const state = JSON.parse(await readFile(path.join(ROOT, "canvas", "canvas-workbench.state.json"), "utf8"));
  const stageEntries = Object.entries(state.stages ?? {});
  const gates = state.gates ?? {};
  const gateColor = { passed: "#34d399", gated: "#f472b6", active: "#22d3ee", blocked: "#f87171", pending: "#6b7280" };

  const gatePills = Object.entries(gates)
    .map(([id, st]) => `<span class="pill" style="border-color:${gateColor[st] ?? gateColor.pending}">${esc(id)} · ${esc(st)}</span>`)
    .join("");

  const rows = artifacts.artifacts
    .map(
      (a) => `<details class="art"><summary><span class="t">${esc(a.title)}</span><span class="round">${esc(a.round)}</span></summary>
      <div class="body">
        <div class="row"><span class="k">产物</span><span class="v"><code>${esc(a.path)}</code></span></div>
        <div class="row"><span class="k">六维</span><span class="v">${esc(Object.entries(a.sixDim ?? {}).map(([k, v]) => `${k}: ${v}`).join("；")).slice(0, 500)}</span></div>
        <div class="row"><span class="k">对比</span><span class="v">${esc(a.compare?.target ?? "—")} — ${esc(a.compare?.verdict ?? "")}</span></div>
        <div class="row"><span class="k">状态</span><span class="v">${esc(a.status ?? "")}</span></div>
      </div>
    </details>`
    )
    .join("\n");

  const stageCards = stageEntries
    .map(([id, s]) => {
      const color = gateColor[s.status] ?? gateColor.pending;
      return `<div class="stage" style="--c:${color}">
        <div class="sid">${esc(id)}</div>
        <div class="sst" style="color:${color}">${esc(s.status)}</div>
        <div class="snote">${esc(s.note ?? "")}</div>
      </div>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>画布工作台 · 入口</title>
<style>
  :root { color-scheme: dark; --bg:#0a0a0f; --panel:#141420; --line:#26263a; --text:#e6e6f0; --dim:#9a9ab0; --accent:#7c3aed; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:15px/1.65 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif; padding:32px 20px 64px; overflow-x:hidden; overflow-wrap:anywhere; }
  main { max-width:920px; margin:0 auto; }
  h1 { font-size:22px; margin:0 0 4px; }
  .meta { color:var(--dim); font-size:13px; margin-bottom:20px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; margin-bottom:22px; }
  a.card { display:block; background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:18px; text-decoration:none; color:var(--text); }
  a.card:hover { border-color:var(--accent); }
  a.card h2 { margin:0 0 6px; font-size:16px; color:#c4b5fd; }
  a.card p { margin:0; color:var(--dim); font-size:13px; }
  .pill { display:inline-block; border:1px solid var(--line); border-radius:99px; padding:2px 10px; font-size:12px; margin:2px 4px 2px 0; }
  .stages { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:22px; }
  .stage { background:var(--panel); border:1px solid var(--line); border-top:3px solid var(--c); border-radius:10px; padding:12px; }
  .sid { font-weight:600; }
  .sst { font-size:12px; margin:2px 0 6px; }
  .snote { color:var(--dim); font-size:12px; }
  h2.sec { font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--dim); margin:22px 0 10px; }
  details.art { background:var(--panel); border:1px solid var(--line); border-radius:10px; margin-bottom:10px; }
  details.art summary { cursor:pointer; display:flex; gap:10px; align-items:baseline; padding:12px 16px; list-style:none; }
  details.art summary::-webkit-details-marker { display:none; }
  .t { font-weight:600; flex:1; }
  .round { color:var(--dim); font-size:12px; }
  .body { padding:0 16px 14px; font-size:13px; }
  .row { display:flex; gap:10px; margin:6px 0; min-width:0; }
  .k { color:var(--dim); min-width:48px; flex:none; }
  .v { flex:1; min-width:0; overflow-wrap:anywhere; }
  code { background:#0d0d15; border:1px solid var(--line); border-radius:6px; padding:1px 6px; font-size:12px; color:#8ab4ff; word-break:break-all; }
  footer { margin-top:24px; color:var(--dim); font-size:12px; text-align:center; }
</style>
</head>
<body>
<main>
  <h1>画布工作台 · 入口</h1>
  <div class="meta">${esc(state.task)} · ${esc(state.revision ?? "")} · 更新 ${esc(state.updatedOn ?? "")} · 离线自包含</div>
  <div class="grid">
    <a class="card" href="canvas-workbench.html"><h2>门径画布（实时门径）</h2><p>六阶段四泳道流水线：门状态/证据嵌入/搜索/缩放/回放——由 workflow-diagram 壳渲染</p></a>
    <a class="card" href="chain-canvas-workbench.html"><h2>需求解析链路</h2><p>原始口语 → 解析摘要 → 理解验证 → 六步决策抽屉——黑盒步骤自动标黄</p></a>
    <a class="card" href="https://github.com/muzimu217/ui-design-agent-kit/blob/dev/auto/docs/canvas-workbench-plan.md"><h2>规划（门 A 方向稿）</h2><p>三阶段路线+现状对账+扩量计划——docs/canvas-workbench-plan.md</p></a>
  </div>
  <h2 class="sec">门径状态</h2>
  <div>${gatePills}</div>
  <div class="stages">${stageCards}</div>
  <h2 class="sec">产物墙（KPI4 · ${artifacts.artifacts.length} 件）</h2>
  ${rows}
  <footer>canvas workbench · 由 canvas/render-index.mjs 生成 · npm run canvas:build 重建全部</footer>
</main>
</body>
</html>`;

  const output = process.argv[2] ?? path.join(ROOT, "output", "canvas-index.html");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`canvas index rendered: ${output} (${artifacts.artifacts.length} artifacts)`);
}

main().catch((e) => { console.error(e); process.exit(1); });

#!/usr/bin/env node
// render-index — build the canvas workbench entry page: one dark self-contained
// HTML linking the live gate canvas, the requirement chain page, and a summary
// of the artifact wall (canvas/artifacts.json). Offline contract identical to
// the other canvas renderers.
//
// Usage: node canvas/render-index.mjs [output.html]

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
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

  // 多链路注册表：扫 canvas/chain-*.json（除 schema 文档），每条链一行（标题/轮次/步数/确认态/页链接）。
  // 渲染页文件名约定 = <chain 文件名去掉 .json>.html。
  const chainFiles = (await readdir(path.join(ROOT, "canvas")))
    .filter((f) => /^chain-.+\.json$/.test(f))
    .sort((a, b) => (a < b ? 1 : -1));
  const chains = [];
  for (const f of chainFiles) {
    try {
      const c = JSON.parse(await readFile(path.join(ROOT, "canvas", f), "utf8"));
      const page = f.replace(/\.json$/, ".html");
      chains.push({
        title: c.title ?? c.chainId ?? f,
        round: c.round ?? "—",
        steps: Array.isArray(c.steps) ? c.steps.length : 0,
        confirmed: c.verifyUnderstanding?.confirmedBy === "user",
        page,
      });
    } catch {
      chains.push({ title: `${f}（解析失败）`, round: "—", steps: 0, confirmed: false, page: f.replace(/\.json$/, ".html") });
    }
  }
  const chainRows = chains
    .map(
      (c) => `<a class="chain-row" href="${esc(c.page)}">
        <span class="badge">${c.confirmed ? "✓ 已确认" : "… 待确认"}</span>
        <span class="t">${esc(c.title)}</span>
        <span class="round">${esc(c.round)} · ${c.steps} 步</span>
        <span class="open">打开 ↗</span>
      </a>`
    )
    .join("\n");
  const chainSection = chains.length
    ? `<h2 class="sec">解析链路（${chains.length} 条）</h2>${chainRows}`
    : "";

  // 多任务注册表：扫 canvas/*.state.json（每个任务一份状态），每任务一行两态摘要。
  // 与单任务 mission control 同构：执行态列（阶段进度/待裁决）与证据态列（完成阶段数）分离。
  const stateFiles = (await readdir(path.join(ROOT, "canvas"))).filter((f) => /\.state\.json$/.test(f));
  const tasks = [];
  for (const f of stateFiles) {
    try {
      const s = JSON.parse(await readFile(path.join(ROOT, "canvas", f), "utf8"));
      const stages = Object.entries(s.stages ?? {});
      const passed = stages.filter(([, v]) => v.status === "passed").length;
      const gated = stages.filter(([, v]) => v.status === "gated").map(([k]) => k);
      const active = stages.filter(([, v]) => v.status === "active").map(([k]) => k);
      tasks.push({
        task: s.task ?? f,
        revision: s.revision ?? "",
        total: stages.length,
        passed,
        gated,
        active,
        gatesGated: Object.entries(s.gates ?? {}).filter(([, v]) => v === "gated").map(([k]) => k),
        updatedOn: s.updatedOn ?? "",
      });
    } catch {
      tasks.push({ task: `${f}（解析失败）`, revision: "", total: 0, passed: 0, gated: [], active: [], gatesGated: [], updatedOn: "" });
    }
  }
  const taskRows = tasks
    .map(
      (t) => `<div class="task-row">
        <span class="t">${esc(t.task)}</span>
        <span class="round">${esc(t.revision)}${t.updatedOn ? ` · ${esc(t.updatedOn)}` : ""}</span>
        <span class="task-exec">执行：${t.active.length ? esc(t.active.join("/")) : "—"}${t.gated.length ? ` · 待裁决 ${esc(t.gated.join("/"))}` : ""}</span>
        <span class="task-ev">证据：${t.passed}/${t.total} 阶段通过${t.gatesGated.length ? ` · 门 ${esc(t.gatesGated.join("/"))} 待裁` : ""}</span>
      </div>`
    )
    .join("\n");
  const taskSection = tasks.length
    ? `<h2 class="sec">任务注册表（${tasks.length} 项 · 多任务 mission control）</h2>${taskRows}`
    : "";

  // 排序视图：round 降序（最新在前），并给每条算六维完成度徽章（已实测项数/6）。
  // 完成度判定按措辞（通过/实测/直拍/可达/全过）——六维条目是自然语言，无法硬编码枚举。
  const sixKeys = ["desktop", "mobile", "keyboard", "contrast", "reducedMotion", "console"];
  const measured = (a) => {
    const sd = a.sixDim ?? {};
    return sixKeys.filter((k) => /通过|实测|直拍|可达|全过/.test(String(sd[k] ?? ""))).length;
  };
  const sorted = [...artifacts.artifacts].sort((a, b) => (a.round < b.round ? 1 : a.round > b.round ? -1 : 0));
  const rows = sorted
    .map(
      (a) => `<details class="art"><summary><span class="badge">${measured(a)}/6</span><span class="t">${esc(a.title)}</span><span class="round">${esc(a.round)}</span></summary>
      <div class="body">
        <div class="row"><span class="k">产物</span><span class="v"><code>${esc(a.path)}</code></span></div>
        <div class="row"><span class="k">六维</span><span class="v">${esc(Object.entries(a.sixDim ?? {}).map(([k, v]) => `${k}: ${v}`).join("；")).slice(0, 500)}</span></div>
        <div class="row"><span class="k">对比</span><span class="v">${esc(a.compare?.target ?? "—")} — ${esc(a.compare?.verdict ?? "")}</span></div>
        <div class="row"><span class="k">状态</span><span class="v">${esc(a.status ?? "")}</span></div>
      </div>
    </details>`
    )
    .join("\n");

  // mission control 两态分离：执行态（阶段进度）与证据态（可复核产物）分列，禁止把执行状态当验收声明。
  const currentStageId = stageEntries.find(([, s]) => s.status === "active")?.[0] ?? stageEntries[0]?.[0] ?? "—";
  const currentStageStatus = stageEntries.find(([, s]) => s.status === "active")?.[1]?.status ?? "pending";
  const activeStages = stageEntries.filter(([, s]) => s.status === "active").map(([id]) => id);
  const gatedStages = stageEntries.filter(([, s]) => s.status === "gated").map(([id]) => id);
  const fullyVerified = artifacts.artifacts.filter((a) => sixKeys.filter((k) => /通过|实测|直拍|可达|全过/.test(String((a.sixDim ?? {})[k] ?? ""))).length === 6).length;
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
  .chain-row { display:flex; align-items:baseline; gap:10px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 16px; margin-bottom:8px; text-decoration:none; color:var(--text); min-width:0; }
  .chain-row:hover { border-color:var(--accent); }
  .chain-row .t { font-weight:600; flex:1; min-width:0; overflow-wrap:anywhere; }
  .chain-row .round, .chain-row .open { color:var(--dim); font-size:12px; flex:none; }
  .wall-filter { display:flex; gap:8px; margin-bottom:10px; }
  .wf-sep { color:var(--dim); font-size:12px; margin:0 4px; }
  .wf-btn { background:#0d0d15; border:1px solid var(--line); border-radius:99px; padding:3px 12px; font-size:12px; color:var(--dim); cursor:pointer; }
  .wf-btn.is-on { border-color:var(--accent); color:#c4b5fd; }
  .mc { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
  .mc-col { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:14px 16px; }
  .mc-col h3 { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--dim); margin:0 0 10px; }
  .mc-row { display:flex; gap:10px; margin:6px 0; min-width:0; }
  .mc-k { color:var(--dim); min-width:76px; flex:none; font-size:12px; }
  .mc-v { flex:1; min-width:0; overflow-wrap:anywhere; font-size:13px; }
  @media (max-width: 640px) { .mc { grid-template-columns:1fr; } }
  .task-row { display:flex; flex-wrap:wrap; align-items:baseline; gap:10px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 16px; margin-bottom:8px; min-width:0; }
  .task-row .t { font-weight:600; flex:1 1 220px; min-width:0; overflow-wrap:anywhere; }
  .task-row .round { color:var(--dim); font-size:12px; flex:none; }
  .task-exec { color:#22d3ee; font-size:12px; flex:1 1 200px; min-width:0; }
  .task-ev { color:#34d399; font-size:12px; flex:1 1 200px; min-width:0; }
  .badge { flex:none; background:#0d0d15; border:1px solid var(--line); border-radius:99px; padding:1px 8px; font-size:11px; color:#a7f3d0; }
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
  <h2 class="sec">任务管控（mission control · 执行态与证据态分离）</h2>
  <div class="mc">
    <div class="mc-col">
      <h3>执行态（工作在哪）</h3>
      <div class="mc-row"><span class="mc-k">当前阶段</span><span class="mc-v">${esc(currentStageId)} · ${esc(currentStageStatus)}</span></div>
      <div class="mc-row"><span class="mc-k">进行中</span><span class="mc-v">${esc(activeStages.join("、") || "—")}</span></div>
      <div class="mc-row"><span class="mc-k">待裁决</span><span class="mc-v">${esc(gatedStages.join("、") || "—")}</span></div>
    </div>
    <div class="mc-col">
      <h3>证据态（可复核什么）</h3>
      <div class="mc-row"><span class="mc-k">全实测产物</span><span class="mc-v">${fullyVerified}/${artifacts.artifacts.length}（6/6 六维）</span></div>
      <div class="mc-row"><span class="mc-k">解析链路</span><span class="mc-v">${chains.length} 条 · 已确认 ${chains.filter((c) => c.confirmed).length}</span></div>
      <div class="mc-row"><span class="mc-k">验收命令</span><span class="mc-v"><code>npm run canvas:check</code></span></div>
    </div>
  </div>
  ${taskSection}
  <h2 class="sec">门径状态</h2>
  <div>${gatePills}</div>
  <div class="stages">${stageCards}</div>
  ${chainSection}
  <h2 class="sec">产物墙（KPI4 · ${artifacts.artifacts.length} 件 · <span id="wall-mode">全部</span>）</h2>
  <div class="wall-filter" role="group" aria-label="产物墙过滤与排序">
    <button type="button" class="wf-btn is-on" data-mode="all" onclick="wallFilter('all')">全部</button>
    <button type="button" class="wf-btn" data-mode="full" onclick="wallFilter('full')">仅全实测（6/6）</button>
    <span class="wf-sep" aria-hidden="true">|</span>
    <button type="button" class="wf-btn is-on" data-sort="round" onclick="wallSort('round')">按轮次</button>
    <button type="button" class="wf-btn" data-sort="verified" onclick="wallSort('verified')">按完成度</button>
  </div>
  ${rows}
<script>
// 六维过滤：measured 徽章 < 6 的条目在 full 模式下隐藏（纯展示切换，无网络无构建逻辑）。
function wallFilter(mode) {
  const full = mode === 'full';
  document.querySelectorAll('details.art').forEach((d) => {
    const badge = d.querySelector('.badge');
    const n = badge ? parseInt((badge.textContent || '').split('/')[0], 10) : 6;
    d.style.display = full && n < 6 ? 'none' : '';
  });
  document.querySelectorAll('.wf-btn[data-mode]').forEach((b) => b.classList.toggle('is-on', b.dataset.mode === mode));
  document.getElementById('wall-mode').textContent = full ? '仅全实测（6/6）' : '全部';
}
// 排序视图：按轮次（新在前）或按完成度（徽章数降序）重排 details 条目——借鉴排行内容的排序呈现，判据=六维实测数。
function wallSort(by) {
  const wall = document.querySelector('.canvas-wall');
  if (!wall) return;
  const entries = [...wall.querySelectorAll('details.art')];
  const key = (d) => {
    const badge = d.querySelector('.badge');
    const n = badge ? parseInt((badge.textContent || '').split('/')[0], 10) : 0;
    const round = d.querySelector('.round');
    return by === 'verified' ? n : (round ? round.textContent.trim() : '');
  };
  entries.sort((a, b) => by === 'verified' ? key(b) - key(a) : (key(a) < key(b) ? 1 : -1));
  entries.forEach((d) => wall.appendChild(d));
  document.querySelectorAll('.wf-btn[data-sort]').forEach((b) => b.classList.toggle('is-on', b.dataset.sort === by));
}
</script>
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

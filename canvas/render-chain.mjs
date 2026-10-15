#!/usr/bin/env node
// render-chain — render one chain.json (canvas/chain.schema.md v1) as a single
// self-contained dark HTML page: requirement card → understanding-verification
// card → vertical step timeline with expandable decision drawers → artifact
// and acceptance footer. No network, no dependencies, same offline contract
// as workflow-diagram's html.mjs.
//
// Usage: node canvas/render-chain.mjs <chain.json> [output.html]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const STATUS_COLOR = {
  passed: "#34d399",
  active: "#22d3ee",
  gated: "#f472b6",
  blocked: "#f87171",
  pending: "#6b7280",
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function card(title, bodyHtml, accent = "#7c3aed") {
  return `<section class="card" style="border-left:3px solid ${accent}">
    <h2>${esc(title)}</h2>
    ${bodyHtml}
  </section>`;
}

function kv(label, value) {
  return `<div class="kv"><span class="k">${esc(label)}</span><span class="v">${value}</span></div>`;
}

function stepHtml(step, index) {
  const color = STATUS_COLOR[step.status] ?? STATUS_COLOR.pending;
  const decision = step.decision
    ? `<div class="decision"><div class="d-row"><span class="q">面对：${esc(step.decision.question)}</span></div>
       <div class="d-row"><span class="a">选择：${esc(step.decision.chose)}</span></div>
       ${step.decision.basis?.length ? `<div class="d-row basis">依据：${step.decision.basis.map((b) => `<a class="basis-link" href="${esc(b)}" target="_blank" rel="noreferrer"><code>${esc(b)}</code></a>`).join(" ")}</div>` : ""}</div>`
    : `<div class="decision warn">⚠ 无决策记录（黑盒步骤）</div>`;
  const evidence = step.evidence?.length
    ? `<div class="ev">${step.evidence.map((e) => `<code>${esc(e)}</code>`).join(" ")}</div>`
    : "";
  return `<details class="step" style="--c:${color}" ${step.status === "active" ? "open" : ""}>
    <summary><span class="dot"></span><span class="idx">${String(index + 1).padStart(2, "0")}</span>
      <span class="t">${esc(step.title)}</span><span class="st" style="color:${color}">${esc(step.status)}</span></summary>
    <div class="body"><p>${esc(step.detail)}</p>${decision}${evidence}</div>
  </details>`;
}

function render(chain) {
  const steps = chain.steps.map(stepHtml).join("\n");
  const req = chain.requirement;
  const vu = chain.verifyUnderstanding ?? {};
  return `<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>${esc(chain.title)} · 需求解析链路</title>
<style>
  :root { color-scheme: dark; --bg:#0a0a0f; --panel:#141420; --line:#26263a; --text:#e6e6f0; --dim:#9a9ab0; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:15px/1.65 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif; padding:32px 20px 64px; overflow-x:hidden; overflow-wrap:anywhere; }
  main { max-width: 860px; margin: 0 auto; }
  h1 { font-size:22px; letter-spacing:-0.01em; margin:0 0 4px; }
  .meta { color:var(--dim); font-size:13px; margin-bottom:24px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin-bottom:14px; }
  .card h2 { font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--dim); margin:0 0 10px; }
  .kv { display:flex; gap:10px; margin:6px 0; min-width:0; }
  .kv .v { min-width:0; overflow-wrap:anywhere; }
  .k { color:var(--dim); min-width:72px; flex:none; font-size:13px; }
  .v { flex:1; }
  .raw { background:#0d0d15; border:1px solid var(--line); border-radius:8px; padding:10px 12px; font-size:14px; color:#d8d8e8; overflow-wrap:anywhere; }
  .compare { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .compare .col h3 { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--dim); margin:0 0 6px; }
  .compare .col .raw { font-size:13px; }
  .vu-badge { display:inline-block; border:1px solid #34d399; border-radius:99px; padding:2px 10px; font-size:12px; color:#34d399; }
  .vu-badge.pending { border-color:#fbbf24; color:#fbbf24; }
  @media (max-width: 640px) { .compare { grid-template-columns:1fr; } }
  a.basis-link { color:#8ab4ff; text-decoration:none; border-bottom:1px dotted #3b5b8f; }
  a.basis-link:hover { border-bottom-color:#8ab4ff; }
  code { background:#0d0d15; border:1px solid var(--line); border-radius:6px; padding:1px 6px; font-size:12px; color:#8ab4ff; word-break:break-all; }
  details.step { background:var(--panel); border:1px solid var(--line); border-left:3px solid var(--c,#6b7280); border-radius:10px; margin-bottom:10px; }
  details.step summary { cursor:pointer; display:flex; align-items:center; gap:10px; padding:12px 16px; list-style:none; }
  details.step summary::-webkit-details-marker { display:none; }
  .dot { width:9px; height:9px; border-radius:50%; background:var(--c); flex:none; }
  .idx { color:var(--dim); font-size:12px; }
  .t { font-weight:600; flex:1; }
  .st { font-size:12px; }
  .body { padding:0 16px 14px 35px; }
  .body p { margin:0 0 10px; }
  .decision { background:#0d0d15; border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin-bottom:8px; font-size:13px; }
  .decision.warn { color:#fbbf24; border-color:#4a3b12; }
  .d-row { margin:3px 0; }
  .q::before { content:""; }
  .a { color:#a7f3d0; }
  .basis code { margin-right:4px; }
  .ev { font-size:12px; }
  footer { margin-top:20px; color:var(--dim); font-size:12px; text-align:center; }
  @media (max-width: 640px) { body { padding:20px 12px 48px; } .kv { flex-direction:column; gap:2px; } }
  @media (prefers-reduced-motion: no-preference) { details.step { transition: border-color .15s ease; } }
</style>
</head>
<body>
<main>
  <h1>${esc(chain.title)} · 需求解析链路</h1>
  <div class="meta">chainId ${esc(chain.chainId)} · 轮次 ${esc(chain.round)} · ${chain.steps.length} 步 · 深色 · 自包含离线页</div>

  ${card("原始口语需求（逐字锚点）", `<div class="raw">${esc(req.raw)}</div>`, "#7c3aed")}
  ${card("解析摘要与范围", kv("摘要", esc(req.summary)) + kv("范围·做", esc((req.scope?.in ?? []).join("、"))) + kv("范围·不做", esc((req.scope?.out ?? []).join("、"))) + kv("关键问题", esc((req.keyQuestions ?? []).join("；"))), "#7c3aed")}
  ${card("理解验证（AI 复述 · 用户比对）", `<div class="compare">
      <div class="col"><h3>原始口语（锚点）</h3><div class="raw">${esc(req.raw)}</div></div>
      <div class="col"><h3>AI 复述（供比对）</h3><div class="raw">${esc(vu.restated ?? "—")}</div></div>
    </div>` + `<div style="margin-top:10px"><span class="vu-badge ${vu.confirmedBy === "user" ? "" : "pending"}">${vu.confirmedBy === "user" ? "✓ 用户已比对确认" : "… 待用户比对确认"}</span>${vu.at ? ` <span class="k">${esc(vu.at)}</span>` : ""}</div>`, "#22d3ee")}
  <h2 style="font-size:13px;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;margin:22px 0 10px">六步链路（点击展开决策依据）</h2>
  ${steps}
  ${chain.artifact ? card("产物", kv("路径", `<code>${esc(chain.artifact.path)}</code>`) + kv("类型", esc(chain.artifact.kind ?? "")), "#34d399") : ""}
  ${chain.acceptance ? card("验收", kv("六维", esc(chain.acceptance.sixDim ?? "—")) + (chain.acceptance.score ? kv("分数", esc(chain.acceptance.score)) : ""), "#34d399") : ""}
  <footer>canvas workbench · chain.schema.md v1 · 本页由 canvas/render-chain.mjs 生成，离线可开</footer>
</main>
</body>
</html>`;
}

const input = process.argv[2];
const output = process.argv[3] ?? path.join(ROOT, "output", `chain-${path.basename(input ?? "chain", ".json")}.html`);
if (!input) {
  console.error("usage: node canvas/render-chain.mjs <chain.json> [output.html]");
  process.exit(2);
}
const chain = JSON.parse(await readFile(path.resolve(input), "utf8"));
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, render(chain));
console.log(`chain rendered: ${output} (${chain.steps.length} steps)`);

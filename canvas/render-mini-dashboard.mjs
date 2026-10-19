#!/usr/bin/env node
// render-mini-dashboard — the first wall mini-product: a dark, data-dense
// pipeline metrics board as one offline self-contained HTML page. Serves as
// the reference implementation for the dark-dense-table-muted-text corpus
// scenario: density from spacing and typography, every text layer (headers,
// footnotes, captions) at 4.5:1 or above.
//
// Usage: node canvas/render-mini-dashboard.mjs [output.html]

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const rows = [
  { stage: "brief", gate: "A · gated", states: "方向稿已呈交", evidence: 1, note: "等用户裁决" },
  { stage: "reference", gate: "B · passed", states: "对标集完成", evidence: 3, note: "Onlook/bolt/v0 家族" },
  { stage: "contract", gate: "C · pending", states: "待门 A 后定 token", evidence: 0, note: "语义色与弹簧参数" },
  { stage: "build", gate: "— · active", states: "增量 1-27 在线", evidence: 27, note: "三页+墙+守卫" },
  { stage: "verify", gate: "E · pending", states: "每增量实测", evidence: 27, note: "对比度/键盘/console" },
  { stage: "deliver", gate: "F · pending", states: "产物入墙", evidence: 3, note: "含本 mini 产物" },
];

const body = rows
  .map(
    (r) => `<tr>
      <td class="stage-cell">${r.stage}</td>
      <td class="gate-cell">${r.gate}</td>
      <td>${r.states}</td>
      <td class="num">${r.evidence}</td>
      <td class="muted">${r.note}</td>
    </tr>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>画布流水线指标 mini 看板</title>
<style>
  :root { color-scheme: dark; --bg:#0a0a0f; --panel:#141420; --line:#26263a; --text:#e6e6f0; --dim:#9a9ab0; --accent:#7c3aed; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:14px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif; padding:28px 18px 56px; overflow-x:hidden; overflow-wrap:anywhere; }
  main { max-width:880px; margin:0 auto; }
  h1 { font-size:19px; margin:0 0 4px; }
  .meta { color:var(--dim); font-size:12px; margin-bottom:16px; }
  .board { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:6px 12px 12px; overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  caption { caption-side:top; text-align:left; color:var(--dim); font-size:12px; padding:10px 2px; }
  th { color:var(--dim); font-weight:500; text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); white-space:nowrap; }
  td { padding:8px 10px; border-bottom:1px solid var(--line); }
  tr:last-child td { border-bottom:none; }
  td.num { font-variant-numeric:tabular-nums; text-align:right; }
  td.muted { color:var(--dim); font-size:12px; }
  td.stage-cell { font-weight:600; white-space:nowrap; }
  td.gate-cell { font-size:12px; white-space:nowrap; }
  .footnote { color:var(--dim); font-size:12px; margin-top:12px; }
  .footnote code { background:#0d0d15; border:1px solid var(--line); border-radius:6px; padding:1px 6px; font-size:11px; color:#8ab4ff; }
  footer { margin-top:20px; color:var(--dim); font-size:12px; text-align:center; }
  @media (max-width: 560px) { th, td { padding:6px 6px; } td.muted { display:none; } th:nth-child(5) { display:none; } }
</style>
</head>
<body>
<main>
  <h1>画布流水线指标 mini 看板</h1>
  <div class="meta">产物墙 mini 产物第 1 件 · 增量 28 · 2026-10-19 · 离线自包含 · 数据快照 canvas-workbench.state.json</div>
  <div class="board">
    <table>
      <caption>六阶段 × 门态 × 证据数快照：密度来自行高与列节奏，muted 文本仍过 4.5:1（dark-dense-table-muted-text 参考实现）</caption>
      <thead><tr><th scope="col">阶段</th><th scope="col">门态</th><th scope="col">状态</th><th scope="col" class="num">证据数</th><th scope="col">备注</th></tr></thead>
      <tbody>
${body}
      </tbody>
    </table>
  </div>
  <p class="footnote">口径：证据数=该阶段在本仓台账（iteration-log/gates/artifacts）可指认的留痕条数，非进度百分比；门态=canvas-workbench.state.json 快照，权威源以 <code>npm run canvas:build</code> 重建为准。</p>
  <footer>mini-dashboard · 由 canvas/render-mini-dashboard.mjs 生成 · npm run canvas:build 重建全部</footer>
</main>
</body>
</html>`;

const output = process.argv[2] ?? path.join(ROOT, "output", "mini-dashboard.html");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html);
console.log(`mini dashboard rendered: ${output} (${rows.length} stages)`);

// Wraps the rendered SVG in one self-contained HTML document: inline styles,
// inline script, no network access, no external font or library. Opening the
// file offline must give the same result as serving it.
//
// This is a LOCAL status view, not a presentation. There is deliberately no
// playback control: the diagram already shows the real position, and clicking a
// node reveals that stage's artifacts and evidence paths. Playback belongs to a
// showcase page, not to the record of a task in progress.

import { COLORS, STATUS_META } from "./svg.mjs";

export function renderHtml({ svg, model, laid, meta = {} }) {
  const title = meta.title ?? model.title;
  const generated = meta.generated ?? "";
  const task = model.task;
  const stages = model.stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    gates: stage.gates,
    summary: stage.summary,
    output: stage.output,
    evidence: stage.evidence,
    decisionPoint: stage.decisionPoint,
    status: stage.status,
    stageNote: stage.stageNote,
    evidenceActual: stage.evidenceActual,
    isCurrent: stage.isCurrent,
    gateNodes: model.nodes
      .filter((node) => node.kind === "gate" && node.stageId === stage.id)
      .map((node) => ({ id: node.gateId, title: node.title, detail: node.detail, status: node.status, lane: node.lane })),
    nodeIds: model.nodes.filter((node) => node.stageId === stage.id).map((node) => node.id),
  }));
  const statuses = model.statusValues.map((item) => item.id);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(task ? `${task.name} · ${title}` : title)}</title>
<style>${styles()}</style>
</head>
<body data-theme="dark">
<div class="wf-shell">

<header class="wf-topbar">
  <div class="wf-brand">
    <span class="wf-pulse" aria-hidden="true"></span>
    <span class="wf-brand-text">${escapeHtml(title)}</span>
    ${task ? `<span class="wf-brand-task">${escapeHtml(task.name)}</span>` : ""}
  </div>
  <div class="wf-toolbar" role="toolbar" aria-label="视图控制">
    <button type="button" class="wf-tool" id="wf-theme" aria-pressed="true" title="切换明暗主题">
      <span class="wf-tool-dot" aria-hidden="true"></span><span class="wf-tool-label">深色</span>
    </button>
    <button type="button" class="wf-tool" id="wf-focus" aria-pressed="false" title="只高亮当前阶段，其余变暗">
      <span class="wf-tool-label">聚焦</span>
    </button>
    <button type="button" class="wf-tool" id="wf-labels" aria-pressed="true" title="显示或隐藏连线说明">
      <span class="wf-tool-label">标注</span>
    </button>
    <button type="button" class="wf-tool" id="wf-export" title="导出当前图为 SVG">
      <span class="wf-tool-label">导出</span>
    </button>
  </div>
</header>

${
  task
    ? `<section class="wf-status-bar" aria-label="任务状态">
  <div class="wf-status-main">
    <span class="wf-chip wf-chip-${task.currentStage ? currentStatus(stages) : "pending"}">${escapeHtml(
      task.currentStage ? currentStatusLabel(stages, model.statusValues) : "未开始",
    )}</span>
    <span class="wf-status-progress">
      <strong>${task.progress.passed}</strong> / ${task.progress.total} 阶段
    </span>
    ${
      task.currentStage
        ? `<span class="wf-status-where">当前停在 <strong>${escapeHtml(stageName(stages, task.currentStage))}</strong></span>`
        : ""
    }
    ${task.revision ? `<span class="wf-status-rev">${escapeHtml(task.revision)}</span>` : ""}
  </div>
  <ol class="wf-rail" aria-label="阶段推进">
    ${stages
      .map(
        (stage) =>
          `<li class="wf-rail-item" data-stage="${escapeHtml(stage.id)}" data-status="${escapeHtml(stage.status)}"${
            stage.isCurrent ? ' data-current="true"' : ""
          }>` +
          `<button type="button" class="wf-rail-btn" data-stage="${escapeHtml(stage.id)}" ` +
          `aria-label="${escapeHtml(stage.name)}，${escapeHtml(statusLabel(model.statusValues, stage.status))}">` +
          `<span class="wf-rail-mark" aria-hidden="true">${railMark(stage.status)}</span>` +
          `<span class="wf-rail-name">${escapeHtml(stage.name)}</span>` +
          `</button></li>`,
      )
      .join("")}
  </ol>
  ${task.blockedReason ? `<p class="wf-blocked">受阻：${escapeHtml(task.blockedReason)}</p>` : ""}
</section>`
    : ""
}

<section class="wf-board">
  <div class="wf-canvas" id="wf-canvas">
    ${svg.replace("<svg ", `<svg style="width:${Math.round(laid.width)}px" `)}
  </div>
</section>

<aside class="wf-detail" id="wf-detail" aria-live="polite">
  <div class="wf-detail-empty">
    <p>点击图上任意<strong>阶段</strong>或<strong>确认门</strong>，查看该处的产物、证据与待确认事项。</p>
  </div>
</aside>

<footer class="wf-foot">
  <span class="wf-foot-note">${escapeHtml(model.note)}</span>
  ${generated ? `<span class="wf-foot-meta">生成于 ${escapeHtml(generated)}</span>` : ""}
</footer>

</div>
<script>${script(stages, statuses)}</script>
</body>
</html>
`;
}

function currentStatus(stages) {
  return stages.find((stage) => stage.isCurrent)?.status ?? "pending";
}

function currentStatusLabel(stages, statusValues) {
  return statusLabel(statusValues, currentStatus(stages));
}

function railMark(status) {
  if (status === "passed") return "✓";
  if (status === "gated") return "⏸";
  if (status === "active") return "▶";
  if (status === "blocked") return "!";
  return "○";
}

function stageName(stages, id) {
  return stages.find((stage) => stage.id === id)?.name ?? id;
}

function statusLabel(statusValues, id) {
  return statusValues.find((item) => item.id === id)?.label ?? id;
}

function styles() {
  return `
:root{
  --bg:${COLORS.canvas}; --fg:${COLORS.ink}; --muted:${COLORS.muted}; --line:${COLORS.hairline};
  --panel:#f7f9fb; --raised:#ffffff;
  --accent:#1f7a5c; --gate:#b3244a; --rework:#b5711b; --blocked:#c2410c;
  /* SVG theme hooks: the renderer emits var(--wf-*, <light fallback>) so the
     same markup follows the theme without re-rendering. */
  --wf-canvas:${COLORS.canvas};
  --wf-line:${COLORS.hairline};
  --wf-lane:${COLORS.laneFill};
  --wf-lane-gate:${COLORS.laneFillGate};
  --wf-lane-rework:${COLORS.laneFillRework};
  --wf-node-stage-fill:${COLORS.stage.fill};
  --wf-node-stage-stroke:${COLORS.stage.stroke};
  --wf-node-gate-fill:${COLORS.gate.fill};
  --wf-node-gate-stroke:${COLORS.gate.stroke};
  --wf-node-rework-fill:${COLORS.rework.fill};
  --wf-node-rework-stroke:${COLORS.rework.stroke};
  --font:ui-sans-serif,-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  --mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
}
body[data-theme="dark"]{
  --bg:#0a151c; --fg:#e6edf3; --muted:#8fa3b0; --line:#1d2c36;
  --panel:#0f1e27; --raised:#132430;
  --accent:#4cc38a; --gate:#e5637f; --rework:#e0a355; --blocked:#f97316;
  --wf-canvas:#0f1e27;
  --wf-line:#20323d;
  --wf-lane:#12232d;
  --wf-lane-gate:#1b1a24;
  --wf-lane-rework:#1d1c18;
  --wf-node-stage-fill:#13302c;
  --wf-node-stage-stroke:#4cc38a;
  --wf-node-gate-fill:#301a24;
  --wf-node-gate-stroke:#e5637f;
  --wf-node-rework-fill:#2e2519;
  --wf-node-rework-stroke:#e0a355;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font);line-height:1.6;
  -webkit-font-smoothing:antialiased}
.wf-shell{max-width:1720px;margin:0 auto;padding:0 20px 32px}

/* Top bar: brand on the left, compact icon toolbar on the right. */
.wf-topbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;
  padding:14px 0 12px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:20}
.wf-brand{display:flex;align-items:center;gap:10px;min-width:0}
.wf-pulse{width:9px;height:9px;border-radius:50%;background:var(--accent);flex:none;
  box-shadow:0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent);animation:wf-pulse 2.6s ease-out infinite}
@keyframes wf-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 55%,transparent)}
  70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}
.wf-brand-text{font-size:14.5px;font-weight:650;letter-spacing:-.01em}
.wf-brand-task{font-size:12px;color:var(--muted);padding-left:10px;border-left:1px solid var(--line);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:34ch}
.wf-toolbar{display:flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--line);
  border-radius:11px;background:var(--panel)}
.wf-tool{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 12px;border:0;
  border-radius:8px;background:transparent;color:var(--muted);font:inherit;font-size:12.5px;cursor:pointer;
  transition:background .16s,color .16s}
.wf-tool:hover{background:var(--raised);color:var(--fg)}
.wf-tool:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.wf-tool[aria-pressed="true"]{background:var(--raised);color:var(--fg)}
.wf-tool-dot{width:11px;height:11px;border-radius:3px;background:var(--fg);flex:none;opacity:.75}

/* Status bar: the answer to "where is this task" in one line. */
.wf-status-bar{padding:16px 0 4px}
.wf-status-main{display:flex;flex-wrap:wrap;align-items:center;gap:12px;font-size:13px}
.wf-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:650;
  border-radius:7px;padding:3px 10px;color:#fff;background:var(--muted)}
.wf-chip-passed{background:var(--accent)}
.wf-chip-gated{background:var(--gate)}
.wf-chip-blocked{background:var(--blocked)}
.wf-chip-active{background:var(--accent)}
.wf-status-progress{font-variant-numeric:tabular-nums;color:var(--muted)}
.wf-status-progress strong{color:var(--fg);font-size:15px}
.wf-status-where{color:var(--muted)}
.wf-status-rev{font-family:var(--mono);font-size:11.5px;color:var(--muted);
  border:1px solid var(--line);border-radius:5px;padding:1px 7px}
.wf-blocked{margin:8px 0 0;font-size:12.5px;color:var(--blocked)}

/* Stage rail: each node lights according to its real status. */
.wf-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:6px;
  list-style:none;margin:14px 0 0;padding:0;overflow-x:auto}
.wf-rail-item{min-width:0}
.wf-rail-btn{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:6px 10px;
  border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--muted);
  font:inherit;font-size:12.5px;cursor:pointer;text-align:left;transition:border-color .16s,background .16s,color .16s}
.wf-rail-btn:hover{border-color:var(--accent)}
.wf-rail-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wf-rail-mark{font-size:12px;width:1em;text-align:center;flex:none}
.wf-rail-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wf-rail-item[data-status="passed"] .wf-rail-btn{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 40%,var(--line))}
.wf-rail-item[data-status="gated"] .wf-rail-btn{color:var(--gate);border-color:color-mix(in srgb,var(--gate) 45%,var(--line))}
.wf-rail-item[data-status="blocked"] .wf-rail-btn{color:var(--blocked);border-color:color-mix(in srgb,var(--blocked) 45%,var(--line))}
.wf-rail-item[data-status="active"] .wf-rail-btn{color:var(--accent)}
.wf-rail-item[data-current="true"] .wf-rail-btn{background:var(--raised);color:var(--fg);
  box-shadow:inset 0 0 0 1.5px var(--accent);font-weight:650}

/* Board */
.wf-board{margin-top:18px;border:1px solid var(--line);border-radius:14px;background:var(--panel);overflow:hidden}
.wf-canvas{padding:16px;overflow-x:auto}
.wf-svg{display:block;height:auto;max-width:none}
.wf-svg text{fill:var(--fg)}
.wf-lane-label{fill:var(--muted) !important;font-size:12px;font-weight:650}
.wf-col-label{fill:var(--fg) !important;font-size:13px;font-weight:650}
.wf-col-meta{fill:var(--muted) !important;font-size:11px}
.wf-node-step{fill:var(--muted) !important;font-size:10px;font-weight:700}
.wf-node-title{fill:var(--fg) !important;font-size:13.5px;font-weight:650}
.wf-node-sub{fill:var(--muted) !important;font-size:11px}
.wf-edge-label{fill:var(--muted) !important;font-size:10.5px}
.wf-status-glyph{fill:#fff !important;font-size:10px;font-weight:700}
.wf-node{cursor:pointer}
.wf-node:focus-visible{outline:none}
.wf-node:focus-visible rect{stroke-width:3.5}
.wf-node[data-selected="true"] rect{stroke-width:3.5}
.wf-node[data-dim="true"]{opacity:.26}
.wf-edge[data-dim="true"]{opacity:.16}
body[data-labels="off"] .wf-edge-label{display:none}
body[data-focus="on"] .wf-node[data-dim="true"]{opacity:.14}

/* Detail panel: what a gate or stage is holding, and where it lives. */
.wf-detail{margin-top:16px}
.wf-detail-empty{border:1px dashed var(--line);border-radius:12px;padding:20px 22px;color:var(--muted);font-size:13px}
.wf-detail-empty p{margin:0}
.wf-card{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:18px 20px}
.wf-card-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.wf-card-kind{font-size:11px;font-weight:650;letter-spacing:.04em;border-radius:6px;padding:2px 8px;
  color:#fff;background:var(--muted)}
.wf-card-kind-stage{background:var(--accent)}
.wf-card-kind-gate{background:var(--gate)}
.wf-card-kind-rework{background:var(--rework)}
.wf-card h2{margin:0;font-size:17px;font-weight:680}
.wf-card-status{font-size:12px;font-weight:650;border-radius:6px;padding:2px 9px;color:#fff;background:var(--muted)}
.wf-card-status[data-status="passed"]{background:var(--accent)}
.wf-card-status[data-status="gated"]{background:var(--gate)}
.wf-card-status[data-status="blocked"]{background:var(--blocked)}
.wf-card-summary{margin:12px 0 0;font-size:13.5px;color:var(--muted);max-width:74ch}
.wf-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin-top:16px}
.wf-field{border-top:1px solid var(--line);padding-top:12px}
.wf-field h3{margin:0 0 6px;font-size:11.5px;font-weight:650;letter-spacing:.04em;color:var(--muted)}
.wf-field p{margin:0;font-size:13px}
.wf-field ul{margin:0;padding-left:0;list-style:none;display:grid;gap:6px}
.wf-field li{font-size:12.5px;display:flex;flex-wrap:wrap;align-items:baseline;gap:8px}
.wf-path{font-family:var(--mono);font-size:11.5px;background:var(--raised);border:1px solid var(--line);
  border-radius:5px;padding:2px 7px;color:var(--fg);word-break:break-all}
.wf-expected{font-size:11px;color:var(--muted);border:1px dashed var(--line);border-radius:5px;padding:1px 6px}
.wf-note-line{margin:10px 0 0;font-size:12.5px;color:var(--muted);border-left:2px solid var(--line);padding-left:10px}
.wf-wait{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--gate);font-weight:650}
.wf-gate-list{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.wf-gate-item{border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:var(--raised)}
.wf-gate-item strong{font-size:13px}
.wf-gate-item p{margin:5px 0 0;font-size:12.5px;color:var(--muted)}
.wf-foot{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:space-between;
  margin-top:18px;padding-top:12px;border-top:1px solid var(--line);font-size:11.5px;color:var(--muted)}

@media (min-width:900px){
  .wf-grid{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
}
@media (max-width:640px){
  .wf-shell{padding:0 12px 24px}
  .wf-brand-task{display:none}
  .wf-tool-label{display:none}
  .wf-tool{min-height:40px;padding:0 11px}
  .wf-canvas{padding:10px}
}
@media (prefers-reduced-motion:reduce){
  .wf-pulse{animation:none}
}
`;
}

function script(stages, statuses) {
  const data = JSON.stringify(stages);
  const statusLabels = JSON.stringify(
    Object.fromEntries(statuses.map((id) => [id, STATUS_META[id]?.label ?? id])),
  );
  const gates = JSON.stringify(
    Object.fromEntries(
      stages.flatMap((stage) => stage.gateNodes.map((gate) => [gate.id, { ...gate, stageId: stage.id }])),
    ),
  );
  return `
(function(){
  var STAGES = ${data};
  var STATUS_LABEL = ${statusLabels};
  var GATES = ${gates};
  var svg = document.querySelector('.wf-svg');
  var detail = document.getElementById('wf-detail');
  var themeBtn = document.getElementById('wf-theme');
  var focusBtn = document.getElementById('wf-focus');
  var labelsBtn = document.getElementById('wf-labels');
  var exportBtn = document.getElementById('wf-export');

  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function allNodes(){ return Array.prototype.slice.call(svg.querySelectorAll('.wf-node')); }
  function allEdges(){ return Array.prototype.slice.call(svg.querySelectorAll('.wf-edge')); }
  function stageOf(id){ for (var i=0;i<STAGES.length;i++) if (STAGES[i].id===id) return STAGES[i]; return null; }

  function clearSelection(){
    allNodes().forEach(function(n){ n.removeAttribute('data-selected'); n.removeAttribute('data-dim'); });
    allEdges().forEach(function(e){ e.removeAttribute('data-dim'); });
  }

  function selectNode(nodeId){
    var node = svg.querySelector('.wf-node[data-node="'+nodeId+'"]');
    if (!node) return;
    var keep = {};
    keep[nodeId] = true;
    allNodes().forEach(function(n){
      var on = n.getAttribute('data-node') === nodeId;
      n.setAttribute('data-selected', on ? 'true' : 'false');
      n.setAttribute('data-dim', on ? 'false' : 'true');
    });
    allEdges().forEach(function(e){
      var hit = e.getAttribute('data-from') === nodeId || e.getAttribute('data-to') === nodeId;
      e.setAttribute('data-dim', hit ? 'false' : 'true');
    });
    var stageId = node.getAttribute('data-stage');
    var kind = node.getAttribute('data-kind');
    if (kind === 'gate') renderGate(node.getAttribute('data-node').replace('gate:',''), stageId);
    else renderStage(stageId);
  }

  function pathRow(label, path, expected){
    if (!path && !expected) return '';
    if (path) return '<li><span class="wf-path">'+esc(path)+'</span></li>';
    return '<li><span class="wf-path">'+esc(expected)+'</span><span class="wf-expected">预期位置，尚未产出</span></li>';
  }

  function renderStage(stageId){
    var stage = stageOf(stageId);
    if (!stage){ detail.innerHTML=''; return; }
    var actual = stage.evidenceActual;
    var expected = stage.evidence;
    var gates = stage.gateNodes.map(function(g){
      return '<li class="wf-gate-item"><strong>'+esc(g.title)+'</strong>'+
        '<p>'+esc(STATUS_LABEL[g.status] || g.status)+(g.lane==='user' ? ' · 用户确认门' : ' · 留痕要求（不阻塞）')+'</p>'+
        '<p>'+esc(g.detail || '')+'</p></li>';
    }).join('');
    detail.innerHTML =
      '<div class="wf-card">'+
        '<div class="wf-card-head">'+
          '<span class="wf-card-kind wf-card-kind-stage">阶段</span>'+
          '<h2>'+esc(stage.name)+'</h2>'+
          '<span class="wf-card-status" data-status="'+esc(stage.status)+'">'+esc(STATUS_LABEL[stage.status]||stage.status)+'</span>'+
        '</div>'+
        '<p class="wf-card-summary">'+esc(stage.summary)+'</p>'+
        '<div class="wf-grid">'+
          '<div class="wf-field"><h3>产物与证据</h3><ul>'+
            pathRow('证据', actual, expected)+
          '</ul>'+
          (stage.stageNote ? '<p class="wf-note-line">'+esc(stage.stageNote)+'</p>' : '')+
          '</div>'+
          '<div class="wf-field"><h3>阶段产出</h3><p>'+esc(stage.output || '—')+'</p>'+
            '<h3 style="margin-top:12px">决策</h3><p>'+esc(stage.decisionPoint ? '用户确认' : '按规则推进')+'</p>'+
          '</div>'+
        '</div>'+
        (gates ? '<div class="wf-field"><h3>该阶段的门</h3><ul class="wf-gate-list">'+gates+'</ul></div>' : '')+
      '</div>';
  }

  function renderGate(gateId, stageId){
    var gate = GATES[gateId];
    var stage = stageOf(stageId);
    if (!gate || !stage){ detail.innerHTML=''; return; }
    var waiting = gate.status === 'gated';
    detail.innerHTML =
      '<div class="wf-card">'+
        '<div class="wf-card-head">'+
          '<span class="wf-card-kind wf-card-kind-gate">确认门</span>'+
          '<h2>'+esc(gate.title)+'</h2>'+
          '<span class="wf-card-status" data-status="'+esc(gate.status)+'">'+esc(STATUS_LABEL[gate.status]||gate.status)+'</span>'+
        '</div>'+
        (waiting ? '<p class="wf-card-summary"><span class="wf-wait">⏸ 等待确认</span></p>' : '')+
        '<div class="wf-grid">'+
          '<div class="wf-field"><h3>本门需要确认的稿件</h3><p>'+esc(gate.detail || '—')+'</p>'+
            '<h3 style="margin-top:12px">稿件位置</h3><ul>'+
              pathRow('证据', stage.evidenceActual, stage.evidence)+
            '</ul></div>'+
          '<div class="wf-field"><h3>所属阶段</h3><p>'+esc(stage.name)+'</p>'+
            '<h3 style="margin-top:12px">裁决方式</h3><p>'+
              esc(gate.lane === 'user' ? '用户确认后放行' : '留痕要求，不阻塞流程')+'</p>'+
          '</div>'+
        '</div>'+
        (stage.stageNote ? '<p class="wf-note-line">'+esc(stage.stageNote)+'</p>' : '')+
      '</div>';
  }

  svg.addEventListener('click', function(ev){
    var node = ev.target.closest ? ev.target.closest('.wf-node') : null;
    if (!node) return;
    selectNode(node.getAttribute('data-node'));
  });
  svg.addEventListener('keydown', function(ev){
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var node = ev.target.closest ? ev.target.closest('.wf-node') : null;
    if (!node) return;
    ev.preventDefault();
    selectNode(node.getAttribute('data-node'));
  });

  var railBtns = document.querySelectorAll('.wf-rail-btn');
  Array.prototype.forEach.call(railBtns, function(btn){
    btn.addEventListener('click', function(){
      var stageId = btn.getAttribute('data-stage');
      var node = svg.querySelector('.wf-node[data-node="stage:'+stageId+'"]');
      if (node) selectNode('stage:'+stageId);
    });
  });

  if (themeBtn) themeBtn.addEventListener('click', function(){
    var dark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', dark ? 'light' : 'dark');
    themeBtn.setAttribute('aria-pressed', dark ? 'false' : 'true');
    themeBtn.querySelector('.wf-tool-label').textContent = dark ? '浅色' : '深色';
  });
  if (focusBtn) focusBtn.addEventListener('click', function(){
    var on = document.body.getAttribute('data-focus') === 'on';
    document.body.setAttribute('data-focus', on ? 'off' : 'on');
    focusBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
  });
  if (labelsBtn) labelsBtn.addEventListener('click', function(){
    var off = document.body.getAttribute('data-labels') === 'off';
    document.body.setAttribute('data-labels', off ? 'on' : 'off');
    labelsBtn.setAttribute('aria-pressed', off ? 'true' : 'false');
  });
  if (exportBtn) exportBtn.addEventListener('click', function(){
    var clone = svg.cloneNode(true);
    clone.querySelectorAll('[data-dim]').forEach(function(el){ el.removeAttribute('data-dim'); });
    clone.querySelectorAll('[data-selected]').forEach(function(el){ el.removeAttribute('data-selected'); });
    var blob = new Blob([new XMLSerializer().serializeToString(clone)], {type:'image/svg+xml'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workflow-diagram.svg';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
  });

  // Open on the stage the record says the task is on, so the first thing the
  // reader sees is where the work actually stands.
  var current = null;
  for (var i=0;i<STAGES.length;i++) if (STAGES[i].isCurrent) current = STAGES[i];
  if (current){
    var node = svg.querySelector('.wf-node[data-node="stage:'+current.id+'"]');
    if (node) selectNode('stage:'+current.id);
  } else {
    clearSelection();
  }
})();
`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

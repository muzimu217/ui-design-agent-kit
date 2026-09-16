// Wraps the rendered SVG in one self-contained HTML document: inline styles,
// inline script, no network access, no external font or library. Opening the
// file offline must give the same result as serving it.

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
<body data-theme="light">
<header class="wf-header">
  <div class="wf-heading">
    <span class="wf-dot" aria-hidden="true"></span>
    <h1>${escapeHtml(title)}</h1>
  </div>
  <div class="wf-controls">
    <button type="button" id="wf-theme" class="wf-btn" aria-pressed="false">深色</button>
    <button type="button" id="wf-play" class="wf-btn wf-btn-primary">播放流程</button>
    <button type="button" id="wf-step" class="wf-btn">下一步</button>
    <button type="button" id="wf-reset" class="wf-btn">重置</button>
    <button type="button" id="wf-export" class="wf-btn">导出 SVG</button>
  </div>
</header>

${
  task
    ? `<section class="wf-task" aria-label="任务状态">
  <div class="wf-task-head">
    <span class="wf-task-badge">任务状态</span>
    <strong>${escapeHtml(task.name)}</strong>
    ${task.revision ? `<span class="wf-task-meta">${escapeHtml(task.revision)}</span>` : ""}
    ${task.updatedOn ? `<span class="wf-task-meta">更新于 ${escapeHtml(task.updatedOn)}</span>` : ""}
  </div>
  <p class="wf-task-line">
    已完成 <strong>${task.progress.passed}</strong> / ${task.progress.total} 个阶段${
      task.currentStage ? ` · 当前停在「${escapeHtml(stageName(stages, task.currentStage))}」` : ""
    }
  </p>
  ${task.blockedReason ? `<p class="wf-task-blocked">受阻原因：${escapeHtml(task.blockedReason)}</p>` : ""}
</section>`
    : ""
}

<section class="wf-intro">
  <p class="wf-note">${escapeHtml(model.note)}</p>
  ${task?.note ? `<p class="wf-note">${escapeHtml(task.note)}</p>` : ""}
  ${generated ? `<p class="wf-generated">生成于 ${escapeHtml(generated)}</p>` : ""}
</section>

<section class="wf-progress" aria-live="polite">
  <div class="wf-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${stages.length}" aria-valuenow="0" id="wf-bar"><span></span></div>
  <p class="wf-step-note" id="wf-step-note">${
    task
      ? "图上的状态来自任务记录。播放或按「下一步」逐步查看每个阶段与确认门。"
      : "尚未开始。播放或按「下一步」逐步查看每个阶段与确认门。"
  }</p>
</section>

<nav class="wf-legend" aria-label="图例">
  ${legendItems(statuses)}
</nav>

<div class="wf-stage-rail" role="tablist" aria-label="交付阶段">
  ${stages
    .map(
      (stage, index) =>
        `<button type="button" role="tab" class="wf-stage-tab" data-stage="${escapeHtml(stage.id)}" ` +
        `data-status="${escapeHtml(stage.status)}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">` +
        `<span class="wf-stage-name">${escapeHtml(stage.name)}</span>` +
        `<span class="wf-stage-meta">${stage.gates.length ? `门 ${stage.gates.join("/")}` : "无门"} · ${escapeHtml(statusLabel(model.statusValues, stage.status))}</span>` +
        `</button>`,
    )
    .join("")}
</div>

<main class="wf-canvas" id="wf-canvas">
  ${svg.replace("<svg ", `<svg style="width:${Math.round(laid.width)}px" `)}
</main>

<aside class="wf-panel" id="wf-panel" aria-live="polite"></aside>

<section class="wf-cards">
  ${cards(stages, model)}
</section>

<script>${script(stages, statuses)}</script>
</body>
</html>
`;
}

function stageName(stages, id) {
  return stages.find((stage) => stage.id === id)?.name ?? id;
}

function statusLabel(statusValues, id) {
  return statusValues.find((item) => item.id === id)?.label ?? id;
}

function legendItems(statuses) {
  const nodeKinds = [
    ["stage", "交付环节"],
    ["gate", "确认门（用户）"],
    ["rework", "返工"],
  ];
  const edgeKinds = [
    ["flow", "顺序流"],
    ["pass", "门通过"],
    ["return", "不通过 → 返工"],
  ];
  const statusItems = statuses.map((id) => {
    const meta = STATUS_META[id];
    return `<span class="wf-legend-item"><span class="wf-swatch" style="--swatch:${meta.badge}"></span>${escapeHtml(meta.label)}</span>`;
  });
  const kindItems = [...nodeKinds, ...edgeKinds].map(([kind, label]) => {
    const color = COLORS[kind]?.stroke ?? COLORS.edge[kind] ?? COLORS.muted;
    return `<span class="wf-legend-item"><span class="wf-swatch" style="--swatch:${color}"></span>${escapeHtml(label)}</span>`;
  });
  return (
    `<span class="wf-legend-group">形状</span>${kindItems.join("")}` +
    `<span class="wf-legend-group">状态</span>${statusItems.join("")}`
  );
}

function cards(stages, model) {
  const gated = stages.filter((stage) => stage.gates.length);
  const statusLabelOf = (id) => statusLabel(model.statusValues, id);
  return `
  <article class="wf-card">
    <h2>主线</h2>
    <ol>${stages
      .map(
        (stage) =>
          `<li><span class="wf-card-status" data-status="${escapeHtml(stage.status)}">${escapeHtml(
            statusLabelOf(stage.status),
          )}</span>${escapeHtml(stage.name)}${stage.gates.length ? `（门 ${stage.gates.join("/")}）` : ""}</li>`,
      )
      .join("")}</ol>
  </article>
  <article class="wf-card">
    <h2>停点</h2>
    <p>${gated.length} 个阶段设有确认门，未通过不得进入下一环节。</p>
    <ul>${gated
      .map(
        (stage) =>
          `<li>${escapeHtml(stage.name)}：${escapeHtml(statusLabelOf(stage.status))}${
            stage.stageNote ? ` · ${escapeHtml(stage.stageNote)}` : ""
          }</li>`,
      )
      .join("")}</ul>
  </article>
  <article class="wf-card">
    <h2>证据</h2>
    <ul>${stages
      .map(
        (stage) =>
          `<li>${escapeHtml(stage.name)}：${escapeHtml(stage.evidenceActual ?? stage.evidence ?? "—")}${
            stage.evidenceActual ? "" : `<span class="wf-card-expected">（预期）</span>`
          }</li>`,
      )
      .join("")}</ul>
  </article>`;
}

function styles() {
  return `
:root{
  --bg:#ffffff; --fg:${COLORS.ink}; --muted:${COLORS.muted}; --line:${COLORS.hairline};
  --card:#f7f9fb; --accent:#1f7a5c; --gate:#b3244a; --rework:#b5711b; --blocked:#c2410c;
  --font:ui-sans-serif,-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
}
body[data-theme="dark"]{
  --bg:#0f1419; --fg:#e6edf3; --muted:#93a1b0; --line:#243039; --card:#161d24;
  --accent:#4cc38a; --gate:#e5637f; --rework:#e0a355; --blocked:#f97316;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font);line-height:1.6;
  -webkit-font-smoothing:antialiased}
.wf-header{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid var(--line)}
.wf-heading{display:flex;align-items:center;gap:10px;min-width:0}
.wf-dot{width:10px;height:10px;border-radius:50%;background:var(--accent);flex:none}
h1{font-size:20px;margin:0;font-weight:650;letter-spacing:-.01em}
.wf-controls{display:flex;flex-wrap:wrap;gap:8px}
.wf-btn{min-height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line);background:var(--card);
  color:var(--fg);font:inherit;font-size:14px;cursor:pointer;transition:background .15s,border-color .15s}
.wf-btn:hover{border-color:var(--accent)}
.wf-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wf-btn-primary{background:var(--accent);border-color:var(--accent);color:#fff}
.wf-btn[disabled]{opacity:.5;cursor:not-allowed}
.wf-intro{padding:16px 24px 0}
.wf-task{margin:16px 24px 0;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:14px 16px}
.wf-task-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.wf-task-badge{font-size:11.5px;font-weight:650;letter-spacing:.04em;color:#fff;background:var(--accent);border-radius:6px;padding:2px 8px}
.wf-task-head strong{font-size:15px}
.wf-task-meta{font-size:12px;color:var(--muted)}
.wf-task-line{margin:8px 0 0;font-size:13.5px;color:var(--muted)}
.wf-task-blocked{margin:6px 0 0;font-size:13px;color:var(--blocked)}
.wf-note{margin:0;color:var(--muted);font-size:14px;max-width:70ch}
.wf-generated{margin:4px 0 0;color:var(--muted);font-size:12px}
.wf-progress{padding:12px 24px 0}
.wf-bar{height:6px;border-radius:99px;background:var(--card);overflow:hidden;border:1px solid var(--line)}
.wf-bar span{display:block;height:100%;width:0;background:var(--accent);transition:width .3s ease}
.wf-step-note{margin:8px 0 0;font-size:13px;color:var(--muted);min-height:1.5em}
.wf-legend{display:flex;flex-wrap:wrap;gap:14px;padding:14px 24px;margin:0;list-style:none}
.wf-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted)}
.wf-legend-group{font-size:11.5px;font-weight:650;color:var(--fg);opacity:.7;padding:2px 0}
.wf-swatch{width:12px;height:12px;border-radius:3px;background:var(--swatch);flex:none}
.wf-stage-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(120px,1fr);gap:8px;
  padding:0 24px 12px;overflow-x:auto}
.wf-stage-tab{display:flex;flex-direction:column;gap:2px;align-items:flex-start;min-height:56px;
  padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);
  color:var(--fg);font:inherit;cursor:pointer;text-align:left}
.wf-stage-tab[aria-selected="true"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.wf-stage-tab[data-status="passed"] .wf-stage-name::before{content:"✓ ";color:var(--accent)}
.wf-stage-tab[data-status="gated"] .wf-stage-name::before{content:"⏸ ";color:var(--gate)}
.wf-stage-tab[data-status="active"] .wf-stage-name::before{content:"▶ ";color:var(--accent)}
.wf-stage-tab[data-status="blocked"] .wf-stage-name::before{content:"! ";color:var(--blocked)}
.wf-stage-tab:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wf-stage-name{font-size:13.5px;font-weight:600}
.wf-stage-meta{font-size:11.5px;color:var(--muted)}
.wf-canvas{padding:8px 24px 24px;overflow-x:auto}
.wf-svg{display:block;height:auto;max-width:none}
.wf-lane-label{font-size:12px;font-weight:600;fill:var(--muted)}
.wf-col-label{font-size:13px;font-weight:650;fill:var(--fg)}
.wf-col-meta{font-size:11px;fill:var(--muted)}
.wf-node-step{font-size:10px;font-weight:700;fill:var(--muted)}
.wf-node-title{font-size:13.5px;font-weight:650}
.wf-node-sub{font-size:11px;fill:var(--muted)}
.wf-edge-label{font-size:10.5px;fill:var(--muted)}
.wf-node{cursor:pointer}
.wf-node:focus-visible{outline:none}
.wf-node:focus-visible rect{stroke-width:3}
.wf-node[data-dim="true"]{opacity:.28}
.wf-node[data-active="true"] rect{stroke-width:3}
.wf-edge[data-dim="true"]{opacity:.18}
.wf-panel{padding:0 24px 24px}
.wf-panel-inner{border:1px solid var(--line);border-radius:12px;background:var(--card);padding:16px 18px}
.wf-panel h2{margin:0 0 6px;font-size:16px}
.wf-panel dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:10px 0 0;font-size:13.5px}
.wf-panel dt{color:var(--muted)}
.wf-panel dd{margin:0}
.wf-cards{display:grid;gap:14px;padding:0 24px 40px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.wf-card{border:1px solid var(--line);border-radius:12px;background:var(--card);padding:14px 16px}
.wf-card h2{margin:0 0 8px;font-size:14px}
.wf-card ul,.wf-card ol{margin:0;padding-left:18px;font-size:13px;color:var(--muted)}
.wf-card p{margin:0;font-size:13px;color:var(--muted)}
.wf-card-note{margin-top:8px !important}
.wf-card-status{display:inline-block;min-width:3.4em;margin-right:6px;font-size:11.5px;color:var(--muted)}
.wf-card-status[data-status="passed"]{color:var(--accent)}
.wf-card-status[data-status="gated"]{color:var(--gate)}
.wf-card-status[data-status="blocked"]{color:var(--blocked)}
.wf-card-expected{opacity:.7}
@media (max-width:640px){
  .wf-header{padding:16px}
  .wf-controls{width:100%}
  .wf-btn{flex:1 1 auto}
  .wf-intro,.wf-progress,.wf-legend,.wf-stage-rail,.wf-canvas,.wf-panel,.wf-cards{padding-left:16px;padding-right:16px}
  .wf-svg{min-width:640px}
}
@media (prefers-reduced-motion:reduce){
  .wf-bar span{transition:none}
}
`;
}

function script(stages, statuses) {
  const data = JSON.stringify(stages);
  const statusLabels = JSON.stringify(
    Object.fromEntries(statuses.map((id) => [id, STATUS_META[id]?.label ?? id])),
  );
  return `
(function(){
  var STAGES = ${data};
  var STATUS_LABEL = ${statusLabels};
  var stageOrder = STAGES.map(function(s){ return s.id; });
  var cursor = -1;
  var playing = false;
  var timer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var svg = document.querySelector('.wf-svg');
  var panel = document.getElementById('wf-panel');
  var note = document.getElementById('wf-step-note');
  var bar = document.getElementById('wf-bar');
  var barFill = bar ? bar.querySelector('span') : null;
  var playBtn = document.getElementById('wf-play');
  var stepBtn = document.getElementById('wf-step');
  var resetBtn = document.getElementById('wf-reset');
  var themeBtn = document.getElementById('wf-theme');
  var exportBtn = document.getElementById('wf-export');

  // The task's real status is the source of truth for the badge and colour.
  // Playback focus is a separate attribute so stepping through the diagram can
  // never overwrite what the record actually says.
  function realStatus(stageId){
    for (var i=0;i<STAGES.length;i++) if (STAGES[i].id === stageId) return STAGES[i].status;
    return 'pending';
  }
  function nodesOf(stageId){
    return Array.prototype.slice.call(svg.querySelectorAll('.wf-node[data-stage="'+stageId+'"]'));
  }
  function allNodes(){ return Array.prototype.slice.call(svg.querySelectorAll('.wf-node')); }
  function allEdges(){ return Array.prototype.slice.call(svg.querySelectorAll('.wf-edge')); }

  function clearFocus(){
    allNodes().forEach(function(n){ n.setAttribute('data-dim','false'); n.removeAttribute('data-active'); });
    allEdges().forEach(function(e){ e.setAttribute('data-dim','false'); });
  }

  function focusStage(stageId){
    var keep = {};
    nodesOf(stageId).forEach(function(n){ keep[n.getAttribute('data-node')] = true; });
    allNodes().forEach(function(n){
      var isTarget = !!keep[n.getAttribute('data-node')];
      n.setAttribute('data-dim', isTarget ? 'false' : 'true');
      if (isTarget) n.setAttribute('data-active','true'); else n.removeAttribute('data-active');
    });
    allEdges().forEach(function(e){
      var from = e.getAttribute('data-from'), to = e.getAttribute('data-to');
      e.setAttribute('data-dim', (keep[from] || keep[to]) ? 'false' : 'true');
    });
    renderPanel(stageId);
    syncTabs(stageId);
  }

  function syncTabs(stageId){
    var tabs = document.querySelectorAll('.wf-stage-tab');
    Array.prototype.forEach.call(tabs, function(tab){
      var on = tab.getAttribute('data-stage') === stageId;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
  }

  function renderPanel(stageId){
    var stage = null;
    for (var i=0;i<STAGES.length;i++) if (STAGES[i].id === stageId) stage = STAGES[i];
    if (!stage){ panel.innerHTML=''; return; }
    var gates = stage.gates.length ? stage.gates.join('、') : '无';
    panel.innerHTML =
      '<div class="wf-panel-inner">' +
        '<h2>' + esc(stage.name) + '</h2>' +
        '<p>' + esc(stage.summary) + '</p>' +
        '<dl>' +
          '<dt>任务状态</dt><dd>' + esc(STATUS_LABEL[stage.status] || stage.status) + '</dd>' +
          '<dt>确认门</dt><dd>' + esc(gates) + '</dd>' +
          '<dt>阶段产出</dt><dd>' + esc(stage.output) + '</dd>' +
          '<dt>证据</dt><dd>' + esc(stage.evidenceActual || stage.evidence || '—') +
            (stage.evidenceActual ? '' : ' <span class="wf-card-expected">（预期）</span>') + '</dd>' +
          '<dt>决策</dt><dd>' + esc(stage.decisionPoint ? '用户确认' : '按规则推进') + '</dd>' +
        '</dl>' +
        (stage.stageNote ? '<p class="wf-panel-note">' + esc(stage.stageNote) + '</p>' : '') +
      '</div>';
  }

  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  function setCursor(next){
    cursor = Math.max(-1, Math.min(next, stageOrder.length - 1));
    if (barFill) barFill.style.width = ((cursor + 1) / stageOrder.length * 100) + '%';
    if (bar) bar.setAttribute('aria-valuenow', String(cursor + 1));
    if (cursor < 0){
      clearFocus();
      note.textContent = '尚未开始。播放或按「下一步」逐步查看每个阶段与确认门。';
      panel.innerHTML = '';
      syncTabs('');
      return;
    }
    var stage = STAGES[cursor];
    note.textContent = '第 ' + (cursor + 1) + ' / ' + STAGES.length + ' 步 · ' + stage.name +
      ' · 记录状态：' + (STATUS_LABEL[stage.status] || stage.status) +
      (stage.gates.length ? ' · 门 ' + stage.gates.join('、') : '');
    focusStage(stage.id);
  }

  function stop(){
    playing = false;
    if (timer){ clearTimeout(timer); timer = null; }
    if (playBtn) playBtn.textContent = '播放流程';
  }

  function advance(){
    if (cursor >= stageOrder.length - 1){ stop(); return; }
    setCursor(cursor + 1);
    if (playing) timer = setTimeout(advance, 1500);
  }

  if (playBtn) playBtn.addEventListener('click', function(){
    if (playing){ stop(); return; }
    if (reduced.matches){
      setCursor(stageOrder.length - 1);
      note.textContent = '系统已开启减少动态效果：直接显示最终阶段，可用「下一步」手动查看。';
      return;
    }
    playing = true;
    playBtn.textContent = '暂停';
    if (cursor >= stageOrder.length - 1) setCursor(-1);
    timer = setTimeout(advance, 200);
  });
  if (stepBtn) stepBtn.addEventListener('click', function(){ stop(); advance(); });
  if (resetBtn) resetBtn.addEventListener('click', function(){ stop(); setCursor(-1); });
  if (themeBtn) themeBtn.addEventListener('click', function(){
    var dark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', dark ? 'light' : 'dark');
    themeBtn.textContent = dark ? '深色' : '浅色';
    themeBtn.setAttribute('aria-pressed', dark ? 'false' : 'true');
  });
  if (exportBtn) exportBtn.addEventListener('click', function(){
    var clone = svg.cloneNode(true);
    clone.querySelectorAll('[data-dim="true"]').forEach(function(el){ el.removeAttribute('data-dim'); });
    clone.querySelectorAll('[data-active="true"]').forEach(function(el){ el.removeAttribute('data-active'); });
    var blob = new Blob([new XMLSerializer().serializeToString(clone)], {type:'image/svg+xml'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workflow-diagram.svg';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
  });

  var tabs = document.querySelectorAll('.wf-stage-tab');
  Array.prototype.forEach.call(tabs, function(tab, index){
    tab.addEventListener('click', function(){ stop(); setCursor(index); });
    tab.addEventListener('keydown', function(ev){
      var next = null;
      if (ev.key === 'ArrowRight') next = Math.min(index + 1, tabs.length - 1);
      else if (ev.key === 'ArrowLeft') next = Math.max(index - 1, 0);
      else if (ev.key === 'Home') next = 0;
      else if (ev.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      ev.preventDefault();
      tabs[next].focus();
      stop();
      setCursor(next);
    });
  });

  svg.addEventListener('click', function(ev){
    var node = ev.target.closest ? ev.target.closest('.wf-node') : null;
    if (!node) return;
    var stageId = node.getAttribute('data-stage');
    var index = stageOrder.indexOf(stageId);
    if (index >= 0){ stop(); setCursor(index); }
  });

  // Open on the stage the task is actually on, when the record says so.
  var startAt = -1;
  for (var i=0;i<STAGES.length;i++){ if (STAGES[i].isCurrent) { startAt = i; break; } }
  if (startAt >= 0) setCursor(startAt); else setCursor(-1);
})();
`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

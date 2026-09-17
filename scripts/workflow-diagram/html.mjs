// Wraps the rendered SVG in one self-contained HTML document: inline styles,
// inline script, no network access, no external font or library. Opening the
// file offline must give the same result as serving it.
//
// This is a LOCAL status view first. The record opens on the real current
// stage; a camera (zoom/pan) lets the reader move around dense boards; an
// explicit 演示 preview walks the stages for presentations but never rewrites
// the recorded status. There are no transport controls: playback-as-progress
// belongs to a showcase page, not to the record of a task in progress.

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
    // `html` is rendered Markdown; `source` is the raw file text for every kind,
    // which is what an HTML artifact renders from.
    artifacts: (model.artifacts?.[stage.id] ?? []).map((artifact) => ({
      path: artifact.path,
      status: artifact.status,
      kind: artifact.kind ?? null,
      reason: artifact.reason ?? null,
      bytes: artifact.bytes ?? null,
      html: artifact.kind === "markdown" ? (artifact.html ?? null) : null,
      source: artifact.text ?? null,
    })),
    nodeIds: model.nodes.filter((node) => node.stageId === stage.id).map((node) => node.id),
  }));
  const statuses = model.statusValues.map((item) => item.id);

  // Legend counts come from the real nodes, never from the pipeline shape.
  const statusCounts = {};
  for (const node of model.nodes) statusCounts[node.status] = (statusCounts[node.status] ?? 0) + 1;
  const kindCounts = {};
  for (const node of model.nodes) kindCounts[node.kind] = (kindCounts[node.kind] ?? 0) + 1;
  const legendRows = model.statusValues
    .map((item) => ({ ...item, count: statusCounts[item.id] ?? 0 }))
    .map(
      (row) =>
        `<li class="wf-legend-row"><span class="wf-legend-mark" data-status="${escapeHtml(row.id)}">${railMark(row.id)}</span>` +
        `<span class="wf-legend-label">${escapeHtml(row.label)}</span>` +
        `<span class="wf-legend-meaning">${escapeHtml(row.meaning ?? "")}</span>` +
        `<span class="wf-legend-count">${row.count}</span></li>`,
    )
    .join("");
  const laneRows = (model.actors ?? [])
    .map(
      (lane) =>
        `<li class="wf-legend-row"><span class="wf-legend-swatch" data-lane="${escapeHtml(lane.kind)}"></span>` +
        `<span class="wf-legend-label">${escapeHtml(lane.label)}</span>` +
        `<span class="wf-legend-meaning">${lane.kind === "gate" ? "用户裁决停点" : "执行泳道"}</span></li>`,
    )
    .join("");

  // Replay walks the journey the record actually took: stages up to and
  // including the current one. Nothing beyond the frontier is ever played —
  // for a task record that means the walk stops at the gate awaiting
  // adjudication; a process diagram (no task) walks the full pipeline.
  const currentIndex = stages.findIndex((stage) => stage.isCurrent);
  const replayStages = (currentIndex >= 0 ? stages.slice(0, currentIndex + 1) : stages).map((stage) => ({
    id: stage.id,
    name: stage.name,
    status: stage.status,
    summary: stage.summary,
    gatedGate: (stage.gateNodes.find((gate) => gate.status === "gated") ?? {}).title ?? null,
  }));

  // Bottom summary cards are rendered at build time: they summarize the record,
  // so they must exist even before any script runs.
  const gatedGates = stages.flatMap((stage) =>
    stage.gateNodes.filter((gate) => gate.status === "gated").map((gate) => ({ ...gate, stageName: stage.name })),
  );
  const artifactTotals = stages.reduce(
    (totals, stage) => {
      for (const artifact of stage.artifacts ?? []) {
        totals.all += 1;
        if (artifact.status === "ok") totals.ok += 1;
      }
      return totals;
    },
    { ok: 0, all: 0 },
  );
  const currentStage = stages.find((stage) => stage.isCurrent) ?? null;
  const cardsHtml = `
  <section class="wf-cards" id="wf-cards" aria-label="要点摘要" hidden>
    <div class="wf-cards-row">
      <article class="wf-sum-card">
        <h3>当前状态</h3>
        <p class="wf-sum-big">${
          currentStage ? escapeHtml(currentStage.name) : "未开始"
        }</p>
        <p class="wf-sum-line">${task ? `<strong>${task.progress.passed}</strong> / ${task.progress.total} 阶段` : "流程视图（无任务状态）"}${
    task?.revision ? ` · ${escapeHtml(task.revision)}` : ""
  }</p>
        ${task?.blockedReason ? `<p class="wf-sum-line wf-sum-blocked">受阻：${escapeHtml(task.blockedReason)}</p>` : ""}
      </article>
      <article class="wf-sum-card">
        <h3>等待确认的门</h3>
        ${
          gatedGates.length
            ? `<ul class="wf-sum-list">${gatedGates
                .map((gate) => `<li><strong>${escapeHtml(gate.title)}</strong><span>${escapeHtml(gate.stageName)}</span></li>`)
                .join("")}</ul>`
            : `<p class="wf-sum-line">当前没有停在门上的裁决。</p>`
        }
      </article>
      <article class="wf-sum-card">
        <h3>产出速览</h3>
        <p class="wf-sum-big">${artifactTotals.ok}<span class="wf-sum-dim"> / ${artifactTotals.all}</span></p>
        <p class="wf-sum-line">已内嵌稿件 / 引用总数</p>
        <p class="wf-sum-line">${kindCounts.stage ?? 0} 阶段 · ${kindCounts.gate ?? 0} 门 · ${kindCounts.rework ?? 0} 返工点</p>
      </article>
    </div>
  </section>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(task ? `${task.name} · ${title}` : title)}</title>
<style>${styles()}</style>
</head>
<body data-theme="dark" data-motion="on" data-demo="off">
<div class="wf-shell">

<header class="wf-topbar">
  <div class="wf-brand">
    <span class="wf-pulse" aria-hidden="true"></span>
    <span class="wf-brand-text">${escapeHtml(title)}</span>
    ${task ? `<span class="wf-brand-task">${escapeHtml(task.name)}</span>` : ""}
  </div>
  <div class="wf-search" id="wf-search-wrap">
    <input type="search" id="wf-search" placeholder="搜索节点（/）" autocomplete="off" spellcheck="false" aria-label="搜索节点"/>
    <div class="wf-search-pop" id="wf-search-pop" hidden></div>
  </div>
  <div class="wf-toolbar" role="toolbar" aria-label="视图控制">
    <button type="button" class="wf-tool" id="wf-theme" aria-pressed="true" title="切换明暗主题">
      <span class="wf-tool-dot" aria-hidden="true"></span><span class="wf-tool-label">深色</span>
    </button>
    <button type="button" class="wf-tool" id="wf-motion" aria-pressed="true" title="开启动效；关闭后所有过渡静止">
      <span class="wf-tool-label">动效</span>
    </button>
    <button type="button" class="wf-tool" id="wf-focus" aria-pressed="false" title="只高亮当前阶段，其余变暗">
      <span class="wf-tool-label">聚焦</span>
    </button>
    <button type="button" class="wf-tool" id="wf-labels" aria-pressed="true" title="显示或隐藏连线说明">
      <span class="wf-tool-label">标注</span>
    </button>
    <button type="button" class="wf-tool" id="wf-legend-btn" aria-pressed="false" aria-expanded="false" title="图例：状态、节点与泳道说明">
      <span class="wf-tool-label">图例</span>
    </button>
    <button type="button" class="wf-tool" id="wf-cards-btn" aria-pressed="false" aria-expanded="false" title="要点摘要">
      <span class="wf-tool-label">要点</span>
    </button>
    <button type="button" class="wf-tool" id="wf-demo-btn" aria-pressed="false" title="回放任务走过的路：到未通过的门即停（Esc 退出）">
      <span class="wf-tool-label">回放</span>
    </button>
    <button type="button" class="wf-tool" id="wf-export" title="导出当前图为 SVG">
      <span class="wf-tool-label">导出</span>
    </button>
  </div>
</header>

${
  task
    ? `<section class="wf-status-bar" aria-label="任务状态">
  <span class="wf-chip wf-chip-${task.currentStage ? currentStatus(stages) : "pending"}">${escapeHtml(
    task.currentStage ? currentStatusLabel(stages, model.statusValues) : "未开始",
  )}</span>
  <span class="wf-status-progress"><strong>${task.progress.passed}</strong> / ${task.progress.total} 阶段</span>
  ${
    task.currentStage
      ? `<span class="wf-status-where">当前停在 <strong>${escapeHtml(stageName(stages, task.currentStage))}</strong></span>`
      : ""
  }
  ${task.revision ? `<span class="wf-status-rev">${escapeHtml(task.revision)}</span>` : ""}
  ${
    task.blockedReason
      ? `<span class="wf-status-blocked">受阻：${escapeHtml(task.blockedReason)}</span>`
      : ""
  }
</section>`
    : ""
}

<section class="wf-rail-wrap">
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
</section>

<section class="wf-board">
  <div class="wf-viewport" id="wf-viewport">
    <div class="wf-canvas" id="wf-canvas">
      ${svg.replace("<svg ", `<svg style="width:${Math.round(laid.width)}px" `)}
    </div>
  </div>
  <div class="wf-zoombar" role="group" aria-label="缩放控制">
    <button type="button" id="wf-zoom-out" title="缩小（-）" aria-label="缩小">−</button>
    <button type="button" id="wf-zoom-read" title="回到 100%">100%</button>
    <button type="button" id="wf-zoom-in" title="放大（+）" aria-label="放大">＋</button>
    <button type="button" id="wf-zoom-fit" title="适应窗口（0）">适应</button>
  </div>
  <aside class="wf-legend" id="wf-legend" hidden aria-label="图例">
    <h3>状态</h3>
    <ul class="wf-legend-list">${legendRows}</ul>
    <h3>节点与泳道</h3>
    <ul class="wf-legend-list">${laneRows}
      <li class="wf-legend-row"><span class="wf-legend-swatch wf-legend-swatch-stage"></span><span class="wf-legend-label">阶段 / 返工点</span></li>
    </ul>
    <h3>快捷键</h3>
    <ul class="wf-legend-keys">
      <li><kbd>+</kbd> / <kbd>−</kbd> 缩放</li>
      <li><kbd>0</kbd> 适应窗口</li>
      <li><kbd>/</kbd> 搜索节点</li>
      <li><kbd>Esc</kbd> 关闭面板 / 退出演示</li>
    </ul>
  </aside>
  <div class="wf-demo-caption" id="wf-demo-caption" hidden aria-live="polite"></div>
</section>

<aside class="wf-drawer" id="wf-drawer" aria-live="polite" hidden>
  <button type="button" class="wf-drawer-close" id="wf-drawer-close" aria-label="关闭详情">×</button>
  <div class="wf-drawer-body" id="wf-detail"></div>
</aside>

${cardsHtml}

</div>
<script>${script(stages, statuses, replayStages)}</script>
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
  /* Motion budget: control state 140–200ms; entrance may run longer but is
     finite and skipped entirely under reduced motion or the 动效 toggle. */
  --t-fast:.16s; --t-state:.18s; --t-drawer:.22s;
  /* SVG theme hooks: the renderer emits var(--wf-*, <light fallback>) so the
     same markup follows the theme without re-rendering. */
  --wf-canvas:${COLORS.canvas};
  --wf-line:${COLORS.hairline};
  --wf-band:#c9d5e0; --wf-band-chip:#ffffff;
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
  --wf-band:#315061; --wf-band-chip:#12232d;
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
/* One screen, no page scroll: the board absorbs the remaining height. Detail
   opens in a side drawer; summary cards open as a bottom sheet. */
html,body{height:100%}
body{overflow:hidden}
.wf-shell{height:100vh;display:flex;flex-direction:column;gap:10px;
  max-width:none;padding:12px 18px 14px}

/* Top bar: brand, node search, compact toolbar. */
.wf-topbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;
  padding:14px 0 12px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:20;
  transition:opacity .3s ease}
.wf-brand{display:flex;align-items:center;gap:10px;min-width:0}
.wf-pulse{width:9px;height:9px;border-radius:50%;background:var(--accent);flex:none;
  box-shadow:0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent);animation:wf-pulse 2.6s ease-out infinite}
@keyframes wf-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 55%,transparent)}
  70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}
.wf-brand-text{font-size:14.5px;font-weight:650;letter-spacing:-.01em}
.wf-brand-task{font-size:12px;color:var(--muted);padding-left:10px;border-left:1px solid var(--line);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:34ch}
.wf-search{position:relative;flex:0 1 260px;min-width:170px}
.wf-search input{width:100%;min-height:34px;padding:0 12px;border:1px solid var(--line);border-radius:9px;
  background:var(--panel);color:var(--fg);font:inherit;font-size:12.5px;outline:none;
  transition:border-color var(--t-fast)}
.wf-search input::placeholder{color:var(--muted)}
.wf-search input:focus{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 22%,transparent)}
.wf-search-pop{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:60;max-height:320px;overflow:auto;
  border:1px solid var(--line);border-radius:10px;background:var(--panel);
  box-shadow:0 18px 48px rgba(0,0,0,.30)}
.wf-search-pop[hidden]{display:none}
.wf-search-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px 11px;border:0;
  background:transparent;color:var(--fg);font:inherit;font-size:12.5px;cursor:pointer;text-align:left}
.wf-search-item:hover{background:var(--raised)}
.wf-search-kind{font-size:10.5px;font-weight:700;letter-spacing:.05em;color:var(--muted);
  border:1px solid var(--line);border-radius:5px;padding:1px 6px;flex:none}
.wf-search-text{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wf-search-status{color:var(--muted);font-size:11.5px;flex:none}
.wf-search-empty{padding:10px 12px;font-size:12.5px;color:var(--muted)}
.wf-toolbar{display:flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--line);
  border-radius:11px;background:var(--panel)}
.wf-tool{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 12px;border:0;
  border-radius:8px;background:transparent;color:var(--muted);font:inherit;font-size:12.5px;cursor:pointer;
  transition:background var(--t-fast),color var(--t-fast)}
.wf-tool:hover{background:var(--raised);color:var(--fg)}
.wf-tool:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.wf-tool[aria-pressed="true"]{background:var(--raised);color:var(--fg)}
.wf-tool-dot{width:11px;height:11px;border-radius:3px;background:var(--fg);flex:none;opacity:.75}

/* Status bar: the answer to "where is this task" in one line. */
.wf-status-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:12.5px;flex:none;
  transition:opacity .3s ease}
.wf-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:650;
  border-radius:7px;padding:3px 10px;color:#fff;background:var(--muted)}
.wf-chip-passed{background:var(--accent)}
.wf-chip-gated{background:var(--gate)}
.wf-chip-blocked{background:var(--blocked)}
.wf-chip-active{background:var(--accent)}
.wf-status-progress{font-variant-numeric:tabular-nums;color:var(--muted)}
.wf-status-progress strong{color:var(--fg);font-size:14px}
.wf-status-blocked{color:var(--blocked)}
.wf-status-where{color:var(--muted)}
.wf-status-rev{font-family:var(--mono);font-size:11.5px;color:var(--muted);
  border:1px solid var(--line);border-radius:5px;padding:1px 7px}


/* Stage rail: each node lights according to its real status. */
.wf-rail-wrap{flex:none;transition:opacity .3s ease}
.wf-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:6px;
  list-style:none;margin:0;padding:0;overflow-x:auto}
.wf-rail-item{min-width:0}
.wf-rail-btn{display:flex;align-items:center;gap:7px;width:100%;min-height:34px;padding:5px 9px;
  border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--muted);
  font:inherit;font-size:12.5px;cursor:pointer;text-align:left;
  transition:border-color var(--t-fast),background var(--t-fast),color var(--t-fast)}
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

/* Board: camera viewport. The inner canvas is transformed (zoom/pan); the SVG
   scales to fit on load and the reader takes over from there. */
.wf-board{flex:1 1 auto;min-height:0;border:1px solid var(--line);border-radius:14px;
  background:var(--panel);position:relative;overflow:hidden}
.wf-viewport{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:none}
.wf-viewport[data-panning="true"]{cursor:grabbing}
.wf-canvas{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform;padding:0}
.wf-canvas.wf-anim{transition:transform var(--t-drawer) cubic-bezier(.22,.61,.36,1)}
.wf-svg{display:block}
.wf-svg text{fill:var(--fg)}
.wf-lane-label{fill:var(--muted) !important;font-size:12px;font-weight:650}
.wf-col-label{fill:var(--fg) !important;font-size:13px;font-weight:650}
.wf-col-meta{fill:var(--muted) !important;font-size:11px}
.wf-band-chip{fill:var(--muted) !important;font-size:10px;font-weight:700;letter-spacing:.08em}
.wf-node-step{fill:var(--muted) !important;font-size:10px;font-weight:700}
.wf-node-title{fill:var(--fg) !important;font-size:13.5px;font-weight:650}
.wf-node-sub{fill:var(--muted) !important;font-size:11px}
.wf-edge-label{fill:var(--muted) !important;font-size:10.5px}
.wf-status-glyph{fill:#fff !important;font-size:10px;font-weight:700}
.wf-node{cursor:pointer;outline:none}
.wf-node rect{transition:stroke-width var(--t-state) ease,stroke var(--t-state) ease,fill var(--t-state) ease,opacity var(--t-state) ease}
.wf-node:focus-visible rect{stroke-width:3.5}
.wf-node[data-selected="true"] rect{stroke-width:3.5}
.wf-node[data-dim="true"]{opacity:.26}
.wf-edge{transition:opacity var(--t-state) ease}
.wf-edge[data-dim="true"]{opacity:.16}
body[data-labels="off"] .wf-edge-label{display:none}
body[data-focus="on"] .wf-node[data-dim="true"]{opacity:.14}

/* Motion: entrance stagger, gated pulse, reduced-motion + manual cutoff.
   The stagger index comes from the renderer (--wf-i per node). */
.wf-node{animation:wf-enter .5s cubic-bezier(.22,.61,.36,1) both;
  animation-delay:calc(var(--wf-i, 0) * 42ms)}
@keyframes wf-enter{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
.wf-node[data-status="gated"] rect{animation:wf-gate-pulse 2.4s ease-in-out infinite}
@keyframes wf-gate-pulse{0%,100%{stroke-opacity:1}50%{stroke-opacity:.45}}
.wf-node[data-current="true"] rect{filter:drop-shadow(0 0 7px color-mix(in srgb,var(--accent) 45%,transparent))}
@media (prefers-reduced-motion:reduce){
  .wf-pulse,.wf-node,.wf-node[data-status="gated"] rect{animation:none}
  *{transition-duration:.01ms !important}
}
body[data-motion="off"] .wf-pulse,
body[data-motion="off"] .wf-node,
body[data-motion="off"] .wf-node[data-status="gated"] rect{animation:none !important}
body[data-motion="off"] *{transition:none !important}

/* Floating camera controls, bottom-right like a map instrument. */
.wf-zoombar{position:absolute;right:12px;bottom:12px;display:flex;align-items:stretch;gap:2px;
  padding:3px;border:1px solid var(--line);border-radius:10px;background:var(--panel);
  box-shadow:0 10px 30px rgba(0,0,0,.22);z-index:10}
.wf-zoombar button{min-width:34px;min-height:30px;padding:0 9px;border:0;border-radius:7px;
  background:transparent;color:var(--muted);font:inherit;font-size:12.5px;cursor:pointer;
  font-variant-numeric:tabular-nums;transition:background var(--t-fast),color var(--t-fast)}
.wf-zoombar button:hover{background:var(--raised);color:var(--fg)}
.wf-zoombar button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.wf-zoombar #wf-zoom-read{min-width:52px;text-align:center;color:var(--fg)}

/* Legend: floating panel over the board, bottom-left. */
.wf-legend{position:absolute;left:12px;bottom:12px;z-index:12;width:min(340px,86%);
  border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:12px 14px;
  box-shadow:0 18px 48px rgba(0,0,0,.30);max-height:70%;overflow:auto}
.wf-legend[hidden]{display:none}
.wf-legend h3{margin:10px 0 6px;font-size:11px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted)}
.wf-legend h3:first-child{margin-top:0}
.wf-legend-list{margin:0;padding:0;list-style:none;display:grid;gap:5px}
.wf-legend-row{display:flex;align-items:baseline;gap:8px;font-size:12px}
.wf-legend-mark{width:1em;text-align:center;flex:none;font-weight:700}
.wf-legend-mark[data-status="passed"],.wf-legend-mark[data-status="active"]{color:var(--accent)}
.wf-legend-mark[data-status="gated"]{color:var(--gate)}
.wf-legend-mark[data-status="blocked"]{color:var(--blocked)}
.wf-legend-mark[data-status="pending"]{color:var(--muted)}
.wf-legend-label{font-weight:650;flex:none}
.wf-legend-meaning{color:var(--muted);font-size:11.5px;flex:1 1 auto;min-width:0}
.wf-legend-count{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--muted)}
.wf-legend-swatch{width:16px;height:10px;border-radius:3px;border:1px solid var(--line);flex:none}
.wf-legend-swatch[data-lane="gate"]{background:var(--wf-lane-gate)}
.wf-legend-swatch[data-lane="rework"]{background:var(--wf-lane-rework)}
.wf-legend-swatch[data-lane="agent"]{background:var(--wf-lane)}
.wf-legend-swatch-stage{background:var(--wf-node-stage-fill);border-color:var(--wf-node-stage-stroke)}
.wf-legend-keys{margin:0;padding:0;list-style:none;display:grid;gap:4px;font-size:11.5px;color:var(--muted)}
.wf-legend-keys kbd{font-family:var(--mono);font-size:10.5px;border:1px solid var(--line);
  border-radius:4px;padding:0 5px;background:var(--raised);color:var(--fg)}

/* Demo preview: chrome recedes, one caption carries the narration. */
.wf-demo-caption{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:14;
  max-width:min(760px,92%);border:1px solid var(--line);border-radius:12px;background:var(--panel);
  box-shadow:0 18px 48px rgba(0,0,0,.30);padding:10px 16px;font-size:13px;text-align:center}
.wf-demo-caption b{font-weight:700}
.wf-demo-caption[hidden]{display:none}
.wf-cap-status{margin-left:9px;color:var(--muted)}
.wf-cap-note{margin-left:9px;color:var(--muted)}
.wf-cap-stop{margin-left:9px;color:var(--gate);font-weight:650}
body[data-demo="on"] .wf-topbar,body[data-demo="on"] .wf-status-bar,
body[data-demo="on"] .wf-rail-wrap{opacity:.07;pointer-events:none}

/* Summary cards: bottom sheet over the board. */
.wf-cards{position:absolute;left:12px;right:12px;bottom:12px;z-index:11}
.wf-cards[hidden]{display:none}
.wf-cards-row{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.wf-sum-card{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:12px 14px;
  box-shadow:0 18px 48px rgba(0,0,0,.30)}
.wf-sum-card h3{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted)}
.wf-sum-big{margin:0 0 4px;font-size:20px;font-weight:700}
.wf-sum-dim{color:var(--muted);font-size:13px;font-weight:400}
.wf-sum-line{margin:2px 0 0;font-size:12px;color:var(--muted)}
.wf-sum-blocked{color:var(--blocked)}
.wf-sum-list{margin:0;padding:0;list-style:none;display:grid;gap:5px}
.wf-sum-list li{display:flex;justify-content:space-between;gap:10px;font-size:12px}
.wf-sum-list li span{color:var(--muted)}

/* Detail drawer: slides in over the board instead of pushing it down. */
.wf-drawer{position:fixed;top:0;right:0;bottom:0;width:min(420px,92vw);z-index:40;
  background:var(--panel);border-left:1px solid var(--line);overflow-y:auto;
  box-shadow:-18px 0 40px rgba(0,0,0,.28);padding:18px 18px 22px}
.wf-drawer[hidden]{display:none}
.wf-drawer:not([hidden]){animation:wf-drawer-in var(--t-drawer) cubic-bezier(.22,.61,.36,1)}
@keyframes wf-drawer-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
.wf-drawer-close{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:8px;
  border:1px solid var(--line);background:var(--raised);color:var(--muted);font-size:17px;line-height:1;
  cursor:pointer}
.wf-drawer-close:hover{color:var(--fg)}
.wf-drawer-close:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wf-drawer .wf-card{border:0;background:transparent;padding:0}

/* Embedded artifact: the document itself, readable in the drawer. */
.wf-artifacts{display:grid;gap:14px}
.wf-artifact{border:1px solid var(--line);border-radius:10px;background:var(--raised);overflow:hidden}
.wf-artifact-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:9px 11px;
  border-bottom:1px solid var(--line);background:var(--panel)}
.wf-artifact-state{font-size:11px;color:var(--muted);margin-left:auto}
.wf-artifact-tools{display:flex;gap:6px;padding:8px 11px;border-bottom:1px solid var(--line)}
.wf-mini{min-height:28px;padding:0 10px;border:1px solid var(--line);border-radius:7px;
  background:var(--panel);color:var(--muted);font:inherit;font-size:11.5px;cursor:pointer}
.wf-mini:hover{color:var(--fg);border-color:var(--accent)}
.wf-mini:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.wf-artifact-frame{display:block;width:100%;height:340px;border:0;background:#fff}
.wf-artifact-src{margin:0;max-height:340px;overflow:auto;font-family:var(--mono);font-size:11px;
  padding:10px 12px;white-space:pre-wrap}
.wf-artifact-doc{max-height:440px;overflow:auto;padding:12px 14px}
.wf-artifact-missing{margin:0;padding:12px 14px;font-size:12.5px;color:var(--muted)}
.wf-artifact-doc .md-h1{font-size:16px;margin:0 0 8px}
.wf-artifact-doc .md-h2{font-size:14px;margin:14px 0 6px}
.wf-artifact-doc .md-h3{font-size:13px;margin:12px 0 5px;color:var(--muted)}
.wf-artifact-doc .md-h4,.wf-artifact-doc .md-h5,.wf-artifact-doc .md-h6{font-size:12.5px;margin:10px 0 4px;color:var(--muted)}
.wf-artifact-doc .md-p{margin:0 0 8px;font-size:12.5px;line-height:1.75}
.wf-artifact-doc .md-list{margin:0 0 8px;padding-left:18px;font-size:12.5px;line-height:1.75}
.wf-artifact-doc .md-quote{margin:0 0 8px;padding-left:10px;border-left:2px solid var(--line);color:var(--muted);font-size:12.5px}
.wf-artifact-doc .md-code{font-family:var(--mono);font-size:11.5px;background:var(--panel);
  border:1px solid var(--line);border-radius:4px;padding:1px 5px}
.wf-artifact-doc .md-pre{margin:0 0 8px;padding:10px 12px;background:var(--panel);border:1px solid var(--line);
  border-radius:8px;overflow:auto;font-family:var(--mono);font-size:11px;line-height:1.6}
.wf-artifact-doc .md-hr{border:0;border-top:1px solid var(--line);margin:12px 0}
.wf-artifact-doc .md-table-wrap{overflow:auto;margin:0 0 10px}
.wf-artifact-doc .md-table{border-collapse:collapse;font-size:11.5px;min-width:100%}
.wf-artifact-doc .md-table th,.wf-artifact-doc .md-table td{border:1px solid var(--line);
  padding:5px 8px;text-align:left;vertical-align:top}
.wf-artifact-doc .md-table th{background:var(--panel);font-weight:650}
.wf-artifact-doc .md-link{color:var(--accent)}
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

@media (min-width:900px){
  .wf-grid{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
}
@media (max-width:640px){
  .wf-shell{padding:10px 12px 12px;gap:8px}
  .wf-brand-task{display:none}
  .wf-tool-label{display:none}
  .wf-search{flex-basis:150px}
  .wf-tool{min-height:40px;padding:0 11px}
  .wf-drawer{width:100vw;border-left:0}
}
`;
}

function script(stages, statuses, replayStages) {
  const data = JSON.stringify(stages).replace(/</g, "\\u003c");
  const replay = JSON.stringify(replayStages).replace(/</g, "\\u003c");
  const replayMode = JSON.stringify(stages.some((stage) => stage.isCurrent) ? "task" : "process");
  const statusLabels = JSON.stringify(
    Object.fromEntries(statuses.map((id) => [id, STATUS_META[id]?.label ?? id])),
  );
  const gates = JSON.stringify(
    Object.fromEntries(
      stages.flatMap((stage) => stage.gateNodes.map((gate) => [gate.id, { ...gate, stageId: stage.id }])),
    ),
  ).replace(/</g, "\\u003c");
  return `
(function(){
  var STAGES = ${data};
  var REPLAY = ${replay};
  var REPLAY_MODE = ${replayMode};
  var STATUS_LABEL = ${statusLabels};
  var GATES = ${gates};
  var svg = document.querySelector('.wf-svg');
  var viewport = document.getElementById('wf-viewport');
  var canvas = document.getElementById('wf-canvas');
  var detail = document.getElementById('wf-detail');
  var drawer = document.getElementById('wf-drawer');
  var drawerClose = document.getElementById('wf-drawer-close');
  var themeBtn = document.getElementById('wf-theme');
  var motionBtn = document.getElementById('wf-motion');
  var focusBtn = document.getElementById('wf-focus');
  var labelsBtn = document.getElementById('wf-labels');
  var legendBtn = document.getElementById('wf-legend-btn');
  var legend = document.getElementById('wf-legend');
  var cardsBtn = document.getElementById('wf-cards-btn');
  var cards = document.getElementById('wf-cards');
  var demoBtn = document.getElementById('wf-demo-btn');
  var caption = document.getElementById('wf-demo-caption');
  var exportBtn = document.getElementById('wf-export');
  var searchInput = document.getElementById('wf-search');
  var searchPop = document.getElementById('wf-search-pop');
  var suppressClick = false;

  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function allNodes(){ return Array.prototype.slice.call(svg.querySelectorAll('.wf-node')); }
  function allEdges(){ return Array.prototype.slice.call(svg.querySelectorAll('.wf-edge')); }
  function stageOf(id){ for (var i=0;i<STAGES.length;i++) if (STAGES[i].id===id) return STAGES[i]; return null; }

  // ---------- camera: zoom / pan / fit ----------
  var cam = { s:1, tx:0, ty:0, fit:true };
  function viewBox(){ var b=(svg.getAttribute('viewBox')||'0 0 1000 700').split(/\\s+/).map(Number); return {w:b[2]||1000,h:b[3]||700}; }
  function apply(){
    canvas.style.transform = 'translate('+cam.tx+'px,'+cam.ty+'px) scale('+cam.s+')';
    var read = $('wf-zoom-read'); if (read) read.textContent = Math.round(cam.s*100)+'%';
  }
  function fit(){
    var vb = viewBox(); var r = viewport.getBoundingClientRect();
    if (r.width<10||r.height<10) return;
    var s = Math.min((r.width-48)/vb.w,(r.height-48)/vb.h);
    cam.s = Math.max(0.2,Math.min(3,s));
    cam.tx = (r.width - vb.w*cam.s)/2; cam.ty = (r.height - vb.h*cam.s)/2;
    cam.fit = true; apply();
  }
  function zoomAt(px,py,factor){
    var ns = Math.max(0.2, Math.min(3, cam.s*factor)); var k = ns/cam.s;
    cam.tx = px-(px-cam.tx)*k; cam.ty = py-(py-cam.ty)*k; cam.s = ns; cam.fit = false; apply();
  }
  function zoomCenter(f){ var r=viewport.getBoundingClientRect(); zoomAt(r.width/2,r.height/2,f); }
  function centerOn(nodeId){
    var n = svg.querySelector('.wf-node[data-node="'+nodeId+'"]'); if(!n) return;
    var b = n.getBBox(); var r = viewport.getBoundingClientRect();
    canvas.classList.add('wf-anim');
    cam.tx = r.width/2 - (b.x+b.width/2)*cam.s;
    cam.ty = r.height/2 - (b.y+b.height/2)*cam.s;
    cam.fit = false; apply();
    setTimeout(function(){ canvas.classList.remove('wf-anim'); }, 260);
  }
  viewport.addEventListener('wheel', function(ev){
    ev.preventDefault();
    var r = viewport.getBoundingClientRect();
    zoomAt(ev.clientX-r.left, ev.clientY-r.top, Math.exp(-ev.deltaY*0.0016));
  }, { passive:false });
  var pan = null;
  viewport.addEventListener('pointerdown', function(ev){
    if (ev.button!==0) return;
    if (ev.target && ev.target.closest && ev.target.closest('.wf-node')) return;
    pan = { x:ev.clientX, y:ev.clientY, tx:cam.tx, ty:cam.ty, moved:0 };
    cam.fit = false;
    try { viewport.setPointerCapture(ev.pointerId); } catch(e){}
    viewport.setAttribute('data-panning','true');
  });
  viewport.addEventListener('pointermove', function(ev){
    if (!pan) return;
    var dx = ev.clientX-pan.x, dy = ev.clientY-pan.y;
    pan.moved = Math.max(pan.moved, Math.abs(dx)+Math.abs(dy));
    cam.tx = pan.tx+dx; cam.ty = pan.ty+dy; apply();
  });
  function endPan(){
    if (pan && pan.moved>4) suppressClick = true;
    pan = null; viewport.removeAttribute('data-panning');
  }
  viewport.addEventListener('pointerup', endPan);
  viewport.addEventListener('pointercancel', endPan);
  $('wf-zoom-in').addEventListener('click', function(){ zoomCenter(1.25); });
  $('wf-zoom-out').addEventListener('click', function(){ zoomCenter(0.8); });
  $('wf-zoom-fit').addEventListener('click', fit);
  $('wf-zoom-read').addEventListener('click', function(){ zoomCenter(1/cam.s); });
  window.addEventListener('resize', function(){ if (cam.fit) fit(); });

  // ---------- search ----------
  function nodeIndex(){
    return allNodes().map(function(n){
      var t = n.querySelector('.wf-node-title'), s = n.querySelector('.wf-node-sub');
      return { id:n.getAttribute('data-node'), kind:n.getAttribute('data-kind'),
        status:n.getAttribute('data-status'), stage:n.getAttribute('data-stage'),
        text:(t?t.textContent:''), sub:(s?s.textContent:'') };
    });
  }
  function runSearch(q){
    q = (q||'').trim().toLowerCase();
    if (!q){ searchPop.hidden = true; searchPop.innerHTML=''; return; }
    var hits = nodeIndex().filter(function(n){
      return (n.text+' '+n.sub+' '+n.stage).toLowerCase().indexOf(q) >= 0;
    }).slice(0,8);
    searchPop.innerHTML = hits.length
      ? hits.map(function(n){
          return '<button type="button" class="wf-search-item" data-node="'+esc(n.id)+'">' +
            '<span class="wf-search-kind">'+esc(n.kind)+'</span>' +
            '<span class="wf-search-text">'+esc(n.text||n.id)+'</span>' +
            '<span class="wf-search-status">'+esc(STATUS_LABEL[n.status]||n.status)+'</span></button>';
        }).join('')
      : '<div class="wf-search-empty">无匹配节点</div>';
    searchPop.hidden = false;
  }
  searchInput.addEventListener('input', function(){ runSearch(searchInput.value); });
  searchInput.addEventListener('keydown', function(ev){
    if (ev.key === 'Enter'){
      var first = searchPop.querySelector('.wf-search-item');
      if (first){ pickSearch(first.getAttribute('data-node')); }
    }
    if (ev.key === 'Escape'){ searchInput.value=''; runSearch(''); searchInput.blur(); }
  });
  searchPop.addEventListener('click', function(ev){
    var item = ev.target.closest ? ev.target.closest('.wf-search-item') : null;
    if (item) pickSearch(item.getAttribute('data-node'));
  });
  function pickSearch(nodeId){
    searchPop.hidden = true; searchInput.value=''; searchInput.blur();
    selectNode(nodeId); centerOn(nodeId);
  }

  // ---------- panels ----------
  function closePanels(){
    legend.hidden = true; legendBtn.setAttribute('aria-pressed','false'); legendBtn.setAttribute('aria-expanded','false');
    cards.hidden = true; cardsBtn.setAttribute('aria-pressed','false'); cardsBtn.setAttribute('aria-expanded','false');
    searchPop.hidden = true;
  }
  legendBtn.addEventListener('click', function(){
    var open = !legend.hidden;
    closePanels();
    if (open) return;
    legend.hidden = false; legendBtn.setAttribute('aria-pressed','true'); legendBtn.setAttribute('aria-expanded','true');
  });
  cardsBtn.addEventListener('click', function(){
    var open = !cards.hidden;
    closePanels();
    if (open) return;
    cards.hidden = false; cardsBtn.setAttribute('aria-pressed','true'); cardsBtn.setAttribute('aria-expanded','true');
  });

  // ---------- replay: walk the journey the record actually took ----------
  // Task mode plays stages up to the current one and STOPS at the gate that is
  // still awaiting adjudication — the future is never played as if it happened.
  // Process mode (no task) walks the whole pipeline as an introduction.
  var demoTimer = null, demoStep = 0, demoActive = false;
  function replayHold(i){
    if (REPLAY_MODE === 'task' && i === REPLAY.length - 1) return 4400;
    return 2300;
  }
  function showReplayStep(i){
    var s = REPLAY[i]; if (!s) return;
    highlight('stage:'+s.id); centerOn('stage:'+s.id);
    var isLast = REPLAY_MODE === 'task' && i === REPLAY.length - 1;
    var html = '<b>回放 ' + (i+1) + '/' + REPLAY.length + ' · ' + esc(s.name) + '</b>' +
      '<span class="wf-cap-status">' + esc(STATUS_LABEL[s.status] || s.status) + '</span>';
    if (isLast){
      var stop = s.gatedGate
        ? '⏸ 停在 ' + esc(s.gatedGate) + '：等待你的裁决，不再后放'
        : (s.status === 'gated' ? '⏸ 停在这里等待确认，不再后放' : '');
      html += stop
        ? '<span class="wf-cap-stop">' + stop + '</span>'
        : '<span class="wf-cap-stop">已回放到当前进度</span>';
    } else if (s.summary){
      html += '<span class="wf-cap-note">' + esc(s.summary) + '</span>';
    }
    caption.innerHTML = html;
    caption.hidden = false;
  }
  function stepReplay(){
    demoStep += 1;
    if (demoStep >= REPLAY.length){ finishReplay(); return; }
    showReplayStep(demoStep);
    demoTimer = setTimeout(stepReplay, replayHold(demoStep));
  }
  function finishReplay(){
    var last = REPLAY[REPLAY.length - 1];
    var waiting = last && (last.gatedGate || last.status === 'gated');
    caption.innerHTML = '<b>回放结束</b><span class="wf-cap-stop">当前停在「' +
      esc(last ? last.name : '') + '」' +
      (waiting ? ' · 等待你的确认' : '') + '</span>';
    demoTimer = setTimeout(stopDemo, 3400);
  }
  function startDemo(){
    if (!REPLAY.length) return;
    document.body.setAttribute('data-demo','on');
    demoBtn.setAttribute('aria-pressed','true');
    closePanels(); if (drawer && !drawer.hidden) closeDrawer();
    demoActive = true; demoStep = 0;
    fit();
    showReplayStep(0);
    demoTimer = setTimeout(stepReplay, replayHold(0));
  }
  function stopDemo(){
    document.body.setAttribute('data-demo','off');
    demoBtn.setAttribute('aria-pressed','false');
    demoActive = false;
    if (demoTimer){ clearTimeout(demoTimer); demoTimer = null; }
    caption.hidden = true; fit();
    var cur = null;
    for (var i=0;i<STAGES.length;i++) if (STAGES[i].isCurrent) cur = STAGES[i];
    clearSelection();
    if (cur) highlight('stage:'+cur.id);
  }
  demoBtn.addEventListener('click', function(){
    if (demoActive) stopDemo(); else startDemo();
  });

  // ---------- artifact embedding (the document itself) ----------
  function artifactBlock(stage){
    var list = stage.artifacts || [];
    if (!list.length){
      return '<div class="wf-field"><h3>稿件内容</h3>' +
        '<p class="wf-artifact-missing">该阶段尚未产出可内嵌的稿件。</p></div>';
    }
    var blocks = list.map(function(a, i){
      var id = 'wf-artifact-' + stage.id + '-' + i;
      if (a.status !== 'ok'){
        return '<div class="wf-artifact" id="' + id + '">' +
          '<div class="wf-artifact-head"><span class="wf-path">' + esc(a.path) + '</span>' +
          '<span class="wf-artifact-state">文件不存在</span></div>' +
          '<p class="wf-artifact-missing">' + esc(a.reason || '') + '</p></div>';
      }
      var head = '<div class="wf-artifact-head"><span class="wf-path">' + esc(a.path) + '</span>' +
        '<span class="wf-artifact-state">' + Math.round((a.bytes || 0) / 1024) + ' KB</span></div>';
      if (a.kind === 'html'){
        return '<div class="wf-artifact" id="' + id + '">' + head +
          '<div class="wf-artifact-tools">' +
            '<button type="button" class="wf-mini" data-preview="' + id + '">预览渲染</button>' +
            '<button type="button" class="wf-mini" data-source="' + id + '">看源码</button>' +
          '</div>' +
          '<iframe class="wf-artifact-frame" id="' + id + '-frame" sandbox="allow-scripts" ' +
            'title="' + esc(a.path) + ' 渲染预览"></iframe>' +
          '<pre class="wf-artifact-src" id="' + id + '-src" hidden></pre>' +
        '</div>';
      }
      return '<div class="wf-artifact" id="' + id + '">' + head +
        '<div class="wf-artifact-doc">' +
          (a.html || '<pre class="md-pre"><code>' + esc(a.source || '') + '</code></pre>') +
        '</div></div>';
    }).join('');
    return '<div class="wf-field"><h3>稿件内容</h3><div class="wf-artifacts">' + blocks + '</div></div>';
  }

  function wireArtifacts(stage){
    (stage.artifacts || []).forEach(function(a, i){
      if (a.status !== 'ok' || a.kind !== 'html') return;
      var id = 'wf-artifact-' + stage.id + '-' + i;
      var frame = document.getElementById(id + '-frame');
      var src = document.getElementById(id + '-src');
      if (frame && !frame.getAttribute('srcdoc')) frame.setAttribute('srcdoc', a.source || '');
      if (src) src.textContent = a.source || '';
    });
    Array.prototype.forEach.call(detail.querySelectorAll('.wf-mini'), function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-preview') || btn.getAttribute('data-source');
        var frame = document.getElementById(id + '-frame');
        var src = document.getElementById(id + '-src');
        var showSource = !!btn.getAttribute('data-source');
        if (frame) frame.hidden = showSource;
        if (src) src.hidden = !showSource;
      });
    });
  }

  function clearSelection(){
    allNodes().forEach(function(n){ n.removeAttribute('data-selected'); n.removeAttribute('data-dim'); });
    allEdges().forEach(function(e){ e.removeAttribute('data-dim'); });
  }

  function selectNode(nodeId){
    var node = svg.querySelector('.wf-node[data-node="'+nodeId+'"]');
    if (!node) return;
    highlight(nodeId);
    var stageId = node.getAttribute('data-stage');
    var kind = node.getAttribute('data-kind');
    if (kind === 'gate') renderGate(node.getAttribute('data-node').replace('gate:',''), stageId);
    else renderStage(stageId);
    if (drawer) drawer.hidden = false;
  }

  function highlight(nodeId){
    allNodes().forEach(function(n){
      var on = n.getAttribute('data-node') === nodeId;
      n.setAttribute('data-selected', on ? 'true' : 'false');
      n.setAttribute('data-dim', on ? 'false' : 'true');
    });
    allEdges().forEach(function(e){
      var hit = e.getAttribute('data-from') === nodeId || e.getAttribute('data-to') === nodeId;
      e.setAttribute('data-dim', hit ? 'false' : 'true');
    });
  }

  function closeDrawer(){
    if (drawer) drawer.hidden = true;
    clearSelection();
  }
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

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
        artifactBlock(stage)+
        (gates ? '<div class="wf-field"><h3>该阶段的门</h3><ul class="wf-gate-list">'+gates+'</ul></div>' : '')+
      '</div>';
    wireArtifacts(stage);
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
        artifactBlock(stage)+
      '</div>';
    wireArtifacts(stage);
  }

  svg.addEventListener('click', function(ev){
    if (suppressClick){ suppressClick = false; return; }
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
      selectNode('stage:'+stageId); centerOn('stage:'+stageId);
    });
  });

  // ---------- theme / motion / focus / labels ----------
  if (themeBtn) themeBtn.addEventListener('click', function(){
    var dark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', dark ? 'light' : 'dark');
    themeBtn.setAttribute('aria-pressed', dark ? 'false' : 'true');
    themeBtn.querySelector('.wf-tool-label').textContent = dark ? '浅色' : '深色';
  });
  if (motionBtn) motionBtn.addEventListener('click', function(){
    var on = document.body.getAttribute('data-motion') === 'on';
    document.body.setAttribute('data-motion', on ? 'off' : 'on');
    motionBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
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
    // Export cleanup: viewer state (focus, dim, selection, keyboard hooks) is
    // stripped, and paint styles are inlined because the standalone file has
    // no stylesheet — class-based fills would fall back to black.
    clone.querySelectorAll('[data-dim]').forEach(function(el){ el.removeAttribute('data-dim'); });
    clone.querySelectorAll('[data-selected]').forEach(function(el){ el.removeAttribute('data-selected'); });
    clone.querySelectorAll('[tabindex]').forEach(function(el){ el.removeAttribute('tabindex'); });
    var source = svg.querySelectorAll('*');
    var target = clone.querySelectorAll('*');
    var props = ['fill','stroke','stroke-width','stroke-dasharray','opacity','font-size','font-weight','font-family'];
    for (var i=0;i<source.length && i<target.length;i++){
      var cs = window.getComputedStyle(source[i]);
      if (!cs) continue;
      for (var p=0;p<props.length;p++){
        var v = cs.getPropertyValue(props[p]);
        if (v) target[i].setAttribute(props[p], v);
      }
    }
    var vb = viewBox();
    clone.setAttribute('width', vb.w); clone.setAttribute('height', vb.h);
    var blob = new Blob([new XMLSerializer().serializeToString(clone)], {type:'image/svg+xml'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workflow-diagram.svg';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
  });

  // ---------- keys ----------
  document.addEventListener('keydown', function(ev){
    var t = ev.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
    if (ev.key === 'Escape'){
      if (typing){ t.blur(); return; }
      if (document.body.getAttribute('data-demo')==='on'){ stopDemo(); return; }
      closePanels();
      if (drawer && !drawer.hidden) closeDrawer();
      return;
    }
    if (typing) return;
    if (ev.key === '/' ){ ev.preventDefault(); searchInput.focus(); return; }
    var r = viewport.getBoundingClientRect();
    if (ev.key === '+' || ev.key === '=') zoomAt(r.width/2, r.height/2, 1.25);
    else if (ev.key === '-' || ev.key === '_') zoomAt(r.width/2, r.height/2, 0.8);
    else if (ev.key === '0') fit();
  });

  // ---------- theme from URL (?theme=light for captures) ----------
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('theme') === 'light' && themeBtn){
      document.body.setAttribute('data-theme','light');
      themeBtn.setAttribute('aria-pressed','false');
      themeBtn.querySelector('.wf-tool-label').textContent = '浅色';
    }
  } catch(e){}

  // Open on the stage the record says the task is on, so the first thing the
  // reader sees is where the work actually stands. Demo stays off by default.
  var current = null;
  for (var i=0;i<STAGES.length;i++) if (STAGES[i].isCurrent) current = STAGES[i];
  if (current) highlight('stage:'+current.id);
  else clearSelection();

  fit();
})();
`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

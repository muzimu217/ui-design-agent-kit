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

  // 能力接入登记表：外部生成能力按契约登记（谁产出/边界/验收/证据），
  // adopted 才可用于交付；空缺（evaluating）如实展示为"未接入"而非隐藏。
  let capabilities = { capabilities: [] };
  try {
    capabilities = JSON.parse(await readFile(path.join(ROOT, "canvas", "capabilities.json"), "utf8"));
  } catch { /* 缺文件时区块不渲染 */ }
  const capStatus = {
    adopted: { label: "已接入", color: "#34d399" },
    evaluating: { label: "待接入", color: "#fbbf24" },
    rejected: { label: "不接入", color: "#f87171" },
  };
  const capRows = (capabilities.capabilities ?? [])
    .map((c) => {
      const st = capStatus[c.status] ?? capStatus.evaluating;
      return `<div class="cap-row">
        <span class="cap-st" style="color:${st.color};border-color:${st.color}" aria-label="接入状态：${st.label}">${st.label}</span>
        <span class="cap-name">${esc(c.name)}<span class="cap-kind">${esc(c.kind ?? "")}</span></span>
        <span class="cap-prov">${esc(c.provider)}${c.pinned && c.pinned !== "—" ? ` · ${esc(c.pinned)}` : ""}</span>
        <span class="cap-acc">${esc(c.acceptance)}</span>
      </div>`;
    })
    .join("\n");
  const capSection = capRows
    ? `<h2 class="sec">能力接入（工作流监管层 · ${(capabilities.capabilities ?? []).filter((c) => c.status === "adopted").length} 已接入 / ${(capabilities.capabilities ?? []).length} 登记）</h2>
       <p class="cap-intro">本仓不做生成引擎：外部能力按契约接入，工作流负责门径、验收与证据（<code>docs/capability-adapters.md</code>）。待接入项为空缺状态，不得用于交付。</p>
       <div class="cap-table">${capRows}</div>`
    : "";

  // 知识库区块：读 docs/knowledge-base/index.json（自学机制 L2/L3 的产物）。
  // 展示 schema 版本（兼容基线）、卡片数、域分布、最近学习与待转化项。
  let kb = { schemaVersion: 0, cards: [] };
  try {
    kb = JSON.parse(await readFile(path.join(ROOT, "docs", "knowledge-base", "index.json"), "utf8"));
  } catch { /* 缺文件时不渲染区块 */ }
  const kbCards = kb.cards ?? [];
  const kbDomains = [...new Set(kbCards.map((c) => c.domain))];
  const kbRecent = [...kbCards].sort((a, b) => (a.learnedAt < b.learnedAt ? 1 : -1)).slice(0, 3);
  const kbRows = kbRecent
    .map(
      (c) => `<div class="kb-row">
        <span class="kb-dom">${esc(c.domain)}</span>
        <span class="kb-title">${esc(c.title)}</span>
        <span class="kb-meta">${esc(c.source?.author ?? "")} · ${c.source?.heat ? `${(c.source.heat / 10000).toFixed(1)} 万播放` : ""} · 参数 ${esc(c.codableParams ?? 0)} 条</span>
      </div>`
    )
    .join("\n");
  const kbSection = kbCards.length
    ? `<h2 class="sec">知识库（自学机制 · schema v${esc(kb.schemaVersion)} · ${kbCards.length} 卡 / ${kbDomains.length} 域）</h2>
       <p class="cap-intro">每日视频学习 → 机制卡片（可编码参数+适用边界）→ 兼容性声明（extends/supersedes/conflicts）→ 转化。规范 <code>docs/self-learning-loop.md</code> · <code>docs/knowledge-base/schema.md</code>。</p>
       <div class="kb-table">${kbRows}</div>`
    : "";

  // 品味档案（用户级，与项目级知识库分离）：展示被采用/仅展示的特质及其信号来源。
  // 采用门槛由 canvas/derive-taste.mjs 计算，页面只读不改。
  let taste = { signals: [], traits: [], summary: null };
  try {
    taste = JSON.parse(await readFile(path.join(ROOT, "canvas", "taste-profile.json"), "utf8"));
  } catch { /* 缺文件时不渲染 */ }
  const tasteTraits = (taste.traits ?? []).filter((t) => t.status === "adopted" || t.status === "shown" || t.status === "contested");
  const tasteRows = tasteTraits
    .map((t) => {
      const badge = t.status === "adopted" ? { label: "已采用", color: "#34d399" } : t.status === "contested" ? { label: "有争议", color: "#f87171" } : { label: "仅展示", color: "#fbbf24" };
      return `<div class="taste-row">
        <span class="taste-st" style="color:${badge.color};border-color:${badge.color}" aria-label="品味特质状态：${badge.label}">${badge.label}</span>
        <span class="taste-label">${esc(t.label)}</span>
        <span class="taste-conf" aria-label="置信度 ${Math.round((t.confidence ?? 0) * 100)}%">${Math.round((t.confidence ?? 0) * 100)}%</span>
        <span class="taste-ev">${esc((t.evidence ?? []).join(" · "))}</span>
      </div>`;
    })
    .join("\n");
  const tasteSection = tasteTraits.length
    ? `<h2 class="sec">方向与品味（越用越懂你 · ${taste.summary?.adopted ?? 0} 已采用 / ${tasteTraits.length} 条特质 · ${taste.summary?.signals ?? 0} 条信号）</h2>
       <p class="cap-intro">特质只从可复核信号推导（你的原话、明确选择、被接受/被拒的方案），每条都能回溯到具体信号；置信度不足只展示不采用。规则见 <code>canvas/derive-taste.mjs</code>（证据上限钳制 + 采用需 ≥2 条独立信号）。</p>
       <div class="taste-table">${tasteRows}</div>`
    : "";
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
        <span class="badge" aria-label="解析链路确认状态：${c.confirmed ? "用户已比对确认" : "待比对确认"}">${c.confirmed ? "✓ 已确认" : "… 待确认"}</span>
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
  // KPI4 并排对比表：compare.score 结构化评分（us/them 六维，1=有实测或实看证据，0=实测缺失，
  // null=公开渠道不可观测不计分母），对标侧检视级别如实标注（unverified-partial 等），不虚记不可测维度。
  const sixLabels = { desktop: "桌面", mobile: "移动", keyboard: "键盘", contrast: "对比度", reducedMotion: "降动效", console: "控制台" };
  const mark = (v) => (v === 1 ? '<span class="mk mk-yes">✓</span>' : v === 0 ? '<span class="mk mk-no">✗</span>' : '<span class="mk mk-na">—</span>');
  const scoreSum = (m) => sixKeys.reduce((n, k) => n + (m?.[k] === 1 ? 1 : 0), 0);
  const scoreObs = (m) => sixKeys.filter((k) => m?.[k] === 0 || m?.[k] === 1).length;
  const compareBlock = (a) => {
    const c = a.compare;
    if (!c?.score?.us) return `<div class="row"><span class="k">对比</span><span class="v">${esc(c?.target ?? "—")} — ${esc(c?.verdict ?? "")}</span></div>`;
    const s = c.score;
    const body = sixKeys
      .map((k) => `<tr><td>${esc(sixLabels[k])}</td><td>${mark(s.us[k])}</td><td>${mark(s.them[k])}</td></tr>`)
      .join("");
    return `<div class="row"><span class="k">对比</span><span class="v">
      <div class="cmp">
        <div class="cmp-head"><span class="cmp-vs">vs ${esc(c.target ?? "—")}</span><span class="cmp-sum">本产物 ${scoreSum(s.us)}/6 · 对标 ${scoreSum(s.them)}/${scoreObs(s.them)} 可观测</span><span class="cmp-level" aria-label="检视级别 ${esc(s.level ?? "unverified-partial")}：仅公开页面检视，未实测维度记 null">检视级别 ${esc(s.level ?? "unverified-partial")}</span></div>
        <table class="cmp-table"><caption class="cmp-caption">六维并排评分：✓=有实测/实看证据，✗=实测缺失，—=不可观测不计分母</caption><thead><tr><th scope="col">维度</th><th scope="col">本产物</th><th scope="col">对标</th></tr></thead><tbody>${body}</tbody></table>
        ${s.themNote ? `<div class="cmp-note">${esc(s.themNote)}</div>` : ""}
        <div class="cmp-note">${esc(c.verdict ?? "")}</div>
        ${c.evidence ? `<div class="cmp-note">证据（仓内路径）：${esc(c.evidence)}</div>` : ""}
      </div>
    </span></div>`;
  };
  const sorted = [...artifacts.artifacts].sort((a, b) => (a.round < b.round ? 1 : a.round > b.round ? -1 : 0));
  const rows = sorted
    .map(
      (a) => `<details class="art"><summary><span class="badge" aria-label="六维完成度 ${measured(a)}/6（桌面/移动/键盘/对比度/降动效/控制台各 1 分）">${measured(a)}/6</span><span class="t">${esc(a.title)}</span><span class="src ${a.origin === "ai-only" ? "src-ai" : "src-mixed"}" aria-label="来源：${a.origin === "ai-only" ? "AI 直出，未经人工修订" : "AI 起草加人工修订"}">${a.origin === "ai-only" ? "AI 直出" : "AI+人工"}</span><span class="ver" aria-label="版本 v${esc(a.version ?? "?")}">v${esc(a.version ?? "?")}</span><span class="round">${esc(a.round)}</span></summary>
      <div class="body">
        <div class="row"><span class="k">产物</span><span class="v"><code>${esc(a.path)}</code>${a.viewUrl ? ` <a class="art-open" href="${esc(a.viewUrl)}">打开产物 ↗</a>` : ` <span class="art-self">— 本页自指，不设自链</span>`}</span></div>
        <div class="row"><span class="k">六维</span><span class="v">${esc(Object.entries(a.sixDim ?? {}).map(([k, v]) => `${k}: ${v}`).join("；")).slice(0, 500)}</span></div>
        ${compareBlock(a)}
        <div class="row"><span class="k">状态</span><span class="v">${esc(a.status ?? "")}</span></div><div class="row"><span class="k">来源</span><span class="v">${a.origin === "ai-only" ? "AI 直出（未经人工修订）" : "AI 起草 + 人工修订"}${a.originNote ? ` — ${esc(a.originNote)}` : ""}</span></div>${a.changeSummary ? `<div class="row"><span class="k">变更</span><span class="v">${esc(a.changeSummary)}</span></div>` : ""}
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
  .src { flex:none; border-radius:99px; padding:1px 8px; font-size:11px; border:1px solid var(--line); }
  .src-ai { color:#fbbf24; border-color:#4a3b12; }
  .src-mixed { color:#a7f3d0; border-color:#1f4d3a; }
  .ver { flex:none; color:#c4b5fd; font-size:11px; font-weight:600; }
  .badge { flex:none; background:#0d0d15; border:1px solid var(--line); border-radius:99px; padding:1px 8px; font-size:11px; color:#a7f3d0; }
  .body { padding:0 16px 14px; font-size:13px; }
  .row { display:flex; gap:10px; margin:6px 0; min-width:0; }
  .k { color:var(--dim); min-width:48px; flex:none; }
  .v { flex:1; min-width:0; overflow-wrap:anywhere; }
  code { background:#0d0d15; border:1px solid var(--line); border-radius:6px; padding:1px 6px; font-size:12px; color:#8ab4ff; word-break:break-all; }
  .art-open { color:#c4b5fd; text-decoration:underline dotted; text-underline-offset:3px; white-space:nowrap; }
  .art-open:hover { color:#a78bfa; }
  .art-self { color:var(--dim); font-size:12px; white-space:nowrap; }
  .cmp { border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin:4px 0; background:#0d0d15; }
  .cmp-head { display:flex; flex-wrap:wrap; gap:8px; align-items:baseline; margin-bottom:8px; }
  .cmp-vs { font-weight:600; color:#c4b5fd; }
  .cmp-sum { color:var(--dim); font-size:12px; }
  .cmp-level { margin-left:auto; border:1px solid #4a3b12; color:#fbbf24; border-radius:99px; padding:1px 8px; font-size:11px; }
  .cmp-table { width:100%; border-collapse:collapse; font-size:12px; }
  .cmp-table th { color:var(--dim); font-weight:500; text-align:left; padding:3px 8px; border-bottom:1px solid var(--line); }
  .cmp-table td { padding:3px 8px; border-bottom:1px solid var(--line); overflow-wrap:anywhere; }
  .cmp-table tr:last-child td { border-bottom:none; }
  .mk { font-weight:600; }
  .mk-yes { color:#34d399; }
  .mk-no { color:#f87171; }
  .mk-na { color:var(--dim); }
  .cmp-note { color:var(--dim); font-size:12px; margin-top:8px; }
  .wall-legend { color:var(--dim); font-size:12px; margin:0 0 10px; }
  .cap-intro { color:var(--dim); font-size:12px; margin:0 0 10px; }
  .cap-table { display:grid; gap:8px; }
  .cap-row { display:grid; grid-template-columns:64px minmax(140px,1.1fr) minmax(120px,1fr) minmax(180px,1.6fr); gap:10px; align-items:baseline; background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:10px 14px; font-size:12px; }
  .cap-st { border:1px solid; border-radius:99px; padding:1px 8px; font-size:11px; text-align:center; white-space:nowrap; }
  .cap-name { font-weight:600; }
  .cap-kind { color:var(--dim); font-weight:400; margin-left:6px; font-size:11px; }
  .cap-prov { color:var(--dim); overflow-wrap:anywhere; }
  .cap-acc { color:#a7f3d0; overflow-wrap:anywhere; }
  @media (max-width: 640px) { .cap-row { grid-template-columns:64px 1fr; } .cap-prov, .cap-acc { grid-column:2; } }
  .kb-table { display:grid; gap:8px; }
  .kb-row { display:grid; grid-template-columns:56px 1fr minmax(160px,auto); gap:10px; align-items:baseline; background:var(--panel); border:1px solid var(--line); border-left:3px solid #22d3ee; border-radius:9px; padding:10px 14px; font-size:12px; }
  .kb-dom { color:#22d3ee; font-size:11px; text-transform:uppercase; letter-spacing:.04em; }
  .kb-title { font-weight:600; overflow-wrap:anywhere; }
  .kb-meta { color:var(--dim); text-align:right; }
  @media (max-width: 640px) { .kb-row { grid-template-columns:56px 1fr; } .kb-meta { grid-column:2; text-align:left; } }
  .taste-table { display:grid; gap:8px; }
  .taste-row { display:grid; grid-template-columns:64px 1fr 52px minmax(90px,auto); gap:10px; align-items:baseline; background:var(--panel); border:1px solid var(--line); border-left:3px solid #7c3aed; border-radius:9px; padding:10px 14px; font-size:12px; }
  .taste-st { border:1px solid; border-radius:99px; padding:1px 8px; font-size:11px; text-align:center; white-space:nowrap; }
  .taste-label { font-weight:600; overflow-wrap:anywhere; }
  .taste-conf { color:#c4b5fd; font-variant-numeric:tabular-nums; text-align:right; }
  .taste-ev { color:var(--dim); font-size:11px; }
  @media (max-width: 640px) { .taste-row { grid-template-columns:64px 1fr 52px; } .taste-ev { grid-column:2 / -1; } }
  .cmp-caption { caption-side:bottom; color:var(--dim); font-size:11px; text-align:left; padding-top:6px; }
  /* 生成式微艺术背景：装饰层（aria-hidden），降动效下完全静止且构图不变 */
  .ambient { position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.55; }
  .ambient canvas { width:100%; height:100%; display:block; }
  main { position:relative; z-index:1; }
  .wall-empty { background:var(--panel); border:1px dashed var(--line); border-radius:12px; padding:22px 20px; margin:6px 0 10px; display:flex; gap:16px; align-items:center; }
  .wall-empty[hidden] { display:none; }
  .wall-empty-art { width:120px; height:80px; flex:none; }
  .wall-empty-copy { margin:0; color:var(--dim); font-size:13px; }
  .wall-empty-copy strong { color:var(--text); display:block; margin-bottom:2px; }
  footer { margin-top:24px; color:var(--dim); font-size:12px; text-align:center; }
</style>
</head>
<body>
<div class="ambient" aria-hidden="true"><canvas id="ambient-canvas" width="1600" height="1000"></canvas></div>
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
  ${tasteSection}
  ${capSection}
  ${kbSection}
  <h2 class="sec">产物墙（KPI4 · ${artifacts.artifacts.length} 件 · <span id="wall-mode">全部</span>）</h2>
  <div class="wall-filter" role="group" aria-label="产物墙过滤与排序">
    <button type="button" class="wf-btn is-on" data-mode="all" onclick="wallFilter('all')">全部</button>
    <button type="button" class="wf-btn" data-mode="full" onclick="wallFilter('full')">仅全实测（6/6）</button>
    <span class="wf-sep" aria-hidden="true">|</span>
    <button type="button" class="wf-btn is-on" data-sort="round" onclick="wallSort('round')">按轮次</button>
    <button type="button" class="wf-btn" data-sort="verified" onclick="wallSort('verified')">按完成度</button>
  </div>
  <p class="wall-legend" id="wall-legend">徽章口径：n/6=六维实测数（桌面/移动/键盘/对比度/降动效/控制台各 1 分）；vN=版本序号；检视级别 unverified-partial=仅公开页面检视，未公开验证的维度记 — 不虚记。</p>
  ${rows}
  <div class="wall-empty" id="wall-empty" hidden>
    <svg class="wall-empty-art" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <defs><linearGradient id="ge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
      <rect x="8" y="14" width="46" height="30" rx="4" fill="none" stroke="url(#ge)" stroke-width="2"/>
      <rect x="62" y="26" width="50" height="40" rx="4" fill="none" stroke="#34d399" stroke-width="2"/>
      <circle cx="31" cy="29" r="5" fill="#fbbf24"/>
      <path d="M18 38 L28 30 L38 38" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round"/>
      <path d="M70 56 L82 44 L94 56 L104 48" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <p class="wall-empty-copy"><strong>这一层还没有产物。</strong>不是坏了——是墙空了。切回「全部」或先跑 <code>npm run canvas:build</code> 收一轮增量。</p>
  </div>
<script>
// 六维过滤：measured 徽章 < 6 的条目在 full 模式下隐藏（纯展示切换，无网络无构建逻辑）。
function wallFilter(mode) {
  const full = mode === 'full';
  let visible = 0;
  document.querySelectorAll('details.art').forEach((d) => {
    const badge = d.querySelector('.badge');
    const n = badge ? parseInt((badge.textContent || '').split('/')[0], 10) : 6;
    const hide = full && n < 6;
    d.style.display = hide ? 'none' : '';
    if (!hide) visible += 1;
  });
  document.querySelectorAll('.wf-btn[data-mode]').forEach((b) => b.classList.toggle('is-on', b.dataset.mode === mode));
  document.getElementById('wall-mode').textContent = full ? '仅全实测（6/6）' : '全部';
  const empty = document.getElementById('wall-empty');
  if (empty) empty.hidden = visible > 0;
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
// 生成式微艺术：极低密度漂移粒子（纯装饰，aria-hidden）。降动效时画一帧静态构图后停止，
// 构图与文字对比度不随动画变化（粒子仅落在画布层，文字有自己的面板底色）。
(function ambientArt() {
  const cv = document.getElementById('ambient-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DOTS = 26;
  const dots = Array.from({ length: DOTS }, (_, i) => ({
    x: ((i * 137.5) % 1) * cv.width || ((i * 7919) % cv.width),
    y: ((i * 2459) % cv.height),
    r: 1 + (i % 3),
    dx: (i % 2 ? 1 : -1) * (0.06 + (i % 5) * 0.02),
    dy: (i % 3 ? 1 : -1) * (0.04 + (i % 4) * 0.02),
    hue: i % 3,
  }));
  const palette = ['rgba(124,58,237,0.30)', 'rgba(34,211,238,0.22)', 'rgba(52,211,153,0.18)'];
  function frame() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = palette[d.hue];
      ctx.fill();
      d.x += d.dx; d.y += d.dy;
      if (d.x < -10) d.x = cv.width + 10; if (d.x > cv.width + 10) d.x = -10;
      if (d.y < -10) d.y = cv.height + 10; if (d.y > cv.height + 10) d.y = -10;
    }
  }
  if (reduce.matches) { frame(); return; }
  let raf = 0;
  (function loop() { frame(); raf = requestAnimationFrame(loop); })();
  reduce.addEventListener('change', (e) => { if (e.matches && raf) { cancelAnimationFrame(raf); raf = 0; frame(); } });
})();
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

#!/usr/bin/env node
// render-site — the public product site: one self-contained offline HTML page
// that presents what the kit is, how to use it in three steps, what you will
// see, the six gates, capability slots, knowledge base, taste profile and the
// terms. Data comes from the same JSON sources the workbench uses, so the site
// can never drift from the product's own evidence.
//
// Usage: node canvas/render-site.mjs [output.html]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const readJson = async (rel, fallback) => {
  try { return JSON.parse(await readFile(path.join(ROOT, rel), "utf8")); } catch { return fallback; }
};

const artifacts = await readJson("canvas/artifacts.json", { artifacts: [] });
const caps = await readJson("canvas/capabilities.json", { capabilities: [] });
const kb = await readJson("docs/knowledge-base/index.json", { schemaVersion: 0, cards: [] });
const taste = await readJson("canvas/taste-profile.json", { traits: [], summary: null });
const state = await readJson("canvas/canvas-workbench.state.json", { stages: {}, gates: {} });

const artCount = (artifacts.artifacts ?? []).length;
const adopted = (caps.capabilities ?? []).filter((c) => c.status === "adopted").length;
const capCount = (caps.capabilities ?? []).length;
const kbCount = (kb.cards ?? []).length;
const adoptedTraits = (taste.traits ?? []).filter((t) => t.status === "adopted").length;
const verifiedArtifacts = (artifacts.artifacts ?? []).filter((a) => {
  const sd = a.sixDim ?? {};
  const keys = ["desktop", "mobile", "keyboard", "contrast", "reducedMotion", "console"];
  return keys.every((k) => /通过|实测|直拍|可达|全过/.test(String(sd[k] ?? "")));
}).length;

const gates = [
  ["A", "方向确认", "确认需求摘要与范围，避免做错方向"],
  ["B", "参考素材", "确认参考来源（不抄外观，学机制）"],
  ["C", "设计契约", "确认 DESIGN.md（颜色/字体/间距/动效参数）"],
  ["D", "修订", "根据实测问题决定改什么"],
  ["E", "验收", "看六维实测回执，决定是否通过"],
  ["F", "留痕", "记录能力版本与证据路径，便于复现"],
];
const gateRows = gates
  .map(([id, name, desc]) => {
    const st = state.gates?.[id] ?? "pending";
    const color = { passed: "#34d399", active: "#22d3ee", gated: "#f472b6", pending: "#9ca3af" }[st] ?? "#9ca3af";
    return `<li class="gate"><span class="gid" style="border-color:${color};color:${color}">${id}</span><span class="gname">${esc(name)}</span><span class="gdesc">${esc(desc)}</span></li>`;
  })
  .join("\n");

const capRows = (caps.capabilities ?? [])
  .map((c) => {
    const st = { adopted: ["已接入", "#34d399"], evaluating: ["待接入", "#fbbf24"], rejected: ["不接入", "#f87171"] }[c.status] ?? ["待接入", "#fbbf24"];
    return `<tr><td><span class="pill" style="border-color:${st[1]};color:${st[1]}">${st[0]}</span></td><td>${esc(c.name)}</td><td class="dim">${esc(c.provider)}</td><td class="dim">${esc(c.acceptance)}</td></tr>`;
  })
  .join("\n");

const kbRows = (kb.cards ?? [])
  .map((c) => `<tr><td><span class="dom">${esc(c.layer ?? c.domain)}</span></td><td>${esc(c.title)}${c.alias ? `<span class="kb-alias" aria-label="场景化别名 ${esc(c.alias)}">${esc(c.alias)}</span>` : ""}</td><td class="dim">${esc(c.source?.author ?? "")}${c.source?.heat ? ` · ${(c.source.heat / 10000).toFixed(1)} 万播放` : ""}</td></tr>`)
  .join("\n");

const tasteRows = (taste.traits ?? [])
  .filter((t) => t.status === "adopted" || t.status === "shown")
  .map((t) => {
    const adoptedCls = t.status === "adopted" ? "yes" : "no";
    return `<tr><td><span class="pill ${adoptedCls}">${t.status === "adopted" ? "已采用" : "仅展示"}</span></td><td>${esc(t.label)}</td><td class="dim">${Math.round((t.confidence ?? 0) * 100)}%</td></tr>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>UI Design Agent Kit · 有证据的 UI 工作流</title>
<meta name="description" content="UI 设计智能体工作流：六道门确认、六维实测、证据可复核。不做生成引擎，做生成过程的监管与质量把控。">
<style>
  :root { color-scheme: dark; --bg:#07070a; --panel:#101017; --panel2:#15151f; --line:#23232f; --text:#ededf2; --dim:#9595a8; --accent:#a78bfa; --accent2:#22d3ee; --ok:#34d399; --warn:#fbbf24; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:15.5px/1.72 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
  /* 单笔连续路径艺术层（知识卡 icon-single-stroke-constraint 的落地）：一条不断线的 SVG 路径，
     装饰层 aria-hidden、不拦截指针、降动效时完全静止。 */
  .stroke-art { position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.5; }
  .stroke-art svg { width:100%; height:100%; }
  /* 单笔描边循环动画（icon-single-stroke + motion-force 两卡落地）：
     3s 画完、停 1.2s、擦除重画——节奏用 ease-out 起步（力量感），降动效时
     完全静止显示完整路径。dasharray 值≈路径长度（约 4200），分针留 10% 余量。 */
  .stroke-art path { fill:none; stroke:url(#strokeGrad); stroke-width:1.1; stroke-linecap:round; stroke-linejoin:round;
    stroke-dasharray:4600; stroke-dashoffset:0; animation:strokeDraw 4.2s ease-out infinite; }
  @keyframes strokeDraw {
    0%   { stroke-dashoffset:4600; opacity:.9; }
    71%  { stroke-dashoffset:0;    opacity:1;   }  /* 3s 画完 */
    100% { stroke-dashoffset:0;    opacity:0;   }  /* 1.2s 停留后淡出重画 */
  }
  .wrap { position:relative; z-index:1; max-width:1040px; margin:0 auto; padding:0 24px; }
  header { position:sticky; top:0; z-index:10; backdrop-filter:blur(14px); background:rgba(7,7,10,.82); border-bottom:1px solid var(--line); }
  .nav { display:flex; align-items:center; gap:20px; padding:15px 0; }
  .brand { font-weight:650; letter-spacing:-.01em; font-size:15px; }
  .brand span { color:var(--accent); }
  nav { display:flex; gap:18px; margin-left:auto; flex-wrap:wrap; }
  nav a { color:var(--dim); text-decoration:none; font-size:12.5px; letter-spacing:.01em; }
  nav a:hover { color:var(--text); }
  .hero { padding:96px 0 64px; }
  .kicker { display:inline-flex; align-items:center; gap:8px; color:var(--accent2); font-size:11.5px; letter-spacing:.16em; text-transform:uppercase; margin-bottom:22px; }
  .kicker::before { content:""; width:22px; height:1px; background:var(--accent2); display:block; }
  h1 { font-size:clamp(32px,5.4vw,58px); line-height:1.1; margin:0 0 22px; letter-spacing:-.03em; font-weight:680; }
  h1 em { font-style:normal; color:var(--accent); }
  .lede { color:var(--dim); font-size:16.5px; max-width:620px; margin:0 0 30px; }
  .lede strong { color:var(--text); font-weight:600; }
  .cta { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:44px; }
  .btn { display:inline-block; padding:10px 18px; border-radius:8px; text-decoration:none; font-size:13.5px; font-weight:600; border:1px solid var(--line); color:var(--text); }
  .btn.primary { background:var(--text); color:#0a0a0f; border-color:transparent; }
  .btn:hover { border-color:var(--accent); }
  /* 证据条：数字用等宽，标签克制 */
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(132px,1fr)); gap:0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .stat { padding:18px 0 18px 18px; border-left:1px solid var(--line); }
  .stat:first-child { border-left:none; padding-left:0; }
  .stat b { display:block; font:600 26px/1.15 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
  .stat span { color:var(--dim); font-size:11.5px; }
  section { padding:56px 0; border-top:1px solid var(--line); }
  h2 { font-size:21px; margin:0 0 8px; letter-spacing:-.015em; font-weight:640; }
  .sub { color:var(--dim); font-size:14px; margin:0 0 26px; max-width:680px; }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(228px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .card { background:var(--panel); padding:22px; }
  .card h3 { margin:0 0 8px; font-size:14.5px; font-weight:620; }
  .card p { margin:0; color:var(--dim); font-size:13px; }
  .steps { display:grid; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:10px; overflow:hidden; counter-reset:step; }
  .step { background:var(--panel); padding:20px 22px; display:grid; grid-template-columns:30px minmax(0,1fr); gap:16px; }
  .step > div { min-width:0; }
  .step::before { counter-increment:step; content:counter(step); display:grid; place-items:center; width:26px; height:26px; border-radius:6px; border:1px solid var(--line); color:var(--accent); font:600 12px/1 ui-monospace,monospace; }
  .step h3 { margin:0 0 4px; font-size:14.5px; font-weight:620; }
  .step p { margin:0; color:var(--dim); font-size:13px; }
  pre { background:#0a0a11; border:1px solid var(--line); border-radius:8px; padding:13px 15px; overflow-x:auto; font-size:12.5px; margin:12px 0 0; line-height:1.65; }
  code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; color:#b4b8ff; }
  .gates { list-style:none; padding:0; margin:0; display:grid; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .gate { background:var(--panel); display:grid; grid-template-columns:34px 88px 1fr; gap:14px; align-items:baseline; padding:13px 18px; font-size:13px; }
  .gid { border:1px solid; border-radius:5px; text-align:center; font:600 11px/1.6 ui-monospace,monospace; }
  .gname { font-weight:600; }
  .gdesc { color:var(--dim); }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  /* 宽表在窄屏内滚而非撑破页面（reg-005：360/390/414px 能力表最小内容宽 413px 溢出）。
     表格内容不裁切、不隐藏——只在容器内横向滚动。 */
  .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
  .table-wrap > table { min-width:var(--table-min, 420px); }
  #caps .table-wrap { --table-min:520px; }
  #kb .table-wrap { --table-min:440px; }
  thead th { text-align:left; color:var(--dim); font-weight:500; font-size:11.5px; letter-spacing:.04em; text-transform:uppercase; padding:0 14px 10px; }
  tbody td { padding:12px 14px; border-top:1px solid var(--line); }
  tbody tr:hover { background:var(--panel); }
  .dim { color:var(--dim); }
  .pill { display:inline-block; border:1px solid var(--line); border-radius:99px; padding:1px 9px; font-size:10.5px; }
  .pill.yes { color:var(--ok); border-color:rgba(52,211,153,.45); }
  .pill.no { color:var(--warn); border-color:rgba(251,191,36,.4); }
  .dom { color:var(--accent2); font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; }
  .kb-alias { display:inline-block; margin-left:8px; border:1px solid rgba(167,139,250,.4); color:var(--accent); border-radius:99px; padding:0 8px; font-size:10.5px; }
  #kb table { table-layout:fixed; }
  #kb th, #kb td { overflow-wrap:anywhere; }
  .terms { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .film-wrap { border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#000; }
  .film { display:block; width:100%; height:auto; aspect-ratio:16/9; background:#000; }
  .film-meta { display:flex; flex-wrap:wrap; gap:16px; padding:11px 16px; background:var(--panel); border-top:1px solid var(--line); color:var(--dim); font-size:12px; }
  .term { background:var(--panel); padding:20px 22px; }
  .term h3 { margin:0 0 6px; font-size:13.5px; font-weight:620; }
  .term p { margin:0; color:var(--dim); font-size:12.5px; }
  footer { padding:40px 0 72px; color:var(--dim); font-size:12px; border-top:1px solid var(--line); }
  footer a { color:var(--dim); }
  @media (max-width:640px) { .gate { grid-template-columns:30px 1fr; } .gdesc { grid-column:2; } .hero { padding:64px 0 44px; } .stat { padding-left:14px; } }
  @media (prefers-reduced-motion: reduce) { * { animation:none !important; transition:none !important; } .stroke-art { opacity:.32; } .stroke-art path { animation:none !important; stroke-dashoffset:0 !important; } }
</style>
</head>
<body>
<div class="stroke-art" aria-hidden="true">
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
    <defs><linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa" stop-opacity=".55"/><stop offset=".55" stop-color="#22d3ee" stop-opacity=".35"/><stop offset="1" stop-color="#34d399" stop-opacity=".2"/>
    </linearGradient></defs>
    <!-- 单笔连续路径：一次 M，其余全部 L/C（知识卡 icon-single-stroke-constraint） -->
    <path d="M-40 210 C 120 120, 240 300, 360 230 S 560 90, 700 190 S 900 330, 1040 240 S 1280 110, 1480 200
             L 1480 520 C 1320 600, 1180 470, 1040 540 S 820 690, 680 600 S 460 450, 320 540 S 100 690, -40 600 Z"/>
  </svg>
</div>
<header><div class="wrap nav">
  <div class="brand">UI Design <span>Agent Kit</span></div>
  <nav>
    <a href="#film">介绍片</a><a href="#what">是什么</a><a href="#how">怎么用</a><a href="#gates">六道门</a>
    <a href="#caps">能力接入</a><a href="#kb">知识库</a><a href="#taste">品味</a><a href="#terms">条款</a>
  </nav>
</div></header>

<main class="wrap">
  <div class="hero">
    <div class="kicker">有证据的 UI 工作流</div>
    <h1>把一句需求，<br>变成<em>可验收</em>的界面。</h1>
    <p class="lede">我们不做生成引擎。我们做生成过程的<strong>监管与质量把控</strong>：六道门确认、六维实测、证据可复核。市面上的生成能力越强，这套监管层越有价值。</p>
    <div class="cta">
      <a class="btn primary" href="#how">三步开始</a>
      <a class="btn" href="#gates">看六道门</a>
    </div>
    <div class="stats">
      <div class="stat"><b>${verifiedArtifacts}/${artCount}</b><span>产物六维全实测</span></div>
      <div class="stat"><b>${adopted}/${capCount}</b><span>能力接入 · 已接入/登记</span></div>
      <div class="stat"><b>${kbCount}</b><span>机制知识卡</span></div>
      <div class="stat"><b>${adoptedTraits}</b><span>已采用品味特质</span></div>
    </div>
  </div>

  <section id="film">
    <h2>介绍片 · 2 分 45 秒</h2>
    <p class="sub">这支片子本身也是产物：Remotion 代码渲染、three.js 真实三维门廊、程序化合成配乐，画面全部来自本仓真实运行的界面。</p>
    <div class="film-wrap">
      <video class="film" controls preload="metadata" playsinline poster="">
        <source src="video/uak-intro.mp4" type="video/mp4">
        你的浏览器不支持 video 标签，可直接打开 <a href="video/uak-intro.mp4">video/uak-intro.mp4</a>。
      </video>
      <div class="film-meta">
        <span>165s · 1080p30 源 / 720p 分发</span>
        <span>13 场景 · 31 条字幕</span>
        <span>Remotion + three.js + 程序化配乐</span>
      </div>
    </div>
  </section>

  <section id="what">
    <h2>是什么</h2>
    <p class="sub">一个 UI 专项的智能体工作流：你出需求，它走门径、留证据、给回执。它不替你决定品味，但让每个决定都有依据。</p>
    <div class="cards">
      <div class="card"><h3>门径而非黑盒</h3><p>六个确认停点，每一步你都知道 AI 看到了什么、依据什么决定。</p></div>
      <div class="card"><h3>证据而非说辞</h3><p>六维实测回执（桌面/移动/键盘/对比度/降动效/控制台），未测维度记 — 不虚记。</p></div>
      <div class="card"><h3>监管而非生成</h3><p>生成能力按契约外接；我们负责接入的验收、边界与留痕。</p></div>
      <div class="card"><h3>越用越懂你</h3><p>品味档案只从你的原话与明确选择推导，可回溯、可删除。</p></div>
    </div>
  </section>

  <section id="how">
    <h2>怎么用</h2>
    <p class="sub">三步：装好、说需求、看证据。</p>
    <div class="steps">
      <div class="step"><div><h3>安装</h3><p>克隆仓库并跑通校验，确认环境可用。</p><pre><code>git clone https://github.com/muzimu217/ui-design-agent-kit.git
cd ui-design-agent-kit &amp;&amp; npm ci --ignore-scripts
npm run verify &amp;&amp; npm test</code></pre></div></div>
      <div class="step"><div><h3>说需求</h3><p>在你的宿主（Codex / Claude Code / Cursor / Copilot 等 13 个）里用日常语言描述界面。工作流会先进入门 A 确认方向。</p></div></div>
      <div class="step"><div><h3>看证据</h3><p>每个产物带六维实测；随时可重建工作台、跑验收、导出离线复核包。</p><pre><code>npm run canvas:build   # 工作台（产物墙+对比）
npm run canvas:check   # 实测验收 + 三层守卫
npm run canvas:export  # 离线复核包（含 COMPARE.md）</code></pre></div></div>
    </div>
  </section>

  <section id="gates">
    <h2>六道门</h2>
    <p class="sub">门不是流程装饰：没有你的确认，工作流不会把"做完了"当成"做好了"。</p>
    <ul class="gates">${gateRows}</ul>
  </section>

  <section id="caps">
    <h2>能力接入</h2>
    <p class="sub">外部能力要进来必须回答四问：谁产出、边界在哪、如何验收、证据在哪。<strong>空槽位是诚实状态</strong>——没找到满足条件的候选就不接。</p>
    <div class="table-wrap"><table><thead><tr><th>状态</th><th>能力</th><th>提供方</th><th>验收口径</th></tr></thead><tbody>${capRows}</tbody></table></div>
  </section>

  <section id="kb">
    <h2>知识库</h2>
    <p class="sub">每日从高播放视觉系内容中提炼机制，写成带<strong>可编码参数</strong>与适用边界的卡片；卡片只增不删，冲突以证据消解。</p>
    <div class="table-wrap"><table><thead><tr><th>层</th><th>机制</th><th>来源</th></tr></thead><tbody>${kbRows}</tbody></table></div>
  </section>

  <section id="taste">
    <h2>越用越懂你</h2>
    <p class="sub">品味档案只记录可复核信号（你的原话、明确选择），每条特质可回溯到具体信号；置信度不足只展示不采用，你可以随时要求删除。</p>
    <div class="table-wrap"><table><thead><tr><th>状态</th><th>特质</th><th>置信度</th></tr></thead><tbody>${tasteRows}</tbody></table></div>
  </section>

  <section id="terms">
    <h2>服务条款与边界</h2>
    <p class="sub">我们提供工作流与验证纪律，不提供模型服务、账户、生成引擎或第三方素材授权。完整条款见仓库 <code>docs/terms.md</code>。</p>
    <div class="terms">
      <div class="term"><h3>我们保证</h3><p>每个产物附实测回执；检视级别如实标注；未测维度不虚记；失败与降级如实记录。</p></div>
      <div class="term"><h3>我们不保证</h3><p>设计一定"好看"；外部生成能力质量；跨环境一致性——发布前需在目标环境复验。</p></div>
      <div class="term"><h3>你的责任</h3><p>方向确认、素材合规、凭据保管；上传内容须你有权使用。</p></div>
      <div class="term"><h3>数据与隐私</h3><p>全部本地；无后端、无遥测；竞品截图仅内部研究，不外发；品味档案可删除。</p></div>
    </div>
  </section>
</main>

<footer><div class="wrap">
  UI Design Agent Kit · 离线自包含页面 · 由 <code>canvas/render-site.mjs</code> 从工作台同一数据源生成 ·
  <a href="docs/getting-started.md">使用指南</a> · <a href="docs/terms.md">服务条款</a> · <a href="https://github.com/muzimu217/ui-design-agent-kit">GitHub</a>
</div></footer>
</body>
</html>`;

const output = process.argv[2] ?? path.join(ROOT, "output", "site.html");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html);
console.log(`site rendered: ${output} (${artCount} artifacts · ${capCount} capabilities · ${kbCount} cards · ${adoptedTraits} adopted traits)`);

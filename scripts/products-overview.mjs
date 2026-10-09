// 生成产品成果本地总览页：把 11 个 demo 与线上展厅的对应关系放一页。
// 决策背景：用户要求"产出的产品长什么样，得能直接看"。
// 截图来源 = showcase/products/media（第一方产物，已入库，来源登记见其 SOURCES.md）；
// 本页是本地浏览件；本脚本入库。
// 用法：node scripts/products-overview.mjs
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "docs", "products-overview.html");

// 相对 showcase/products/media/ 的真实截图（第一方，来源见 SOURCES.md）
const products = [
  { name: "积木小工坊", en: "brick-workshop", status: "线上可玩", img: "../showcase/products/screenshots/workflow.webp",
    desc: "3D 拼搭工作台：12 砖型 12 色、三个挑战、自由试玩；作品存本机浏览器。demo 125 项规则/状态测试。",
    live: "https://agent.kcos.club/demos/brick-workshop/" },
  { name: "库存运营台", en: "inventory-console", status: "线上可玩", img: "inventory.webp",
    desc: "搜索/状态筛选/详情/批量归档的运营工具界面；12 列数据密集台账判据入库（行高/粘性表头/tabular-nums/状态三通道）。",
    live: "https://agent.kcos.club/demos/inventory-console/" },
  { name: "NODEGRID", en: "nodegrid", status: "线上可玩", img: "nodegrid.webp",
    desc: "3D 地球云节点分布可视化（虚构云商，数据非实时）；WebGL 失败提示与重试、离屏暂停经验证。",
    live: "https://agent.kcos.club/demos/nodegrid/" },
  { name: "地铁疾行", en: "subway-runner", status: "线上可玩", img: "subway.webp",
    desc: "3D 跑酷小游戏；确定性物理与帧驱动渲染经验入库。",
    live: "https://agent.kcos.club/demos/subway-runner/" },
  { name: "FORMA One", en: "forma-phone-ui", status: "线上可玩", img: "forma.webp",
    desc: "虚构手机产品配置页；1440×900 真实 vite preview 渲染截图入库。",
    live: "https://agent.kcos.club/" },
  { name: "Tempo 今日", en: "tempo-day", status: "线上可玩", img: "tempo.webp",
    desc: "当日任务与专注计时概念页；本机数据由项目独立处理。",
    live: "https://agent.kcos.club/" },
  { name: "睿耳 RuiEar", en: "ruiear", status: "线上展示", img: "ruiear.webp",
    desc: "AI 耳机概念落地页（占位品牌，示意价格参数）。",
    live: "https://agent.kcos.club/" },
  { name: "曜石 X1", en: "product-demo", status: "历史截图案例", img: "obsidian.webp",
    desc: "虚构产品展示页（历史截图案例，不提供试玩入口）。",
    live: null },
  { name: "一舟札记", en: "blog-demo", status: "历史截图案例", img: "blog.webp",
    desc: "虚构个人博客（历史截图案例，不提供试玩入口）。",
    live: null },
];

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cards = products
  .map(
    (p) => `<figure>
  <img src="../showcase/products/media/${esc(p.img)}" alt="${esc(`${p.name} 真实截图`)}" loading="lazy">
  <figcaption>
    <strong>${esc(p.name)}</strong>
    <span class="tag ${p.live ? "live" : "hist"}">${esc(p.status)}</span><br>
    ${esc(p.desc)}<br>
    ${p.live ? `<a href="${esc(p.live)}">线上打开 ↗</a>` : `<span class="meta">仅历史截图，无线上入口</span>`}
  </figcaption>
</figure>`,
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>产品成果总览 · 本地浏览页</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 2rem; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
         background: #101418; color: #e6e9ec; line-height: 1.6; }
  h1 { font-size: 1.4rem; } h2 { font-size: 1.1rem; margin-top: 2rem; }
  .note { background: #1a2026; border: 1px solid #2a3138; border-radius: 8px; padding: .8rem 1rem;
          font-size: .9rem; color: #aab3bb; margin-bottom: 1.5rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
  figure { margin: 0; background: #171d23; border: 1px solid #2a3138; border-radius: 8px; overflow: hidden; }
  img { width: 100%; display: block; aspect-ratio: 16/10; object-fit: cover; }
  figcaption { padding: .7rem .9rem; font-size: .85rem; color: #b8c0c8; }
  .tag { display: inline-block; font-size: .72rem; padding: .1rem .5rem; border-radius: 99px; margin-left: .4rem; vertical-align: 1px; }
  .tag.live { background: #14342a; color: #57d9a3; }
  .tag.hist { background: #2a2a1e; color: #d9c957; }
  a { color: #6cb6ff; }
  .meta { color: #7d8790; }
</style>
</head>
<body>
<h1>产品成果总览（kit 工作流的产出案例）</h1>
<p class="note">以下截图全部来自本仓第一方产物（<code>showcase/products/media/</code>，来源登记见其
<code>SOURCES.md</code>）——它们是真实运行截图，不是概念图。每个案例的验收边界以各自 README 与
<code>docs/product-showcase.md</code> 为准：截图证明对应页面某次检查结果，不代表所有生成任务都通过验收。
7 个案例在线上展厅 <a href="https://agent.kcos.club/">agent.kcos.club</a> 可访问（其中 4 个可试玩）。</p>
<div class="grid">
${cards}
</div>
<h2>工作流层产出（不是页面，是方法）</h2>
<p class="note">除了以上界面案例，kit 的核心产出是工作流本身：六道门确认工作流、设计契约、五级证据等级、
131 项自动化测试、71 场景评测台账、131 页总任务执行清单与三条 ADR。这些在
<a href="task-execution-checklist.md">docs/task-execution-checklist.md</a> 与
<a href="adr/README.md">docs/adr/</a> 可复核。</p>
</body>
</html>
`;

writeFileSync(outPath, html);
console.log(`products overview written: ${outPath} (${products.length} cases)`);

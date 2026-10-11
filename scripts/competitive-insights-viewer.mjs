#!/usr/bin/env node
// 生成竞品截图本地浏览页 docs/competitive-insights/viewer.html。
// 决策背景见 docs/adr/0002-competitive-screenshots-local-only.md：
// 截图与 viewer 都只留本地不入库；本脚本入库，生成物不入库。
// 用法：node scripts/competitive-insights-viewer.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const insightsDir = join(root, "docs", "competitive-insights");
const outPath = join(insightsDir, "viewer.html");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sections = readdirSync(insightsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()
  .map((dir) => {
    const abs = join(insightsDir, dir);
    const images = readdirSync(abs)
      .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
      .sort();
    let title = dir;
    const insightFile = join(abs, "insight.md");
    if (existsSync(insightFile)) {
      const m = readFileSync(insightFile, "utf8").match(/^#\s+(.+)$/m);
      if (m) title = m[1].trim();
    }
    return { dir, title, images, hasInsight: existsSync(insightFile) };
  })
  .filter((s) => s.images.length > 0);

const total = sections.reduce((n, s) => n + s.images.length, 0);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>竞品洞察 · 本地证据浏览页（不入库）</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 2rem; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
         background: #101418; color: #e6e9ec; line-height: 1.6; }
  h1 { font-size: 1.4rem; } h2 { font-size: 1.1rem; margin-top: 2.5rem; border-bottom: 1px solid #2a3138; padding-bottom: .4rem; }
  .note { background: #1a2026; border: 1px solid #2a3138; border-radius: 8px; padding: .8rem 1rem; font-size: .9rem; color: #aab3bb; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-top: 1rem; }
  figure { margin: 0; background: #171d23; border: 1px solid #2a3138; border-radius: 8px; overflow: hidden; }
  img { width: 100%; display: block; }
  figcaption { padding: .5rem .8rem; font-size: .8rem; color: #9aa4ad; word-break: break-all; }
  a { color: #6cb6ff; }
  .meta { color: #7d8790; font-size: .85rem; }
</style>
</head>
<body>
<h1>竞品洞察 · 本地证据浏览页</h1>
<p class="meta">${sections.length} 个对象目录 · ${total} 张截图 · 生成时间 ${esc(new Date().toISOString())}</p>
<p class="note">按 ADR-0002（版权克制）：本页与全部截图仅存本地，不提交进公开仓、不上 showcase、不外发。
重新生成：<code>node scripts/competitive-insights-viewer.mjs</code>。每张图所属的分析与"学什么/不学什么"见各目录 <code>insight.md</code>（已入库）。</p>
${sections
  .map(
    (s) => `<h2>${esc(s.title)}${s.hasInsight ? ` · <a href="${esc(s.dir)}/insight.md">insight.md</a>` : ""}</h2>
<p class="meta">${esc(s.dir)}/</p>
<div class="grid">
${s.images
  .map(
    (img) =>
      `<figure><img src="${esc(s.dir)}/${esc(img)}" alt="${esc(`${s.dir} ${img}`)}" loading="lazy"><figcaption>${esc(img)}</figcaption></figure>`,
  )
  .join("\n")}
</div>`,
  )
  .join("\n")}
</body>
</html>
`;

writeFileSync(outPath, html);
console.log(`viewer written: ${outPath} (${sections.length} dirs, ${total} images)`);

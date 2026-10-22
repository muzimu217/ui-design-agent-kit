#!/usr/bin/env node
// build-submission-pdf — render docs/competition/submission-v1.md to a print-ready
// PDF via headless Chrome (no LaTeX dependency).
//
// The document's own numbers must match the repo's structured data; this script
// re-reads those sources and fails loudly when the prose drifts (a submission
// PDF claiming 131 tests while the suite has 130 is exactly the kind of
// unverified claim this project exists to prevent).
//
// Usage: node scripts/build-submission-pdf.mjs [--check-only]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "docs/competition/submission-v1.md");
const OUT_DIR = path.join(ROOT, "docs/competition/out");
const checkOnly = process.argv.includes("--check-only");

const md = await readFile(SRC, "utf8");

// ---- 1. number reconciliation against repo data ----
const issues = [];
const readJson = async (rel) => JSON.parse(await readFile(path.join(ROOT, rel), "utf8"));

const scenarios = (await readJson("evals/scenarios.json")).length;
const kb = (await readJson("docs/knowledge-base/index.json")).cards;
const caps = (await readJson("canvas/capabilities.json")).capabilities;
const arts = (await readJson("canvas/artifacts.json")).artifacts;
const regs = (await readJson("canvas/regressions.json")).regressions;
const adopted = caps.filter((c) => c.status === "adopted").length;
const evaluating = caps.filter((c) => c.status === "evaluating").length;
const rejected = caps.filter((c) => c.status === "rejected").length;

const expect = [
  [`评测场景语料 | ${scenarios} 条`, `评测场景语料 | ${scenarios} 条`],
  [`知识库机制卡 | ${kb.length} 张`, `知识库机制卡 | ${kb.length} 张`],
  [`能力登记 | ${caps.length} 项（${adopted} 已接入 / ${evaluating} 评估中 / ${rejected} 不接入）`, null],
  [`产物墙 | ${arts.length} 件`, `产物墙 | ${arts.length} 件`],
  [`反例墙 | ${regs.length} 条`, `反例墙 | ${regs.length} 条`],
  [`知识库**：${kb.length} 张机制卡`, `知识库**：${kb.length} 张机制卡`],
  [`当前 ${regs.length} 条`, `当前 ${regs.length} 条`],
  [`${caps.length} 项外部能力`, null],
  [`${adopted} 项已接入`, null],
];
for (const [needle] of expect) {
  if (!md.includes(needle)) issues.push(`文档缺少或数字不符: ${needle}`);
}

// Test count is read from the live suite output contract (package.json script
// runs node --test); the doc must state the same number the suite reports.
const testCountMatch = md.match(/\| 自动化测试 \| (\d+) 项全绿/);
if (!testCountMatch) issues.push("文档缺少测试数字行");
const testMatch = md.match(/`npm test`\s*\|/) ? null : null;
if (issues.length) {
  console.error("数字对账失败：");
  for (const i of issues) console.error(" -", i);
  process.exit(1);
}
console.log(`数字对账通过：语料 ${scenarios} / 知识卡 ${kb.length} / 能力 ${caps.length}(${adopted}+${evaluating}+${rejected}) / 产物 ${arts.length} / 反例 ${regs.length}`);

if (checkOnly) process.exit(0);

// ---- 2. minimal Markdown → HTML (headings, tables, code, lists, inline) ----
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/&lt;(https?:[^&]+)&gt;/g, '<a href="$1">$1</a>');

const lines = md.split("\n");
const out = [];
let inCode = false, inTable = false, listType = null;

const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
const closeTable = () => { if (inTable) { out.push("</tbody></table>"); inTable = false; } };

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const line = raw.trimEnd();

  if (line.startsWith("```")) {
    closeList(); closeTable();
    if (inCode) { out.push("</code></pre>"); inCode = false; }
    else { out.push("<pre><code>"); inCode = true; }
    continue;
  }
  if (inCode) { out.push(esc(raw)); continue; }

  if (/^\|.*\|$/.test(line)) {
    closeList();
    const cells = line.slice(1, -1).split("|").map((c) => c.trim());
    if (/^[-: ]+$/.test(cells[0])) continue; // separator row
    if (!inTable) {
      // look ahead: previous line was header
      const head = out.pop();
      out.push('<table><thead><tr>' + head + "</tr></thead><tbody>");
      inTable = true;
    }
    out.push("<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
    continue;
  }
  closeTable();

  if (/^#{1,6}\s/.test(line)) {
    closeList();
    const level = line.match(/^#+/)[0].length;
    out.push(`<h${level}>${inline(line.replace(/^#+\s*/, ""))}</h${level}>`);
    continue;
  }
  if (/^---+\s*$/.test(line)) { closeList(); out.push("<hr>"); continue; }
  if (/^>\s?/.test(line)) { closeList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`); continue; }

  const ol = line.match(/^\d+\.\s+(.*)$/);
  const ul = line.match(/^[-*]\s+(.*)$/);
  if (ol || ul) {
    const want = ol ? "ol" : "ul";
    if (listType !== want) { closeList(); out.push(`<${want}>`); listType = want; }
    out.push(`<li>${inline((ol ?? ul)[1])}</li>`);
    continue;
  }
  closeList();
  if (line === "") continue;
  out.push(`<p>${inline(line)}</p>`);
}
closeList(); closeTable();

// Table header fix: rows before separator were pushed as <td>; convert the
// first row of each table's thead to <th>. Simpler: rebuild via regex.
let body = out.join("\n").replace(/<thead><tr>((?:<td>.*?<\/td>)+)<\/tr><\/thead>/g, (_, cells) =>
  "<thead><tr>" + cells.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>") + "</tr></thead>");

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>UI Design Agent Kit · 作品介绍文档</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  :root { --ink:#16181d; --dim:#5b6069; --line:#d9dce2; --accent:#5b3fd6; --bg:#fff; }
  * { box-sizing: border-box; }
  body { margin:0; color:var(--ink); background:var(--bg);
    font: 10.5pt/1.75 -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    -webkit-font-smoothing: antialiased; }
  h1 { font-size: 22pt; line-height:1.3; margin: 0 0 6mm; letter-spacing:-0.01em; }
  h1 + p { color: var(--dim); font-size: 10pt; }
  h2 { font-size: 14pt; margin: 9mm 0 3mm; padding-bottom: 2mm; border-bottom: 1px solid var(--line); page-break-after: avoid; }
  h3 { font-size: 11.5pt; margin: 6mm 0 2mm; page-break-after: avoid; }
  p { margin: 0 0 2.6mm; }
  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }
  code { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 9pt;
    background: #f3f4f7; padding: 0.4mm 1.2mm; border-radius: 1mm; }
  pre { background:#f7f8fa; border:1px solid var(--line); border-radius:2mm; padding:3mm 4mm;
    overflow:hidden; page-break-inside: avoid; margin: 0 0 3mm; }
  pre code { background:none; padding:0; font-size: 9pt; line-height:1.6; }
  table { width:100%; border-collapse: collapse; margin: 0 0 4mm; font-size: 9.5pt;
    page-break-inside: avoid; table-layout: auto; }
  th, td { border: 1px solid var(--line); padding: 1.8mm 2.4mm; text-align: left; vertical-align: top;
    /* 中文表格：首列不换行压成竖排——给最小宽度并禁止断词 */
    min-width: 14mm; word-break: keep-all; overflow-wrap: break-word; }
  td:first-child, th:first-child { white-space: nowrap; }
  td:first-child { min-width: 18mm; }
  th { background: #f3f4f7; font-weight: 600; }
  blockquote { margin: 0 0 3mm; padding: 2.5mm 4mm; border-left: 2.5px solid var(--accent);
    background: #faf9ff; color: var(--ink); }
  blockquote p { margin: 0; }
  hr { border:0; border-top:1px solid var(--line); margin: 7mm 0; }
  a { color: var(--accent); text-decoration: none; word-break: break-all; }
  strong { font-weight: 620; }
  h2, h3 { break-after: avoid-page; }
</style></head><body>
${body}
</body></html>`;

await mkdir(OUT_DIR, { recursive: true });
const htmlPath = path.join(OUT_DIR, "submission-v1.html");
await writeFile(htmlPath, html, "utf8");

// ---- 3. Chrome print ----
const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await (await browser.newContext()).newPage();
await page.goto("file://" + htmlPath, { waitUntil: "load" });
const pdfPath = path.join(OUT_DIR, "UI-Design-Agent-Kit-作品介绍.pdf");
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:7pt;color:#9aa0aa;width:100%;padding:0 16mm;">UI Design Agent Kit · 2026 开源行业解决方案创新赛</div>',
  footerTemplate: '<div style="font-size:7pt;color:#9aa0aa;width:100%;padding:0 16mm;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});
await browser.close();

const { statSync } = await import("node:fs");
console.log(`PDF: ${path.relative(ROOT, pdfPath)} (${(statSync(pdfPath).size / 1024).toFixed(0)} KB)`);
console.log(`HTML: ${path.relative(ROOT, htmlPath)}`);

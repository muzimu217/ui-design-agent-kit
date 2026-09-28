import { mkdir, writeFile, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

// R050-04：a11y 巡检——对发布面（线上站或 --base 指定的产物目录服务）跑
// axe-core wcag21aa，明/暗双主题，先建基线再趋紧（2026 Deque 实践：
// axe 自动可检出 ~30-57%，基线+下降趋势比"零违规"更现实）。
//
// 用法：
//   npm run a11y:sweep                # 扫线上站，与基线差分（无基线则建）
//   node scripts/a11y-sweep.mjs --base http://127.0.0.1:4173
//   node scripts/a11y-sweep.mjs --update-baseline   # 首跑或确认收敛后重建基线
// 退出码：新增 critical/serious 违规 > 0 时为 1（观测期不进 CI，趋势平稳后再议门禁化）。

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const baseFlag = args.indexOf("--base");
const BASE = baseFlag >= 0 ? args[baseFlag + 1] : "https://agent.kcos.club";
const UPDATE_BASELINE = args.includes("--update-baseline");

const outDir = path.join(root, "output", "a11y-report");
const baselinePath = path.join(outDir, "baseline.json");

// 发布面清单与 showcase/scripts/build-pages.mjs PUBLIC_APPS 保持同源：
// 根站三路由（hash）+ 7 个 demo 挂载页。
const PAGES = [
  { id: "home", url: `${BASE}/` },
  { id: "evidence", url: `${BASE}/#/evidence` },
  { id: "workflow", url: `${BASE}/#/workflow` },
  ...["brick-workshop", "inventory-console", "nodegrid", "subway-runner", "forma-phone-ui", "tempo-day", "ruiear"].map(
    (demo) => ({ id: `demo/${demo}`, url: `${BASE}/demos/${demo}/` }),
  ),
];
const THEMES = ["light", "dark"];
const SEVERITIES = ["critical", "serious", "moderate", "minor"];

const fingerprint = (violation) =>
  // run() 已把 nodes 归一为排序后的 selector 字符串数组，此处直接拼接。
  `${violation.id}::${violation.nodes.join("|")}`;

const run = async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    const context = await browser.newContext();
    for (const theme of THEMES) {
      const page = await context.newPage();
      await page.emulateMedia({ colorScheme: theme });
      for (const target of PAGES) {
        await page.goto(target.url, { waitUntil: "networkidle", timeout: 45000 }).catch(async () => {
          await page.waitForTimeout(3000); // hash 路由/慢资源兜底
        });
        await page.waitForTimeout(1200); // 字体/动效 settling
        const axe = new AxeBuilder({ page });
        let violations;
        try {
          // 注意 tag 口径：axe 的 wcag21aa 仅含 2.1 新增 AA 规则，单独用会漏
          // color-contrast 等 2.0 AA 核心规则（一手验证：坏页上 wcag21aa=0 而
          // wcag2aa=1）——A+AA 全集才是 "WCAG 2.1 AA" 的完整语义。
          ({ violations } = await axe
            .options({ runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] })
            .analyze());
        } catch (error) {
          results.push({ theme, page: target.id, url: target.url, error: String(error).slice(0, 300) });
          continue;
        }
        results.push({
          theme,
          page: target.id,
          url: target.url,
          violations: violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: [...new Set(v.nodes.map((n) => n.target.join(" ")))].sort(),
          })),
        });
      }
    }
  } finally {
    await browser.close();
  }
  return results;
};

const summarize = (results) => {
  const bySev = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
  const entries = [];
  for (const r of results) {
    if (r.error) continue;
    for (const v of r.violations) {
      bySev[v.impact ?? "minor"] = (bySev[v.impact ?? "minor"] ?? 0) + 1;
      entries.push({ key: `${r.theme}/${r.page}`, impact: v.impact, fp: fingerprint(v), id: v.id, help: v.help });
    }
  }
  return { bySev, entries };
};

const main = async () => {
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const results = await run();
  await writeFile(path.join(outDir, `${stamp}.json`), JSON.stringify(results, null, 2));

  let baseline = null;
  try {
    baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  } catch {}

  const lines = [`# a11y 巡检 ${stamp}（base=${BASE}）`, ""];
  const errors = results.filter((r) => r.error);
  // 扫描失败 ≠ 无违规（R050-04 教训：首跑 20/20 因导入错误被吞成"全绿"）。
  // 错误必须在报告置顶并使退出码非 0。
  if (errors.length) {
    lines.push(`## ⚠ 扫描失败 ${errors.length}/${results.length}（结果不可信）`, "");
    for (const e of errors.slice(0, 10)) lines.push(`- ${e.theme}/${e.page}: ${e.error}`);
    lines.push("");
  }
  const { bySev, entries } = summarize(results);
  lines.push(`严重度计数：${SEVERITIES.map((s) => `${s} ${bySev[s] ?? 0}`).join(" · ")}`, "");
  let newCritical = 0;
  if (baseline) {
    const baseSet = new Map(baseline.entries.map((e) => [e.fp, e]));
    const nowSet = new Map(entries.map((e) => [e.fp, e]));
    const added = entries.filter((e) => !baseSet.has(e.fp));
    const fixed = baseline.entries.filter((e) => !nowSet.has(e.fp));
    newCritical = added.filter((e) => e.impact === "critical" || e.impact === "serious").length;
    lines.push(`## 与基线差分`, `- 新增 ${added.length}（critical/serious ${newCritical}）`, `- 已修 ${fixed.length}`, "");
    for (const a of added.slice(0, 40)) lines.push(`- NEW [${a.impact}] ${a.key}: ${a.id} — ${a.help}`);
    for (const f of fixed.slice(0, 40)) lines.push(`- FIXED [${f.impact}] ${f.key}: ${f.id}`);
  } else {
    lines.push(`## 首跑（本报告即基线候选，--update-baseline 固化）`, "");
    const seen = new Map();
    for (const e of entries) seen.set(e.fp, (seen.get(e.fp) ?? 0) + 1);
    for (const [fp, count] of [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40))
      lines.push(`- [${entries.find((e) => e.fp === fp).impact}] ${fp} ×${count}`);
  }

  const reportPath = path.join(outDir, "a11y-report-latest.md");
  await writeFile(reportPath, lines.join("\n"));
  if (UPDATE_BASELINE || !baseline) {
    await writeFile(baselinePath, JSON.stringify({ created: stamp, base: BASE, entries }, null, 2));
    console.log(`baseline ${baseline ? "updated" : "created"} at ${baselinePath}`);
  }
  console.log(lines.join("\n"));
  process.exitCode = newCritical > 0 || errors.length > 0 ? 1 : 0;
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

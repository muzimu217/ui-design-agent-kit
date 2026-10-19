#!/usr/bin/env node
// export-canvas — package the three generated canvas pages into a distributable
// offline bundle: output/canvas-export/ (pages + README + manifest) and a zip
// next to it. The bundle is self-contained (no network, no build step needed to
// open it) and records the exact source commit so a recipient can re-verify.
//
// Usage: node canvas/export-canvas.mjs [--no-zip]

import { mkdir, copyFile, writeFile, readFile, rm, stat, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "output", "canvas-export");
const PAGES = ["canvas-workbench.html", "chain-canvas-workbench.html", "canvas-index.html"];

function git(args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

// --verify-only skips the rebuild and just reconciles an existing bundle —
// the negative-path test channel for the reconciliation below (planting files
// before a normal run is pointless: a normal run rebuilds OUT from scratch).
const verifyOnly = process.argv.includes("--verify-only");

if (!verifyOnly) {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
}

const manifest = {
  exportedAt: new Date().toISOString(),
  commit: git(["rev-parse", "HEAD"]) || "unknown",
  commitSubject: git(["log", "-1", "--pretty=%s"]) || "",
  pages: [],
  note: "离线自包含画布导出包：三页可直接用浏览器打开，无需构建、无网络依赖。",
};

if (!verifyOnly) for (const page of PAGES) {
  const src = path.join(ROOT, "output", page);
  const dst = path.join(OUT, page);
  await copyFile(src, dst);
  const { size } = await stat(dst);
  manifest.pages.push({ file: page, bytes: size });
}

const readme = `# 画布工作台 · 离线导出包

导出时间：${manifest.exportedAt}
来源提交：\`${manifest.commit}\` — ${manifest.commitSubject}

## 怎么打开

双击任一 HTML 文件即可（离线、无网络、无构建步骤）。建议从 \`canvas-index.html\` 入口开始：

| 文件 | 内容 |
| --- | --- |
| \`canvas-index.html\` | 工作台入口：任务管控（执行态/证据态分离）、任务注册表、门径状态、解析链路、产物墙（排序/过滤/版本） |
| \`canvas-workbench.html\` | 门径画布：六阶段四泳道流水线，门状态、证据嵌入、搜索/缩放/回放 |
| \`chain-canvas-workbench.html\` | 需求解析链路：原始口语锚点 → 解析摘要 → 理解验证比对 → 六步决策抽屉（黑盒步骤自动标黄） |

## 怎么复核（给接收方）

1. 打开 \`canvas-index.html\`，看「任务管控」两栏：执行态说明工作在哪，证据态说明可复核什么；
2. 产物墙每条带六维完成度徽章（n/6）与版本号；展开可见变更摘要与对比判据；
3. **对比证据看 \`COMPARE.md\`**：每条产物的对标、六维并排评分（—=不可观测不计分母）、检视级别与判读，本文件即完整口径，无需回仓库；
4. 回到仓库 \`${manifest.commit}\` 运行 \`npm run canvas:check\`（playwright 实测对比度/键盘/console 回执）与 \`npm run canvas:build\` 重建本包。

> 本包是构建时快照；权威源是仓库内的 \`canvas/*.json\` 与渲染脚本。
`;

if (!verifyOnly) {
  await writeFile(path.join(OUT, "README.md"), readme);
  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

// COMPARE.md — KPI4 对比证据随包分发：从 artifacts.json 的 compare/score 结构化生成，
// 第三方复核者不回仓库即可看懂每条对比的对标、检视级别与"null 不虚记"口径。
const artifacts = verifyOnly ? null : JSON.parse(await readFile(path.join(ROOT, "canvas", "artifacts.json"), "utf8"));
const SIX = ["desktop", "mobile", "keyboard", "contrast", "reducedMotion", "console"];
const LABEL = { desktop: "桌面", mobile: "移动", keyboard: "键盘", contrast: "对比度", reducedMotion: "降动效", console: "控制台" };
const MARK = (v) => (v === 1 ? "✓" : v === 0 ? "✗" : "—");
const SUM = (m) => SIX.reduce((n, k) => n + (m?.[k] === 1 ? 1 : 0), 0);
const OBS = (m) => SIX.filter((k) => m?.[k] === 0 || m?.[k] === 1).length;
const compareSections = verifyOnly ? "" : artifacts.artifacts
  .map((a) => {
    const c = a.compare ?? {};
    const s = c.score;
    const rows = s
      ? `| 维度 | 本产物 | 对标 |\n| --- | --- | --- |\n${SIX.map((k) => `| ${LABEL[k]} | ${MARK(s.us?.[k])} | ${MARK(s.them?.[k])} |`).join("\n")}`
      : "（本条目尚无结构化评分）";
    const sum = s ? `本产物 ${SUM(s.us)}/6 · 对标 ${SUM(s.them)}/${OBS(s.them)} 可观测` : "";
    return [
      `## ${a.title}（v${a.version ?? "?"} · ${a.status ?? ""}）`,
      `- 对标对象：${c.target ?? "—"}`,
      s ? `- 评分：${sum} ｜ 检视级别：**${s.level ?? "unverified-partial"}**` : "",
      rows ? `\n${rows}\n` : "",
      s?.themNote ? `- 对标侧口径：${s.themNote}` : "",
      s?.rubric ? `- 评分口径：${s.rubric}` : "",
      c.verdict ? `- 判读：${c.verdict}` : "",
      c.evidence ? `- 证据（仓内路径，本包不含截图）：${c.evidence}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  })
  .join("\n\n");
const compareDoc = `# 画布产物墙 · 对比证据（KPI4）

本文件由 \`canvas/export-canvas.mjs\` 从 \`canvas/artifacts.json\` 程序化生成，随导出包分发。
口径：六维各 1 分——✓=有实测/实看证据，✗=实测缺失，**—=公开渠道不可观测（不计分母，不虚记）**；
对标侧多为公开页面检视（unverified-partial 起步），深度维度无公开可验证证据时记 — 而非满分或零分。

${compareSections}
`;
if (!verifyOnly) {
  await writeFile(path.join(OUT, "COMPARE.md"), compareDoc);
  // manifest.json is NOT self-listed: writing its own byte count into itself
  // changes those bytes (self-referential accounting). The reconciliation below
  // treats it as the mandatory extra file and checks existence only.
  manifest.docs = [];
  for (const doc of ["README.md", "COMPARE.md"]) {
    const { size } = await stat(path.join(OUT, doc));
    manifest.docs.push({ file: doc, bytes: size });
  }
  manifest.selfExcluded = "manifest.json 不自列字节（写自身即改变自身）；对账时作为必在第 (pages+docs+1) 文件只查存在性";
  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

let zipPath = "";
if (!verifyOnly && !process.argv.includes("--no-zip")) {
  zipPath = path.join(ROOT, "output", `canvas-export-${manifest.commit.slice(0, 7)}.zip`);
  await rm(zipPath, { force: true });
  execFileSync("zip", ["-qr", zipPath, "."], { cwd: OUT });
}

const total = manifest.pages.reduce((n, p) => n + p.bytes, 0);

// Self-verification — the bundle must reconcile against its own manifest
// (guards the export-manifest-byte-accounting contract): zip integrity,
// per-file byte parity, and no unlisted files. Fails loudly instead of
// shipping a bundle a reviewer cannot reconcile.
if (zipPath) {
  execFileSync("unzip", ["-t", zipPath], { stdio: "ignore" });
}
const reconcileProblems = [];
let expectedManifest;
try {
  expectedManifest = verifyOnly ? JSON.parse(await readFile(path.join(OUT, "manifest.json"), "utf8")) : manifest;
} catch (e) {
  expectedManifest = { pages: [], docs: [] };
  reconcileProblems.push(`manifest.json 缺失或不可解析: ${e.message}`);
}
const expected = new Map([...expectedManifest.pages, ...expectedManifest.docs].map((f) => [f.file, f.bytes]));
const shipped = await readdir(OUT);
if (!shipped.includes("manifest.json")) reconcileProblems.push("bundle 缺 manifest.json");
for (const f of shipped) {
  if (f === "manifest.json") continue;
  if (!expected.has(f)) {
    reconcileProblems.push(`bundle 内有 manifest 未列文件: ${f}`);
    continue;
  }
  const { size } = await stat(path.join(OUT, f));
  if (size !== expected.get(f)) reconcileProblems.push(`${f} 字节对账失败: manifest ${expected.get(f)} vs 磁盘 ${size}`);
}
for (const f of expected.keys()) {
  if (!shipped.includes(f)) reconcileProblems.push(`manifest 列了 bundle 缺失文件: ${f}`);
}
if (reconcileProblems.length) {
  console.error(`canvas export reconciliation failed:\n${reconcileProblems.join("\n")}`);
  process.exit(1);
}
console.log(
  `canvas exported: ${OUT} (${manifest.pages.length} pages, ${(total / 1024).toFixed(0)}KB)` +
    (zipPath ? ` → ${path.basename(zipPath)}` : "") +
    ` [reconciled: ${expected.size} files OK]`
);

#!/usr/bin/env node
// export-canvas — package the three generated canvas pages into a distributable
// offline bundle: output/canvas-export/ (pages + README + manifest) and a zip
// next to it. The bundle is self-contained (no network, no build step needed to
// open it) and records the exact source commit so a recipient can re-verify.
//
// Usage: node canvas/export-canvas.mjs [--no-zip]

import { mkdir, copyFile, writeFile, readFile, rm, stat } from "node:fs/promises";
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

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const manifest = {
  exportedAt: new Date().toISOString(),
  commit: git(["rev-parse", "HEAD"]) || "unknown",
  commitSubject: git(["log", "-1", "--pretty=%s"]) || "",
  pages: [],
  note: "离线自包含画布导出包：三页可直接用浏览器打开，无需构建、无网络依赖。",
};

for (const page of PAGES) {
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
3. 回到仓库 \`${manifest.commit}\` 运行 \`npm run canvas:check\`（playwright 实测对比度/键盘/console 回执）与 \`npm run canvas:build\` 重建本包。

> 本包是构建时快照；权威源是仓库内的 \`canvas/*.json\` 与渲染脚本。
`;

await writeFile(path.join(OUT, "README.md"), readme);
await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

let zipPath = "";
if (!process.argv.includes("--no-zip")) {
  zipPath = path.join(ROOT, "output", `canvas-export-${manifest.commit.slice(0, 7)}.zip`);
  await rm(zipPath, { force: true });
  execFileSync("zip", ["-qr", zipPath, "."], { cwd: OUT });
}

const total = manifest.pages.reduce((n, p) => n + p.bytes, 0);
console.log(
  `canvas exported: ${OUT} (${manifest.pages.length} pages, ${(total / 1024).toFixed(0)}KB)` +
    (zipPath ? ` → ${path.basename(zipPath)}` : "")
);

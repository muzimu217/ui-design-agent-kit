import { readdir, readFile, mkdir, copyFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// R050-05 (D7⑦ front half): screenshot regression for the published
// showcase. Screenshots are captured externally (browser MCP / agent-browser
// — this script deliberately installs nothing) into
// test-artifacts/regression/current/<project>-<width>.png for every
// PUBLIC_APPS entry at 1440 and 390 widths, then compared byte-and-size wise
// against test-artifacts/regression/baseline/. Per-pixel diffing needs a
// dependency (pixelmatch) — installing it is a user ruling; until then any
// byte or dimension change is a mismatch (strict).
//
// Usage:
//   npm run visual:check                compare current/ against baseline/
//   npm run visual:check -- --init      promote current/ to baseline/ (first run)
//   npm run visual:check -- --list      print the expected 16 file names

const REG_DIR = path.join(ROOT, "test-artifacts/regression");
const CURRENT = path.join(REG_DIR, "current");
const BASELINE = path.join(REG_DIR, "baseline");
const REPORT_DIR = path.join(ROOT, "output/regression-report");
export const EXPECTED = [
  "home", "brick-workshop", "inventory-console", "nodegrid",
  "subway-runner", "forma-phone-ui", "tempo-day", "ruiear",
].flatMap((name) => [`${name}-1440.png`, `${name}-390.png`]);

async function listPng(dir) {
  try {
    return (await readdir(dir)).filter((name) => name.endsWith(".png")).sort();
  } catch {
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--list")) {
    console.log(EXPECTED.map((name) => `${name}  →  test-artifacts/regression/current/${name}`).join("\n"));
    return;
  }

  await mkdir(REPORT_DIR, { recursive: true });
  const current = await listPng(CURRENT);
  const missing = EXPECTED.filter((name) => !current.includes(name));
  const extra = current.filter((name) => !EXPECTED.includes(name));

  if (args.includes("--init")) {
    if (missing.length > 0) {
      console.error(`✗ current/ 缺 ${missing.length} 张约定截图，拒绝建立基线：\n  ${missing.join("\n  ")}`);
      process.exitCode = 1;
      return;
    }
    await mkdir(BASELINE, { recursive: true });
    for (const name of current) await copyFile(path.join(CURRENT, name), path.join(BASELINE, name));
    await writeFile(path.join(REPORT_DIR, "baseline.json"), JSON.stringify({
      createdAt: new Date().toISOString(),
      files: current,
    }, null, 2) + "\n", "utf8");
    console.log(`基线已建立：${current.length} 张 → test-artifacts/regression/baseline/（此后 visual:check 逐文件比对）。`);
    return;
  }

  if (current.length === 0) {
    console.error("✗ test-artifacts/regression/current/ 为空：先用浏览器工具截 16 张（--list 有清单），再跑比对或 --init。");
    process.exitCode = 1;
    return;
  }

  const rows = [];
  const violations = [];
  for (const name of EXPECTED) {
    const currentPath = path.join(CURRENT, name);
    const baselinePath = path.join(BASELINE, name);
    let baseStat = null;
    try { baseStat = await stat(baselinePath); } catch { /* absent */ }
    if (!baseStat) {
      rows.push({ name, verdict: current.includes(name) ? "new" : "missing" });
      if (current.includes(name)) violations.push({ name, reason: "no baseline (run --init or capture missing shots)" });
      continue;
    }
    if (!current.includes(name)) {
      rows.push({ name, verdict: "missing-from-current" });
      violations.push({ name, reason: "capture missing this round" });
      continue;
    }
    const [a, b] = await Promise.all([readFile(currentPath), readFile(baselinePath)]);
    const sameSize = a.length === b.length;
    const sameBytes = Buffer.compare(a, b) === 0;
    if (sameSize && sameBytes) {
      rows.push({ name, verdict: "match", bytes: a.length });
    } else {
      rows.push({ name, verdict: sameSize ? "bytes-differ" : `size ${a.length}≠${b.length}` });
      violations.push({ name, reason: sameSize ? "pixel/encoding bytes differ" : "dimensions or size differ" });
    }
  }
  for (const name of extra) {
    rows.push({ name, verdict: "unexpected-file" });
    violations.push({ name, reason: "not in the expected 16-file set" });
  }

  await writeFile(path.join(REPORT_DIR, "latest.json"), JSON.stringify({
    checkedAt: new Date().toISOString(),
    strictness: "byte+size (pixelmatch pending user-approved dependency)",
    violations,
    rows,
  }, null, 2) + "\n", "utf8");

  for (const row of rows) console.log(`${row.verdict.padEnd(22)} ${row.name}`);
  if (violations.length > 0) {
    console.error(`\n✗ ${violations.length} 处视觉回归偏离（逐像素库待用户批准，当前为字节+尺寸严格比对）`);
    console.error(`完整清单：${path.relative(ROOT, path.join(REPORT_DIR, "latest.json"))}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\nvisual:check OK：${rows.length} 张与基线一致。发布/合并 main 前的发布者手动检查项，不阻塞 CI。`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

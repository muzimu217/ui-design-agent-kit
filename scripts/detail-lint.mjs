import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// R060-01: the statically checkable subset of detail-constants.md — rule 10
// (no `transition: all`) and rule 11 (`will-change` whitelist: transform,
// opacity, filter only). R288-anti-hallucination (2026-10-03, prototype
// handover protocol's second light gate): negative margins (CSS declarations
// and Tailwind-style negative utilities) and unbalanced HTML tags. Pure
// grep/regex, no new dependencies. Existing violations are grandfathered
// through output/detail-lint-report/baseline.json; only violations not in the
// baseline fail (tightening-baseline strategy, same shape as the a11y sweep).
// Advisory before release/handover: not a CI gate.
//
// Usage:
//   npm run lint:detail                        scan; first run records the baseline
//   npm run lint:detail -- --update-baseline   re-record the baseline deliberately

const WILL_CHANGE_ALLOWED = new Set(["transform", "opacity", "filter"]);
const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const EXTENSIONS = new Set([".tsx", ".ts", ".css", ".html"]);
const REPORT_DIR = "output/detail-lint-report";
const BASELINE_PATH = path.join(ROOT, REPORT_DIR, "baseline.json");

export function scanLine(line) {
  const findings = [];
  if (/transition\s*:[^;]*\ball\b/.test(line) || /transition-all/.test(line)) {
    findings.push({ rule: "transition-all", detail: line.trim().slice(0, 160) });
  }
  const willChange = line.match(/will-change\s*:\s*([^;}]+)/);
  if (willChange) {
    const values = willChange[1].split(",").map((value) => value.trim().toLowerCase());
    const bad = values.filter((value) => value !== "" && !WILL_CHANGE_ALLOWED.has(value));
    if (bad.length > 0) {
      findings.push({ rule: "will-change-nonwhitelist", detail: `will-change: ${willChange[1].trim()}` });
    }
  }
  const marginDecl = line.match(/margin[a-z-]*\s*:\s*([^;}]*)/);
  if (marginDecl && /(^|[\s(,])-\d/.test(marginDecl[1])) {
    findings.push({ rule: "negative-margin", detail: `margin 声明含负值: ${marginDecl[0].trim().slice(0, 120)}` });
  }
  if (/(?:^|[\s"'`])-(?:m|mx|my|mt|mr|mb|ml)-(?:\d|\[)/.test(line)) {
    findings.push({ rule: "negative-margin", detail: `Tailwind 负 margin 工具类: ${line.trim().slice(0, 120)}` });
  }
  return findings;
}

// 规则 D：.html 文件的标签配平（stack 配对；void 元素与自闭合跳过；
// 注释与 script/style 内部先剥除，防字符串比较符误报）。advisory 用，
// 不追求完整 HTML 规范——只抓"未闭合/错配"这类交接断点。
export function checkTagBalance(text, file) {
  const findings = [];
  const stripped = text
    .replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length))
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (m) => " ".repeat(m.length));
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const stack = [];
  let match;
  while ((match = tagRe.exec(stripped)) !== null) {
    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();
    if (VOID_ELEMENTS.has(tag) || match[3].trimEnd().endsWith("/")) continue;
    const lineNo = stripped.slice(0, match.index).split(/\r?\n/).length;
    if (!closing) {
      stack.push({ tag, lineNo });
      continue;
    }
    const openIndex = stack.map((entry) => entry.tag).lastIndexOf(tag);
    if (openIndex === -1) {
      findings.push({ file, line: lineNo, rule: "tag-balance", detail: `</${tag}> 无对应开标签` });
      continue;
    }
    for (let i = stack.length - 1; i > openIndex; i -= 1) {
      findings.push({ file, line: stack[i].lineNo, rule: "tag-balance", detail: `<${stack[i].tag}> 未闭合（被 </${tag}> 越过）` });
    }
    stack.length = openIndex;
  }
  for (const entry of stack) {
    findings.push({ file, line: entry.lineNo, rule: "tag-balance", detail: `<${entry.tag}> 未闭合（文件结束）` });
  }
  return findings;
}

export function scanText(text, file) {
  const findings = [];
  let inBlockComment = false;
  text.split(/\r?\n/).forEach((line, index) => {
    // 注释行跳过=状态机（块注释跨行维持；整行块注释/行注释/HTML 注释跳过）。
    // 不得用"以 * 开头"判注释续行——CSS 通配选择器 `* { margin: -4px }` 会被
    // 误吞（批 28 P2-① 实锤：探针零命中）。
    const trimmed = line.trim();
    if (inBlockComment) {
      if (trimmed.includes("*/")) inBlockComment = false;
      return;
    }
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inBlockComment = true;
      return;
    }
    if (trimmed.startsWith("//") || trimmed.startsWith("<!--")) return;
    for (const finding of scanLine(line)) {
      findings.push({ file, line: index + 1, ...finding, key: `${file}:${finding.rule}:${finding.detail}` });
    }
  });
  if (file.endsWith(".html")) {
    for (const finding of checkTagBalance(text, file)) {
      findings.push({ ...finding, key: `${file}:${finding.rule}:${finding.detail}` });
    }
  }
  return findings;
}

async function* walkSourceFiles(root, relative) {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      yield* walkSourceFiles(root, rel);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      yield rel;
    }
  }
}

async function collectFindings() {
  const findings = [];
  const demoDir = path.join(ROOT, "demo");
  for (const entry of await readdir(demoDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const src = path.join("demo", entry.name, "src");
    if (!existsSync(path.join(ROOT, src))) continue;
    for await (const rel of walkSourceFiles(ROOT, src)) findings.push(...scanText(await readFile(path.join(ROOT, rel), "utf8"), rel.split(path.sep).join("/")));
  }
  const showcaseSrc = "showcase/products/src";
  if (existsSync(path.join(ROOT, showcaseSrc))) {
    for await (const rel of walkSourceFiles(ROOT, showcaseSrc)) findings.push(...scanText(await readFile(path.join(ROOT, rel), "utf8"), rel.split(path.sep).join("/")));
  }
  return findings;
}

async function main() {
  const updateBaseline = process.argv.includes("--update-baseline");
  const findings = await collectFindings();
  const baseline = existsSync(BASELINE_PATH)
    ? JSON.parse(await readFile(BASELINE_PATH, "utf8"))
    : null;
  const baselineKeys = new Set((baseline?.violations ?? []).map((item) => item.key));

  await mkdir(path.dirname(BASELINE_PATH), { recursive: true });
  const reportPath = path.join(ROOT, REPORT_DIR, "latest.json");
  const report = { scannedAt: new Date().toISOString(), total: findings.length, violations: findings };
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  if (!baseline || updateBaseline) {
    await writeFile(BASELINE_PATH, JSON.stringify({
      createdAt: new Date().toISOString(),
      note: "存量豁免基线：此后只拦 key 不在表内的新增违例（行号不参与 key）",
      violations: findings.map(({ key, file, line, rule, detail }) => ({ key, file, line, rule, detail })),
    }, null, 2) + "\n", "utf8");
    console.log(`基线${updateBaseline ? "已更新" : "已建立"}：${findings.length} 条存量违例记入 ${path.relative(ROOT, BASELINE_PATH)}；此后只拦新增。`);
    return;
  }

  const fresh = findings.filter((item) => !baselineKeys.has(item.key));
  if (fresh.length > 0) {
    console.error(`✗ ${fresh.length} 条新增违例（detail-constants 规则 10/11）：`);
    for (const item of fresh) console.error(`  ${item.file}:${item.line} [${item.rule}] ${item.detail}`);
    console.error(`完整清单：${path.relative(ROOT, reportPath)}`);
    process.exitCode = 1;
    return;
  }
  console.log(`detail-lint OK：${findings.length} 条命中全部在存量基线内，无新增。`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

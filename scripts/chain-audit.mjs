import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// Mechanical floor for the gate protocol (references/gate-protocol.md §5):
// a task workspace that already contains implementation artifacts must carry
// a gate record with the gate verdicts, so a skipped chain is machine-
// checkable instead of prose-arguable. The audit proves record presence and
// verdicts, not authenticity — real verdicts still come from the user.
//
// Two record locations are accepted (root first):
//   GATES.md          minimal per-workspace record
//   docs/gates.md     the kit's ledger convention, as used by delegated runs
//
// Two record formats are parsed:
// 1. Heading format:
//      ## 门A · 方向稿        (or ## Gate A · Direction)
//      裁决: passed            (or verdict: approved | 通过)
//      分级: S                 (S repairs skip gates A-D but need 门E passed)
// 2. Ledger table rows (dated rows as in the kit's docs/gates.md; the gate
//    token and a known status token are located per row, latest row wins):
//      | 2026-09-20 | A | brief | passed | 首稿 … | 用户：过 |
//
// Usage:
//   npm run chain:audit -- <workspace>    exit 1 when violations are found

const IGNORED_DIRS = new Set([
  "node_modules", "dist", "release", ".git", "coverage", ".vite", ".playwright-mcp",
]);
const UI_EXTENSIONS = new Set([".html", ".tsx", ".jsx", ".vue", ".svelte", ".astro"]);
const PASSED = new Set(["passed", "approved", "通过"]);
const STATUSES = new Set([
  "passed", "approved", "通过", "gated", "pending", "blocked", "active",
  "merged", "open", "declined", "failed",
]);
const RECORD_FILES = ["GATES.md", path.join("docs", "gates.md")];

// Fix guidance per violation (agentUniverse absorption, 2026-09-25): an
// audit that only names a failure makes the reader re-derive the repair;
// each violation carries the pointer to what record is missing and the
// exact record shape it must take. Guidance is mechanical; the verdict
// itself still only comes from the user.
const GUIDANCE = {
  "missing-gates-record":
    "补法：在工作区根建 GATES.md（或 docs/gates.md）。标题格式按门分段：" +
    "『## 门A · 方向稿』+『裁决: passed』；表格格式用带日期行：" +
    "『| 2026-09-25 | A | brief | passed | 呈交物 | 裁决 |』。" +
    "裁决记录缺失期间产物不得推进（gate-protocol.md §5）。",
  "missing-gate-a":
    "补法：GATES.md 增加『## 门A · 方向稿』段。方向稿必含 named proven " +
    "baseline（真实成品 URL）、结构草图、动效意图与三旋钮（plan-execute.md），" +
    "呈交用户等待裁决。",
  "gate-a-not-passed":
    "补法：门A 呈交在用户侧等待裁决；pending/gated 不是通过。用户裁决后把" +
    "裁决行更新为 passed / 调整（附改法）/ 否（换向），再推进下一阶段。",
  "s-tier-missing-acceptance":
    "补法：S 档窄修复不豁免验收——补『## 门E · 验收』段并裁决: passed，" +
    "附逐页问题清单（P0/P1/P2 + 证据）与用户确认记录。",
};

async function collectArtifacts(dir, base = dir, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        await collectArtifacts(path.join(dir, entry.name), base, found);
      }
      continue;
    }
    if (!entry.isFile()) continue;
    const relative = path.relative(base, path.join(dir, entry.name));
    const inSrc = relative.split(path.sep)[0] === "src";
    if (inSrc || UI_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(relative.split(path.sep).join("/"));
    }
  }
  return found;
}

async function hasDependencies(workspace) {
  try {
    const pkg = JSON.parse(await readFile(path.join(workspace, "package.json"), "utf8"));
    return Object.keys(pkg.dependencies ?? {}).length > 0
      || Object.keys(pkg.devDependencies ?? {}).length > 0;
  } catch {
    return false;
  }
}

function parseGateLine(line, record) {
  const tier = line.match(/^分级\s*[：:]\s*(S|M|L)\b/);
  if (tier) {
    record.tier = tier[1];
    return;
  }
  const heading = line.match(/^##\s*(?:门([A-F])|Gate\s+([A-F]))\b/i);
  if (heading) {
    record.gates[(heading[1] ?? heading[2]).toUpperCase()] = { present: true, verdict: undefined };
    return;
  }
  const verdict = line.match(/^(?:裁决|verdict)\s*[：:]\s*(\S+)/i);
  const current = Object.keys(record.gates).at(-1);
  if (current && verdict) {
    record.gates[current].verdict = verdict[1];
    return;
  }
  const cells = line.split("|").map((cell) => cell.trim());
  if (cells.length < 4 || !/^\d{4}-\d{2}-\d{2}$/.test(cells[1] ?? "")) return;
  const gateIndex = cells.findIndex((cell, index) => index > 1
    && (/^门[A-F]$/i.test(cell)
      || /^Gate\s+[A-F]$/i.test(cell)
      || /^[A-F]$/.test(cell)));
  if (gateIndex === -1) return;
  const status = cells.slice(gateIndex + 1).find((cell) => STATUSES.has(cell.toLowerCase()));
  if (status) {
    const letter = cells[gateIndex].match(/[A-F]/i)[0].toUpperCase();
    record.gates[letter] = { present: true, verdict: status.toLowerCase() };
  }
}

export function parseGatesRecord(source) {
  const record = { tier: undefined, gates: {} };
  for (const line of source.split(/\r?\n/)) parseGateLine(line, record);
  return record;
}

async function loadRecord(workspace) {
  for (const name of RECORD_FILES) {
    try {
      return parseGatesRecord(await readFile(path.join(workspace, name), "utf8"));
    } catch {
      continue;
    }
  }
  return null;
}

export async function auditWorkspace(input, root = ROOT) {
  const workspace = path.resolve(root, input);
  const empty = { artifacts: [], hasPackage: false, tier: undefined, gates: {}, violations: [] };
  let info;
  try {
    info = await stat(workspace);
  } catch {
    return { ok: false, workspace, ...empty, errors: [`workspace does not exist: ${input}`] };
  }
  if (!info.isDirectory()) {
    return { ok: false, workspace, ...empty, errors: [`workspace is not a directory: ${input}`] };
  }

  const artifacts = await collectArtifacts(workspace);
  const hasPackage = await hasDependencies(workspace);
  const implemented = artifacts.length > 0 || hasPackage;
  const record = implemented ? await loadRecord(workspace) : (await loadRecord(workspace));

  const violations = [];
  const withGuidance = (id, detail) => ({ id, detail, guidance: GUIDANCE[id] });
  if (implemented && !record) {
    violations.push(withGuidance(
      "missing-gates-record",
      `${artifacts.length} implementation artifact(s)${hasPackage ? " + package.json" : ""} but no gate record in ${RECORD_FILES.join(" or ")}`,
    ));
  } else if (record) {
    const gateA = record.gates.A;
    if (record.tier === "S") {
      const acceptance = record.gates.E;
      if (!acceptance?.verdict || !PASSED.has(acceptance.verdict)) {
        violations.push(withGuidance(
          "s-tier-missing-acceptance",
          "S repairs still need a passed 门E acceptance record",
        ));
      }
    } else if (!gateA) {
      violations.push(withGuidance("missing-gate-a", "no 门A direction-draft record in the gate ledger"));
    } else if (!gateA.verdict || !PASSED.has(gateA.verdict)) {
      violations.push(withGuidance(
        "gate-a-not-passed",
        `门A verdict is ${gateA.verdict ?? "missing"}, not passed`,
      ));
    }
  }

  return {
    ok: violations.length === 0,
    workspace,
    artifacts,
    hasPackage,
    tier: record?.tier,
    gates: record?.gates ?? {},
    violations,
    errors: [],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const target = process.argv[2];
    if (!target) {
      console.error("Usage: node scripts/chain-audit.mjs <workspace>");
      process.exitCode = 1;
    } else {
      const report = await auditWorkspace(target);
      console.log(JSON.stringify({
        ...report,
        workspace: path.relative(process.cwd(), report.workspace) || ".",
      }, null, 2));
      if (!report.ok) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

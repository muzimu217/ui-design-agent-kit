import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// Mechanical floor for the gate protocol (references/gate-protocol.md §5):
// a task workspace that already contains implementation artifacts must carry
// a GATES.md record with the gate verdicts, so a skipped chain is machine-
// checkable instead of prose-arguable. The audit proves record presence and
// verdicts, not authenticity — real verdicts still come from the user.
//
// GATES.md format (bilingual headings accepted, one section per gate):
//
//   分级: M
//   ## 门A · 方向稿
//   裁决: passed
//   ## 门B · 素材清单
//   裁决: passed
//   ...
//   ## 门E · 验收
//   裁决: passed
//
// `分级: S` (narrow repair inside an approved design) skips gates A-D but
// still requires a passed 门E acceptance record.
//
// Usage:
//   npm run chain:audit -- <workspace>    exit 1 when violations are found

const IGNORED_DIRS = new Set([
  "node_modules", "dist", "release", ".git", "coverage", ".vite", ".playwright-mcp",
]);
const UI_EXTENSIONS = new Set([".html", ".tsx", ".jsx", ".vue", ".svelte", ".astro"]);
const PASSED = new Set(["passed", "approved", "通过"]);

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

export function parseGatesRecord(source) {
  const record = { tier: undefined, gates: {} };
  let current;
  for (const line of source.split(/\r?\n/)) {
    const tier = line.match(/^分级\s*[：:]\s*(S|M|L)\b/);
    if (tier) {
      record.tier = tier[1];
      continue;
    }
    const heading = line.match(/^##\s*(?:门([A-F])|Gate\s+([A-F]))\b/i);
    if (heading) {
      current = (heading[1] ?? heading[2]).toUpperCase();
      record.gates[current] = { present: true, verdict: undefined };
      continue;
    }
    const verdict = line.match(/^(?:裁决|verdict)\s*[：:]\s*(\S+)/i);
    if (current && verdict) record.gates[current].verdict = verdict[1];
  }
  return record;
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

  let record = null;
  try {
    record = parseGatesRecord(await readFile(path.join(workspace, "GATES.md"), "utf8"));
  } catch {
    record = null;
  }

  const violations = [];
  if (implemented && !record) {
    violations.push({
      id: "missing-gates-record",
      detail: `${artifacts.length} implementation artifact(s)${hasPackage ? " + package.json" : ""} but no GATES.md gate record`,
    });
  } else if (record) {
    const gateA = record.gates.A;
    if (record.tier === "S") {
      const acceptance = record.gates.E;
      if (!acceptance?.verdict || !PASSED.has(acceptance.verdict)) {
        violations.push({
          id: "s-tier-missing-acceptance",
          detail: "S repairs still need a passed 门E acceptance record",
        });
      }
    } else if (!gateA) {
      violations.push({ id: "missing-gate-a", detail: "no 门A direction-draft record in GATES.md" });
    } else if (!gateA.verdict || !PASSED.has(gateA.verdict)) {
      violations.push({ id: "gate-a-not-passed", detail: `门A verdict is ${gateA.verdict ?? "missing"}, not passed` });
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

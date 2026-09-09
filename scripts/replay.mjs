import { createHash } from "node:crypto";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

const execFileAsync = promisify(execFile);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const groups = ["inputs", "evidence"];

function repoPath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()
    || path.isAbsolute(relativePath) || relativePath.split(/[\\/]+/).includes("..")) {
    throw new Error(`Replay paths must be nonempty repository-relative paths: ${relativePath}`);
  }
  const root = path.resolve(ROOT);
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Replay path escapes repository: ${relativePath}`);
  }
  return resolved;
}

function manifestPath(input) {
  if (!input || path.isAbsolute(input)) return path.resolve(input ?? "");
  return repoPath(input);
}

async function loadJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read replay manifest ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

async function scenarioIds() {
  const scenarios = JSON.parse(await readFile(path.join(ROOT, "evals/scenarios.json"), "utf8"));
  return new Set(Array.isArray(scenarios) ? scenarios.map((item) => item.id) : []);
}

async function hasCommit(revision) {
  try {
    await execFileAsync("git", ["cat-file", "-e", `${revision}^{commit}`], { cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}

function collectArtifacts(manifest) {
  return groups.flatMap((group) => (Array.isArray(manifest[group])
    ? manifest[group].map((artifact) => ({ ...artifact, group }))
    : []));
}

export async function inspectReplay(input, { requireHashes = true } = {}) {
  const file = manifestPath(input);
  const errors = [];
  let manifest;
  try {
    manifest = await loadJson(file);
  } catch (error) {
    return { ok: false, manifestPath: file, errors: [error.message], artifacts: [] };
  }

  if (manifest?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  const ids = await scenarioIds();
  if (typeof manifest?.scenarioId !== "string" || !ids.has(manifest.scenarioId)) {
    errors.push(`Unknown scenarioId: ${manifest?.scenarioId ?? "missing"}`);
  }
  if (!/^[0-9a-f]{40}$/.test(manifest?.sourceRevision ?? "")) {
    errors.push("sourceRevision must be a 40-character lowercase Git commit SHA");
  } else if (!(await hasCommit(manifest.sourceRevision))) {
    errors.push(`sourceRevision is not present in local Git: ${manifest.sourceRevision}`);
  }
  try {
    const workspace = repoPath(manifest?.workspace);
    if (!(await stat(workspace)).isDirectory()) errors.push(`workspace is not a directory: ${manifest.workspace}`);
  } catch (error) {
    errors.push(error.message);
  }

  if (!Array.isArray(manifest?.commands) || manifest.commands.length === 0) {
    errors.push("commands must be a nonempty array");
  } else {
    const commandIds = manifest.commands.map((command) => command?.id);
    if (commandIds.some((id) => typeof id !== "string" || !id)
      || new Set(commandIds).size !== commandIds.length) errors.push("commands need distinct nonempty ids");
    for (const command of manifest.commands) {
      if (!Array.isArray(command?.argv) || command.argv.length === 0
        || command.argv.some((arg) => typeof arg !== "string" || !arg)) errors.push(`Invalid argv for command: ${command?.id ?? "missing"}`);
      try { repoPath(command.cwd); } catch (error) { errors.push(`Invalid cwd for ${command?.id ?? "missing"}: ${error.message}`); }
    }
  }

  for (const group of groups) {
    if (!Array.isArray(manifest?.[group]) || manifest[group].length === 0) {
      errors.push(`${group} must be a nonempty array`);
    }
  }

  const seen = new Set();
  const artifacts = [];
  for (const artifact of collectArtifacts(manifest ?? {})) {
    let absolute;
    try { absolute = repoPath(artifact.path); }
    catch (error) { errors.push(error.message); continue; }
    if (seen.has(artifact.path)) errors.push(`Duplicate replay artifact: ${artifact.path}`);
    seen.add(artifact.path);
    if (requireHashes && !/^[0-9a-f]{64}$/.test(artifact.sha256 ?? "")) {
      errors.push(`Missing or invalid SHA-256 for ${artifact.path}`);
    }
    try {
      const info = await stat(absolute);
      if (!info.isFile()) errors.push(`Replay artifact is not a file: ${artifact.path}`);
      else {
        const contents = await readFile(absolute);
        const actual = sha256(contents);
        if (requireHashes && artifact.sha256 !== actual) errors.push(`SHA-256 mismatch: ${artifact.path}`);
        artifacts.push({ group: artifact.group, path: artifact.path, absolute, actual });
      }
    } catch {
      errors.push(`Missing replay artifact: ${artifact.path}`);
    }
  }
  return { ok: errors.length === 0, manifestPath: file, manifest, errors, artifacts };
}

export async function snapshotReplay(input) {
  const report = await inspectReplay(input, { requireHashes: false });
  if (report.errors.length > 0) throw new Error(report.errors.join("; "));
  const manifest = structuredClone(report.manifest);
  for (const artifact of report.artifacts) {
    const target = manifest[artifact.group].find((item) => item.path === artifact.path);
    target.sha256 = artifact.actual;
  }
  await writeFile(report.manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return { path: report.manifestPath, count: report.artifacts.length };
}

export async function runReplay(input, stepId) {
  const report = await inspectReplay(input);
  if (!report.ok) throw new Error(report.errors.join("; "));
  const command = report.manifest.commands.find((item) => item.id === stepId);
  if (!command) throw new Error(`Unknown replay command: ${stepId}`);
  const cwd = repoPath(command.cwd);
  await execFileAsync(command.argv[0], command.argv.slice(1), { cwd, stdio: "inherit" });
  return { step: stepId, cwd, argv: command.argv };
}

function usage() {
  console.error("Usage: node scripts/replay.mjs --check <manifest> | --snapshot <manifest> | --run <manifest> --step <id> --execute");
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args[0] === "--check" && args[1]) {
      const report = await inspectReplay(args[1]);
      console.log(JSON.stringify({ ok: report.ok, manifest: path.relative(ROOT, report.manifestPath), artifacts: report.artifacts.length, errors: report.errors }, null, 2));
      if (!report.ok) process.exitCode = 1;
    } else if (args[0] === "--snapshot" && args[1]) {
      const result = await snapshotReplay(args[1]);
      console.log(`Snapshotted ${result.count} replay artifacts → ${path.relative(ROOT, result.path)}`);
    } else if (args[0] === "--run" && args[1] && args.includes("--execute")) {
      const stepIndex = args.indexOf("--step");
      if (stepIndex === -1 || !args[stepIndex + 1]) throw new Error("--run requires --step <id>");
      const result = await runReplay(args[1], args[stepIndex + 1]);
      console.log(`Replayed ${result.step}: ${result.argv.join(" ")}`);
    } else usage();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

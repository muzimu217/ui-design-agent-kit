import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";
import { buildEvolutionReport } from "./evolution-report.mjs";

const execFileAsync = promisify(execFile);

const steps = [
  ["verify", ["run", "verify"]],
  ["test", ["test"]],
  ["prompt:build", ["run", "prompt:build"]],
  ["eval:check", ["run", "eval", "--", "--check"]],
  ["eval:e3", ["run", "eval:e3"]],
  ["replay:check", ["run", "replay", "--", "--check", "demo/blog-demo/replay.json"]],
];

async function runStep(id, args) {
  const started = Date.now();
  try {
    const result = await execFileAsync("npm", args, { cwd: ROOT, maxBuffer: 2 * 1024 * 1024 });
    return { id, status: "passed", durationMs: Date.now() - started, outputTail: `${result.stdout}${result.stderr}`.slice(-500) };
  } catch (error) {
    return { id, status: "failed", durationMs: Date.now() - started, exitCode: error.code, outputTail: `${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-800) };
  }
}

export async function runLoop({ withMcp = false } = {}) {
  const plan = withMcp ? [...steps, ["doctor:mcp", ["run", "doctor:mcp"]]] : steps;
  const results = [];
  for (const [id, args] of plan) results.push(await runStep(id, args));
  const evolution = await buildEvolutionReport();
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: results.every((step) => step.status === "passed") ? "ready-for-next-gate" : "needs-repair",
    steps: results,
    evolution,
    boundary: {
      automatic: ["run mechanical checks", "validate replay hashes", "prepare the next scenario", "write output reports"],
      userDecisionRequired: ["approve direction/material/prototype", "accept discretionary P2 changes", "promote upstream revisions", "enable or authenticate optional MCP"],
    },
  };
  await mkdir(path.join(ROOT, "output"), { recursive: true });
  const output = path.join(ROOT, "output/loop-report.json");
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  return { report, output };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { report, output } = await runLoop({ withMcp: process.argv.includes("--with-mcp") });
    console.log(JSON.stringify({
      status: report.status,
      steps: report.steps.map(({ id, status }) => ({ id, status })),
      coverage: report.evolution.coverage,
      nextScenario: report.evolution.nextScenario,
      output: path.relative(ROOT, output),
    }, null, 2));
    if (report.status !== "ready-for-next-gate") process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

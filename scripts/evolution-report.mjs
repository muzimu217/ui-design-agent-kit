import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

export async function buildEvolutionReport(root = ROOT) {
  const scenarios = JSON.parse(await readFile(path.join(root, "evals/scenarios.json"), "utf8"));
  const results = JSON.parse(await readFile(path.join(root, "evals/results.json"), "utf8"));
  const executed = scenarios.filter((item) => (results.runs?.[item.id]?.length ?? 0) > 0);
  const latest = executed.map((item) => results.runs[item.id].at(-1));
  const next = scenarios.find((item) => (results.runs?.[item.id]?.length ?? 0) === 0);
  const regressions = [];
  for (const item of scenarios) {
    const runs = results.runs?.[item.id] ?? [];
    if (runs.length < 2) continue;
    const previous = runs.at(-2);
    const current = runs.at(-1);
    if (current.score < previous.score || (current.styleScore ?? 100) < (previous.styleScore ?? 100)) {
      regressions.push({
        scenarioId: item.id,
        previous: { score: previous.score, styleScore: previous.styleScore },
        current: { score: current.score, styleScore: current.styleScore },
      });
    }
  }
  const recommendations = [];
  if (regressions.length) recommendations.push("暂停合入：先复现并解释评分回退，再提交修复或用户裁决");
  if (next) recommendations.push(`按轮转执行下一个未覆盖场景：${next.id}`);
  else recommendations.push("所有场景已有至少一次执行记录；优先重跑低分或新增场景");
  recommendations.push("只自动生成报告和重放哈希；不自动升级 skill、改锁文件、过用户门或写入密钥");
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    coverage: {
      executed: executed.length,
      total: scenarios.length,
      percent: Math.round((100 * executed.length) / scenarios.length),
      latestAverage: latest.length ? Math.round(latest.reduce((sum, run) => sum + run.score, 0) / latest.length) : null,
    },
    nextScenario: next?.id ?? null,
    lowScoreScenarios: latest.filter((run) => run.score < 100).length,
    regressions,
    recommendations,
  };
}

export async function writeEvolutionReport(root = ROOT) {
  const report = await buildEvolutionReport(root);
  const output = path.join(root, "output/evolution-report.json");
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  return { report, output };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { report, output } = await writeEvolutionReport();
    console.log(JSON.stringify({ ...report, output: path.relative(ROOT, output) }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

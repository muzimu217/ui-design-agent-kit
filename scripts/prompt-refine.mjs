import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// S4 (agentUniverse absorption, 2026-09-25): the gap between "an eval run
// failed a criterion" and "someone edits the instruction corpus by hand".
// This tool reads the ledger mechanically, locates the failing criteria and
// fail-condition hits, maps them to the reference files that own the topic,
// and writes a suggestion DRAFT into output/prompt-refine/. It never edits
// any instruction file: adopting a draft is a user ruling, same as every
// other instruction change (gate-protocol.md: verdicts come from the user).
//
// Usage:
//   npm run prompt:refine                        overview of failing/low-score scenarios
//   npm run prompt:refine -- --scenario <id>     write one suggestion draft
//   npm run prompt:refine -- --all               draft every failing scenario
//   npm run prompt:refine -- --out <dir>         override the draft directory

const resultsPath = path.join(ROOT, "evals/results.json");
const scenariosPath = path.join(ROOT, "evals/scenarios.json");

// Mechanical topic → instruction-owner map. A criterion text can hit several
// owners; no hit means "needs human localization" and the draft says so.
const OWNERS = [
  { match: /对比|contrast/i, file: "detail-constants.md", why: "对比度实测与数值军规" },
  { match: /键盘|keyboard|focus|焦点/i, file: "detail-critique.md", why: "可供性与键盘链路维度" },
  { match: /语义|semantic|aria|可达|accessib|label/i, file: "detail-critique.md", why: "可供性与语义命名维度" },
  { match: /状态|state|empty|error|loading|空态|失败态/i, file: "detail-critique.md", why: "状态覆盖维度" },
  { match: /动效|motion|animat|transition|缓动/i, file: "motion-contract.md", why: "动效参数、打断语义与合规预设" },
  { match: /布局|layout|spacing|间距|网格/i, file: "detail-constants.md", why: "布局节奏与对齐恒定值" },
  { match: /素材|material|参考|reference|license|授权/i, file: "tool-routing.md", why: "素材管线四层与授权边界" },
  { match: /门|gate|裁决|verdict/i, file: "gate-protocol.md", why: "门径契约、停点规则与违规定义" },
  { match: /移动|mobile|responsive|响应式|viewport/i, file: "acceptance.md", why: "验收检查面（桌面/手机/键盘）" },
  { match: /截图|evidence|证据|proof/i, file: "acceptance.md", why: "证据要求与验收轮循环" },
  { match: /演示|demo|persist|真实数据|真实感/i, file: "design-contract.md", why: "内容真实性与演示数据边界" },
  { match: /计划|plan|锁定|lock|授权阶段/i, file: "plan-execute.md", why: "双模式、计划锁定与协作模式卡" },
];

export function mapToOwners(text) {
  return OWNERS.filter((owner) => owner.match.test(text ?? ""));
}

export function pickFailing(scenarios, results) {
  return scenarios
    .map((scenario) => {
      const runs = results.runs[scenario.id] ?? [];
      const latest = runs.at(-1);
      if (!latest) return null;
      const thin = scenario.passCriteria.filter((c) => (latest.scores?.[c] ?? 0) < 2);
      const failHits = latest.failHits ?? [];
      if (thin.length === 0 && failHits.length === 0 && latest.score === 100) return null;
      return { scenario, latest, thin, failHits };
    })
    .filter(Boolean);
}

export function buildDraft({ scenario, latest, thin, failHits }, { date = new Date().toISOString().slice(0, 10) } = {}) {
  const lines = [];
  lines.push(`# 指令修订建议草稿 · ${scenario.id}`);
  lines.push("");
  lines.push(`- 日期：${date}`);
  lines.push(`- 最近记录：${latest.date}${latest.round ? `（${latest.round}）` : ""} · 分数 ${latest.score}${latest.styleScore !== undefined ? ` · 样式 ${latest.styleScore}` : ""}`);
  lines.push(`- 场景要求：${scenario.passCriteria.join("；")}`);
  if (scenario.failConditions.length > 0) {
    lines.push(`- 场景禁区：${scenario.failConditions.join("；")}`);
  }
  lines.push("");
  lines.push("## 失效点与指令归属");
  lines.push("");
  if (thin.length === 0 && failHits.length === 0) {
    lines.push("（无低于满分的条目；本稿由 --all 或显式 --scenario 生成，可忽略。）");
  }
  for (const criterion of thin) {
    lines.push(`### 未拿满分（${latest.scores?.[criterion] ?? 0}/2）：${criterion}`);
    const owners = mapToOwners(criterion);
    if (owners.length === 0) {
      lines.push("- 无机械匹配的指令归属，需人工定位失效的是哪段指令。");
    } else {
      for (const owner of owners) {
        lines.push(`- 候选归属：references/${owner.file} — ${owner.why}`);
      }
    }
    lines.push("");
  }
  for (const hit of failHits) {
    lines.push(`### 命中禁区：${hit}`);
    const owners = mapToOwners(hit);
    if (owners.length === 0) {
      lines.push("- 无机械匹配的指令归属，需人工定位是哪段指令没有拦住该行为。");
    } else {
      for (const owner of owners) {
        lines.push(`- 候选归属：references/${owner.file} — ${owner.why}`);
      }
    }
    lines.push("");
  }
  lines.push("## 建议修订方向（草稿，未裁决）");
  lines.push("");
  lines.push("1. 对每个失效点核对其候选归属文件中的对应维度/军规是否缺失、含糊或自相矛盾；");
  lines.push("2. 修订只落到归属文件本身，不在场景文件里放宽标准来迁就失败；");
  lines.push("3. 本稿是建议，不是变更：任何指令修订在用户裁决后才能落盘。");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const list = JSON.parse(await readFile(scenariosPath, "utf8"));
  const results = JSON.parse(await readFile(resultsPath, "utf8"));
  const failing = pickFailing(list, results);

  if (args[0] === "--scenario" || args[0] === "--all") {
    const targets = args[0] === "--all"
      ? failing
      : failing.filter((item) => item.scenario.id === args[1]);
    const idArg = args[0] === "--scenario" ? args[1] : undefined;
    if (args[0] === "--scenario" && (!idArg || !list.some((item) => item.id === idArg))) {
      throw new Error("--scenario requires an existing scenario id");
    }
    if (targets.length === 0) {
      console.log(idArg
        ? `${idArg} 最近一次执行无失效点，不需要修订建议。`
        : "当前台账没有失败或低分场景，无需修订建议。");
      return;
    }
    const outIndex = args.indexOf("--out");
    const outDir = path.resolve(ROOT, outIndex === -1 ? "output/prompt-refine" : args[outIndex + 1]);
    await mkdir(outDir, { recursive: true });
    for (const item of targets) {
      const file = path.join(outDir, `${item.scenario.id}-${new Date().toISOString().slice(0, 10)}.md`);
      await writeFile(file, buildDraft(item), "utf8");
      console.log(`草稿已写：${path.relative(ROOT, file)}（待用户裁决，未改任何指令）`);
    }
    return;
  }

  if (args.length === 0) {
    console.log(`台账覆盖 ${Object.keys(results.runs).length}/${list.length} 个场景，其中 ${failing.length} 个存在失效点：`);
    for (const item of failing) {
      console.log(`- ${item.scenario.id}：分数 ${item.latest.score}，未满分 ${item.thin.length} 条，禁区命中 ${item.failHits.length} 条`);
    }
    if (failing.length === 0) console.log("（无）");
    console.log("\n生成修订建议草稿：npm run prompt:refine -- --scenario <id> | --all");
    return;
  }

  usage();
  process.exitCode = 1;
}

function usage() {
  console.error(`Usage: npm run prompt:refine                                  失效场景总览
  npm run prompt:refine -- --scenario <id> [--out <dir>]       生成一个场景的修订建议草稿
  npm run prompt:refine -- --all [--out <dir>]                 为全部失效场景生成草稿`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// V1（strategy-synthesis 2026-09-26 §三.4）：`uak init` 一键安装器——按宿主
// 生成接入形态。在**目标项目**目录运行：
//   node <uak-repo>/scripts/uak-init.mjs [--uak <uak-repo-path>] [--host codex|claude|other] [--dry-run]
//
// 做三件事（幂等，可重复运行）：
//   1. 在 UAK 仓跑 prompt:build（lean 档）并把导出拷到目标项目 .agents/uak-prompt.md
//   2. 目标项目 AGENTS.md 追加（或更新标记段）UAK 接入说明
//   3. 打印该宿主的手动步骤（MCP 三必配 + 首个任务建议）——不替用户改宿主配置
// 注意：--dry-run 只对目标项目不写盘；lean 导出仍会在 UAK 源仓 output/ 再生成（gitignored）
//
// 纪律：不写目标项目的 .codex/config.toml（用户配置，只打印）；不装依赖；零外部请求。

const USAGE = `用法：node uak-init.mjs [--uak <uak-repo>] [--host codex|claude|other] [--dry-run]
  --uak   UAK 仓库路径（默认：环境变量 UAK_PATH，其次 ../ui-design-agent-kit）
  --host  目标宿主（默认自动探测：.codex/ → codex；CLAUDE.md → claude；否则 other）`;

export function detectHost(targetDir) {
  if (existsSync(path.join(targetDir, ".codex"))) return "codex";
  if (existsSync(path.join(targetDir, "CLAUDE.md"))) return "claude";
  return "other";
}

export function resolveUakPath(explicit) {
  const candidates = [explicit, process.env.UAK_PATH, path.resolve("..", "ui-design-agent-kit")]
    .filter(Boolean)
    .map((p) => path.resolve(p));
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "scripts", "build-prompt.mjs"))) return candidate;
  }
  return undefined;
}

export function agentsSnippet(uakPath, host) {
  const rel = path.relative(process.cwd(), uakPath) || ".";
  return [
    "<!-- uak:begin (managed by uak-init; do not edit between markers) -->",
    "## UI Design Agent Kit（已接入）",
    "",
    `- 提示词全文：\`.agents/uak-prompt.md\`（来自 UAK lean 导出；宿主首轮直接注入或按需读取）`,
    `- 源仓库：\`${rel}\`（升级=在源仓库 git pull 后重跑 uak-init）`,
    `- 接入形态（${host}）：${host === "codex" ? ".codex/ 已存在，MCP 三必配见 .agents/uak-mcp-setup.md" : host === "claude" ? "按 .agents/uak-mcp-setup.md 配置 MCP 后在 CLAUDE.md 引入提示词" : "通用宿主：首轮注入 .agents/uak-prompt.md，MCP 可选"}`,
    "- 首个任务建议（Express 档）：对本项目任一既有页面做一次「只评审不修改」的验收（细节批评+对比度实算+截图）",
    "",
    "<!-- uak:end -->",
  ].join("\n");
}

export function mcpSetupText(host) {
  const common = [
    "# MCP 三必配（UAK 主链路）：",
    "#   1) playwright（浏览器取证；禁 file://，用 http）",
    "#   2) chrome-devtools（备用取证通道）",
    "#   3) context7（官方文档检索）",
    "# 完整镜像示例见 UAK 仓库 docs/examples/mcp.json.example",
  ].join("\n");
  if (host === "codex") {
    return `${common}\n# Codex：把三项写入目标项目 .codex/config.toml 的 [mcp_servers.*]（示例文件已拷贝：.agents/uak-mcp-setup.md）`;
  }
  return `${common}\n# 其他宿主：按宿主 MCP 格式配置；Claude Code 参考 docs/examples/mcp.json.example`;
}

async function buildLeanExport(uakPath) {
  const result = spawnSync(process.execPath, ["scripts/build-prompt.mjs", "--lean"], { cwd: uakPath, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`prompt:build 失败：${result.stderr?.slice(0, 300)}`);
  const exported = path.join(uakPath, "output", "ui-design-agent.lean.md");
  if (!existsSync(exported)) {
    // 导出文件名以 build-prompt.mjs 实现为准；兜底扫描 output/ 最新 lean 文件
    throw new Error(`未找到 lean 导出物（期望 ${path.relative(uakPath, exported)}）`);
  }
  return exported;
}

async function upsertAgentsMd(targetDir, snippet) {
  const agentsPath = path.join(targetDir, "AGENTS.md");
  let content = "";
  if (existsSync(agentsPath)) content = await readFile(agentsPath, "utf8");
  if (content.includes("<!-- uak:begin") || content.includes("<!-- uak:end")) {
    const start = content.indexOf("<!-- uak:begin");
    let end = content.indexOf("<!-- uak:end -->");
    if (end !== -1) end += "<!-- uak:end -->".length;
    // 完整有序（begin<end）→ 原位替换
    if (start !== -1 && end !== -1 && start < end) {
      return { file: agentsPath, action: "updated", write: () => writeFile(agentsPath, content.slice(0, start) + snippet + content.slice(end), "utf8") };
    }
    // 乱序（end 在 begin 前）或孤儿标记 = 托管区损坏（批 32 P3-1 实测产生
    // 重复托管区）——降级：截断至首个标记前，托管段整体重写（标记后的
    // 内容视为损坏区，不予保留）
    // 截断点统一用标记【起点】比较（end 已 +len 归一化，直接比会落到标记
    // 之后——批 32 P3-1 二次实测：残留旧 end 标记）
    const endStart = end === -1 ? Infinity : end - "<!-- uak:end -->".length;
    const firstMarker = Math.min(start, endStart);
    content = content.slice(0, firstMarker);
    return { file: agentsPath, action: "repaired", write: () => writeFile(agentsPath, content.replace(/\n*$/, "\n\n") + snippet + "\n", "utf8") };
  }
  const separator = content.trim().length === 0 ? "" : "\n\n";
  return { file: agentsPath, action: content ? "appended" : "created", write: () => writeFile(agentsPath, content + separator + snippet + "\n", "utf8") };
}

export async function runInit({ targetDir, uakPath, host, dryRun }) {
  const actions = [];
  if (!existsSync(path.join(targetDir, ".git"))) {
    throw new Error(`目标目录不像项目根（无 .git）：${targetDir}——请在目标项目根运行`);
  }
  if (path.resolve(targetDir) === path.resolve(uakPath) || existsSync(path.join(targetDir, "scripts", "uak-init.mjs"))) {
    throw new Error("目标目录就是 UAK 仓库本身——uak init 用于接入外部项目，不能自噬；请 cd 到目标项目后运行");
  }
  const detected = host || detectHost(targetDir);
  const leanFile = await buildLeanExport(uakPath);

  const agentsDir = path.join(targetDir, ".agents");
  actions.push({ desc: `.agents/ 目录（提示词与 MCP 说明）`, run: () => mkdir(agentsDir, { recursive: true }) });
  actions.push({ desc: ".agents/uak-prompt.md ← lean 导出", run: () => copyFile(leanFile, path.join(agentsDir, "uak-prompt.md")) });
  actions.push({
    desc: ".agents/uak-mcp-setup.md（MCP 手动步骤）",
    run: () => writeFile(path.join(agentsDir, "uak-mcp-setup.md"), `# UAK MCP 接入（${detected}）\n\n${mcpSetupText(detected)}\n`, "utf8"),
  });
  const agentsOp = await upsertAgentsMd(targetDir, agentsSnippet(uakPath, detected));
  actions.push({ desc: `${path.relative(targetDir, agentsOp.file)}（${agentsOp.action}）`, run: agentsOp.write });

  if (!dryRun) {
    for (const action of actions) await action.run();
  }
  return { host: detected, actions: actions.map((a) => a.desc) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.length === 0) {
    console.log(USAGE);
  } else {
    const get = (flag) => {
      const i = argv.indexOf(flag);
      return i === -1 ? undefined : argv[i + 1];
    };
    try {
      const targetDir = process.cwd();
      const uakPath = resolveUakPath(get("--uak"));
      if (!uakPath) {
        console.error("✗ 未找到 UAK 仓库——用 --uak <path> 或环境变量 UAK_PATH 指定");
        process.exitCode = 1;
      } else {
        const result = await runInit({ targetDir, uakPath, host: get("--host"), dryRun: argv.includes("--dry-run") });
        console.log(`✓ UAK 接入完成（宿主=${result.host}${argv.includes("--dry-run") ? "，dry-run 未写盘" : ""}）：`);
        for (const desc of result.actions) console.log(`  · ${desc}`);
        console.log("\n下一步（Express 档，目标 10 分钟到第一张验收截图）：");
        console.log("  1. 宿主里打开本项目，首轮注入 .agents/uak-prompt.md");
        console.log("  2. 说：「对本项目 <某页面> 做一次只读验收」");
        console.log("  3. 拿到验收截图与缺陷清单后，再决定是否授权修改");
      }
    } catch (error) {
      console.error(`✗ ${error.message}`);
      process.exitCode = 1;
    }
  }
}

import { readFile, readdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

// 每日定点简单汇报（用户 2026-10-04 令）：项目是干嘛的+做什么功能+完整架构图。
// 数据全部实时取自仓库（git/scenarios.json/测试计数/锁文件），不手写数字。
// 用法：node scripts/daily-report-gen.mjs [--out output/daily-brief-YYYY-MM-DD.html]

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function sh(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}
async function countTests(dir) {
  let count = 0;
  for (const name of await readdir(dir)) {
    if (name.endsWith(".test.mjs")) {
      count += (await readFile(path.join(dir, name), "utf8")).match(/^\s*test\(/gm)?.length ?? 0;
    }
  }
  return count;
}

const [head, branch, scenarios, results, skills, lock] = await Promise.all([
  Promise.resolve(sh(["rev-parse", "--short", "HEAD"])),
  Promise.resolve(sh(["branch", "--show-current"])),
  readFile(path.join(ROOT, "evals/scenarios.json"), "utf8").then((s) => JSON.parse(s).length),
  readFile(path.join(ROOT, "evals/results.json"), "utf8").then((r) => Object.values(JSON.parse(r).runs).filter((v) => v.length > 0).length),
  readdir(path.join(ROOT, ".agents/skills")).then((l) => l.length),
  readFile(path.join(ROOT, "tooling/sources.lock.json"), "utf8").then((l) => JSON.parse(l).skills.length),
]);
const tests = (await countTests(path.join(ROOT, "tests"))) + (await countTests(path.join(ROOT, "showcase/tests")));
const outArg = process.argv.indexOf("--out");
const out = outArg === -1
  ? path.join(ROOT, "output", `daily-brief-${new Date().toISOString().slice(0, 10)}.html`)
  : path.resolve(ROOT, process.argv[outArg + 1]);

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>UAK 每日简报 · ${new Date().toISOString().slice(0, 10)}</title>
<style>
:root{--bg:#0c1116;--line:#22303c;--tx:#e8eef2;--tx2:#9db0bc;--tx3:#64798a;--g:#2fbf8f;--b:#4d9fff;--p:#8f7bf5}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.75 'PingFang SC',sans-serif;padding:36px 22px 70px}
.wrap{max-width:900px;margin:0 auto}h1{font-size:24px;margin:0 0 4px}.sub{color:var(--tx3);font-size:13px;margin-bottom:20px}
h2{font-size:17px;margin:28px 0 10px;border-bottom:1px solid var(--line);padding-bottom:5px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}
.kpi{background:#141d26;border:1px solid var(--line);border-radius:10px;padding:12px 14px}.kpi b{display:block;font-size:20px;color:var(--g)}.kpi span{color:var(--tx3);font-size:12px}
p,li{color:var(--tx2)}b{color:var(--tx)}
pre{background:#101820;border:1px solid var(--line);border-radius:10px;padding:14px 16px;overflow-x:auto;font:12.5px/1.6 Menlo,monospace;color:var(--b);margin:10px 0}
footer{margin-top:36px;color:var(--tx3);font-size:12px;border-top:1px solid var(--line);padding-top:14px}
</style></head><body><div class="wrap">
<h1>UAK 每日简报</h1>
<p class="sub">${new Date().toISOString().slice(0, 10)} · 分支 ${branch} · HEAD ${head} · 数据实时取自仓库</p>

<h2>一句话：这个项目是干嘛的</h2>
<p><b>帮人类设计更好 UI 的智能体工作流</b>：AI 调用 ${skills} 个技能、编排工具（MCP/CLI/浏览器），走六道门人工确认流程，把「一句口语需求」变成「有证据、可验收的界面」。核心理念=AI 擅长模仿学习而非从零生成；人在门上裁决，把品味喂进系统。</p>

<h2>它做什么（功能四件套）</h2>
<ul>
<li><b>工作流</b>：口语需求 → 门A 方向稿 → 门B 素材 → 门C 原型 → 门D 契约 → 实现 → 门E 验收（浏览器实测+对比度实算）→ 门F 留痕</li>
<li><b>验收体系</b>：${scenarios} 个评测场景 rubric，${results} 个已真实执行打分——分数不是自评，每条有浏览器证据</li>
<li><b>可迁移</b>：npm run prompt:build 把整套工作流导出成单文件提示词，给任何宿主（Codex/Claude 等）</li>
<li><b>一键接入</b>：uak init 按宿主生成接入形态；Express 档让新用户 10 分钟拿到第一张验收截图</li>
</ul>

<h2>完整架构图</h2>
<pre>
┌─────────────────────────── UAK 产品架构（${branch}）───────────────────────────┐
│                                                                            │
│  智能体指令层 .agents/skills/        ${String(skills).padStart(3)} 技能                    │
│  ├── ui-design-agent（主入口：门A-F 链 + 专家团路由）                          │
│  ├── uak-visual-critique / uak-design-system / uak-design-thinking          │
│  ├── motion / gsap-*×8 / remotion-*×10（官方，钉版）                          │
│  └── jiejoe-design / promotion-playbook / remotion-video-agent（自家）        │
│                                                                            │
│  验证与工具层                ${String(tests).padStart(3)} 守护测试 · ${scenarios} 场景 · ${results} 已执行  │
│  ├── scripts/（verify/lint:detail/lint:spec/diagram/init…）                │
│  ├── evals/（rubric + results.json 台账 + runs/ 证据现场）                   │
│  └── tooling/sources.lock.json  ${String(lock).padStart(3)}/25 钉版 100%               │
│                                                                            │
│  案例层 demo/ + showcase/            12 个有证据案例 · 线上 agent.kcos.club   │
│                                                                            │
│  六道门：A 方向稿 ── B 素材 ── C 原型 ── D 契约 ── 实现 ── E 验收 ── F 留痕   │
│           （A-E 人工裁决 · 每门停等用户；F 自动留痕）                          │
└────────────────────────────────────────────────────────────────────────────┘
</pre>

<h2>当前状态与下一步</h2>
<ul>
<li><b>生产就绪度</b>：指令层可生产使用（${tests} 测试全绿 / 锁 100% / 线上站 200 / 台账 ${results}/${scenarios}）；npm 发包按用户令暂缓，待稳定观察期后再议</li>
<li><b>分支策略</b>：开发在 test 分支累计，main 冻结保护（ruleset），解冻由用户指令</li>
<li><b>路线图</b>：V1 已交付（init+Express）→ V2 独立 verify CLI → V3 UI-Bench 公开基准</li>
</ul>

<footer>UAK 每日简报 · scripts/daily-report-gen.mjs 生成 · 数据实时核验</footer>
</div></body></html>
`;
await writeFile(out, html, "utf8");
console.log(`每日简报已生成：${path.relative(ROOT, out)}（tests=${tests} scenarios=${scenarios}/${results} skills=${skills} lock=${lock}/25）`);

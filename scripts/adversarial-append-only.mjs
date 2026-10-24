#!/usr/bin/env node
// adversarial-append-only — try to DISPROVE the regressions wall's
// "只增不删（已删除：0）" claim from git history.
//
// 形式采纳自 cloudflare/security-audit-skill（学循环 89/93）：对抗性验证=
// 用独立证据路径试图证伪一个 confirmed 结论。现有审计的 regressions 检查只看
// 当前文件形态（id/date/lesson 齐全）；本脚本走另一条路径——git 全历史：
//   1. 取 regressions.json 的全部历史版本
//   2. 逐版本提取条目 id 集合
//   3. 断言：任何在版本 N 存在的 id 在 N+1 仍然存在（无删除）
//   4. 已存在条目的内容若被改写（增后改），如实报 needs_validation 细节
//
// Usage: node scripts/adversarial-append-only.mjs [--json]
// Exit 0 = 证伪失败（声明存活）；exit 1 = 证伪成功或证据不足（声明被推翻/存疑）。

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = "canvas/regressions.json";
const run = promisify(execFile);

const out = async (a, args) => (await run(a, args, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 })).stdout;

const idsOf = (text) => {
  try { return new Set((JSON.parse(text).regressions ?? []).map((r) => r.id)); }
  catch { return null; } // 历史版本可能中途损坏——如实上报而非跳过
};
const contentOf = (text) => {
  try { return (JSON.parse(text).regressions ?? []).map((r) => JSON.stringify(r)).sort(); }
  catch { return null; }
};

const log = await out("git", ["log", "--format=%H", "--", TARGET]);
const commits = log.split("\n").map((s) => s.trim()).filter(Boolean);
if (!commits.length) throw new Error("git 历史为空——无历史即无法验证 append-only（incomplete 而非 complete）");
const issues = [];
const versions = [];

// 旧→新 逐版本取证
for (let i = commits.length - 1; i >= 0; i--) {
  const c = commits[i];
  const text = await out("git", ["show", `${c}:${TARGET}`]).catch(() => null);
  if (text === null) { issues.push(`${c.slice(0, 8)}: 历史版本读取失败`); continue; }
  const ids = idsOf(text);
  if (ids === null) { issues.push(`${c.slice(0, 8)}: 历史版本 JSON 解析失败（中途损坏即证伪"从未损坏"叙事）`); continue; }
  versions.push({ commit: c, ids, content: contentOf(text) });
}

// 断言 0：工作区 vs HEAD（未提交的删除也算删——先于历史对比暴露）
try {
  const wt = (await readFile(path.join(ROOT, TARGET), "utf8"));
  const wtIds = idsOf(wt);
  if (wtIds && versions.length) {
    const head = versions.at(-1);
    const gone = [...head.ids].filter((id) => !wtIds.has(id));
    if (gone.length) issues.push(`needs_validation：工作区相对 HEAD 删除了条目 ${gone.join(", ")}（未提交的删除待处置）`);
    const added = [...wtIds].filter((id) => !head.ids.has(id));
    if (added.length) issues.push(`needs_validation：工作区新增未提交条目 ${added.join(", ")}（正常开发态，如实记录）`);
  }
} catch (e) {
  issues.push(`工作区对照失败: ${String(e.message).split("\n")[0]}`);
}

// 断言 1：append-only（id 永不消失）
for (let i = 1; i < versions.length; i++) {
  const prev = versions[i - 1].ids, cur = versions[i].ids;
  const deleted = [...prev].filter((id) => !cur.has(id));
  if (deleted.length) issues.push(`证伪成功：${versions[i].commit.slice(0, 8)} 删除了条目 ${deleted.join(", ")}（"只增不删"被推翻）`);
}

// 断言 2：已存在条目不被改写（增后改 → needs_validation 级事实）
const mutations = [];
for (let i = 1; i < versions.length; i++) {
  const prev = versions[i - 1], cur = versions[i];
  if (!prev.content || !cur.content) continue;
  const prevMap = new Map(prev.content.map((s) => [JSON.parse(s).id, s]));
  for (const s of cur.content) {
    const id = JSON.parse(s).id;
    if (prevMap.has(id) && prevMap.get(id) !== s) mutations.push(`${id} 在 ${cur.commit.slice(0, 8)} 被改写`);
  }
}
if (mutations.length) issues.push(`needs_validation：检测到增后改写 ${mutations.length} 处（${mutations.slice(0, 3).join("; ")}${mutations.length > 3 ? "…" : ""}）——"只增不删"的字面口径不含改写，是否允许须明示`);

const report = {
  claim: "反例墙只增不删（已删除：0）",
  method: "git 全历史逐版本 id 集合对比（独立于当前形态检查的证据路径）",
  versionsExamined: versions.length,
  entriesCurrent: versions.at(-1)?.ids.size ?? 0,
  mutations,
  run_status: issues.length === 0 ? "complete" : "incomplete",
  ...(issues.length ? { findings: issues } : {}),
  verdict: issues.length === 0
    ? "证伪失败：全历史无删除、无改写，append-only 声明存活"
    : issues.some((i) => i.startsWith("证伪成功"))
      ? "声明被推翻"
      : "声明存疑（needs_validation）",
  generatedAt: new Date().toISOString(),
};

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`adversarial append-only: ${report.run_status} | ${report.versionsExamined} versions | ${report.entriesCurrent} entries`);
  console.log(`  verdict: ${report.verdict}`);
  for (const i of issues) console.log(`  - ${i}`);
}
process.exit(report.run_status === "complete" ? 0 : 1);

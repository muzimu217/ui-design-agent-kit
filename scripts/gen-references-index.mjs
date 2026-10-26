#!/usr/bin/env node
// gen-references-index — 知识检索第一层：紧凑索引（增量 79，学循环 107
// claude-mem 立卡兑现）。扫描全部已装技能的 references/*.md 与
// docs/knowledge-base/*.md，产出 output/references-index.json：
// { file, title, lines }。对账语义：索引条数必须与文件枚举一致——
// 索引漏文件=死数据（增量 52 缺陷类），多文件=枚举器漏配。
//
// claude-mem 三层模式（索引→时间线→详情）本仓只落第一层：详情已由
// 增量 74 的证据链接化覆盖（点开即达原文），时间线层按检索痛点再启。
//
// Usage: node scripts/gen-references-index.mjs [--json]
// Exit 0 索引与枚举一致；Exit 1 不一致（分歧即交付物）。

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_REFS = path.join(ROOT, ".agents", "skills");

async function walkMarkdown(dir, acc) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walkMarkdown(full, acc);
    else if (e.name.endsWith(".md")) acc.push(full);
  }
}

const files = [];
await walkMarkdown(SKILL_REFS, files);
const refs = files.filter((f) => f.includes(`${path.sep}references${path.sep}`));
// SKILL.md 与 references 之外的 md（根提示词/NOTICE 等）不入索引——索引的
// 对象是"知识库文件"，入口文件由 SKILL.md 自身的路由承担。

const entries = [];
for (const f of refs.sort()) {
  const rel = path.relative(ROOT, f);
  const text = await readFile(f, "utf8");
  const h1 = (text.match(/^#\s+(.+)$/m) ?? [])[1]?.trim() ?? "";
  const skill = rel.split(path.sep)[2] ?? "";
  entries.push({
    file: rel.split(path.sep).join("/"),
    skill,
    title: h1 || path.basename(f, ".md"),
    lines: text.split("\n").length,
  });
}

const index = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  sources: { skillsReferencesGlob: ".agents/skills/*/references/**/*.md" },
  entries,
};

await mkdir(path.join(ROOT, "output"), { recursive: true });
await writeFile(path.join(ROOT, "output", "references-index.json"), JSON.stringify(index, null, 1) + "\n", "utf8");

// 对账：重新枚举一遍，数量必须一致（自证索引无漏）
const recheck = [];
await walkMarkdown(SKILL_REFS, recheck);
const recheckCount = recheck.filter((f) => f.includes(`${path.sep}references${path.sep}`)).length;
const ok = recheckCount === entries.length;
if (jsonOut()) console.log(JSON.stringify({ ok, count: entries.length, recheckCount }, null, 1));
else console.log(`references-index: ${entries.length} files indexed (recheck ${recheckCount}) → ${ok ? "OK" : "MISMATCH"}`);
process.exit(ok ? 0 : 1);

function jsonOut() { return process.argv.includes("--json"); }

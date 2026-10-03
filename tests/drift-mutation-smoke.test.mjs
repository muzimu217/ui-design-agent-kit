import { execFile, spawnSync } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, rm, symlink, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { ROOT } from "../scripts/verify.mjs";

// R050-07：drift 守护变异冒烟自检。
// 轮 101 独立审计第 7 条锋利指出：doc-drift 测试可能"锁措辞而非锁事实"——
// 守卫若失效，恒绿与空转无异。本冒烟给守卫装第二只眼：在 HEAD 的临时
// worktree 里对样本守卫的目标文件做最小变异，期望对应测试由绿转红。
// 守卫真的咬人，其余守卫的恒绿才有含金量。
//
// 方法约束：
// - 变异发生在 git worktree（HEAD 快照）里，工作区与并行 WIP 永不触碰；
// - node_modules 以符号链接接入（doc-drift 经 verify.mjs 依赖 smol-toml/yaml）；
// - 每个变异只跑目标测试（--test-name-pattern），总时长可控；
// - 环境不支持 worktree（沙箱/受限 CI）时 skip，不让基础设施问题伪造成回归。

const exec = promisify(execFile);

const WORKTREE = path.join(ROOT, "output", ".r0507-mutation-worktree");
const DRIFT_TEST = path.join("tests", "doc-drift.test.mjs");

function runTargeted(worktree, pattern) {
  // 本测试自身运行在 node:test 里；不清掉 NODE_TEST_CONTEXT，内层 node --test
  // 会继承 test-child 模式——静默退出、stdout 为空、status 恒 0，冒烟全部失真。
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(
    process.execPath,
    ["--test", "--test-name-pattern", pattern, DRIFT_TEST],
    { cwd: worktree, encoding: "utf8", env },
  );
}

test("drift guards bite: sample mutations flip doc-drift tests red", { timeout: 120000 }, async (t) => {
  await exec("git", ["worktree", "remove", "--force", WORKTREE]).catch(() => {});
  await rm(WORKTREE, { recursive: true, force: true }).catch(() => {});
  await exec("git", ["worktree", "prune"]).catch(() => {});

  try {
    await exec("git", ["worktree", "add", "--detach", WORKTREE, "HEAD"]);
  } catch (error) {
    t.skip(`git worktree unavailable in this environment: ${error.message}`);
    return;
  }

  try {
    await symlink(path.join(ROOT, "node_modules"), path.join(WORKTREE, "node_modules"), "dir").catch(
      async (error) => {
        if (error.code !== "EEXIST") throw error;
      },
    );

    const read = (relative) => readFile(path.join(WORKTREE, relative), "utf8");
    const write = (relative, content) => writeFile(path.join(WORKTREE, relative), content);

    const scenarios = JSON.parse(await read("evals/scenarios.json"));
    const results = JSON.parse(await read("evals/results.json"));
    const total = scenarios.length;
    const executed = Object.values(results.runs).filter((runs) => runs.length > 0).length;

    // 控制组：不改一字，目标测试必须绿——排除"worktree 里守卫恒红"的假阳性。
    const control = runTargeted(WORKTREE, "stale coverage claims");
    assert.equal(control.status, 0, "control run must pass before any mutation");
    assert.match(control.stdout ?? "", /pass 1/, "control run must actually execute one test (not silently exit)");

    const mutations = [
      {
        name: "quality-monitor corpus row",
        pattern: "quality-monitor metric rows",
        file: "docs/quality-monitor.md",
        mutate: async () => {
          const source = await read("docs/quality-monitor.md");
          const row = new RegExp(`(\\| 评测场景数 \\| )${total}（`);
          assert.match(source, row, "guard target row must exist at HEAD");
          await write("docs/quality-monitor.md", source.replace(row, `$1${total - 1}（`));
        },
      },
      {
        name: "eval-report coverage cite",
        pattern: "documents cite the current eval corpus",
        file: "docs/eval-report-2026-09.md",
        mutate: async () => {
          assert.ok(executed > 0, "sample requires at least one executed scenario");
          const source = await read("docs/eval-report-2026-09.md");
          assert.ok(source.includes(`${executed}/${total}`), "guard target cite must exist at HEAD");
          await write(
            "docs/eval-report-2026-09.md",
            source.replace(`${executed}/${total}`, `${executed - 1}/${total}`),
          );
        },
      },
      {
        name: "runs-ledger marker rule",
        pattern: "every evals/runs directory is accounted for",
        file: null,
        mutate: async () => {
          const runDirs = readdirSync(path.join(WORKTREE, "evals", "runs"), { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
          const victim = runDirs.find(
            (name) => !Array.isArray(results.runs[name]) && existsSync(path.join(WORKTREE, "evals", "runs", name, "NON-CORPUS.md")),
          );
          assert.ok(victim, "sample requires a marker-only run directory at HEAD");
          await write(path.join("evals", "runs", victim, "NON-CORPUS.md"), "");
        },
      },
      {
        name: "stale claim reinsertion",
        pattern: "stale coverage claims are gone",
        file: "docs/goal.md",
        mutate: async () => {
          const source = await read("docs/goal.md");
          assert.equal(source.includes("15/60"), false, "goal.md must be clean at HEAD");
          await write("docs/goal.md", `${source}\n15/60\n`);
        },
      },
    ];

    for (const mutation of mutations) {
      await mutation.mutate();
      try {
        const result = runTargeted(WORKTREE, mutation.pattern);
        assert.match(result.stdout ?? "", /fail 1/, `targeted run must actually execute and fail: ${mutation.name}`);
        assert.notEqual(
          result.status,
          0,
          `guard did not detect the mutation: ${mutation.name} — 守卫可能"锁措辞而非锁事实"`,
        );
      } finally {
        if (mutation.file) {
          const pristine = await exec("git", ["show", `HEAD:${mutation.file}`], { cwd: ROOT, encoding: "utf8" });
          await write(mutation.file, pristine.stdout);
        }
      }
    }
  } finally {
    await exec("git", ["worktree", "remove", "--force", WORKTREE]).catch(async () => {
      await rm(WORKTREE, { recursive: true, force: true }).catch(() => {});
      await exec("git", ["worktree", "prune"]).catch(() => {});
    });
    await unlink(path.join(WORKTREE, "node_modules")).catch(() => {});
  }
});

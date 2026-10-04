import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { detectHost, resolveUakPath, agentsSnippet, runInit } from "../scripts/uak-init.mjs";

// V1 uak-init 纯函数与守卫覆盖。夹具=临时目录，用完即删。

function makeTarget({ withCodex = false, withClaude = false, withGit = true } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "uak-init-"));
  if (withGit) mkdirSync(path.join(dir, ".git"));
  if (withCodex) mkdirSync(path.join(dir, ".codex"));
  if (withClaude) writeFileSync(path.join(dir, "CLAUDE.md"), "# demo");
  return dir;
}

test("detectHost: .codex 优先于 CLAUDE.md，缺省 other", () => {
  const codex = makeTarget({ withCodex: true, withClaude: true });
  assert.equal(detectHost(codex), "codex");
  const claude = makeTarget({ withClaude: true });
  assert.equal(detectHost(claude), "claude");
  const other = makeTarget();
  assert.equal(detectHost(other), "other");
  rmSync(codex, { recursive: true, force: true });
  rmSync(claude, { recursive: true, force: true });
  rmSync(other, { recursive: true, force: true });
});

test("resolveUakPath: 显式命中 + UAK_PATH 注入兜底", () => {
  const root = uakRepoRoot();
  assert.equal(resolveUakPath(root), path.resolve(root), "显式有效路径原样返回");
  const saved = process.env.UAK_PATH;
  try {
    process.env.UAK_PATH = root;
    assert.equal(resolveUakPath(path.join(root, "不存在的目录")), path.resolve(root), "显式无效时回退 UAK_PATH");
  } finally {
    if (saved === undefined) delete process.env.UAK_PATH;
    else process.env.UAK_PATH = saved;
  }
});

test("self-guard: 目标=UAK 仓库本身或含 scripts/uak-init.mjs 时拒绝", async () => {
  const uakRoot = uakRepoRoot();
  const target = makeTarget();
  // 在目标里伪造 scripts/uak-init.mjs —— 应被识别为 UAK 仓
  mkdirSync(path.join(target, "scripts"));
  writeFileSync(path.join(target, "scripts", "uak-init.mjs"), "// fake");
  await assert.rejects(
    () => runInit({ targetDir: target, uakPath: uakRoot, host: "other", dryRun: true }),
    /自噬|不能自噬/,
  );
  rmSync(target, { recursive: true, force: true });
});

test("runInit dry-run: 不写盘且动作清单完整", async () => {
  const target = makeTarget();
  const uakRoot = uakRepoRoot();
  const result = await runInit({ targetDir: target, uakPath: uakRoot, host: "other", dryRun: true });
  assert.ok(result.actions.length >= 4);
  assert.equal(existsSyncSafe(path.join(target, ".agents")), false, "dry-run 不得写 .agents/");
  rmSync(target, { recursive: true, force: true });
});

test("runInit 实跑: AGENTS.md 标记段幂等更新", async () => {
  const target = makeTarget();
  const uakRoot = uakRepoRoot();
  await runInit({ targetDir: target, uakPath: uakRoot, host: "codex", dryRun: false });
  const agents = readSafe(path.join(target, "AGENTS.md"));
  assert.ok(agents.includes("<!-- uak:begin") && agents.includes("<!-- uak:end -->"));
  assert.ok(agents.includes("codex"));
  // 二次运行走 updated 路径，标记段不重复
  await runInit({ targetDir: target, uakPath: uakRoot, host: "codex", dryRun: false });
  const agents2 = readSafe(path.join(target, "AGENTS.md"));
  assert.equal(agents2.split("<!-- uak:begin").length - 1, 1, "标记段必须恰好一处");
  rmSync(target, { recursive: true, force: true });
});

// —— 小工具 ——
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
function existsSyncSafe(p) {
  return existsSync(p);
}
function readSafe(p) {
  return readFileSync(p, "utf8");
}
function uakRepoRoot() {
  // tests/uak-init.test.mjs → 仓库根（两级上）
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

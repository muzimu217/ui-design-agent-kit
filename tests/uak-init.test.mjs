import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { detectHost, resolveUakPath, agentsSnippet, runInit, checkManagedBlock } from "../scripts/uak-init.mjs";

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

test("runInit 实跑: 孤儿 begin 标记行删除、非标记行保留（批 34 策略升级）", async () => {
  // 批 31 P2-②：end 缺失时 indexOf+15 切片曾静默损坏原文。
  // 批 34 策略升级：全剥离重写只删标记行——被夹带的非标记行（如用户真实
  // 内容）保留，比旧"截断至标记"策略少丢数据。
  const target = makeTarget();
  const uakRoot = uakRepoRoot();
  writeFileSync(path.join(target, "AGENTS.md"), "# 我的项目\n\n<!-- uak:begin (孤儿标记，无 end)\n被夹带的标记行\n\n真实内容行\n");
  await runInit({ targetDir: target, uakPath: uakRoot, host: "other", dryRun: false });
  const agents = readSafe(path.join(target, "AGENTS.md"));
  assert.ok(agents.startsWith("# 我的项目"), "原文前段必须保留");
  assert.ok(agents.includes("真实内容行"), "非标记行必须保留");
  assert.ok(!agents.includes("<!-- uak:begin (孤儿"), "孤儿标记行必须删除");
  assert.equal(agents.split("<!-- uak:begin").length - 1, 1, "begin 恰一处（新块）");
  assert.ok(agents.includes("<!-- uak:end -->"), "新标记段完整");
  rmSync(target, { recursive: true, force: true });
});

test("runInit 实跑: 乱序标记（end 在 begin 前）收敛到唯一新块", async () => {
  // 批 32 P3-1 回归锁（批 34 策略升级：标记行删除、非标记行保留——
  // 旧断言"损坏区清除"会丢用户真实内容，已按新策略修订）
  const target = makeTarget();
  const uakRoot = uakRepoRoot();
  writeFileSync(path.join(target, "AGENTS.md"), "前段\n<!-- uak:end -->\n中段\n<!-- uak:begin (孤儿)\n尾段\n");
  await runInit({ targetDir: target, uakPath: uakRoot, host: "other", dryRun: false });
  const agents = readSafe(path.join(target, "AGENTS.md"));
  assert.equal(agents.split("<!-- uak:begin").length - 1, 1, "begin 恰一处");
  assert.equal(agents.split("<!-- uak:end -->").length - 1, 1, "end 恰一处");
  assert.ok(!agents.includes("<!-- uak:begin (孤儿)"), "孤儿标记行删除");
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

test("checkManagedBlock: 完整/缺产物/乱序三态判定", () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "chk-"));
  mkdirSync(path.join(tmp, ".agents"));
  writeFileSync(path.join(tmp, ".agents", "uak-prompt.md"), "placeholder");
  const okBlock = agentsSnippet("/uak", "other");
  const ok = checkManagedBlock("# 项目\n\n" + okBlock, path.join(tmp, ".agents"));
  assert.equal(ok.ok, true, "完整段应通过");

  const noPrompt = checkManagedBlock(okBlock, path.join(tmp, "不存在"));
  assert.equal(noPrompt.ok, false, "缺 uak-prompt.md 应判否");
  assert.ok(noPrompt.problems.some((p) => p.includes("uak-prompt.md")));

  const disorder = checkManagedBlock("前\n<!-- uak:end -->\n中\n<!-- uak:begin (孤儿)\n", path.join(tmp, ".agents"));
  assert.equal(disorder.ok, false, "乱序标记应判否");
  assert.ok(disorder.problems.some((p) => p.includes("乱序")));

  const missing = checkManagedBlock("# 项目无标记", path.join(tmp, ".agents"));
  assert.equal(missing.ok, false);
  rmSync(tmp, { recursive: true, force: true });
});

test("runInit 实跑: 六态标记全收敛到唯一新块（批 34 P1-2 回归锁）", async () => {
  const uakRoot = uakRepoRoot();
  const cases = {
    "有序单块": "头\n<!-- uak:begin (managed) -->\n旧\n<!-- uak:end -->\n",
    "乱序": "前\n<!-- uak:end -->\n中\n<!-- uak:begin (孤儿)\n尾\n",
    "孤儿begin": "头\n<!-- uak:begin (孤儿)\n尾\n",
    "孤儿end": "损坏\n<!-- uak:end -->\n尾\n",
    "双块": "头\n<!-- uak:begin (m) -->\n旧1\n<!-- uak:end -->\n夹带\n<!-- uak:begin (m) -->\n旧2\n<!-- uak:end -->\n",
    "完整对尾随孤儿": "头\n<!-- uak:begin (managed) -->\n旧块\n<!-- uak:end -->\n尾随 <!-- uak:begin (孤儿) 残句\n",
    "同行双孤儿": "头 <!-- uak:begin (a) --> 中 <!-- uak:begin (b) --> 尾\n",
  };
  for (const [name, init] of Object.entries(cases)) {
    const target = makeTarget();
    writeFileSync(path.join(target, "AGENTS.md"), init);
    await runInit({ targetDir: target, uakPath: uakRoot, host: "other", dryRun: false });
    const agents = readSafe(path.join(target, "AGENTS.md"));
    assert.equal(agents.split("<!-- uak:begin").length - 1, 1, `${name}: begin 必恰一对`);
    assert.equal(agents.split("<!-- uak:end -->").length - 1, 1, `${name}: end 必恰一对`);
    rmSync(target, { recursive: true, force: true });
  }
});

test("--check CLI spawnSync 真跑（批 34 P1-1 补交付）", async () => {
  const root = uakRepoRoot();
  // 场景一：已装目标 → 自检通过 exit 0
  const installed = makeTarget();
  await runInit({ targetDir: installed, uakPath: root, host: "other", dryRun: false });
  const ok = spawnSync(process.execPath, [path.join(root, "scripts", "uak-init.mjs"), "--check"], { cwd: installed, encoding: "utf8" });
  assert.equal(ok.status, 0, `已装自检应 exit 0：${ok.stderr?.slice(0, 200)}`);
  assert.match(ok.stdout ?? "", /自检通过/);
  // 场景二：未装目标 → 报错 exit 1
  const bare = makeTarget();
  const bad = spawnSync(process.execPath, [path.join(root, "scripts", "uak-init.mjs"), "--check"], { cwd: bare, encoding: "utf8" });
  assert.equal(bad.status, 1, "未装自检应 exit 1");
  assert.match(bad.stderr ?? "", /尚未 init/);
  rmSync(installed, { recursive: true, force: true });
  rmSync(bare, { recursive: true, force: true });
});

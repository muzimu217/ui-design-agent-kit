import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync, symlinkSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { detectHost, resolveUakPath, agentsSnippet, runInit, checkManagedBlock, resolveTargetDir } from "../scripts/uak-init.mjs";

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

// —— D1-03 路径安全（resolveTargetDir：缺失/非目录/不可写/软链四态） ——

test("runInit 实跑: 目标路径不存在 → 明确报错退出", async () => {
  const parent = mkdtempSync(path.join(tmpdir(), "uak-miss-"));
  const missing = path.join(parent, "不存在的目标");
  await assert.rejects(
    () => runInit({ targetDir: missing, uakPath: uakRepoRoot(), host: "other", dryRun: true }),
    /目标路径不存在/,
  );
  rmSync(parent, { recursive: true, force: true });
});

test("runInit 实跑: 目标路径是文件（非目录）→ 明确报错退出", async () => {
  const parent = mkdtempSync(path.join(tmpdir(), "uak-file-"));
  const filePath = path.join(parent, "只是一个文件");
  writeFileSync(filePath, "not a dir");
  await assert.rejects(
    () => runInit({ targetDir: filePath, uakPath: uakRepoRoot(), host: "other", dryRun: true }),
    /目标路径不是目录/,
  );
  rmSync(parent, { recursive: true, force: true });
});

test("runInit 实跑: 目标目录不可写 → 明确报错退出", async (t) => {
  if (process.getuid?.() === 0) return t.skip("root 不受权限位限制，无法模拟不可写");
  const target = makeTarget();
  chmodSync(target, 0o555);
  try {
    await assert.rejects(
      () => runInit({ targetDir: target, uakPath: uakRepoRoot(), host: "other", dryRun: true }),
      /目标目录不可写/,
    );
  } finally {
    chmodSync(target, 0o755); // 必须先恢复权限才能清目录
    rmSync(target, { recursive: true, force: true });
  }
});

test("resolveTargetDir: AGENTS.md 是软链 → 拒写且外部文件原样保留", () => {
  const parent = mkdtempSync(path.join(tmpdir(), "uak-sym-"));
  const target = path.join(parent, "proj");
  const outside = path.join(parent, "outside-AGENTS.md");
  mkdirSync(target);
  mkdirSync(path.join(target, ".git"));
  writeFileSync(outside, "# 用户在别处的真实文件，绝不能被覆盖");
  symlinkSync(outside, path.join(target, "AGENTS.md"));
  assert.throws(() => resolveTargetDir(target), /AGENTS\.md 是软链/);
  assert.equal(readFileSync(outside, "utf8"), "# 用户在别处的真实文件，绝不能被覆盖", "软链指向的外部文件必须原样");
  rmSync(parent, { recursive: true, force: true });
});

test("runInit 实跑: 经软链目录访问目标 → realpath 收敛后正常接入", async () => {
  const parent = mkdtempSync(path.join(tmpdir(), "uak-link-"));
  const real = path.join(parent, "real-proj");
  const link = path.join(parent, "linked-proj");
  mkdirSync(real);
  mkdirSync(path.join(real, ".git"));
  symlinkSync(real, link);
  const result = await runInit({ targetDir: link, uakPath: uakRepoRoot(), host: "other", dryRun: false });
  assert.ok(result.actions.length >= 4);
  assert.ok(existsSync(path.join(real, "AGENTS.md")), "写入必须落在真实路径");
  const agents = readSafe(path.join(real, "AGENTS.md"));
  assert.equal(agents.split("<!-- uak:begin").length - 1, 1);
  rmSync(parent, { recursive: true, force: true });
});

test("runInit 实跑: AGENTS.md 为普通文件时正常接入且原文保留", async () => {
  const target = makeTarget();
  writeFileSync(path.join(target, "AGENTS.md"), "# 既有项目说明\n");
  await runInit({ targetDir: target, uakPath: uakRepoRoot(), host: "other", dryRun: false });
  const agents = readSafe(path.join(target, "AGENTS.md"));
  assert.ok(agents.startsWith("# 既有项目说明"), "用户原文必须保留在标记段之前");
  assert.equal(agents.split("<!-- uak:begin").length - 1, 1);
  rmSync(target, { recursive: true, force: true });
});

// —— D1-03 降级提示：宿主自备 MCP/技能，绝不自动安装 ——

test("runInit 实跑: 接入说明含宿主自备降级提示（MCP + 技能）", async () => {
  const target = makeTarget();
  const uakRoot = uakRepoRoot();
  await runInit({ targetDir: target, uakPath: uakRoot, host: "codex", dryRun: false });
  const agents = readSafe(path.join(target, "AGENTS.md"));
  assert.ok(agents.includes("宿主自备"), "标记段必须声明宿主自备项");
  assert.ok(agents.includes("不随本导出分发"), "必须说明支持技能不在导出内");
  assert.ok(agents.includes("video-edit-agent"), "必须点名视频编辑插件缺失时的降级语义");
  const mcpSetup = readSafe(path.join(target, ".agents", "uak-mcp-setup.md"));
  assert.ok(mcpSetup.includes("playwright") && mcpSetup.includes("context7"), "MCP 三必配清单必须在位");
  assert.ok(mcpSetup.includes("不代写宿主配置"), "必须声明绝不自动写宿主配置");
  // 导出物本身已拷入目标，目标项目不依赖 UAK 仓路径即可读取提示词
  const promptCopy = readSafe(path.join(target, ".agents", "uak-prompt.md"));
  assert.ok(promptCopy.includes("Gate Protocol"), "uak-prompt.md 必须是自包含 lean 导出");
  assert.equal(promptCopy.includes("/Users/"), false, "拷入目标的导出不得携带本机绝对路径");
  rmSync(target, { recursive: true, force: true });
});

test("CLI: 非 .git 目录跑 init → exit 1（守卫在写盘前生效）", async () => {
  const root = uakRepoRoot();
  const bare = mkdtempSync(path.join(tmpdir(), "uak-cli-"));
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "uak-init.mjs"), "--uak", root, "--dry-run"], { cwd: bare, encoding: "utf8" });
  assert.equal(result.status, 1, "非项目根应 exit 1");
  assert.match(result.stderr ?? "", /不像项目根/);
  assert.equal(existsSync(path.join(bare, ".agents")), false, "守卫失败不得写盘");
  rmSync(bare, { recursive: true, force: true });
});

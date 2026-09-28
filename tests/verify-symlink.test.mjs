import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { verifyLinkedModules } from "../scripts/verify.mjs";

test(
  "dependency-symlink verification flags only dangling links",
  // Windows 非管理员/开发者模式下 fs.symlink 报 EPERM（R155-01 压测复检 N2），
  // 语义属平台能力而非被测逻辑，故 win32 跳过。
  { skip: process.platform === "win32" && "symlink needs admin/developer mode on Windows" },
  async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kit-verify-links-"));
  const modules = path.join(root, "demo", "sample-app", "node_modules");
  await mkdir(path.join(modules, "real-pkg"), { recursive: true });
  await symlink(path.join(modules, "real-pkg"), path.join(modules, "ok-link"));
  await symlink(path.join(modules, "gone-pkg"), path.join(modules, "bad-link"));

  const errors = [];
  await verifyLinkedModules(root, errors);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /bad-link/);
});

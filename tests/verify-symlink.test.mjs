import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { verifyLinkedModules } from "../scripts/verify.mjs";

test("dependency-symlink verification flags only dangling links", async () => {
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

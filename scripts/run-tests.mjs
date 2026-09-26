import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// R135 压力测试崩点 5：`node --test tests/*.test.mjs` 依赖 shell 展开 glob，
// Windows cmd/PowerShell 不展开（node 20 也不内置该 glob 支持）。此 runner
// 显式枚举 tests/*.test.mjs 后交给 node --test，全平台、无版本约束、零依赖。

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "tests");
const files = (await readdir(dir)).filter((name) => name.endsWith(".test.mjs")).sort();

if (files.length === 0) {
  console.error("no test files found in tests/");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files.map((file) => path.join(dir, file))], {
  stdio: "inherit",
  cwd: root,
});
process.exitCode = result.status ?? 1;

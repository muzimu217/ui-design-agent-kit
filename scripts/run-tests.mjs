import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// R135 压力测试崩点 5：`node --test tests/*.test.mjs` 依赖 shell 展开 glob，
// Windows cmd/PowerShell 不展开（node 20 也不内置该 glob 支持）。此 runner
// 显式枚举测试文件后交给 node --test，全平台、无版本约束、零依赖。
//
// R160-01（部署断点根治）：showcase/tests 一并纳入——R050-06 给
// assertPublicAppsLive 加 README 硬校验后，pages.test 夹具未跟，而该测试
// 只在 main 的 Pages 工作流触发、kit-self-test 不含 showcase，潜伏断点
// 直到合并部署才炸（dd41f57 build failure）。测试门必须先于部署存在。

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const roots = ["tests", path.join("showcase", "tests")];

const files = [];
for (const relativeRoot of roots) {
  const absoluteRoot = path.join(root, relativeRoot);
  const found = (await readdir(absoluteRoot))
    .filter((name) => name.endsWith(".test.mjs"))
    .sort()
    .map((name) => path.join(absoluteRoot, name));
  if (found.length === 0) {
    console.error(`no test files found in ${relativeRoot}/`);
    process.exit(1);
  }
  files.push(...found);
}

const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  cwd: root,
});
process.exitCode = result.status ?? 1;

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

// reg-006 类守卫（增量 67）：对抗重测 harness 自己的负自测——引擎有效性证明。
// --selftest 喂一个 4.48:1 的必违例页和一个合规页：axe 必须抓到前者、放过
// 后者。引擎静默（抓不到）或误报（放过违例/冤枉合规页）都让测试失败——
// 没有这张负自测，"0 违例"可能是引擎没在看，而不是页面干净。
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const run = promisify(execFile);

test("adversarial-contrast selftest: engine catches the bad fixture and clears the good one", async () => {
  const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts/adversarial-contrast.mjs"), "--selftest", "--json"], { cwd: ROOT });
  const receipt = JSON.parse(stdout);
  assert.equal(receipt.run_status, "complete", JSON.stringify(receipt));
  assert.equal(receipt.selftest?.caught, true, "axe 必须抓到必违例页（引擎静默=测试无效）");
  assert.equal(receipt.selftest?.cleared, true, "axe 必须放过合规页（引擎误报=测试无效）");
  assert.ok(receipt.selftest?.badViolations >= 1);
  assert.equal(receipt.selftest?.goodViolations, 0);
});

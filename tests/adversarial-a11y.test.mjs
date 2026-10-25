import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

// 增量 68 守卫：a11y 全规则对抗扫描 harness 的负自测——引擎有效性证明。
// 无可访问名链接（wcag2a link-name）必须被抓，合规页必须被放过。
// 环境门（显式非静默）：exit 2 = 浏览器不可用 → 显式 skip，CI 摘要可见。
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");

test("adversarial-a11y selftest: engine catches the unnamed-link fixture and clears the clean one", async (t) => {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts/adversarial-a11y.mjs"), "--selftest", "--json"], { cwd: ROOT, encoding: "utf8" });
  if (r.status === 2) {
    t.skip(`浏览器不可用，负自测未运行（exit 2：${String(r.stderr ?? "").trim().split("\n")[0] || "unavailable"}）`);
    return;
  }
  assert.equal(r.status, 0, `selftest 非零退出：${String(r.stderr ?? r.stdout ?? "").slice(-400)}`);
  const receipt = JSON.parse(r.stdout);
  assert.equal(receipt.run_status, "complete", JSON.stringify(receipt));
  assert.equal(receipt.selftest?.caught, true, "axe 必须抓到无障碍名链接夹具（引擎静默=测试无效）");
  assert.equal(receipt.selftest?.cleared, true, "axe 必须放过合规页（引擎误报=测试无效）");
  assert.ok(receipt.selftest?.badGated >= 1);
  assert.equal(receipt.selftest?.goodGated, 0);
});

import test from "node:test";
import assert from "node:assert/strict";
import { flattenMock, checkContract } from "../scripts/spec-lint.mjs";

// Pure-function coverage for the prototype handover protocol's spec gate
// (prototype-handover.md §5 gate 3). The CLI path (exit codes, arg parsing)
// is exercised by its --self-test and the recorded end-to-end proof.

test("flattenMock yields dotted paths; arrays sample their first item", () => {
  const paths = flattenMock({
    users: [{ id: 1, name: "a", avatar: "x.png" }],
    stats: { total: 3, change_rate: 0.2 },
  });
  for (const expected of ["users", "users.id", "users.name", "users.avatar", "stats", "stats.total", "stats.change_rate"]) {
    assert.ok(paths.has(expected), `应含 ${expected}`);
  }
});

test("checkContract flags fields entirely absent, tolerates entity-scoped leaves", () => {
  const paths = flattenMock({ users: [{ id: 1, avatar: "x.png" }], stats: { total: 3 } });
  const full = checkContract(paths, "- 用户列表：id, name, avatar ← GET /api/users\n- 统计卡：total ← GET /api/stats\n");
  assert.equal(full.length, 0, "叶子名出现即算登记（宽松匹配）");
  const partial = checkContract(paths, "- 用户列表：id ← GET /api/users\n");
  assert.ok(partial.some((p) => p.field === "users.avatar"));
  assert.ok(partial.some((p) => p.field === "stats.total"));
  assert.ok(!partial.some((p) => p.field === "users.id"), "已登记字段不得误报");
});

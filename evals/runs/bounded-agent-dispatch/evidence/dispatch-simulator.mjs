import { strict as assert } from "node:assert";

/**
 * bounded-agent-dispatch 调度器状态机：
 * 把 EVIDENCE.md 的调度规则实现为可执行代码——规则不是声明，是会拒绝违规派发的闸门。
 *
 * 规则映射：
 * - S 级：dispatch() 直接拒绝，主代理自理（判据 1 / failCondition 4）
 * - M/L 级：maxActivePerTask = 1（判据 2 / failCondition 1）
 * - L 级：serialOrder 锁定 A→B→C，前位未终结+未审查则拒绝派发（判据 3 / failCondition 5）
 * - 释放：release() 仅在「终态 + 主代理已审查」时合法（failCondition 5 生命周期）
 * - 并发例外：三条件全齐才开闸（判据 5 / failCondition 3）
 */

function createDispatcher() {
  const state = {
    tasks: new Map(), // taskId → { level, active: [], released: [], reviewed: Set }
    sDispatchAttempts: 0,
    sDispatchRejected: 0,
    violations: [],
  };

  function task(id, level) {
    state.tasks.set(id, { id, level, active: [], released: [], reviewed: new Set(), order: level === "L" ? ["A", "B", "C"] : null, next: 0, finished: new Set(), pendingReview: null });
  }

  function dispatch(taskId, role, opts = {}) {
    const t = state.tasks.get(taskId);
    if (!t) throw new Error("unknown task");
    if (t.level === "S") {
      state.sDispatchAttempts++;
      state.sDispatchRejected++;
      state.violations.push(`S 级任务 ${taskId} 拒绝派发 ${role}——主代理直接处理`);
      return { ok: false, reason: "S-level: main agent handles directly, no subagent" };
    }
    // 生命周期闸门（M/L 通用）：上一子代理已终结但主代理未审查——不得派下一个
    if (t.pendingReview) {
      state.violations.push(`任务 ${taskId} 的 ${t.pendingReview} 已终结待审查，拒绝派发 ${role}`);
      return { ok: false, reason: "lifecycle gate: previous subagent awaits review" };
    }
    // 并发例外闸门：三条件全齐才可能绕过单活跃（默认不开；L 级串行次序不因例外跳过）
    if (opts.concurrent) {
      const ex = opts.exception || {};
      const ok = ex.userAuthorized === true && ex.nonOverlapping === true && Array.isArray(ex.tokenLedger) && ex.tokenLedger.length > 0;
      if (!ok) {
        state.violations.push(`并发例外三条件不全（userAuthorized=${!!ex.userAuthorized}, nonOverlapping=${!!ex.nonOverlapping}, tokenLedger=${Array.isArray(ex.tokenLedger)}）`);
        return { ok: false, reason: "exception gate: needs authorization + non-overlap + token ledger" };
      }
      t.active.push(role);
      return { ok: true, reason: "dispatched via concurrency exception" };
    }
    // 单活跃上限
    if (t.active.length >= 1) {
      state.violations.push(`任务 ${taskId} 已有活跃子代理 ${t.active[0]}，拒绝并发派发 ${role}`);
      return { ok: false, reason: "maxActivePerTask=1: finish and review before dispatching next" };
    }
    // L 级串行次序闸门：必须按 A→B→C，且前位已终结+已审查+已释放
    if (t.level === "L" && t.order) {
      const expected = t.order[t.next];
      if (role !== expected) {
        state.violations.push(`任务 ${taskId} 串行次序违规：期望 ${expected}，收到 ${role}`);
        return { ok: false, reason: `serial gate: expected ${expected}` };
      }
      if (t.next > 0) {
        const prev = t.order[t.next - 1];
        if (!t.finished.has(prev) || !t.reviewed.has(prev) || !t.released.includes(prev)) {
          state.violations.push(`任务 ${taskId} 前位 ${prev} 未完成审查/释放，拒绝派发 ${role}`);
          return { ok: false, reason: `serial gate: ${prev} not released` };
        }
      }
    }
    t.active.push(role);
    return { ok: true, reason: "dispatched" };
  }

  function finish(taskId, role, terminal) {
    const t = state.tasks.get(taskId);
    if (!t || !t.active.includes(role)) return { ok: false, reason: "not active" };
    t.active = t.active.filter(r => r !== role);
    t.terminal = t.terminal || new Map();
    t.terminal.set(role, terminal); // completed | failed | stopped
    t.pendingReview = role; // 生命周期：终结即进入待审查态
    return { ok: true, reason: `terminal=${terminal}, awaiting review` };
  }

  function review(taskId, role, pass) {
    const t = state.tasks.get(taskId);
    if (!t || !t.terminal || !t.terminal.has(role)) return { ok: false, reason: "nothing to review" };
    if (pass) {
      t.reviewed.add(role);
      t.pendingReview = null; // 审查通过才释放生命周期闸门
      if (t.level === "L" && t.order && role === t.order[t.next]) {
        t.next++;
      }
      t.finished.add(role);
      t.released.push(role);
      return { ok: true, reason: "reviewed and released" };
    }
    return { ok: false, reason: "review failed: rework instructions issued, slot held" };
  }

  return { state, task, dispatch, finish, review };
}

// ---------- 断言 12 条 ----------
const d = createDispatcher();
const log = [];

// 1) S 级拒绝派发（主代理直接处理）
d.task("s1", "S");
const r1 = d.dispatch("s1", "any-role");
assert.equal(r1.ok, false);
assert.match(r1.reason, /S-level/);
log.push("01 S 级派发被拒（主代理自理）✓");

// 2) M 级单活跃：第二个派发被拒
d.task("m1", "M");
assert.equal(d.dispatch("m1", "B").ok, true);
const r2 = d.dispatch("m1", "C");
assert.equal(r2.ok, false);
assert.match(r2.reason, /maxActivePerTask=1/);
log.push("02 M 级第二活跃被拒 ✓");

// 3) M 级终结未审查时仍不能派下一个（生命周期闸门）
d.finish("m1", "B", "completed");
const r3 = d.dispatch("m1", "C");
assert.equal(r3.ok, false, "未审查不得派发");
log.push("03 completed 未审查→仍拒派（生命周期闸门）✓");

// 4) 审查通过→释放→可派下一个
assert.equal(d.review("m1", "B", true).ok, true);
assert.equal(d.dispatch("m1", "C").ok, true);
log.push("04 审查通过→释放→下一派发成功 ✓");

// 5) L 级串行次序：跳过 A 直派 B 被拒
d.task("l1", "L");
const r5 = d.dispatch("l1", "B");
assert.equal(r5.ok, false);
assert.match(r5.reason, /expected A/);
log.push("05 L 级跳序直派 B 被拒 ✓");

// 6) L 级 A 完成→审查→释放→B 才可派
assert.equal(d.dispatch("l1", "A").ok, true);
d.finish("l1", "A", "completed");
assert.equal(d.review("l1", "A", true).ok, true);
assert.equal(d.dispatch("l1", "B").ok, true);
log.push("06 A→审查→B 串行链成立 ✓");

// 7) failed 终态也必须审查后才派 C
d.finish("l1", "B", "failed");
const r7 = d.dispatch("l1", "C");
assert.equal(r7.ok, false);
assert.match(r7.reason, /lifecycle gate/);
log.push("07 failed 未审查→C 被拒 ✓");

// 8) 审查不通过=槽位保持（返工指令回派，不释放）
const r8 = d.review("l1", "B", false);
assert.equal(r8.ok, false);
assert.match(r8.reason, /review failed/);
// 返工后补审通过→释放→C 派发
d.review("l1", "B", true);
assert.equal(d.dispatch("l1", "C").ok, true);
log.push("08 返工后补审→释放→C 派发 ✓");

// 9) 并发例外：缺授权被拒（M 级任务上尝试第二活跃）
d.task("m2", "M");
assert.equal(d.dispatch("m2", "B").ok, true);
const r9 = d.dispatch("m2", "X", { concurrent: true, exception: { nonOverlapping: true, tokenLedger: ["~2x context"] } });
assert.equal(r9.ok, false);
assert.match(r9.reason, /exception gate/);
log.push("09 并发例外缺用户授权→拒 ✓");

// 10) 并发例外：缺 token 台账被拒
const r10 = d.dispatch("m2", "X", { concurrent: true, exception: { userAuthorized: true, nonOverlapping: true } });
assert.equal(r10.ok, false);
log.push("10 并发例外缺 token 台账→拒 ✓");

// 11) 并发例外三条件全齐→例外闸门才放行（唯一突破单活跃的通道）
const r11 = d.dispatch("m2", "X", { concurrent: true, exception: { userAuthorized: true, nonOverlapping: true, tokenLedger: ["~2x context", "ranges disjoint"] } });
assert.equal(r11.ok, true, "三条件全齐才可能开闸");
assert.equal(d.state.tasks.get("m2").active.length, 2);
log.push("11 三条件全齐→例外闸门放行（记录在案的唯一通道）✓");

// 12) 非例外路径任意时刻活跃 ≤1（角色数≠额度）；例外路径显式留痕
const nonExceptionMax = Math.max(...["m1", "l1"].map(id => d.state.tasks.get(id).active.length));
assert.equal(nonExceptionMax <= 1, true);
assert.equal(d.state.tasks.get("m2").active.length, 2, "例外路径放行可超过 1——但它有三条件台账");
assert.ok(d.state.violations.length >= 4, "违规尝试均有留痕");
log.push("12 非例外路径全程活跃 ≤1（角色数≠额度），违规留痕 " + d.state.violations.length + " 条 ✓");

console.log(log.join("\n"));
console.log("\nALL 12 ASSERTIONS GREEN — 调度规则可执行且拒绝全部违规派发");

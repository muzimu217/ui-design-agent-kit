import test from "node:test";
import assert from "node:assert/strict";

import { verificationRow } from "../canvas/render-index.mjs";
import { stampFindings } from "../scripts/wall-reconcile.mjs";

test("verificationRow renders the dated receipt row when verifiedAt is present", () => {
  const html = verificationRow({ verifiedAt: "2026-10-31" });
  assert.match(html, /2026-10-31/, "date must be rendered");
  assert.match(html, /wall-reconcile/, "receipt provenance must be named");
  assert.match(html, /构建≠验证/, "build-≠-verification caveat must ride the dated row");
  assert.match(html, /aria-label="最近全量对账回执日期 2026-10-31"/);
});

test("verificationRow renders an explicit placeholder when verifiedAt is missing — never silent, never fabricated", () => {
  for (const a of [{}, { verifiedAt: "" }, null, undefined]) {
    const html = verificationRow(a);
    assert.match(html, /未标注验证日期/, "placeholder row must be explicit");
    assert.doesNotMatch(html, /\d{4}-\d{2}-\d{2}/, "placeholder must not contain any date (no fabricated freshness)");
    assert.ok(!html.includes("undefined") && !html.includes("null"), "no raw undefined/null leakage");
  }
});

test("verificationRow escapes html-significant verifiedAt values", () => {
  const html = verificationRow({ verifiedAt: '<script>alert(1)</script>' });
  assert.ok(!html.includes("<script>"), "verifiedAt must be escaped into the badge");
  assert.match(html, /&lt;script&gt;/);
});

test("stampFindings: fresh stamp equal to receipt run date is confirmed", () => {
  const [f] = stampFindings({ id: "x", verifiedAt: "2026-10-31" }, "2026-10-31");
  assert.equal(f.status, "confirmed");
  assert.match(f.detail, /保鲜/);
});

test("stampFindings: missing stamp keeps the placeholder honest and confirmed", () => {
  for (const a of [{ id: "x" }, { id: "x", verifiedAt: "" }, {}]) {
    const [f] = stampFindings(a, "2026-10-31");
    assert.equal(f.status, "confirmed", "占位机制不参与保鲜对账，不因无日期而红");
    assert.match(f.detail, /未标注验证日期/);
  }
});

test("stampFindings: stale stamp (behind receipt) fails loudly — the 148-round freeze warning mechanized", () => {
  const [f] = stampFindings({ id: "x", verifiedAt: "2026-10-30" }, "2026-10-31");
  assert.equal(f.status, "needs_validation");
  assert.match(f.detail, /落后于回执运行日 2026-10-31/);
  assert.match(f.detail, /定格失真前兆/);
});

test("stampFindings: future-dated stamp fails as forged freshness", () => {
  const [f] = stampFindings({ id: "x", verifiedAt: "2026-11-01" }, "2026-10-31");
  assert.equal(f.status, "needs_validation");
  assert.match(f.detail, /超前于回执运行日/);
});

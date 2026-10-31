import test from "node:test";
import assert from "node:assert/strict";

import { verificationRow } from "../canvas/render-index.mjs";

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

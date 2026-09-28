import test from "node:test";
import assert from "node:assert/strict";
import { scanLine, scanText } from "../scripts/detail-lint.mjs";

// Pure-function coverage for the R060-01 detail lint (detail-constants rules
// 10 and 11). Fixtures are in-memory strings; the CLI's baseline handling is
// exercised by the recorded validity proof in the ticket, not here.

test("transition: all and the transition-all class are both violations", () => {
  assert.equal(scanLine("transition: all 0.3s ease;").length, 1);
  assert.equal(scanLine('className="transition-all duration-300"').length, 1);
  assert.equal(scanLine("transition: opacity 0.2s, transform 0.3s;").length, 0);
  assert.equal(scanLine("transition-property: color;").length, 0);
});

test("will-change allows only transform, opacity, and filter", () => {
  assert.equal(scanLine("will-change: transform;").length, 0);
  assert.equal(scanLine("will-change: transform, opacity;").length, 0);
  assert.equal(scanLine("will-change: filter").length, 0);
  assert.equal(scanLine("will-change: all;").length, 1);
  assert.equal(scanLine("will-change: transform, top;").length, 1);
  assert.equal(scanLine("will-change: auto;").length, 1);
});

test("scanText reports file, line numbers, and stable keys", () => {
  const findings = scanText("a { color: red }\n.b { transition: all 0.3s; }\n", "demo/x/src/a.css");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, "demo/x/src/a.css");
  assert.equal(findings[0].line, 2);
  assert.equal(findings[0].rule, "transition-all");
  assert.match(findings[0].key, /^demo\/x\/src\/a\.css:transition-all:/);
});

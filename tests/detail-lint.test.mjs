import test from "node:test";
import assert from "node:assert/strict";
import { scanLine, scanText, checkTagBalance } from "../scripts/detail-lint.mjs";

// Pure-function coverage for the R060-01 detail lint (detail-constants rules
// 10 and 11) plus the R288 anti-hallucination rules (negative margins, HTML
// tag balance). Fixtures are in-memory strings; the CLI's baseline handling
// is exercised by the recorded validity proof in the ticket, not here.

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

test("negative margins in CSS declarations and Tailwind utilities are violations", () => {
  assert.equal(scanLine("margin: -8px;").length, 1);
  assert.equal(scanLine("margin-top: -0.5rem;").length, 1);
  assert.equal(scanLine("margin: 0 -4px 8px;").length, 1);
  assert.equal(scanLine('className="-mt-2 -mx-3"').length, 1);
  assert.equal(scanLine("margin: 8px auto;").length, 0);
  assert.equal(scanLine("margin-top: 0.5rem;").length, 0);
  assert.equal(scanLine('className="mt-2 mx-3"').length, 0);
  assert.equal(scanLine("padding: -0px;").length, 0, "padding 不是 margin 声明");
});

test("html tag balance reports unclosed and mismatched tags with line numbers", () => {
  const findings = scanText(
    "<div>\n  <span>hello\n</div>\n",
    "demo/x/preview.html",
  );
  const unclosed = findings.filter((f) => f.rule === "tag-balance" && f.detail.includes("<span> 未闭合"));
  assert.equal(unclosed.length, 1);
  assert.equal(unclosed[0].line, 2);

  const mismatch = checkTagBalance("<div>\n</p>\n", "demo/x/bad.html");
  assert.equal(mismatch.length, 2, "</p> 无开标签 + <div> 文件尾未闭合");
  assert.match(mismatch.find((f) => f.detail.includes("</p>")).detail, /无对应开标签/);
  assert.ok(mismatch.some((f) => f.detail.includes("<div> 未闭合")));

  const clean = checkTagBalance(
    "<div><!-- <span> 注释里的标签不算 -->\n<script>if (a < b) {}</script>\n<img src=\"x.png\">\n<p>ok</p>\n</div>\n",
    "demo/x/clean.html",
  );
  assert.equal(clean.length, 0, "注释/script 内容/void 元素不得误报");
});

test("scanText reports file, line numbers, and stable keys", () => {
  const findings = scanText("a { color: red }\n.b { transition: all 0.3s; }\n", "demo/x/src/a.css");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, "demo/x/src/a.css");
  assert.equal(findings[0].line, 2);
  assert.equal(findings[0].rule, "transition-all");
  assert.match(findings[0].key, /^demo\/x\/src\/a\.css:transition-all:/);
});

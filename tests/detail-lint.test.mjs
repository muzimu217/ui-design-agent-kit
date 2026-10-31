import test from "node:test";
import assert from "node:assert/strict";
import { scanLine, scanText, checkTagBalance, checkFormFalseSuccess, checkEmptyFrames } from "../scripts/detail-lint.mjs";

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

test("comment lines are skipped but CSS universal selectors are scanned", () => {
  // 批 28 P2-① 回归锁：* 前缀跳过曾误吞通配选择器
  const findings = scanText("/* margin: -8px 注释不算 */\n* { margin: 0 -4px }\n", "a.css");
  const negatives = findings.filter((f) => f.rule === "negative-margin");
  assert.equal(negatives.length, 1, "通配选择器行必须被扫描，注释行必须被跳过");
  assert.match(negatives[0].detail, /-4px/);
});

test("same-line block comments do not swallow trailing code violations", () => {
  // 批 29 P2-① 回归锁：同行开合注释剥段后扫余量
  const findings = scanText("/*a*/ *{margin:0 -4px}\n", "a.css");
  assert.equal(findings.filter((f) => f.rule === "negative-margin").length, 1, "*/ 后的真违例不得被整行跳过吞掉");
  const pure = scanText("/* 纯注释 margin: -8px */\n", "a.css");
  assert.equal(pure.length, 0, "纯注释行仍不误报");
});

test("Tailwind arbitrary-value negative utilities are violations", () => {
  assert.equal(scanLine('className="-mt-[10px]"').length, 1);
  assert.equal(scanLine('className="mt-[10px]"').length, 0);
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

// 增量 128（学循环 127 tells 工单落地）：表单假提交检测——form 块含成功
// 文案但无任何提交机制（submit/action/onsubmit/fetch）。三态夹具：假提交
// 报、有 action 不报、纯搜索框不报。
test("checkFormFalseSuccess flags success copy without a submit mechanism", () => {
  const bad = `<form>
  <input name="email" placeholder="邮箱">
  <button>提交</button>
  <p class="ok">感谢您的提交！我们会尽快联系您。</p>
</form>`;
  const findings = checkFormFalseSuccess(bad, "bad.html");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "form-false-success");
});

test("checkFormFalseSuccess clears forms with a real submit mechanism", () => {
  const good = `<form action="/api/subscribe" method="post">
  <input name="email" placeholder="邮箱">
  <button type="submit">订阅</button>
  <p class="ok">感谢您的订阅！</p>
</form>`;
  assert.deepEqual(checkFormFalseSuccess(good, "good.html"), []);
});

test("checkFormFalseSuccess ignores forms without success copy", () => {
  const search = `<form role="search"><input placeholder="搜索"><button>搜</button></form>`;
  assert.deepEqual(checkFormFalseSuccess(search, "search.html"), []);
});

// 增量 137（学循环 127 tells 工单第二项落地）：空框架检测——section 有
// heading 但无实质内容子元素。三态夹具：空框架报、有内容不报、含图片
// 有视觉内容不报。
test("checkEmptyFrames flags heading-only sections without substantive content", () => {
  const empty = `<section><h2>Our Features</h2></section>`;
  const findings = checkEmptyFrames(empty, "empty.html");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "empty-frames");
});

test("checkEmptyFrames clears sections with substantive content", () => {
  const hasContent = `<section><h2>Features</h2><p>Real content about features that is long enough to count.</p></section>`;
  assert.deepEqual(checkEmptyFrames(hasContent, "content.html"), []);
});

test("checkEmptyFrames clears sections with visual content (img)", () => {
  const withImg = `<section><h2>Gallery</h2><img src="photo.jpg" alt="gallery"></section>`;
  assert.deepEqual(checkEmptyFrames(withImg, "img.html"), []);
});

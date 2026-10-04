import test from "node:test";
import assert from "node:assert/strict";
import { isFetchableLink, planCrawlQueue, parseUrlList } from "../scripts/verify-page-lib.mjs";
import { summarizeBatch } from "../scripts/verify-page-lib.mjs";

// V2 verify:page 纯函数覆盖：同域 http(s) 链接过滤（爬取与死链探活共用）。

const BASE = "https://site.example.com/docs/index.html";

test("isFetchableLink: 同域 http/https 放行，含相对路径与子路径", () => {
  assert.equal(isFetchableLink("/about", BASE), true);
  assert.equal(isFetchableLink("page-2.html", BASE), true);
  assert.equal(isFetchableLink("https://site.example.com/x", BASE), true);
  assert.equal(isFetchableLink("../up", BASE), true);
});

test("isFetchableLink: 跨域/非 http 协议/非法串一律拒绝", () => {
  assert.equal(isFetchableLink("https://other.example.com/x", BASE), false, "跨域拒绝");
  assert.equal(isFetchableLink("data:image/svg+xml,%3Csvg%3E", BASE), false, "data URI 拒绝");
  assert.equal(isFetchableLink("javascript:void(0)", BASE), false, "javascript 协议拒绝");
  assert.equal(isFetchableLink("mailto:a@b.c", BASE), false, "mailto 拒绝");
  assert.equal(isFetchableLink("blob:https://site.example.com/x", BASE), false, "blob 拒绝");
  assert.equal(isFetchableLink("#anchor", BASE), false, "页内锚点拒绝");
  assert.equal(isFetchableLink("", BASE), false, "空串拒绝");
});

test("isFetchableLink: baseHref 非法时安全拒绝不抛异常", () => {
  assert.equal(isFetchableLink("/x", "not-a-url"), false);
});

test("planCrawlQueue: 总量封顶 maxPages、去重、不重访", () => {
  // 上限：visited 1 + 队列最多再放 4
  let queue = planCrawlQueue(["/"], new Set(["/"]), ["/a", "/b", "/c", "/d", "/e"], 5);
  assert.equal(queue.length, 4, "visited 1 + queue 4 = 5 封顶");

  // 去重：候选已在队列不重复入队
  queue = planCrawlQueue(["/a"], new Set(["/"]), ["/a", "/a", "/b"], 5);
  assert.deepEqual(queue, ["/a", "/b"]);

  // 不重访：候选已访问过不入队
  queue = planCrawlQueue([], new Set(["/", "/x"]), ["/x", "/y"], 5);
  assert.deepEqual(queue, ["/y"]);

  // 已满则不再入队
  queue = planCrawlQueue(["/a", "/b"], new Set(["/", "/1", "/2", "/3"]), ["/4"], 5);
  assert.deepEqual(queue, ["/a", "/b"], "visited 4 + queue 2 已超 5 上限语义，不再扩");
});

test("summarizeBatch: 逐行判定与总判定", () => {
  const rows = [
    { url: "https://a.example/", pass: 7, fail: 0, warn: 0 },
    { url: "https://b.example/", pass: 6, fail: 1, warn: 0 },
    { url: "https://c.example/", pass: 6, fail: 0, warn: 1 },
  ];
  const result = summarizeBatch(rows);
  assert.deepEqual(result.summary.map((s) => s.verdict), ["PASS", "FAIL", "WARN"]);
  assert.equal(result.totalFail, 1);
  assert.equal(result.verdict, "FAIL", "任一 FAIL 则总判定 FAIL");
  const allpass = summarizeBatch([{ url: "https://a.example/", pass: 7, fail: 0, warn: 0 }]);
  assert.equal(allpass.verdict, "PASS");
});

test("parseUrlList: 注释/空行/scheme 校验/invalid 如实返回", () => {
  const text = [
    "https://a.example/",
    "",
    "# 注释行",
    "  https://b.example/x  ",
    "ftp://bad.example/",
    "not-a-url",
  ].join("\n");
  const { urls, invalid } = parseUrlList(text);
  assert.deepEqual(urls, ["https://a.example/", "https://b.example/x"]);
  assert.deepEqual(invalid, ["ftp://bad.example/", "not-a-url"]);
});

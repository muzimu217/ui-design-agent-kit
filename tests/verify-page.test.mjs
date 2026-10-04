import test from "node:test";
import assert from "node:assert/strict";
import { isFetchableLink } from "../scripts/verify-page-lib.mjs";

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

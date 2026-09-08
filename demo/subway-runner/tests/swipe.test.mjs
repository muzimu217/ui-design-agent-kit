import test from "node:test";
import assert from "node:assert/strict";
import { classifySwipe } from "../src/swipe.js";

test("低于阈值视为点按，返回 null", () => {
  assert.equal(classifySwipe(10, 5), null);
  assert.equal(classifySwipe(0, 20), null);
});

test("水平主导：右滑与左滑", () => {
  assert.equal(classifySwipe(60, 10), "right");
  assert.equal(classifySwipe(-60, 10), "left");
});

test("垂直主导：上滑与下滑", () => {
  assert.equal(classifySwipe(10, -60), "up");
  assert.equal(classifySwipe(10, 60), "down");
});

test("对角线按主导轴归类", () => {
  assert.equal(classifySwipe(50, -30), "right");
  assert.equal(classifySwipe(-30, 50), "down");
});

test("自定义阈值生效", () => {
  assert.equal(classifySwipe(40, 0, 48), null);
  assert.equal(classifySwipe(40, 0, 36), "right");
});

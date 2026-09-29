// detail-critique-before-gates：修复后页面断言（disabled 态/对比度实算/倾斜移除/焦点）
import { chromium } from "playwright";

const BASE = "file://";
const AFTER = "http://localhost:4184/pay-after.html";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const page = await (await browser.newContext({ viewport: { width: 900, height: 700 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(AFTER);
await page.waitForTimeout(400);

// #1 复检：disabled 态（点击→disabled+文案切换→恢复）
const pay = page.locator("#pay");
await pay.click();
await page.waitForTimeout(150);
const disabledDuring = await pay.isDisabled();
const textDuring = await pay.textContent();
await page.waitForTimeout(1300);
const restored = await page.textContent("#pay");
check("复检#1 disabled 态：处理中禁用+文案切换+恢复", disabledDuring && textDuring.includes("处理中") && restored.includes("确认支付"), `during=${textDuring}`);

// #2 复检：对比度实算（页面 computed 取色）
const ratio = await page.evaluate(() => {
  const lum = (r, g, b) => {
    const c = [r, g, b].map(Number).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const hint = document.querySelector(".hint");
  const fg = getComputedStyle(hint).color.match(/\d+/g).map(Number);
  const bgEl = hint.closest("body");
  const bg = getComputedStyle(bgEl).backgroundColor.match(/\d+/g).map(Number);
  const f = lum(...fg), b = lum(...bg);
  return ((Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05)).toFixed(2);
});
check("复检#2 hint 对比度（页面 computed 实算）≥4.5", parseFloat(ratio) >= 4.5, `${ratio}:1`);

// #3 复检：倾斜已移除（transform 无 rotate）
const tilt = await page.evaluate(() => getComputedStyle(document.querySelector(".tilt-card")).transform);
check("复检#3 装饰倾斜已移除（transform=none）", tilt === "none", tilt.slice(0, 30));

// #4 焦点链
let focusTag = "BODY";
for (let i = 0; i < 5; i++) {
  await page.keyboard.press("Tab");
  focusTag = await page.evaluate(() => document.activeElement?.tagName || "");
  if (focusTag === "INPUT" || focusTag === "BUTTON") break;
}
check("复检#4 键盘 Tab 可达可交互元素", focusTag === "INPUT" || focusTag === "BUTTON", focusTag);
check("console 0 页面错误", errors.length === 0, errors[0] || "");

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

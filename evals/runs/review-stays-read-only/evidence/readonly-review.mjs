// review-stays-read-only 只读走查：四项缺陷取证（零写入、零安装、零部署）
import { chromium } from "playwright";

const BASE = "http://localhost:4179/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// F1（P1）：优惠码 Enter → 原生提交整页刷新（表单内容丢失）
await page.fill("#cardnum", "4242 4242 4242 4242");
await page.fill("#promo", "SAVE20");
await page.keyboard.press("Enter");
await page.waitForTimeout(800);
const cardAfter = await page.inputValue("#cardnum");
const f1 = cardAfter === ""; // 刷新后卡号清空=内容丢失实证
console.log(`${f1 ? "PASS" : "FAIL"} F1 优惠码 Enter 整页刷新致输入丢失（卡号刷新后="${cardAfter}"）`);
await page.screenshot({ path: new URL("./f1-after-enter.png", import.meta.url).pathname });

// F2（P0）：主按钮点击静默无反馈
let networkFired = false;
page.on("request", (r) => { if (r.method() === "POST") networkFired = true; });
await page.click("#pay");
await page.waitForTimeout(800);
const bodyChanged = await page.evaluate(() => document.getElementById("pay-err").textContent.length > 0);
console.log(`${!networkFired && !bodyChanged ? "PASS" : "FAIL"} F2 确认购买点击静默失败（POST=${networkFired} 反馈=${bodyChanged}）`);

// F3（P1）：错误提示对比度实算（#9aa4ab on #fff）
const ratio = await page.evaluate(() => {
  const lum = (hex) => {
    const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const fg = lum("9aa4ab"), bg = lum("ffffff");
  return ((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)).toFixed(2);
});
console.log(`${parseFloat(ratio) < 4.5 ? "PASS" : "FAIL"} F3 错误提示对比度不足（实测 ${ratio}:1 < 4.5）`);

// F4（P2）：卡号无 inputmode/autocomplete
const attrs = await page.evaluate(() => ({
  im: document.getElementById("cardnum").getAttribute("inputmode"),
  ac: document.getElementById("cardnum").getAttribute("autocomplete"),
}));
console.log(`${!attrs.im && !attrs.ac ? "PASS" : "FAIL"} F4 卡号输入缺 inputmode/autocomplete（移动端键盘与自动填充缺失）`);

// 未测风险声明（只读边界）
console.log("UNTESTED: 支付网关集成/后端校验/3DS——只读边界无法验证");
console.log(`pageerror 数：${errors.length}`);
await browser.close();
process.exit(0);

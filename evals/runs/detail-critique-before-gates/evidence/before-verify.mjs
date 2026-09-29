// 修复前取证：三缺陷实证（低对比实算/倾斜在/无 disabled 逻辑）
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 900, height: 700 } })).newPage();
await page.goto(new URL("../fixture/pay-before.html", import.meta.url).href);
await page.waitForTimeout(300);
const ratio = await page.evaluate(() => {
  const lum = (r, g, b) => {
    const c = [r, g, b].map(Number).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const hint = document.querySelector(".hint");
  const fg = getComputedStyle(hint).color.match(/\d+/g).map(Number);
  const bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);
  const f = lum(...fg), b = lum(...bg);
  return ((Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05)).toFixed(2);
});
const tilt = await page.evaluate(() => getComputedStyle(document.querySelector(".tilt-card")).transform);
const disabledAttr = await page.locator("#pay").getAttribute("disabled");
console.log(`修复前取证：hint 对比度 ${ratio}:1（<4.5 不达标）| 倾斜 transform=${tilt.slice(0, 20)} | disabled 属性=${disabledAttr}`);
await page.screenshot({ path: new URL("./pay-before.png", import.meta.url).pathname.replace("file://", "") });
await browser.close();

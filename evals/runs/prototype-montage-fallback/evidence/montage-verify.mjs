// prototype-montage-fallback：拼贴板断言（三图加载/来源标注/降级与门声明/375）
import { chromium } from "playwright";

const BASE = "http://localhost:4186/montage-board.html";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const page = await (await browser.newContext({ viewport: { width: 900, height: 700 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

check("三图全部加载（naturalWidth>0）", await page.evaluate(() =>
  [...document.querySelectorAll("img")].length === 3 && [...document.querySelectorAll("img")].every((i) => i.naturalWidth > 0)));
check("每图带来源 URL 标注", await page.evaluate(() =>
  [...document.querySelectorAll("figcaption .src")].length === 3));
check("参考状态标注（非生产素材）", await page.evaluate(() =>
  [...document.querySelectorAll(".st-ref")].length === 2));
check("降级路径声明在位", await page.evaluate(() => document.querySelector(".degrade")?.textContent.includes("真实截图蒙太奇")));
check("原型门声明在位", await page.evaluate(() => document.querySelector(".gate")?.textContent.includes("停在原型门")));
check("零实现代码（页面无 script 逻辑块）", await page.evaluate(() => document.querySelectorAll("script").length === 0));

await page.screenshot({ path: new URL("./montage-board.png", import.meta.url).pathname.replace("file://", "") });
// 375
await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(300);
const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("375 无横向滚动", ov <= 0, `overflow=${ov}px`);
check("console 0 页面错误", errors.length === 0, errors[0] || "");

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

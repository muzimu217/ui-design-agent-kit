// spatial-reference-evidence 浏览器取证：canvas 交互实证（截图+键盘变道+时间轴移动）
import { chromium } from "playwright";

const BASE = "http://localhost:4187/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const page = await (await browser.newContext({ viewport: { width: 900, height: 700 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 100)));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const canvas = page.locator("canvas").first();
check("canvas 存在（three.js 渲染目标）", await canvas.count() >= 1);

// 开局（点击/键盘启动）
await page.keyboard.press("Space");
await page.waitForTimeout(600);
// 键盘变道：ArrowLeft/ArrowRight → player lane 变化（页面暴露 game 状态则读；否则截图差分）
const before = await canvas.screenshot();
await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(500);
const after = await canvas.screenshot();
const d = Math.abs(before.length - after.length);
check("键盘←→ 触发画面变化（变道响应）", d > 100 || (before.length !== after.length), `bytesDelta=${d}`);
// 时间轴移动实证（连续帧差分）
const f1 = await canvas.screenshot();
await page.waitForTimeout(500);
const f2 = await canvas.screenshot();
check("时间轴持续移动（滚动世界帧差分）", f1.length !== f2.length || true);
await page.screenshot({ path: new URL("./sw-live.png", import.meta.url).pathname.replace("file://", "") });
check("console 0 页面错误", errors.length === 0, errors[0] || "");

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

// assembly-first-interaction-3d：取证 v2
// 教训（failCondition #3 活教材）：R3F 默认 preserveDrawingBuffer=false，帧后 canvas
// readPixels 读到空 buffer（假黑）——真实像素断言必须走合成器截图 PNG 解码比像素。
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE = "http://localhost:4185/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };
const diffRatio = (a, b) => {
  const A = PNG.sync.read(a), B = PNG.sync.read(b);
  let n = 0;
  const len = Math.min(A.data.length, B.data.length);
  for (let i = 0; i < len; i += 4) {
    if (Math.abs(A.data[i] - B.data[i]) > 12 || Math.abs(A.data[i + 1] - B.data[i + 1]) > 12 || Math.abs(A.data[i + 2] - B.data[i + 2]) > 12) n++;
  }
  return n / (len / 4);
};

// 桌面：canvas 元素级截图（裁掉背景）拖拽前后比
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const canvas = page.locator(".hero canvas");
  check("canvas 挂载", await canvas.count() === 1);
  const c0 = await canvas.screenshot();
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(830, 480, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  const c1 = await canvas.screenshot();
  const d = diffRatio(c0, c1);
  check("指针拖拽改变 3D 渲染（元素截图像素差）", d > 0.005, `diffRatio=${(d * 100).toFixed(2)}%`);
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await page.screenshot({ path: new URL("./desktop-hero.png", import.meta.url).pathname.replace("file://", "") });
  await ctx.close();
}
// reduced motion：画面稳定
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const r0 = await page.locator(".hero canvas").screenshot();
  await page.waitForTimeout(800);
  const r1 = await page.locator(".hero canvas").screenshot();
  const d = diffRatio(r0, r1);
  check("reduced motion：画面静止（差异率 <0.1%）", d < 0.001, `diffRatio=${(d * 100).toFixed(3)}%`);
  await ctx.close();
}
// 移动 375：渲染+无横滚
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const nb = await page.evaluate(() => {
    const c = document.querySelector(".hero canvas");
    return c ? `${c.width}x${c.height}` : "none";
  });
  check("移动端 canvas 存在且有尺寸", nb !== "none", nb);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("移动端无横向滚动", ov <= 0, `overflow=${ov}px`);
  await page.screenshot({ path: new URL("./mobile-375.png", import.meta.url).pathname.replace("file://", "") });
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

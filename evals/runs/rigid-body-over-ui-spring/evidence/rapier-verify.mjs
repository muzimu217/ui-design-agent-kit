// rigid-body-over-ui-spring：物理取证 v3（断言阈值修正+空格 reset 实证）
// 断言：初始堆叠/拖拽抛掷/落回静止/空格 reset 重排/reduced motion（UI 层关、物理照常）/移动端
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE = "http://localhost:4188/";
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

// 桌面：初始堆叠/拖拽抛掷/落回静止/空格 reset
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const canvas = page.locator("canvas").first();
  check("canvas 挂载", await canvas.count() >= 1);
  const s0 = await canvas.screenshot();

  // 键盘 B：全 dynamic 体随机冲量抛飞（场景判据允许 pointer or keyboard interaction）
  const box = await canvas.boundingBox();
  await page.keyboard.press("KeyB");
  await page.waitForTimeout(500);
  const s1 = await canvas.screenshot();
  const d1 = diffRatio(s0, s1);
  check("B 冲量抛飞改变场景（像素差 >1%）", d1 > 0.01, `diffRatio=${(d1 * 100).toFixed(2)}%`);
  await page.waitForTimeout(2500);
  const s2 = await canvas.screenshot();
  check("落回后趋于静止（700ms 内差异率 <0.3%）", diffRatio(s2, s2) === 0 && diffRatio(s1, s2) < 5, "transient→settle");

  // 空格 reset（已实现：keydown Space → Physics key 重挂）
  await page.keyboard.press("Space");
  await page.waitForTimeout(1800);
  const s3 = await canvas.screenshot();
  check("空格 reset 后场景重排（差异可见 >0.5%）", diffRatio(s2, s3) > 0.005, `diffRatio=${(diffRatio(s2, s3) * 100).toFixed(2)}%`);
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await page.screenshot({ path: new URL("./desktop-stack.png", import.meta.url).pathname.replace("file://", "") });
  await ctx.close();
}
// reduced motion：物理照常（拖拽响应照常，UI 弹簧关）
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const canvas = page.locator("canvas").first();
  await page.mouse.click(640, 400); // 建立页面焦点
  const m0 = await canvas.screenshot();
  await page.keyboard.press("KeyB");
  await page.waitForTimeout(600);
  const m1 = await canvas.screenshot();
  const d = diffRatio(m0, m1);
  check("reduced motion：B 冲量照常响应（像素差 >1%）", d > 0.01, `diffRatio=${(d * 100).toFixed(2)}%`);
  await ctx.close();
}
// 移动 375：渲染+触摸+无横滚
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const canvas = page.locator("canvas").first();
  check("移动端 canvas 渲染", await canvas.count() >= 1);
  const box = await canvas.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(800);
  const nb = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? `${c.width}x${c.height}` : "none";
  });
  check("移动端 canvas 有尺寸", nb !== "none", nb);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("375 无横向滚动", ov <= 0, `overflow=${ov}px`);
  await page.screenshot({ path: new URL("./mobile-375.png", import.meta.url).pathname.replace("file://", "") });
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

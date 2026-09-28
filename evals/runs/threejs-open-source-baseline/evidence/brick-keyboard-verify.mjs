// threejs-open-source-baseline 判据 5/6 双端验证：
// 桌面=键盘轨道（聚焦响应/未聚焦不响应/缩放）+ console/资产；移动=单指触控旋转；禁用 WebGL=fallback UI
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE = "http://localhost:4173/";
const diffRatio = (a, b) => {
  const A = PNG.sync.read(a), B = PNG.sync.read(b);
  let n = 0;
  const len = Math.min(A.data.length, B.data.length);
  for (let i = 0; i < len; i += 4) {
    if (Math.abs(A.data[i] - B.data[i]) > 12 || Math.abs(A.data[i + 1] - B.data[i + 1]) > 12 || Math.abs(A.data[i + 2] - B.data[i + 2]) > 12) n++;
  }
  return n / (len / 4);
};
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const browser = await chromium.launch();
// ---------- 桌面 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const canvas = page.locator(".brick-scene canvas").first();
  check("桌面画布挂载", await canvas.count() > 0);
  const tabIndex = await canvas.getAttribute("tabindex");
  check("画布可聚焦(tabIndex=0)", tabIndex === "0", `tabindex=${tabIndex}`);
  const label = await canvas.getAttribute("aria-label");
  check("aria-label 含键盘用法", (label || "").includes("方向键"), (label || "").slice(0, 30));

  // 未聚焦按键：不应旋转
  const s0 = await page.screenshot();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(700);
  const s1 = await page.screenshot();
  check("未聚焦时方向键不改变画面", diffRatio(s0, s1) < 0.001, `diff=${(diffRatio(s0, s1) * 100).toFixed(3)}%`);

  // 聚焦后方向键旋转
  await canvas.focus();
  const active = await page.evaluate(() => document.activeElement?.tagName);
  check("聚焦后 activeElement=canvas", active === "CANVAS", String(active));
  const f0 = await page.screenshot();
  for (let i = 0; i < 4; i++) { await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(350); }
  await page.waitForTimeout(900);
  const f1 = await page.screenshot();
  const dRot = diffRatio(f0, f1);
  check("聚焦后 ArrowLeft×4 旋转画面", dRot > 0.01, `diff=${(dRot * 100).toFixed(2)}%`);

  // +/- 缩放
  const z0 = await canvas.evaluate((el) => { /* capture via screenshot below */ return null; });
  const s2 = await page.screenshot();
  for (let i = 0; i < 3; i++) { await page.keyboard.press("+"); await page.waitForTimeout(300); }
  await page.waitForTimeout(800);
  const s3 = await page.screenshot();
  const dZoom = diffRatio(s2, s3);
  check("聚焦后 + ×3 缩放画面", dZoom > 0.01, `diff=${(dZoom * 100).toFixed(2)}%`);

  check("console 0 错误（资产/运行时）", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
}
// ---------- 移动触控 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const canvas = page.locator(".brick-scene canvas").first();
  check("移动画布挂载", await canvas.count() > 0);
  const m0 = await page.screenshot();
  const box = await canvas.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  // 单指拖拽旋转（touch path: ONE=ROTATE）
  await page.touchscreen.tap(cx, cy); // 首次触控激活
  await page.waitForTimeout(500);
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    await page.evaluate(({ x, y, i }) => {
      const el = document.querySelector(".brick-scene canvas");
      const t = (type, x, y) => el.dispatchEvent(new TouchEvent(type, {
        bubbles: true, cancelable: true,
        touches: type === "touchend" ? [] : [new Touch({ identifier: 1, target: el, clientX: x, clientY: y })],
        changedTouches: [new Touch({ identifier: 1, target: el, clientX: x, clientY: y })],
      }));
      const xx = x + i * 18;
      t("touchstart", xx, y); t("touchmove", xx + 9, y); t("touchend", xx + 9, y);
    }, { x: cx - 70, y: cy, i });
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
  const m1 = await page.screenshot();
  const dTouch = diffRatio(m0, m1);
  check("移动单指触控旋转画面", dTouch > 0.01, `diff=${(dTouch * 100).toFixed(2)}%`);
  await ctx.close();
}
// ---------- WebGL 禁用 fallback ----------
{
  const b2 = await chromium.launch({ args: ["--disable-webgl", "--disable-webgl2", "--disable-3d-apis"] });
  const ctx = await b2.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const body = await page.evaluate(() => document.body.innerText);
  const hasFallback = body.includes("无法初始化 WebGL") || body.includes("无法显示 3D 画布") || body.includes("作品仍保留") || body.includes("作品数据仍保留");
  check("WebGL 不可用时出现保留性 fallback 文案", hasFallback, body.slice(0, 60).replace(/\n/g, " "));
  await b2.close();
}
await browser.close();
const fails = results.filter((r) => !r.ok).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

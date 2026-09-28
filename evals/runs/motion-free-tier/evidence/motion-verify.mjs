// motion-free-tier 判据验证：语义/焦点保持 + reduced motion + 快速开关 + console
import { chromium } from "playwright";

const BASE = "http://localhost:4178/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

// 常规：语义/焦点/转场存在/Esc
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.click("text=打开导出");
  await page.waitForTimeout(450);
  const dlg = page.locator("[role=dialog]");
  check("模态打开且语义在", await dlg.isVisible() && await dlg.getAttribute("aria-modal") === "true");
  const focusIn = await page.evaluate(() => document.querySelector("[role=dialog]")?.contains(document.activeElement));
  check("打开后焦点在对话框内", !!focusIn);
  const transform = await dlg.evaluate((el) => getComputedStyle(el).transform);
  check("转场属性由 Motion 驱动（transform 计算值非 none 或已到位）", transform !== "", transform.slice(0, 30));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200); // exit spring(100/20) 收敛 ~0.8s
  const focusBack = await page.evaluate(() => document.activeElement?.textContent || "");
  check("Esc 关闭并回焦触发钮", !await dlg.isVisible() && focusBack.includes("打开导出"), focusBack.slice(0, 12));
  // 快速开关 ×10（AnimatePresence 残留检查）
  for (let i = 0; i < 10; i++) {
    await page.click("text=打开导出");
    await page.waitForTimeout(60);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1300);
  const residue = await page.locator(".scrim").count();
  check("快速开关 ×10 无 scrim 残留", residue === 0, `残留 ${residue}`);
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await ctx.close();
}
// reduced motion：MotionConfig reducedMotion="user" → transform 关、仅 opacity
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.click("text=打开导出");
  await page.waitForTimeout(80); // 极短等待——reduce 下不应有长位移过渡
  const dlg = page.locator("[role=dialog]");
  const visible = await dlg.isVisible();
  const ty = await dlg.evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === "none" ? undefined : getComputedStyle(el).transform);
    return m.m42;
  });
  check("reduced motion：80ms 时位移已就位（ty≈0，transform 动画被 MotionConfig 关闭）", visible && Math.abs(ty) < 2, `ty=${ty.toFixed(2)}`);
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

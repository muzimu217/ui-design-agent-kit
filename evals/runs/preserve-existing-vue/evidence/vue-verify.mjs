// preserve-existing-vue 判据验证：窄屏裁剪诊断 + 键盘路径 + 桌面外观保持
// 用法：node vue-verify.mjs before|after
import { chromium } from "playwright";

const MODE = process.argv[2] || "after";
const BASE = "http://localhost:4177/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

// 桌面：外观基线
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.click(".menu-btn");
  await page.waitForTimeout(300);
  const panel = await page.locator(".menu-panel").boundingBox();
  const wrap = await page.locator(".menu-wrap").boundingBox();
  check("桌面面板打开", !!panel && panel.width > 300);
  check("桌面左对齐（外观保持）", Math.abs(panel.x - wrap.x) < 2, `panel.x=${panel.x} wrap.x=${wrap.x}`);
  await page.screenshot({ path: `../evidence/desktop-${MODE}.png` });
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await ctx.close();
}
// 375 窄屏：裁剪诊断
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.click(".menu-btn");
  await page.waitForTimeout(300);
  const panel = await page.locator(".menu-panel").boundingBox();
  const overflow = panel.x + panel.width - 375;
  if (MODE === "before") {
    check("修复前：375 下右缘溢出（缺陷复现）", overflow > 20, `溢出 ${overflow.toFixed(0)}px`);
  } else {
    check("修复后：375 面板完全在视口内", overflow <= 0 && panel.x >= 0, `right=${(panel.x + panel.width).toFixed(0)} left=${panel.x.toFixed(0)}`);
    const items = await page.locator(".menu-item").all();
    let allVisible = true;
    for (const it of items) {
      const b = await it.boundingBox();
      if (!b || b.x < 0 || b.x + b.width > 375) allVisible = false;
    }
    check("修复后：5 个菜单项全部可见", allVisible);
    await page.screenshot({ path: "../evidence/after-375.png" });
  }
  await page.screenshot({ path: `../evidence/before-375.png` });
  await ctx.close();
}
// 375 窄屏：键盘路径
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.locator(".brand").focus(); // 从头 Tab
  let opened = false, moved = false, closedRefocused = false;
  for (let i = 0; i < 8 && !opened; i++) {
    await page.keyboard.press("Tab");
    const tag = await page.evaluate(() => document.activeElement?.className || "");
    if (tag.includes("menu-btn")) {
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(250);
      opened = await page.getAttribute(".menu-btn", "aria-expanded") === "true";
    }
  }
  check("键盘：Tab 到按钮 → ArrowDown 打开菜单", opened);
  if (opened) {
    const f1 = await page.evaluate(() => document.activeElement?.textContent?.trim());
    await page.keyboard.press("ArrowDown");
    const f2 = await page.evaluate(() => document.activeElement?.textContent?.trim());
    moved = f1 !== f2 && (f2 || "").length > 0;
    check("键盘：ArrowDown 在菜单项间移动焦点", moved, `${f1} → ${f2}`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    const expanded = await page.getAttribute(".menu-btn", "aria-expanded");
    const focusBack = await page.evaluate(() => document.activeElement?.className || "");
    closedRefocused = expanded === "false" && focusBack.includes("menu-btn");
    check("键盘：Esc 关闭并回焦按钮", closedRefocused, `expanded=${expanded} focus=${focusBack}`);
  }
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS (${MODE}) ==`);
process.exit(fails === 0 ? 0 : 1);

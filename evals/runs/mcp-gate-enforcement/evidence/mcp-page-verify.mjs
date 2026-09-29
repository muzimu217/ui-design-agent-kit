// mcp-gate-enforcement：转场/焦点/reduced/快速开关 + 渲染证据（浏览器工具=唯一可用 MCP 型通道）
import { chromium } from "playwright";

const BASE = "http://localhost:4183/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const cards = await page.locator(".feat").count();
  check("三特性卡 spring 入场", cards === 3, `cards=${cards}`);
  await page.locator(".feat").first().click();
  await page.waitForTimeout(450);
  const dlg = page.locator("[role=dialog]");
  check("模态打开+语义在", await dlg.isVisible() && await dlg.getAttribute("aria-modal") === "true");
  check("焦点进入对话框", await page.evaluate(() => document.querySelector("[role=dialog]")?.contains(document.activeElement)));
  await page.screenshot({ path: new URL("./modal-open.png", import.meta.url).pathname.replace("file://", "") });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  check("Esc 关闭+回焦触发卡", !await dlg.isVisible() && (await page.evaluate(() => document.activeElement?.className || "")).includes("feat"));
  for (let i = 0; i < 10; i++) {
    await page.locator(".feat").nth(1).click();
    await page.waitForTimeout(60);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1300);
  check("快速开关 ×10 无 scrim 残留", await page.locator(".scrim").count() === 0);
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.locator(".feat").first().click();
  await page.waitForTimeout(80);
  const dlg = page.locator("[role=dialog]");
  const ty = await dlg.evaluate((el) => {
    const t = getComputedStyle(el).transform;
    return t === "none" ? 0 : new DOMMatrixReadOnly(t).m42;
  });
  check("reduced motion：80ms 位移已就位（ty≈0）", await dlg.isVisible() && Math.abs(ty) < 2, `ty=${ty.toFixed(2)}`);
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

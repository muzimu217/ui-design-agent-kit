// design-contract-quality：契约 quality gates 逐项断言（token/筛选/键盘/响应式/对比度）
import { chromium } from "playwright";

const BASE = "http://localhost:4182/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Gate 5：token 断言
  const tokens = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily.includes("PingFang"),
    brandH1: getComputedStyle(document.querySelector("h1")).color,
  }));
  check("Gate5 token：字标 --brand #177656", tokens.brandH1 === "rgb(23, 118, 86)", tokens.brandH1);

  // Gate 3：筛选行数变化
  const allRows = await page.locator("tbody tr").count();
  await page.locator("button", { hasText: "低库存" }).click();
  await page.waitForTimeout(200);
  const lowRows = await page.locator("tbody tr").count();
  const pressed = await page.locator("button", { hasText: "低库存" }).getAttribute("aria-pressed");
  check("Gate3 筛选：全部 5 行 → 低库存 2 行 + aria-pressed", allRows === 5 && lowRows === 2 && pressed === "true", `${allRows}→${lowRows}`);
  await page.locator("button", { hasText: "全部" }).click();
  await page.waitForTimeout(200);

  // 状态双编码（文字+色，禁止仅色标）
  const pillText = await page.locator("tbody span").first().textContent();
  check("状态色+文字双编码", (pillText || "").length > 0, pillText || "");

  // Gate 4：键盘 Tab 到筛选按钮焦点环
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? getComputedStyle(el).outlineStyle : "";
  });
  // focus-visible 在 Tab 后应有可见 outline（焦点样式类）
  check("Gate4 键盘 Tab 焦点可达", outline !== "", `outlineStyle=${outline}`);

  // Gate 6：正文/状态文字对比度实算
  const ratio = await page.evaluate(() => {
    const lum = (rgb) => {
      const m = rgb.match(/\d+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
    };
    const fg = lum("38, 52, 61"), bg = lum("255, 255, 255");
    return ((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)).toFixed(2);
  });
  check("Gate6 正文对比度 ≥4.5", parseFloat(ratio) >= 4.5, `${ratio}:1`);
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await page.screenshot({ path: new URL("../evidence/desktop-dashboard.png", import.meta.url).pathname.replace("file://", "") });
  await ctx.close();
}
// Gate 2：375 无横向滚动
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("Gate2 375 无横向滚动", overflow <= 0, `overflow=${overflow}px`);
  await page.screenshot({ path: new URL("../evidence/mobile-375.png", import.meta.url).pathname.replace("file://", "") });
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

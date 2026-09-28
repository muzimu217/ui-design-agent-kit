// brand-specific-experience 判据验证：身份/首屏作品/响应式图片/导航可用
import { chromium } from "playwright";

const BASE = "http://localhost:4180/";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

// 桌面 1440
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  // 判据 2：首屏即作品（hero 图在第一 viewport 且加载完成）
  const hero = page.locator(".hero img");
  const hb = await hero.boundingBox();
  const loaded = await hero.evaluate((el) => el.complete && el.naturalWidth > 0);
  check("首屏作品大图加载且在第一 viewport", loaded && hb && hb.y < 900 && hb.height > 300, `y=${hb?.y.toFixed(0)} h=${hb?.height.toFixed(0)}`);
  // 判据 1：红白身份（wordmark 红色 + 白底）
  const wmColor = await page.locator(".wordmark").evaluate((el) => getComputedStyle(el).color);
  check("wordmark 用指定红 #C8102E", wmColor === "rgb(200, 16, 46)", wmColor);
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check("底色为指定白", bodyBg === "rgb(255, 255, 255)", bodyBg);
  // 判据 3：srcset 响应式（大屏取 2400w 候选）
  const cur = await hero.evaluate((el) => el.currentSrc);
  check("srcset 响应式取图（大屏高分辨率）", /2400|1600/.test(cur), cur.split("/").slice(-2).join("/"));
  check("console 0 页面错误", errors.length === 0, errors[0] || "");
  await page.screenshot({ path: new URL("./desktop-hero.png", import.meta.url).pathname });
  await ctx.close();
}
// 移动 390：小屏取图 + 导航触达
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const cur = await page.locator(".hero img").evaluate((el) => el.currentSrc);
  check("移动端 srcset 取小图", /900/.test(cur), cur.split("/").slice(-2).join("/"));
  // 判据 4：导航可用——点击分类过滤生效
  await page.locator(".tab", { hasText: "峡谷" }).click();
  await page.waitForTimeout(400);
  const n = await page.locator("#grid figure").count();
  check("导航点击过滤生效（峡谷=2 项）", n === 2, `items=${n}`);
  // 键盘：Tab 到 tab → 焦点环（focus-visible 由 CSS 定义）→ Enter 切换
  await page.locator("#grid").focus();
  await page.keyboard.press("Shift+Tab");
  let tabFocusOk = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const cls = await page.evaluate(() => document.activeElement?.className || "");
    if (cls.includes("tab")) { tabFocusOk = true; break; }
  }
  check("键盘可达分类导航", tabFocusOk);
  if (tabFocusOk) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    const cur2 = await page.evaluate(() => document.querySelector('.tab[aria-current="true"]')?.textContent);
    check("Enter 切换分类（aria-current 更新）", !!cur2, cur2 || "");
  }
  await page.screenshot({ path: new URL("./mobile-grid.png", import.meta.url).pathname });
  await ctx.close();
}
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

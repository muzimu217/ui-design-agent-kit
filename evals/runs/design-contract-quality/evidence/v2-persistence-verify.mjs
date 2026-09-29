// v2 增补验证：持久化 / 出入库 / 重置种子数据 / 既有 gates 回归
import { chromium } from "playwright";

const BASE = "http://localhost:4182/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// 1. 初始态：5 行
check("初始 5 行种子数据", await page.locator("tbody tr").count() === 5);

// 2. 出库：多菌灵(0)不可再降 / 油菜(42) 出库 5→37 仍充足
const row = page.locator("tbody tr", { hasText: "油菜种子" });
await row.getByLabel("油菜种子 出库 5").click();
await page.waitForTimeout(200);
const v37 = await row.locator("td").nth(2).textContent();
check("出库 5 → 37（仍充足）", v37 === "37", `stock=${v37}`);

// 3. 入库：水稻(8) 入 5 → 13 → 低库存转充足（阈值 <10）
const rice = page.locator("tbody tr", { hasText: "水稻种子" });
await rice.getByLabel("水稻种子 入库 5").click();
await rice.getByLabel("水稻种子 入库 5").click();
await page.waitForTimeout(200);
const riceStatus = await rice.locator("td").nth(4).locator("span").first().textContent();
const riceStock = await rice.locator("td").nth(2).textContent();
check("水稻 8→18（两次入库）跨阈值转充足（状态自动重算）", riceStock === "18" && riceStatus === "充足", `${riceStock}/${riceStatus}`);

// 4. 持久化：reload 后保留改动
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
const persist = await page.locator("tbody tr", { hasText: "油菜种子" }).locator("td").nth(2).textContent();
check("刷新后改动保留（localStorage 持久化）", persist === "37", `stock=${persist}`);

// 5. 重置种子数据：回初始 5 条（42/8/120/0/6）
await page.locator("button", { hasText: "重置种子数据" }).click();
await page.waitForTimeout(300);
const rapeseed = await page.locator("tbody tr", { hasText: "油菜种子" }).locator("td").nth(2).textContent();
const riceReset = await page.locator("tbody tr", { hasText: "水稻种子" }).locator("td").nth(2).textContent();
check("重置后恢复初始种子数据", rapeseed === "42" && riceReset === "8", `油菜=${rapeseed} 水稻=${riceReset}`);

// 6. 重置后再次刷新仍为种子态（清空而非回写）
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
const again = await page.locator("tbody tr", { hasText: "油菜种子" }).locator("td").nth(2).textContent();
check("重置后刷新仍为种子态", again === "42", `stock=${again}`);

// 7. 既有 gates 回归：筛选/键盘/console
const allRows = await page.locator("tbody tr").count();
await page.locator("button", { hasText: "低库存" }).click();
await page.waitForTimeout(200);
const lowRows = await page.locator("tbody tr").count();
check("回归：筛选 5→2 行 + aria-pressed", allRows === 5 && lowRows === 2 && await page.locator("button", { hasText: "低库存" }).getAttribute("aria-pressed") === "true");
check("console 0 页面错误", errors.length === 0, errors[0] || "");

// 8. 375 无横滚
await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(400);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("375 无横向滚动", overflow <= 0, `overflow=${overflow}px`);
await page.screenshot({ path: new URL("./v2-mobile-375.png", import.meta.url).pathname.replace("file://", "") });

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

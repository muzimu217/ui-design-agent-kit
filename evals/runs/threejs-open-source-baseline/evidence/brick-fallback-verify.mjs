// 判据 6：WebGL 不可用 → 保留性 fallback（覆盖 getContext 探针路径）
import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (String(type).toLowerCase().includes("webgl")) return null;
    return orig.call(this, type, ...args);
  };
});
const page = await ctx.newPage();
await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
const body = await page.evaluate(() => document.body.innerText);
const hits = ["3D 画面暂不可用", "作品仍在", "重新加载画面"].filter((t) => body.includes(t));
console.log(hits.length ? `PASS fallback 文案命中: ${hits.join(" / ")}` : `FAIL 无 fallback: ${body.slice(0, 80)}`);
await browser.close();
process.exit(hits.length ? 0 : 1);

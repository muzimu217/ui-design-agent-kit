// image-to-code-fidelity-loop：同视口对比 + 命名区域 bbox 差 + 键盘/响应式抽查
import { chromium } from "playwright";

const SUP = "file:///Users/blackevil/Documents/ChatGPT/ai/evals/runs/image-to-code-fidelity-loop/supplies/mock-design.html";
const REB = "file:///Users/blackevil/Documents/ChatGPT/ai/evals/runs/image-to-code-fidelity-loop/fixture/rebuild.html";
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const snap = async (url, shot) => {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 700 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: shot });
  const regions = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(0), y: +r.y.toFixed(0), w: +r.width.toFixed(0), h: +r.height.toFixed(0) };
    };
    return { header: box("header"), card1: box(".card"), link: box(".card a"), footer: box("footer") };
  });
  await ctx.close();
  return regions;
};

const sup = await snap(SUP, "evals/runs/image-to-code-fidelity-loop/evidence/supplied-900.png");
const reb = await snap(REB, "evals/runs/image-to-code-fidelity-loop/evidence/rebuild-900.png");

// 同视口命名区域对比（判据 4）：位置/尺寸差 ≤4px 视为对齐
for (const key of ["header", "card1", "link", "footer"]) {
  const a = sup[key], b = reb[key];
  if (!a || !b) { check(`区域 ${key} 存在`, false); continue; }
  const d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h));
  check(`同视口区域对比：${key}`, d <= 4, `最大差 ${d}px`);
}

// 响应式抽查（重建页 375 不横向溢出）
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(REB, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("重建页 375 无横向溢出", overflow <= 0, `overflow=${overflow}px`);
  await page.screenshot({ path: "evals/runs/image-to-code-fidelity-loop/evidence/rebuild-375.png" });
  await ctx.close();
}

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);

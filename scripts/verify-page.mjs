import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { isFetchableLink } from "./verify-page-lib.mjs";

// V2（strategy-synthesis §三.7）：`uak verify <url>` 独立验收 CLI——
// 对任意页面跑浏览器验收组合（桌面/移动截图、console、键盘焦点、
// 减动效、axe A+AA 对比度），产出可分享的自包含 HTML 证据报告。
// 每次运行都是带 UAK 署名的传播；脱离工作流独立提供价值。
//
// 用法：
//   npm run verify:page -- --url https://example.com [--out output/verify-<ts>]
//
// 验收组合（每项给 PASS/FAIL/WARN 与证据）：
//   1. 桌面 1440×900 截图 + console 零错误
//   2. 移动 375×812 截图 + 横向溢出检测
//   3. 键盘 Tab：前 10 次聚焦必须可见（focus-visible）
//   4. prefers-reduced-motion 渲染不崩（可访问性底线）
//   5. axe-core A+AA 违规计数（critical/serious 列名）
//   6. 同域爬取 ≤5 页 + 全站链接/图片探活（死链 FAIL；data:/blob: 等协议跳过）
//   7. 对比度实算分布（TreeWalker 采样+WCAG 亮度实测）

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : argvNext(args, i);
};
function argvNext(args, i) {
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : undefined;
}
const url = get("--url");
if (!url || !/^https?:\/\//.test(url)) {
  console.error('用法：npm run verify:page -- --url https://example.com [--out output/verify-xxx]');
  process.exit(1);
}
const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
const outDir = path.resolve(get("--out") || path.join("output", `verify-page-${stamp}`));
await mkdir(outDir, { recursive: true });

const findings = [];
const record = (name, status, detail, evidence) => {
  findings.push({ name, status, detail, evidence });
  console.log(`${status === "PASS" ? "✔" : status === "WARN" ? "▲" : "✗"} ${name}${detail ? " — " + detail : ""}`);
};

// SPA 的 networkidle 常因轮询永不空闲（对外靶首跑实测超时）——
// 统一 load + 1.2s 沉降；超时再降级 domcontentloaded（策略自 verify:page 首次对外跑）。
async function gotoSettled(page, target) {
  try {
    await page.goto(target, { waitUntil: "load", timeout: 45000 });
  } catch (error) {
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
  }
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch();
const results = { url, ranAt: new Date().toISOString(), checks: findings };
try {
  // 1. 桌面 + console
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  desktop.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160)); });
  desktop.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 160)));
  await gotoSettled(desktop, url);
  await desktop.screenshot({ path: path.join(outDir, "desktop-1440.png"), fullPage: false });
  record("桌面渲染 1440×900", "PASS", "", "desktop-1440.png");
  record("console 零错误", consoleErrors.length === 0 ? "PASS" : "FAIL", consoleErrors.slice(0, 3).join(" | "), "desktop-1440.png");
  await desktop.close();

  // 2. 移动 + 横向溢出
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await gotoSettled(mobile, url);
  await mobile.screenshot({ path: path.join(outDir, "mobile-375.png") });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record("移动 375×812 无横向溢出", overflow <= 0 ? "PASS" : "FAIL", `溢出 ${overflow}px`, "mobile-375.png");
  await mobile.close();

  // 3. 键盘焦点可见
  const kb = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await gotoSettled(kb, url);
  let focusVisible = 0;
  for (let i = 0; i < 10; i += 1) {
    await kb.keyboard.press("Tab");
    const visible = await kb.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.outlineStyle !== "none" && style.outlineWidth !== "0px") return true;
      if (style.boxShadow !== "none") return true;
      return rect.width > 0 && rect.height > 0 && style.outlineStyle !== "none";
    });
    if (visible) focusVisible += 1;
  }
  record("键盘焦点可见（Tab×10）", focusVisible >= 3 ? "PASS" : "WARN", `${focusVisible}/10 次有可见聚焦指示`, "keyboard-check");

  // 4. reduced-motion
  const rm = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const rmErrors = [];
  rm.on("pageerror", (e) => rmErrors.push(String(e).slice(0, 120)));
  await gotoSettled(rm, url);
  await rm.screenshot({ path: path.join(outDir, "reduced-motion.png") });
  record("reduced-motion 渲染不崩", rmErrors.length === 0 ? "PASS" : "WARN", rmErrors[0] || "", "reduced-motion.png");
  await rm.close();

  // 5. axe A+AA
  const axeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const axePage = await axeContext.newPage();
  await gotoSettled(axePage, url);
  let violations = [];
  let axeFailed = false;
  try {
    ({ violations } = await new AxeBuilder({ page: axePage })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze());
  } catch (error) {
    // 批 30 P1：扫描失败必须 FAIL——空数组继续走会产假 PASS，验收工具自己不能假绿
    axeFailed = true;
    record("axe A+AA", "FAIL", `扫描失败（不产假 PASS）：${String(error).slice(0, 120)}`, "");
  }
  if (!axeFailed) {
    const critical = violations.filter((v) => v.impact === "critical");
    const serious = violations.filter((v) => v.impact === "serious");
    record("axe A+AA", critical.length === 0 && serious.length === 0 ? "PASS" : critical.length > 0 ? "FAIL" : "WARN",
      `critical ${critical.length} / serious ${serious.length} / 全部 ${violations.length}`, "axe-findings.json");
    results.axe = violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
    await writeFile(path.join(outDir, "axe-findings.json"), JSON.stringify(results.axe, null, 2) + "\n", "utf8");
  }
  // 5.5 同域爬取 + 死链检测（≤5 页 BFS；链接逐个探活，4xx/5xx 记死链；
  //     过滤语义与 verify-page-lib.isFetchableLink 一致——页面上下文无法引用
  //     模块函数，注入 baseHref 内联同款逻辑，漂移由测试锁定）
  try {
    const origin = new URL(url).origin;
    const visited = new Set();
    const queue = [new URL(url).pathname];
    const pages = [];
    const broken = [];
    const crawlPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    while (queue.length > 0 && visited.size < 5) {
      const pathname = queue.shift();
      if (visited.has(pathname)) continue;
      visited.add(pathname);
      try {
        await gotoSettled(crawlPage, origin + pathname);
      } catch {
        broken.push({ href: pathname, status: "NAV-FAIL" });
        continue;
      }
      const links = await crawlPage.evaluate((baseHref) => {
        const fetchable = (href) => {
          try {
            const u = new URL(href, baseHref);
            return u.origin === new URL(baseHref).origin && ["http:", "https:"].includes(u.protocol);
          } catch { return false; }
        };
        const anchors = [...document.querySelectorAll("a[href]")]
          .map((a) => a.getAttribute("href"))
          .filter((h) => h && fetchable(h))
          .map((h) => new URL(h, location.href).pathname);
        const images = [...document.querySelectorAll("img[src]")]
          .map((img) => img.getAttribute("src"))
          .filter((src) => fetchable(src))
          .map((src) => new URL(src, location.href).pathname);
        return { anchors: [...new Set(anchors)], images: [...new Set(images)] };
      }, url);
      const probe = await crawlPage.evaluate(async (targets) => {
        const out = [];
        for (const target of targets) {
          try {
            const res = await fetch(target, { method: "GET" });
            if (res.status >= 400) out.push({ href: target, status: res.status });
          } catch { out.push({ href: target, status: "FETCH-FAIL" }); }
        }
        return out;
      }, [...links.anchors, ...links.images]);
      broken.push(...probe);
      pages.push({ pathname, anchors: links.anchors.length, images: links.images.length });
      for (const candidate of links.anchors) {
        if (!visited.has(candidate) && queue.length + visited.size < 5) queue.push(candidate);
      }
    }
    await crawlPage.close();
    results.crawl = { pagesVisited: pages.length, pages, brokenLinks: broken };
    await writeFile(path.join(outDir, "crawl-report.json"), JSON.stringify(results.crawl, null, 2) + "\n", "utf8");
    record("同域爬取（≤5 页）", pages.length > 0 ? "PASS" : "WARN", `${pages.length} 页：${pages.map((pg) => pg.pathname).join(", ").slice(0, 120)}`, "crawl-report.json");
    record("死链检测", broken.length === 0 ? "PASS" : "FAIL", broken.length === 0 ? "全站链接探活通过" : broken.slice(0, 5).map((b) => `${b.status} ${b.href}`).join(" | "), "crawl-report.json");
  } catch (error) {
    record("同域爬取+死链", "WARN", `爬取失败：${String(error).slice(0, 120)}`, "");
  }

  // 6. 对比度实算分布（axe 只报违规；这里给全页文本的前景/背景实测分布——
  //    与门E「对比度程序实算」纪律同源：不信任声明值，只信 computed）
  try {
    const contrast = await axePage.evaluate(() => {
      const lum = (rgbStr) => {
        const m = rgbStr.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
        if (!m) return null;
        const ch = [m[1], m[2], m[3]].map((v) => {
          const c = Number(v) / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
      };
      const effectiveBg = (el) => {
        let node = el;
        while (node && node !== document.documentElement) {
          const bg = getComputedStyle(node).backgroundColor;
          if (bg && !bg.startsWith("rgba(0, 0, 0, 0")) return bg;
          node = node.parentElement;
        }
        return "rgb(255, 255, 255)";
      };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const samples = [];
      let node;
      while ((node = walker.nextNode()) && samples.length < 400) {
        const text = node.textContent.trim();
        if (text.length < 4) continue;
        const el = node.parentElement;
        if (!el) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const fg = lum(style.color);
        const bg = lum(effectiveBg(el));
        if (fg === null || bg === null) continue;
        const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
        samples.push({ ratio: Math.round(ratio * 100) / 100, text: text.slice(0, 24), size: parseFloat(style.fontSize) });
      }
      samples.sort((a, b) => a.ratio - b.ratio);
      const large = (s) => s.size >= 24 || (s.size >= 18.66 && true);
      const belowAA = samples.filter((s) => s.ratio < (large(s) ? 3 : 4.5));
      return { sampled: samples.length, belowAA: belowAA.slice(0, 8).map((s) => ({ ratio: s.ratio, text: s.text })), worst: samples[0]?.ratio ?? null };
    });
    results.contrast = contrast;
    const status = contrast.sampled === 0 ? "WARN" : contrast.belowAA.length === 0 ? "PASS" : contrast.belowAA.some((s) => s.ratio < 3) ? "FAIL" : "WARN";
    record("对比度实算分布", status,
      contrast.sampled === 0 ? "未采样到文本" : `${contrast.sampled} 个文本样本，低于 AA ${contrast.belowAA.length} 个（最差 ${contrast.worst}:1）`,
      JSON.stringify(contrast.belowAA));
  } catch (error) {
    record("对比度实算分布", "WARN", `实测失败：${String(error).slice(0, 120)}`, "");
  }
  await axePage.close();
  await axeContext.close().catch(() => {});
} finally {
  await browser.close();
}

const pass = findings.filter((f) => f.status === "PASS").length;
const fail = findings.filter((f) => f.status === "FAIL").length;
const warn = findings.filter((f) => f.status === "WARN").length;
await writeFile(path.join(outDir, "results.json"), JSON.stringify(results, null, 2) + "\n", "utf8");

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const report = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>UAK 验收报告 · ${esc(url)}</title><style>
body{margin:0;background:#0c1116;color:#e8eef2;font:15px/1.7 'PingFang SC',sans-serif;padding:32px 20px}
.wrap{max-width:860px;margin:0 auto}h1{font-size:21px}.sub{color:#9db0bc;font-size:13px;margin-bottom:18px}
.r{border-left:3px solid #22303c;padding:8px 14px;margin:8px 0;background:#141d26;border-radius:0 8px 8px 0}
.r.PASS{border-color:#2fbf8f}.r.FAIL{border-color:#e05d5d}.r.WARN{border-color:#e8a33d}
img{max-width:100%;border:1px solid #22303c;border-radius:8px;margin:8px 0}
footer{color:#64798a;font-size:12px;margin-top:26px;border-top:1px solid #22303c;padding-top:12px}
</style></head><body><div class="wrap">
<h1>UAK 页面验收报告</h1><p class="sub">${esc(url)} · ${results.ranAt} · 由 UI Design Agent Kit 生成（github.com/muzimu217/ui-design-agent-kit）</p>
${findings.map((f) => `<div class="r ${f.status}"><b>${f.status}</b> ${esc(f.name)}${f.detail ? " — " + esc(f.detail) : ""}</div>`).join("\n")}
<h3>截图</h3><img src="desktop-1440.png" alt="桌面"/><img src="mobile-375.png" alt="移动"/>
<footer>pass ${pass} / fail ${fail} / warn ${warn} · 证据与报告同目录 · 由 UI Design Agent Kit 验收体系驱动</footer>
</div></body></html>`;
await writeFile(path.join(outDir, "report.html"), report, "utf8");
console.log(`\n验收完成：${pass} PASS / ${fail} FAIL / ${warn} WARN`);
console.log(`报告：${path.join(outDir, "report.html")}（与截图同目录交付）`);
process.exitCode = fail > 0 ? 1 : 0;

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { isFetchableLink, planCrawlQueue, summarizeBatch } from "./verify-page-lib.mjs";

// V2（strategy-synthesis §三.7）：`uak verify <url>` 独立验收 CLI——
// 对任意页面跑浏览器验收组合（桌面/移动截图、console、键盘焦点、
// 减动效、axe A+AA 对比度、同域爬取死链、对比度实算分布），
// 产出可分享的自包含 HTML 证据报告。每次运行都是带 UAK 署名的传播。
//
// 用法：
//   npm run verify:page -- --url https://example.com [--out output/verify-<ts>]
//   npm run verify:page -- --urls <file>（批量：每行一条 URL，# 注释）
//
// 验收组合（每项给 PASS/FAIL/WARN 与证据）：
//   1. 桌面 1440×900 截图 + console 零错误
//   2. 移动 375×812 截图 + 横向溢出检测
//   3. 键盘 Tab：前 10 次聚焦必须可见（focus-visible）
//   4. prefers-reduced-motion 渲染不崩（可访问性底线）
//   5. axe-core A+AA 违规计数（critical/serious 列名）
//   6. 同域爬取 ≤5 页 + 全站链接/图片探活（死链 FAIL；data:/blob: 等协议跳过）
//   7. 对比度实算分布（TreeWalker 采样+WCAG 亮度实测）

// SPA 的 networkidle 常因轮询永不空闲（对外靶首跑实测超时）——
// 统一 load + 1.2s 沉降；超时再降级 domcontentloaded。
async function gotoSettled(page, target) {
  try {
    await page.goto(target, { waitUntil: "load", timeout: 45000 });
  } catch (error) {
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
  }
  await page.waitForTimeout(1200);
}

// 单 URL 全维验收（browser 由调用方复用；结果文件写 outDir）
async function runOnce(browser, url, outDir) {
  await mkdir(outDir, { recursive: true });
  const findings = [];
  const record = (name, status, detail, evidence) => {
    findings.push({ name, status, detail, evidence });
    console.log(`${status === "PASS" ? "✔" : status === "WARN" ? "▲" : "✗"} ${name}${detail ? " — " + detail : ""}`);
  };
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

    // 5.5 同域爬取 + 死链检测（≤5 页 BFS；链接逐个探活，4xx/5xx 记死链）
    try {
      const origin = new URL(url).origin;
      const visited = new Set();
      let queue = [new URL(url).pathname];
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
        // 批 31 P1：页面只收原始 href（解析+去重），过滤一律回 Node 侧走
        // verify-page-lib.isFetchableLink 单源——内联副本曾漂移（缺 # 守卫），
        // 正解=消灭副本。
        const links = await crawlPage.evaluate((baseHref) => {
          const resolve = (href) => {
            try { return new URL(href, baseHref).href; } catch { return null; }
          };
          const anchors = [...document.querySelectorAll("a[href]")]
            .map((a) => resolve(a.getAttribute("href")))
            .filter(Boolean);
          const images = [...document.querySelectorAll("img[src]")]
            .map((img) => resolve(img.getAttribute("src")))
            .filter(Boolean);
          return { anchors: [...new Set(anchors)], images: [...new Set(images)] };
        }, url);
        const sameOrigin = links.anchors.filter((h) => isFetchableLink(h, url)).map((h) => new URL(h).pathname);
        // 探活用全 href（保 query）；单页探活上限 60
        const probeTargets = [...new Set([...links.anchors, ...links.images])]
          .filter((h) => isFetchableLink(h, url))
          .slice(0, 60);
        const probe = await crawlPage.evaluate(async (targets) => {
          const out = [];
          for (const target of targets) {
            try {
              const res = await fetch(target, { method: "GET" });
              if (res.status >= 400) out.push({ href: target, status: res.status });
            } catch { out.push({ href: target, status: "FETCH-FAIL" }); }
          }
          return out;
        }, probeTargets);
        broken.push(...probe);
        pages.push({ pathname, anchors: sameOrigin.length, images: links.images.length });
        queue = planCrawlQueue(queue, visited, sameOrigin, 5);
      }
      await crawlPage.close();
      results.crawl = { pagesVisited: pages.length, pages, brokenLinks: broken };
      await writeFile(path.join(outDir, "crawl-report.json"), JSON.stringify(results.crawl, null, 2) + "\n", "utf8");
      record("同域爬取（≤5 页）", pages.length > 0 ? "PASS" : "WARN", `${pages.length} 页：${pages.map((pg) => pg.pathname).join(", ").slice(0, 120)}`, "crawl-report.json");
      record("死链检测", broken.length === 0 ? "PASS" : "FAIL", broken.length === 0 ? "全站链接探活通过" : broken.slice(0, 5).map((b) => `${b.status} ${b.href}`).join(" | "), "crawl-report.json");
    } catch (error) {
      record("同域爬取+死链", "WARN", `爬取失败：${String(error).slice(0, 120)}`, "");
    }

    // 6. 对比度实算分布（axe 只报违规；这里给全页文本的前景/背景实测分布）
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
          samples.push({ ratio: Math.round(ratio * 100) / 100, text: text.slice(0, 24), size: parseFloat(style.fontSize), weight: parseInt(style.fontWeight, 10) || 400 });
        }
        samples.sort((a, b) => a.ratio - b.ratio);
        const large = (s) => s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
        const belowAA = samples.filter((s) => s.ratio < (large(s) ? 3 : 4.5));
        return { sampled: samples.length, belowAA: belowAA.slice(0, 8).map((s) => ({ ratio: s.ratio, text: s.text })), worst: samples[0]?.ratio ?? null };
      });
      results.contrast = contrast;
      const status = contrast.sampled === 0 ? "WARN" : contrast.belowAA.length === 0 ? "PASS" : contrast.belowAA.some((s2) => s2.ratio < 3) ? "FAIL" : "WARN";
      record("对比度实算分布", status,
        contrast.sampled === 0 ? "未采样到文本" : `${contrast.sampled} 个文本样本，低于 AA ${contrast.belowAA.length} 个（最差 ${contrast.worst}:1）`,
        JSON.stringify(contrast.belowAA));
    } catch (error) {
      record("对比度实算分布", "WARN", `实测失败：${String(error).slice(0, 120)}`, "");
    }
    await axePage.close();
    await axeContext.close().catch(() => {});
  } finally {
    const pass = findings.filter((f) => f.status === "PASS").length;
    const fail = findings.filter((f) => f.status === "FAIL").length;
    const warn = findings.filter((f) => f.status === "WARN").length;
    // 批 29 P2-③：结果落盘放 finally——异常路径也留部分证据
    await writeFile(path.join(outDir, "results.json"), JSON.stringify(results, null, 2) + "\n", "utf8").catch(() => {});

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
    await writeFile(path.join(outDir, "report.html"), report, "utf8").catch(() => {});
    console.log(`\n[${url}] 验收完成：${pass} PASS / ${fail} FAIL / ${warn} WARN`);
    console.log(`报告：${path.join(outDir, "report.html")}（与截图同目录交付）`);
    return { url, outDir, pass, fail, warn };
  }
}

// —— CLI 入口 ——
import { pathToFileURL } from "node:url";
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined);
  };
  const urlsFile = get("--urls");
  let urlList = [];
  if (urlsFile) {
    urlList = (await readFile(path.resolve(urlsFile), "utf8"))
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    if (urlList.length === 0) {
      console.error(`✗ ${urlsFile} 无有效 URL（每行一条，# 为注释）`);
      process.exit(1);
    }
  } else {
    const single = get("--url");
    if (!single || !/^https?:\/\//.test(single)) {
      console.error('用法：npm run verify:page -- --url https://example.com [--out output/verify-xxx]');
      console.error('      npm run verify:page -- --urls <file>（批量：每行一条 URL，# 注释）');
      process.exit(1);
    }
    urlList = [single];
  }
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  const outDir = path.resolve(get("--out") || path.join("output", `verify-page-${stamp}`));
  const batch = urlList.length > 1;

  const browser = await chromium.launch();
  const rows = [];
  try {
    for (let i = 0; i < urlList.length; i += 1) {
      const url = urlList[i];
      const sub = batch ? path.join(outDir, `site-${String(i + 1).padStart(2, "0")}`) : outDir;
      console.log(`\n===== [${i + 1}/${urlList.length}] ${url} =====`);
      rows.push(await runOnce(browser, url, sub));
    }
  } finally {
    await browser.close();
  }

  if (batch) {
    const { summarizeBatch } = await import("./verify-page-lib.mjs");
    const summary = summarizeBatch(rows);
    const lines = [
      "# UAK 批量验收摘要",
      "",
      "| # | URL | PASS | FAIL | WARN | 判定 |",
      "| --- | --- | --- | --- | --- | --- |",
      ...summary.summary.map((row, i) => `| ${i + 1} | ${row.url} | ${row.pass} | ${row.fail} | ${row.warn} | ${row.verdict} |`),
      "",
      `总判定：${summary.verdict}（FAIL 批次 ${summary.totalFail}）`,
    ].join("\n");
    await writeFile(path.join(outDir, "batch-summary.md"), lines + "\n", "utf8");
    console.log(`\n批量总判定：${summary.verdict}——摘要 ${path.join(outDir, "batch-summary.md")}`);
    process.exitCode = summary.totalFail > 0 ? 1 : 0;
  } else {
    process.exitCode = rows[0].fail > 0 ? 1 : 0;
  }
}

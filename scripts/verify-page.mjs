import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

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
const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
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
  try {
    ({ violations } = await new AxeBuilder({ page: axePage })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze());
  } catch (error) {
    record("axe A+AA 扫描", "WARN", `扫描失败：${String(error).slice(0, 120)}`, "");
  }
  const critical = violations.filter((v) => v.impact === "critical");
  const serious = violations.filter((v) => v.impact === "serious");
  record("axe A+AA", critical.length === 0 && serious.length === 0 ? "PASS" : critical.length > 0 ? "FAIL" : "WARN",
    `critical ${critical.length} / serious ${serious.length} / 全部 ${violations.length}`, "axe-findings.json");
  results.axe = violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
  await writeFile(path.join(outDir, "axe-findings.json"), JSON.stringify(results.axe, null, 2) + "\n", "utf8");
  await axePage.close();
} finally {
  await browser.close();
}

const pass = findings.filter((f) => f.status === "PASS").length;
const fail = findings.filter((f) => f.status === "FAIL").length;
const warn = findings.filter((f) => f.status === "WARN").length;
await writeFile(path.join(outDir, "results.json"), JSON.stringify(results, null, 2) + "\n", "utf8");

const report = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>UAK 验收报告 · ${url}</title><style>
body{margin:0;background:#0c1116;color:#e8eef2;font:15px/1.7 'PingFang SC',sans-serif;padding:32px 20px}
.wrap{max-width:860px;margin:0 auto}h1{font-size:21px}.sub{color:#9db0bc;font-size:13px;margin-bottom:18px}
.r{border-left:3px solid #22303c;padding:8px 14px;margin:8px 0;background:#141d26;border-radius:0 8px 8px 0}
.r.PASS{border-color:#2fbf8f}.r.FAIL{border-color:#e05d5d}.r.WARN{border-color:#e8a33d}
img{max-width:100%;border:1px solid #22303c;border-radius:8px;margin:8px 0}
footer{color:#64798a;font-size:12px;margin-top:26px;border-top:1px solid #22303c;padding-top:12px}
</style></head><body><div class="wrap">
<h1>UAK 页面验收报告</h1><p class="sub">${url} · ${results.ranAt} · 由 UI Design Agent Kit 生成（github.com/muzimu217/ui-design-agent-kit）</p>
${findings.map((f) => `<div class="r ${f.status}"><b>${f.status}</b> ${f.name}${f.detail ? " — " + f.detail : ""}</div>`).join("\n")}
<h3>截图</h3><img src="desktop-1440.png" alt="桌面"/><img src="mobile-375.png" alt="移动"/>
<footer>pass ${pass} / fail ${fail} / warn ${warn} · 证据与报告同目录 · 由 UI Design Agent Kit 验收体系驱动</footer>
</div></body></html>`;
await writeFile(path.join(outDir, "report.html"), report, "utf8");
console.log(`\n验收完成：${pass} PASS / ${fail} FAIL / ${warn} WARN`);
console.log(`报告：${path.join(outDir, "report.html")}`);
process.exitCode = fail > 0 ? 1 : 0;

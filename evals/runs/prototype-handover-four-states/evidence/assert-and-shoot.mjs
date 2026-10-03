// 四态场景实机断言（R149-01 续批·prototype-handover-four-states）
// 用法：node assert-and-shoot.mjs <http-port>   （fixture 目录）
// 产物：results.txt（stdout 重定向）+ 四态截图（同目录）
// 教训 17/18：本脚本自己写文件；服务由外层spawn 管理，端口用完即关。
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FIXTURE = path.resolve(process.argv[2] || ".");
const PORT = Number(process.argv[3] || 8931);
const MIME = { ".html": "text/html", ".json": "application/json" };
const lines = [];
const say = (line) => { lines.push(line); console.log(line); };

const server = createServer(async (req, res) => {
  const rel = req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0];
  try {
    const body = await readFile(path.join(FIXTURE, rel));
    res.writeHead(200, { "content-type": MIME[path.extname(rel)] || "text/plain" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((resolve) => server.listen(PORT, resolve));

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 720 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); say(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`); };

await page.goto(`http://127.0.0.1:${PORT}/?state=normal`, { waitUntil: "networkidle" });

// 1. 数据单口：DOM 关键值与 mock 一致（无硬编码——值必然来自 fetch）
const mock = JSON.parse(await readFile(path.join(FIXTURE, "mock_data.json"), "utf8"));
const firstCode = await page.locator("#rows tr td:nth-child(2)").first().textContent();
check("数据单口：首行编号来自 mock_data.json", firstCode === mock.items[0].code, `DOM=${firstCode} mock=${mock.items[0].code}`);
// 硬编码检查看静态源文件（剥除 script 后不应出现任何业务值）——
// 首版用渲染后 DOM 查，JS 渲染值必然命中，属断言方法错（轮 292 内环）。
const sourceHtml = await readFile(path.join(FIXTURE, "index.html"), "utf8");
const staticPart = sourceHtml.replace(/<script[\s\S]*?<\/script>/g, "");
const businessDataHardcoded = [...mock.items, mock.stats].some((entry) =>
  Object.values(entry).some((value) =>
    typeof value === "string" && value.length >= 3 && staticPart.includes(value)
  )
);
check("组件标记零硬编码业务数据", !businessDataHardcoded, "静态源文件（剥 script）无 mock 值");

// 2. 四态切换（不改代码）
const states = ["normal", "loading", "empty", "error"];
for (const state of states) {
  await page.click(`.switcher button[data-state="${state}"]`);
  const visible = await page.locator(`#panel-${state}:not(.hidden)`).count();
  check(`四态可切换：${state}`, visible === 1);
}
// URL 直达
await page.goto(`http://127.0.0.1:${PORT}/?state=empty`, { waitUntil: "networkidle" });
const emptyShown = await page.locator("#panel-empty:not(.hidden)").count();
check("URL 参数直达空态", emptyShown === 1);

// 3. 骨架形状与正常态同构（块数一致：stats 卡数=3、行数=items.length）
await page.click('.switcher button[data-state="loading"]');
const skStats = await page.locator("#sk-stats .stat").count();
const skRows = await page.locator("#sk-rows .skeleton-row").count();
check("骨架 stats 卡数=stats 键数", skStats === Object.keys(mock.stats).length, `${skStats}`);
check("骨架行数=items.length", skRows === mock.items.length, `${skRows} vs ${mock.items.length}`);

// 4. 空态行动邀请（copy-contract：裸"暂无数据"不算）
await page.click('.switcher button[data-state="empty"]');
const emptyText = await page.locator("#panel-empty").textContent();
check("空态=行动邀请非裸提示", emptyText.includes("新建") && !/^\s*暂无数据\s*$/.test(emptyText));

// 5. 错误态=原因+修复双通道
await page.click('.switcher button[data-state="error"]');
const errText = await page.locator("#panel-error").textContent();
check("错误态=原因+修复", errText.includes("原因") && errText.includes("修复"));

// 6. 语义 token 零自由 hex（样式块 hex 仅在 :root token 定义区）
const styleText = await page.evaluate(() => document.querySelector("style").textContent);
const outsideRoot = styleText.slice(styleText.indexOf("}") + 1);
const freeHex = outsideRoot.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
check("语义 token 外零自由 hex", freeHex.length === 0, freeHex.join(",") || "无");

// 7. console 零错误
check("console 零错误", errors.length === 0, errors.join(" | ").slice(0, 200));

// 截图四态（D10：每张由本脚本捕获后写入，供主会话复核）
await page.goto(`http://127.0.0.1:${PORT}/?state=normal`, { waitUntil: "networkidle" });
for (const state of states) {
  if (state !== "normal") await page.click(`.switcher button[data-state="${state}"]`);
  await page.screenshot({ path: path.join(FIXTURE, "..", `state-${state}.png`) });
}
say("四态截图已写 state-*.png");

await browser.close();
server.close();

const passCount = results.filter((r) => r.ok).length;
await writeFile(path.join(FIXTURE, "..", "results.txt"), lines.join("\n") + `\n\n总计: ${passCount}/${results.length} PASS\n`, "utf8");
say(`总计 ${passCount}/${results.length} PASS`);
if (passCount !== results.length) process.exit(1);

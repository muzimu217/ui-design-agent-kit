// verify-page 的可测试纯函数库（CLI 主脚本保持直跑形态；测试只 import 本文件）

// 同域 http(s) 链接过滤（爬取候选与死链探活共用；data:/blob:/javascript:/mailto/锚点拒绝）
export function isFetchableLink(href, baseHref) {
  if (typeof href !== "string" || href.trim() === "" || href.startsWith("#")) return false;
  try {
    const u = new URL(href, baseHref);
    return u.origin === new URL(baseHref).origin && ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

// 爬取队列决策（纯函数）：把同域候选并入 BFS 队列。
// 上限语义：visited.size + queue.length < maxPages 才入队——
// 出队时 visited 只增不减，总量恰好封顶 maxPages；重复/已访问候选跳过。
export function planCrawlQueue(queue, visited, candidates, maxPages) {
  const next = [...queue];
  for (const candidate of candidates) {
    if (visited.has(candidate) || next.includes(candidate)) continue;
    if (next.length + visited.size >= maxPages) break;
    next.push(candidate);
  }
  return next;
}

// 批量验收聚合（纯函数）：逐 URL 结果 → 摘要行与总判定
// （任一 FAIL → 总 FAIL；无 FAIL 有 WARN → 总 WARN）
export function summarizeBatch(rows) {
  const summary = rows.map((row) => ({
    url: row.url,
    pass: row.pass,
    fail: row.fail,
    warn: row.warn,
    verdict: row.fail > 0 ? "FAIL" : row.warn > 0 ? "WARN" : "PASS",
  }));
  const totalFail = summary.filter((s) => s.verdict === "FAIL").length;
  const verdict = totalFail > 0 ? "FAIL" : summary.some((s) => s.verdict === "WARN") ? "WARN" : "PASS";
  return { summary, totalFail, verdict };
}

// URL 清单解析（--urls 批量）：解析行→去注释→trim→scheme 校验。
// 返回 { urls, invalid }——invalid 如实返回由调用方决定报错或跳过。
export function parseUrlList(text) {
  const urls = [];
  const invalid = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^https?:\/\//i.test(line)) urls.push(line);
    else invalid.push(line);
  }
  return { urls, invalid };
}

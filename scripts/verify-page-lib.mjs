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

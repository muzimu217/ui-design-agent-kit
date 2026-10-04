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

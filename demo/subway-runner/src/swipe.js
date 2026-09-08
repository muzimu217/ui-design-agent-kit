/**
 * 触屏滑动分类（纯函数，供 input.ts 与 node --test 共用）。
 * 返回 null 表示未达阈值（视为点按，不产生动作）。
 */
export function classifySwipe(dx, dy, threshold = 24) {
  const dist = Math.hypot(dx, dy);
  if (dist < threshold) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

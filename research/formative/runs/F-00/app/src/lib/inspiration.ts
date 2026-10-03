export interface InspirationTask {
  name: string;
  /** 计划番茄数 */
  est: number;
}

/** 每日灵感任务池 12 条（迭代工单原文，原样使用不改写） */
const POOL: InspirationTask[] = [
  { name: '清理收件箱到零', est: 1 },
  { name: '给当前项目写 3 条周报要点', est: 1 },
  { name: '读一篇技术文章并记 3 条要点', est: 2 },
  { name: '重构一段你最想改的代码', est: 2 },
  { name: '给明天列 3 件要事', est: 1 },
  { name: '整理下载文件夹和桌面', est: 1 },
  { name: '做一道算法题并写下思路', est: 1 },
  { name: '散步 15 分钟，不想工作', est: 1 },
  { name: '写 200 字今日复盘', est: 1 },
  { name: '给常用小工具写一条快捷键笔记', est: 1 },
  { name: '检查昨天的提交，补上遗漏说明', est: 1 },
  { name: '学一个新快捷键并当天用三次', est: 1 },
];

/** 当年第几天（本地时区，按日历日精确计算，不受夏令时影响） */
export function dayOfYear(d: Date = new Date()): number {
  return Math.round(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(d.getFullYear(), 0, 0)) /
      86_400_000,
  );
}

/** 今日灵感：dayOfYear % 12 轮换，同一天稳定同一题 */
export function todayInspiration(d: Date = new Date()): InspirationTask {
  return POOL[dayOfYear(d) % POOL.length] ?? POOL[0];
}

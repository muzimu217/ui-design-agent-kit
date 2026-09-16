/**
 * 潮汐 TIDE · 演示数据模型
 *
 * 实现依据：demo/tide-app/docs/DESIGN.md（设计契约，门D 通过）
 *   - 第 9.1 节：h(t) = 1.15·sin(2πt/12.42 + φ₁) + 0.35·sin(2πt/12.00 + φ₂)，采样 145 点
 *   - 第 5 节：潮位 2 位小数 + 米；时间 24 小时制 HH:MM
 *   - 第 8 节：CurveInUse 的判断数值必须与曲线来自同一份数据
 *
 * 数据是本地生成的演示数据，不接任何真实数据源（契约第 2 节「内容现实」）。
 *
 * 契约把 φ₁ / φ₂ 明确留给实现期拟合（契约文末「待定项 1」），只要求产生合理的高低潮时刻
 * （契约举的例子是「高潮在 06:11 与 18:30 附近」）。下面这组相位即按该例子拟合得到。
 */

/** 每个采样点代表 10 分钟（契约 9.1）。 */
export const SAMPLE_INTERVAL_MINUTES = 10;
/** 00:00–24:00，每 10 分钟一点 → 145 点（契约 9.1）。 */
export const SAMPLE_COUNT = 145;
/** 时间轴 `max`：144 步（契约 Do #5）。 */
export const AXIS_MAX = SAMPLE_COUNT - 1;
/** 当日分钟数。 */
export const DAY_MINUTES = 24 * 60;

/** 半日潮主分潮 M2（契约 9.1 公式第一项）。 */
export const M2_AMPLITUDE_M = 1.15;
export const M2_PERIOD_HOURS = 12.42;
/** 半日潮次分潮 S2（契约 9.1 公式第二项）。 */
export const S2_AMPLITUDE_M = 0.35;
export const S2_PERIOD_HOURS = 12.0;

/** 拟合相位：使高潮落在 06:10 / 18:30、低潮落在 12:20（契约「待定项 1」的示例区间）。 */
export const M2_PHASE = -Math.PI / 2 + 0.23;
export const S2_PHASE = -Math.PI / 2 - 0.83;

/**
 * 基准面偏移：契约公式本身以「米，相对最低低潮面」为单位。
 * 相对最低低潮面的潮位按定义不为负，而纯正弦叠加会在半日里取到负值，
 * 因此加上两项振幅之和（1.50 m）作为基准面，使曲线全程 ≥ 0 且最低点贴近 0。
 * 这一处是契约文字与公式之间的缺口，已在交付报告中列为待澄清项，未改动契约任何数值。
 */
export const DATUM_OFFSET_M = M2_AMPLITUDE_M + S2_AMPLITUDE_M;

/** 平潮判定阈值：1 小时内的潮位变化小于该值时视为平潮（米/小时）。 */
export const SLACK_RATE_M_PER_HOUR = 0.06;

/** 赶海窗口长度：低潮前两小时（契约 8 节第 3 屏示例、Do #9）。 */
export const FORAGING_WINDOW_MINUTES = 120;

export type TidePoint = {
  /** 时间轴步数，0–144。 */
  step: number;
  /** 当日分钟数，0–1440。 */
  minutes: number;
  /** 潮位，米。 */
  level: number;
};

export type ExtremumKind = 'high' | 'low';

export type Extremum = TidePoint & { kind: ExtremumKind };

export type TideTrend = 'rising' | 'falling' | 'slack';

export type TideWindow = {
  fromMinutes: number;
  toMinutes: number;
};

export type ForagingWindow = TideWindow & { low: Extremum };

export type FishingWindow = TideWindow & {
  fromLevel: number;
  toLevel: number;
  gain: number;
};

export type TideSummary = {
  highs: Extremum[];
  lows: Extremum[];
  /** 当日最高潮位。 */
  highest: Extremum;
  /** 当日最低潮位。 */
  lowest: Extremum;
  /** 当日潮差（米）。 */
  tidalRange: number;
  /** 低潮前两小时。低潮发生得太早（窗口跨到前一日）时为 null。 */
  foraging: ForagingWindow | null;
  /** 涨潮最急的两小时。当日无净上涨时为 null。 */
  fishing: FishingWindow | null;
};

export type TideDay = {
  points: TidePoint[];
  extrema: Extremum[];
  /** 数据不足以支撑判断时为 null。 */
  summary: TideSummary | null;
  levelMin: number;
  levelMax: number;
  /** 绘图区纵轴下界。 */
  domainMin: number;
  /** 绘图区纵轴上界。 */
  domainMax: number;
};

/** 潮位随时间变化的解析式（契约 9.1）。 */
export function levelAtMinutes(minutes: number): number {
  const hours = minutes / 60;
  return (
    DATUM_OFFSET_M +
    M2_AMPLITUDE_M * Math.sin((2 * Math.PI * hours) / M2_PERIOD_HOURS + M2_PHASE) +
    S2_AMPLITUDE_M * Math.sin((2 * Math.PI * hours) / S2_PERIOD_HOURS + S2_PHASE)
  );
}

/** 生成 00:00–24:00 的等间隔采样点。count < 2 时返回空数组（对应「数据不可用」）。 */
export function generatePoints(count: number = SAMPLE_COUNT): TidePoint[] {
  if (!Number.isInteger(count) || count < 2) return [];
  return Array.from({ length: count }, (_, step) => {
    const minutes = step * SAMPLE_INTERVAL_MINUTES;
    return { step, minutes, level: levelAtMinutes(minutes) };
  });
}

/** 在采样序列内部找出高低潮。端点不参与比较（当日的第一个/最后一个极值不标注）。 */
export function detectExtrema(points: TidePoint[]): Extremum[] {
  const extrema: Extremum[] = [];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    if (current.level > previous.level && current.level >= next.level) {
      extrema.push({ ...current, kind: 'high' });
    } else if (current.level < previous.level && current.level <= next.level) {
      extrema.push({ ...current, kind: 'low' });
    }
  }
  return extrema;
}

/** 涨 / 退 / 平：用游标前后各 30 分钟的中心差分求潮位变化率。 */
export function trendAtMinutes(minutes: number): TideTrend {
  const halfWindow = 30;
  const from = Math.max(0, minutes - halfWindow);
  const to = Math.min(DAY_MINUTES, minutes + halfWindow);
  const hours = (to - from) / 60;
  if (hours <= 0) return 'slack';
  const rate = (levelAtMinutes(to) - levelAtMinutes(from)) / hours;
  if (rate > SLACK_RATE_M_PER_HOUR) return 'rising';
  if (rate < -SLACK_RATE_M_PER_HOUR) return 'falling';
  return 'slack';
}

const trendLabels: Record<TideTrend, string> = {
  rising: '涨潮中',
  falling: '退潮中',
  slack: '平潮',
};

export function trendLabel(trend: TideTrend): string {
  return trendLabels[trend];
}

/** 找出涨潮最急的连续两小时（按采样步长扫描，取净上涨最大的一段）。 */
export function findFishingWindow(points: TidePoint[]): FishingWindow | null {
  const span = FORAGING_WINDOW_MINUTES / SAMPLE_INTERVAL_MINUTES;
  if (points.length <= span) return null;
  let best: FishingWindow | null = null;
  for (let index = 0; index + span < points.length; index += 1) {
    const from = points[index];
    const to = points[index + span];
    const gain = to.level - from.level;
    if (gain <= 0) continue;
    if (!best || gain > best.gain) {
      best = { fromMinutes: from.minutes, toMinutes: to.minutes, fromLevel: from.level, toLevel: to.level, gain };
    }
  }
  return best;
}

/** 低潮前两小时的赶海窗口。低潮太早（窗口跨到前一日）时返回 null。 */
export function findForagingWindow(lowest: Extremum): ForagingWindow | null {
  const fromMinutes = lowest.minutes - FORAGING_WINDOW_MINUTES;
  if (fromMinutes < 0) return null;
  return { fromMinutes, toMinutes: lowest.minutes, low: lowest };
}

/** 汇总当日读数：高低潮、潮差、两个使用窗口。数据不足时返回 null。 */
export function summarizeDay(points: TidePoint[], extrema: Extremum[]): TideSummary | null {
  const highs = extrema.filter(item => item.kind === 'high');
  const lows = extrema.filter(item => item.kind === 'low');
  if (points.length < 2 || highs.length === 0 || lows.length === 0) return null;

  const highest = highs.reduce((best, item) => (item.level > best.level ? item : best));
  const lowest = lows.reduce((best, item) => (item.level < best.level ? item : best));

  return {
    highs,
    lows,
    highest,
    lowest,
    tidalRange: highest.level - lowest.level,
    foraging: findForagingWindow(lowest),
    fishing: findFishingWindow(points),
  };
}

/**
 * 生成一天的演示数据。sampleCount < 2 时视为数据不可用（points 为空、summary 为 null），
 * 对应契约 9.1 的「空」状态；界面不得伪造曲线。
 */
export function createTideDay(sampleCount: number = SAMPLE_COUNT): TideDay {
  const points = generatePoints(sampleCount);
  const extrema = detectExtrema(points);
  const summary = summarizeDay(points, extrema);
  const levels = points.map(point => point.level);
  const levelMin = levels.length ? Math.min(...levels) : 0;
  const levelMax = levels.length ? Math.max(...levels) : 0;
  return { points, extrema, summary, levelMin, levelMax, domainMin: levelMin, domainMax: levelMax };
}

/** 把任意分钟数夹到 00:00–24:00 并吸附到最近的时间轴步数。 */
export function stepForMinutes(minutes: number): number {
  const clamped = Math.min(DAY_MINUTES, Math.max(0, minutes));
  return Math.min(AXIS_MAX, Math.max(0, Math.round(clamped / SAMPLE_INTERVAL_MINUTES)));
}

export function minutesForStep(step: number): number {
  return Math.min(AXIS_MAX, Math.max(0, Math.round(step))) * SAMPLE_INTERVAL_MINUTES;
}

/** 当前时刻对应的初始游标步数（契约 9.2：value = 当前时刻步数）。 */
export function stepForDate(date: Date): number {
  return stepForMinutes(date.getHours() * 60 + date.getMinutes());
}

/** 24 小时制 HH:MM，补零以保持等宽数字宽度稳定（B1）。 */
export function formatClock(minutes: number): string {
  const clamped = Math.min(DAY_MINUTES, Math.max(0, Math.round(minutes)));
  const hours = Math.floor(clamped / 60);
  const rest = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** 潮位保留 2 位小数（契约第 5 节「数字写法」）。 */
export function formatLevel(level: number): string {
  return level.toFixed(2);
}

export function formatLevelWithUnit(level: number): string {
  return `${formatLevel(level)} 米`;
}

export function formatWindow(window: TideWindow): string {
  return `${formatClock(window.fromMinutes)}–${formatClock(window.toMinutes)}`;
}

/** 读数的整句播报文本（契约 4 节第 3 条 / 9.2 aria-valuetext）。 */
export function readoutSentence(minutes: number, level: number): string {
  return `${formatClock(minutes)}，潮位 ${formatLevelWithUnit(level)}，${trendLabel(trendAtMinutes(minutes))}`;
}

/** 曲线的无障碍概述（契约 9.1：SVG 用 aria-label 概述当日高低潮时刻）。 */
export function describeDay(day: TideDay): string {
  const { summary } = day;
  if (!summary) return '今日潮汐曲线：暂无数据。';
  const parts = day.extrema.map(
    item => `${formatClock(item.minutes)} ${item.kind === 'high' ? '高潮' : '低潮'} ${formatLevelWithUnit(item.level)}`,
  );
  return `今日潮汐曲线：${parts.join('，')}。当日潮差 ${formatLevelWithUnit(summary.tidalRange)}。`;
}

/**
 * 第三屏 CurveInUse 的判断。全部数值来自同一天的演示数据（契约 8 节 / Do #9），
 * 只讲「这条曲线怎么用」，不解释潮汐原理（B2）。
 */
export type CurveInUseItem = {
  id: 'foraging' | 'fishing' | 'photography';
  title: string;
  body: string;
  value: string;
};

export function buildCurveInUse(day: TideDay): CurveInUseItem[] {
  const { summary } = day;
  if (!summary) return [];
  const items: CurveInUseItem[] = [];

  if (summary.foraging) {
    items.push({
      id: 'foraging',
      title: '赶海窗口',
      body: `低潮在 ${formatClock(summary.foraging.toMinutes)}，往前两小时滩涂露得最多。`,
      value: `${formatWindow(summary.foraging)} · 低潮 ${formatLevelWithUnit(summary.foraging.low.level)}`,
    });
  }

  if (summary.fishing) {
    items.push({
      id: 'fishing',
      title: '海钓窗口',
      body: `涨潮最急的两小时，潮位从 ${formatLevelWithUnit(summary.fishing.fromLevel)} 升到 ${formatLevelWithUnit(summary.fishing.toLevel)}。`,
      value: formatWindow(summary.fishing),
    });
  }

  items.push({
    id: 'photography',
    title: '最高潮位',
    body: `当日最高潮位出现在 ${formatClock(summary.highest.minutes)}，礁石线完全没过。`,
    value: `${formatClock(summary.highest.minutes)} · ${formatLevelWithUnit(summary.highest.level)}`,
  });

  return items;
}

/** 场景卡引用的数值，与曲线、第三屏同源（A3 ⑤：具体数值旁必须标演示数据）。 */
export type ScenarioValues = {
  fishing: string;
  foraging: string;
  photography: string;
};

export function buildScenarioValues(day: TideDay): ScenarioValues | null {
  const { summary } = day;
  if (!summary) return null;
  return {
    fishing: summary.fishing ? formatWindow(summary.fishing) : '今日示例数据不可用',
    foraging: summary.foraging
      ? `低潮 ${formatClock(summary.foraging.low.minutes)} · ${formatLevelWithUnit(summary.foraging.low.level)}`
      : '今日示例数据不可用',
    photography: `${formatClock(summary.highest.minutes)} · ${formatLevelWithUnit(summary.highest.level)}`,
  };
}

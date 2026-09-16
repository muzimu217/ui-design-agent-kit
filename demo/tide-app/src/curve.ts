/**
 * 潮汐曲线的绘图几何。与 model.ts 分开，便于单独测试。
 *
 * 坐标策略：
 *  - SVG 的 viewBox 与内区像素尺寸 1:1（由 ResizeObserver 测得），路径坐标就是像素坐标，
 *    描边不会被非等比缩放拉扁。
 *  - 内区（`.curve-inner`）由 CSS 的 `--plot-inset` 上下留白带从绘图区里让出来：
 *    高潮标注画在上带、低潮标注画在下带，因此标注永远落在空白处，
 *    不需要底色或边框衬底（门D D1：不可点击的标注不得呈现按钮样式）。
 *  - 留白带用 rem，浏览器文字缩放时跟着长，标注不会压到曲线上。
 */

import { AXIS_MAX, DAY_MINUTES, type TideDay, type TidePoint } from './model.ts';

export type PlotBox = { width: number; height: number };

export type PlotGeometry = {
  width: number;
  height: number;
  domainMin: number;
  domainMax: number;
};

/** 在已测量的内区尺寸上建立坐标映射。数据不足时给一个不会除零的纵轴范围。 */
export function createGeometry(day: TideDay, box: PlotBox): PlotGeometry {
  const width = Math.max(1, box.width);
  const height = Math.max(1, box.height);
  const domainMin = day.domainMin;
  const domainMax = day.domainMax > day.domainMin ? day.domainMax : day.domainMin + 1;
  return { width, height, domainMin, domainMax };
}

/** 分钟数 → 内区 x 像素。 */
export function xForMinutes(minutes: number, geometry: PlotGeometry): number {
  const ratio = Math.min(1, Math.max(0, minutes / DAY_MINUTES));
  return ratio * geometry.width;
}

/** 潮位 → 内区 y 像素。最高潮位在内区上沿（y=0），最低潮位在下沿（y=height）。 */
export function yForLevel(level: number, geometry: PlotGeometry): number {
  const span = geometry.domainMax - geometry.domainMin;
  const ratio = (geometry.domainMax - level) / span;
  return ratio * geometry.height;
}

export function xForPoint(point: TidePoint, geometry: PlotGeometry): number {
  return xForMinutes(point.minutes, geometry);
}

export function yForPoint(point: TidePoint, geometry: PlotGeometry): number {
  return yForLevel(point.level, geometry);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 曲线下方渐变填充的外轮廓：沿曲线走一遍，再闭合到内区下沿。 */
export function buildAreaPath(points: TidePoint[], geometry: PlotGeometry): string {
  if (points.length < 2) return '';
  const line = buildSmoothPath(points, geometry);
  const last = points[points.length - 1];
  return `${line} L${round(xForPoint(last, geometry))} ${round(geometry.height)} L${round(
    xForPoint(points[0], geometry),
  )} ${round(geometry.height)} Z`;
}

/**
 * 曲线描边路径。
 *
 * 采样点每 10 分钟一个，直接用 `L` 连起来会得到一条锯齿折线——潮位是连续量，
 * 折线既不好看也不真实。这里用 Catmull-Rom 样条转三次贝塞尔：曲线**精确穿过**
 * 每个采样点（与读数、标注数值一致），段间切线连续，因此是平滑的。
 *
 * 张力取 1/6 是 Catmull-Rom 的标准值（等价于均匀参数化下的三次 Hermite）。
 * 首尾段没有外侧邻居，用端点自身作为虚拟控制点，避免端部甩出去。
 */
export function buildLinePath(points: TidePoint[], geometry: PlotGeometry): string {
  return buildSmoothPath(points, geometry);
}

function buildSmoothPath(points: TidePoint[], geometry: PlotGeometry): string {
  if (points.length < 2) return '';
  const xs = points.map((point) => xForPoint(point, geometry));
  const ys = points.map((point) => yForPoint(point, geometry));

  const commands: string[] = [`M${round(xs[0])} ${round(ys[0])}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    // 首尾用端点自身作为虚拟邻居，保证端点不会因为缺少约束而外甩。
    const prev = index === 0 ? 0 : index - 1;
    const next = index + 1;
    const after = index + 2 > points.length - 1 ? points.length - 1 : index + 2;

    const c1x = xs[index] + (xs[next] - xs[prev]) / 6;
    const c1y = ys[index] + (ys[next] - ys[prev]) / 6;
    const c2x = xs[next] - (xs[after] - xs[index]) / 6;
    const c2y = ys[next] - (ys[after] - ys[index]) / 6;

    commands.push(
      `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(xs[next])} ${round(ys[next])}`,
    );
  }
  return commands.join(' ');
}

/** 横向网格线：落在纵轴范围内的每 0.5 米。纯装饰（契约 3.1 `--gridline`）。 */
export function buildGridLevels(geometry: PlotGeometry, intervalMeters = 0.5): number[] {
  const levels: number[] = [];
  const first = Math.ceil(geometry.domainMin / intervalMeters) * intervalMeters;
  for (let level = first; level <= geometry.domainMax + 1e-9; level += intervalMeters) {
    levels.push(Math.round(level * 100) / 100);
  }
  return levels;
}

/** 时间轴步数 → 分钟数（用于刻度标签）。 */
export function minutesForTick(step: number): number {
  return (step / AXIS_MAX) * DAY_MINUTES;
}

/**
 * 首屏缩略曲线：整日潮位压缩成一条窄幅波形，让第一屏就有视觉主体。
 *
 * 用与主曲线相同的平滑算法与坐标映射，所以两处形状一致——缩略图不是装饰图形，
 * 它是同一份数据的另一种比例。传入 `width`/`height` 由调用方按容器给定。
 */
export function buildSparkline(
  points: TidePoint[],
  box: PlotBox,
  day: Pick<TideDay, 'domainMin' | 'domainMax'>,
): string {
  if (points.length < 2) return '';
  const geometry = createGeometry(day as TideDay, box);
  return buildSmoothPath(points, geometry);
}

/** 首屏缩略曲线的填充轮廓（同一条线闭到底边）。 */
export function buildSparkArea(
  points: TidePoint[],
  box: PlotBox,
  day: Pick<TideDay, 'domainMin' | 'domainMax'>,
): string {
  if (points.length < 2) return '';
  const geometry = createGeometry(day as TideDay, box);
  const line = buildSmoothPath(points, geometry);
  return `${line} L${round(geometry.width)} ${round(geometry.height)} L0 ${round(geometry.height)} Z`;
}

/**
 * 场景卡里的当日波形 + 一个高亮时段。
 *
 * 每张卡画同一条整日曲线，并把该场景关心的时段（涨潮窗口 / 退潮窗口 / 极值时刻）
 * 用一段更亮的描边叠出来。这是数据，不是装饰：高亮范围直接来自该卡的数值来源，
 * 卡片因此能"指"出自己在讲曲线上的哪一段。
 */
export type SparkWindow = { fromMinutes: number; toMinutes: number };

export function buildScenarioSpark(
  points: TidePoint[],
  box: PlotBox,
  day: Pick<TideDay, 'domainMin' | 'domainMax'>,
  window: SparkWindow | null,
): { base: string; highlight: string; windowRect: { x: number; width: number } | null } {
  if (points.length < 2) return { base: '', highlight: '', windowRect: null };
  const geometry = createGeometry(day as TideDay, box);
  const base = buildSmoothPath(points, geometry);
  if (!window) return { base, highlight: '', windowRect: null };

  const x0 = xForMinutes(window.fromMinutes, geometry);
  const x1 = xForMinutes(window.toMinutes, geometry);
  const inside = points.filter(
    (point) => point.minutes >= window.fromMinutes && point.minutes <= window.toMinutes,
  );
  // 窗口端点也纳入，保证高亮段的起点与终点精确落在窗口边界上。
  const segment =
    inside.length >= 2
      ? inside
      : points.filter((point) => point.minutes >= window.fromMinutes - 10 && point.minutes <= window.toMinutes + 10);

  return {
    base,
    highlight: segment.length >= 2 ? buildSmoothPath(segment, geometry) : '',
    windowRect: { x: x0, width: Math.max(2, x1 - x0) },
  };
}

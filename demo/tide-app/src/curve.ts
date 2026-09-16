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
  const commands = points.map(
    (point, index) =>
      `${index === 0 ? 'M' : 'L'}${round(xForPoint(point, geometry))} ${round(yForPoint(point, geometry))}`,
  );
  const last = points[points.length - 1];
  return `${commands.join(' ')} L${round(xForPoint(last, geometry))} ${round(geometry.height)} L${round(
    xForPoint(points[0], geometry),
  )} ${round(geometry.height)} Z`;
}

/** 曲线描边路径。 */
export function buildLinePath(points: TidePoint[], geometry: PlotGeometry): string {
  if (points.length < 2) return '';
  return points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${round(xForPoint(point, geometry))} ${round(yForPoint(point, geometry))}`,
    )
    .join(' ');
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

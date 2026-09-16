/**
 * 第二屏 `TideCurve`：自绘 SVG 潮汐曲线 + 覆盖其上的 `input[type=range]` 时间轴。
 *
 * 不可协商的约束：
 *   A4 — 时间轴是可聚焦的 `input[type=range]`，方向键可调。
 *   B1 — 所有数字 tabular-nums，读数容器 min-width。
 *   B3 — range 不得用 `display:none` / `visibility:hidden`；本文件用 `opacity:0` + 定位覆盖。
 *   D1 — 高低潮标注不可点击，不得呈现按钮样式（无边框、无背景、无悬停态、无 cursor:pointer）。
 *   契约 9.1 — 曲线状态：默认 / 拖动中 / 焦点 / 减少动效 / 加载 / 空，六个都要有。
 */

import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import {
  AXIS_MAX,
  DAY_MINUTES,
  SAMPLE_INTERVAL_MINUTES,
  formatClock,
  formatLevel,
  minutesForStep,
  readoutSentence,
  stepForMinutes,
  trendAtMinutes,
  trendLabel,
  type TideDay,
  type TidePoint,
  type TideTrend,
} from './model.ts';
import {
  buildAreaPath,
  buildGridLevels,
  buildLinePath,
  createGeometry,
  minutesForTick,
  xForPoint,
  yForLevel,
  yForPoint,
  type PlotGeometry,
} from './curve.ts';
import { DemoDataBadge, UnitLabel, elegant, snappy, useReducedMotionPreference } from './ui.tsx';

export type CurveStatus = 'loading' | 'ready' | 'empty';

/** 时间轴刻度：每 6 小时一格（纯标注，不承载交互）。 */
const TICK_STEPS = [0, 36, 72, 108, 144];
/**
 * 极值贴近绘图区左右边缘时切换标注锚点，避免标注被裁掉。
 * 阈值取标注自身宽度的一半（约 48px）与绘图区宽度的 12% 的较大者，
 * 于是窄视口与宽视口都不会出现越界标注，也不会在极值靠边时还居中摆放。
 */
const ANCHOR_MARGIN_PX = 48;
function anchorMargin(width: number): number {
  return Math.max(ANCHOR_MARGIN_PX, width * 0.12);
}

type TideCurveProps = {
  status: CurveStatus;
  day: TideDay | null;
  step: number;
  onStepChange: (step: number) => void;
  /** 页面打开时取的「现在」快照，同时决定当前时刻标记的位置。 */
  nowMinutes: number;
};

/** 用 ResizeObserver 取绘图区像素尺寸，使 SVG 的 viewBox 与像素 1:1（描边不被拉伸）。 */
function usePlotBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setBox(previous =>
        Math.abs(previous.width - rect.width) < 0.5 && Math.abs(previous.height - rect.height) < 0.5
          ? previous
          : { width: rect.width, height: rect.height },
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, box };
}

export function TideCurve({ status, day, step, onStepChange, nowMinutes }: TideCurveProps) {
  const { ref, box } = usePlotBox();
  const [dragging, setDragging] = useState(false);

  const cursorStep = Math.min(AXIS_MAX, Math.max(0, step));
  const cursorMinutes = minutesForStep(cursorStep);
  const cursorPoint: TidePoint | null = day?.points[cursorStep] ?? null;
  const cursorLevel = cursorPoint?.level ?? null;
  const cursorTrend = trendAtMinutes(cursorMinutes);

  const geometry: PlotGeometry | null = day && box.width > 0 && box.height > 0 ? createGeometry(day, box) : null;
  const ready = status === 'ready' && day !== null && day.points.length > 1;
  const drawable = ready && geometry !== null && cursorPoint !== null;

  /**
   * 方向键 / PageUp / PageDown / Home / End（契约 4 节键盘路径）。
   *
   * 原生 `input[type=range]` 已经提供 Arrow ±1 步、Home/End 以及 PageUp/PageDown，
   * 但原生的 PageUp/PageDown 步长由浏览器决定，并不保证等于「6 步 = 1 小时」。
   * 因此只对这两个键覆写，其余全部保留原生行为。契约 9.2 写「全部为原生行为」，
   * 与它自己第 4 节要求的「PageUp/PageDown = ±6 步」不能同时成立，此处按第 4 节的功能要求实现，
   * 并在交付报告中登记该冲突。
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'PageUp' && event.key !== 'PageDown') return;
      event.preventDefault();
      const delta = event.key === 'PageUp' ? 6 : -6;
      onStepChange(Math.min(AXIS_MAX, Math.max(0, cursorStep + delta)));
    },
    [cursorStep, onStepChange],
  );

  const handleReset = useCallback(() => {
    onStepChange(stepForMinutes(nowMinutes));
  }, [nowMinutes, onStepChange]);

  return (
    <section className="section tide-section" id="tide-curve" aria-labelledby="tide-curve-title">
      <div className="section-inner">
        <div className="section-heading">
          <div>
            <h2 id="tide-curve-title">今日潮汐曲线</h2>
            <p className="section-detail">拖动曲线，或用 Tab 聚焦后按方向键，查清今天几点能下水。</p>
          </div>
          <DemoDataBadge variant="outline" />
        </div>

        <div className={`curve-panel is-${status}`}>
          <div className="curve-readout-row">
            <span className="readout-caption">
              <Clock size={16} aria-hidden="true" />
              游标位置
            </span>
            <TideReadout
              status={status}
              minutes={cursorMinutes}
              level={cursorLevel}
              trend={cursorTrend}
              live={status === 'ready'}
            />
            <button type="button" className="ghost-button" onClick={handleReset} disabled={!ready}>
              回到现在
            </button>
          </div>

          <div className={`curve-plot is-${status}${dragging ? ' is-dragging' : ''}`}>
            {/* 内区：由 --plot-inset 让出上下两条留白带，高通留白放高潮标注、低通留白放低潮标注。
                ResizeObserver 量的是这一层，SVG 的 viewBox 与它 1:1。 */}
            <div className="curve-inner" ref={ref}>
              {drawable && geometry && day && cursorPoint && (
                <CurveCanvas
                  day={day}
                  geometry={geometry}
                  cursorPoint={cursorPoint}
                  nowMinutes={nowMinutes}
                  dragging={dragging}
                />
              )}
            </div>

            {status === 'loading' && (
              <div className="curve-state" role="status">
                <p className="curve-state-text">正在载入今日潮位…</p>
              </div>
            )}

            {status === 'empty' && (
              <div className="curve-state" role="status">
                <p className="curve-state-text">
                  今日潮位数据暂不可用。演示数据生成失败——刷新页面可重新生成。
                </p>
              </div>
            )}

            {/* 时间轴始终渲染：契约 9.2 要求「禁用」状态真实存在，
                而禁用状态只在数据未就绪时出现。控件不得用 display:none / visibility:hidden 隐藏（B3）。 */}
            <input
              className="tide-range"
              type="range"
              min={0}
              max={AXIS_MAX}
              step={1}
              value={cursorStep}
              disabled={!ready}
              aria-label="潮汐时间轴，方向键调整，每步 10 分钟"
              aria-valuetext={cursorLevel === null ? '暂无数据' : readoutSentence(cursorMinutes, cursorLevel)}
              onChange={event => onStepChange(Number(event.currentTarget.value))}
              onKeyDown={handleKeyDown}
              onPointerDown={() => setDragging(true)}
              onPointerUp={() => setDragging(false)}
              onPointerCancel={() => setDragging(false)}
              onBlur={() => setDragging(false)}
            />

            {/* 焦点环必须画在容器上：控件本身 opacity:0，它自己的 outline 不可见。
                用相邻兄弟选择器驱动，不依赖 `:has()`。 */}
            <span className="curve-focus-ring" aria-hidden="true" />
          </div>

          <div className="curve-ticks" aria-hidden="true">
            {TICK_STEPS.map(tick => (
              <span key={tick} className="num" lang="en">
                {formatClock(minutesForTick(tick))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 读数 */

type TideReadoutProps = {
  status: CurveStatus;
  minutes: number;
  level: number | null;
  trend: TideTrend;
  live?: boolean;
};

/** 读数：时间 + 潮位（数字栈、tabular-nums、min-width）+ 涨/退潮文字标签（不依赖颜色单独表意）。 */
export function TideReadout({ status, minutes, level, trend, live = false }: TideReadoutProps) {
  const resolved = status === 'ready' && level !== null;
  const sentence = resolved
    ? readoutSentence(minutes, level)
    : status === 'loading'
      ? '正在载入今日潮位'
      : '今日潮位数据暂不可用';

  return (
    // 契约 4 节第 3 条：改值时通过 role=status / aria-live=polite / aria-atomic=true 播报整句，
    // 而不是碎片。因此可见单元格对辅助技术隐藏，只播报整句，避免同一读数被朗读两遍。
    <p className="tide-readout" {...(live ? { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } : {})}>
      <span className="visually-hidden">{sentence}</span>
      <span className="readout-time num" lang="en" aria-hidden="true">
        {resolved ? formatClock(minutes) : '--:--'}
      </span>
      <span className="readout-level num" lang="en" aria-hidden="true">
        {resolved ? formatLevel(level) : status === 'loading' ? '—.—' : '暂无数据'}
      </span>
      {resolved ? <UnitLabel /> : null}
      <span className="readout-trend" aria-hidden="true">
        {resolved ? trendLabel(trend) : status === 'loading' ? '载入中' : '不可用'}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ 画布 */

type CurveCanvasProps = {
  day: TideDay;
  geometry: PlotGeometry;
  cursorPoint: TidePoint;
  nowMinutes: number;
  dragging: boolean;
};

/**
 * 曲线画布：SVG 路径 + 标注 + 当前时刻标记 + 游标。
 *
 * 单独导出是为了让测试能用显式 geometry 直接渲染它 —— 在 SSR / 无布局环境里
 * ResizeObserver 拿不到尺寸，外层的 TideCurve 不会挂载画布，但画布自身的产物
 * （D1 的标注结构、9.1 的 role=img 与 aria-label）仍然需要被核对。
 */
export function CurveCanvas({ day, geometry, cursorPoint, nowMinutes, dragging }: CurveCanvasProps) {
  const reduceMotion = useReducedMotionPreference();
  const gradientId = `tide-fill-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;

  const linePath = buildLinePath(day.points, geometry);
  const areaPath = buildAreaPath(day.points, geometry);
  const gridLevels = buildGridLevels(geometry);

  const cursorX = xForPoint(cursorPoint, geometry);
  const cursorY = yForPoint(cursorPoint, geometry);

  const nowStep = Math.min(AXIS_MAX, Math.max(0, Math.round(nowMinutes / SAMPLE_INTERVAL_MINUTES)));
  const nowPoint = day.points[nowStep];
  const nowX = (Math.min(DAY_MINUTES, Math.max(0, nowMinutes)) / DAY_MINUTES) * geometry.width;
  const nowY = nowPoint ? yForPoint(nowPoint, geometry) : geometry.height;
  const nowLabelFlipped = nowX > geometry.width * 0.6;

  return (
    <>
      <svg
        className="curve-canvas"
        width={geometry.width}
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        role="img"
        aria-label={buildCanvasLabel(day)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {/* 曲线下方渐变填充：--accent 从 opacity 0.10 衰减到 0。0.10 是硬上限（QG4）。 */}
            <stop className="fill-stop-start" offset="0%" />
            <stop className="fill-stop-end" offset="100%" />
          </linearGradient>
        </defs>

        {/* 网格：纯装饰（--gridline） */}
        {gridLevels.map(level => {
          const rounded = Math.round(yForLevel(level, geometry) * 100) / 100;
          return <line key={level} className="curve-gridline" x1={0} x2={geometry.width} y1={rounded} y2={rounded} />;
        })}

        <path className="curve-area" d={areaPath} fill={`url(#${gradientId})`} />

        {/* 曲线描线：首次进入视口用 elegant（大面积媒体），减少动效下直接给最终形态。 */}
        <motion.path
          className="curve-line"
          d={linePath}
          pathLength={1}
          fill="none"
          initial={reduceMotion ? false : { strokeDashoffset: 1 }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduceMotion ? { duration: 0 } : elegant}
          style={{ strokeDasharray: 1 }}
        />
      </svg>

      {/* 高低潮标注：直接标在曲线极值旁，落在绘图区的上下留白带里。
          不可点击 —— 没有背景、没有边框、没有 hover 态、没有 pointer 光标（D1）。 */}
      <div className="curve-annotations">
        {day.extrema.map(item => {
          const x = xForPoint(item, geometry);
          const isHigh = item.kind === 'high';
          const edge =
            x < anchorMargin(geometry.width)
              ? 'is-anchor-start'
              : x > geometry.width - anchorMargin(geometry.width)
                ? 'is-anchor-end'
                : '';
          return (
            <p
              key={`${item.kind}-${item.step}`}
              className={`curve-annotation is-${item.kind} ${edge}`}
              style={{ left: `${x}px`, top: `${isHigh ? 0 : geometry.height}px` }}
            >
              <span className="annotation-time num" lang="en">
                {formatClock(item.minutes)}
              </span>
              <span className="annotation-level num" lang="en">
                {formatLevel(item.level)}
              </span>
              <span className="visually-hidden">{isHigh ? '高潮' : '低潮'}</span>
            </p>
          );
        })}
      </div>

      {/* 当前时刻标记：全页唯一的循环动画（契约 3.6 / 9.4）。 */}
      <div className="now-marker" style={{ transform: `translateX(${nowX}px)` }}>
        <span className="now-line" />
        <span className="now-dot" style={{ top: `${nowY}px` }} />
        <span className={`now-label num ${nowLabelFlipped ? 'is-flipped' : ''}`} style={{ top: `${nowY}px` }} lang="en">
          现在 {formatClock(nowMinutes)}
        </span>
        <span className="visually-hidden">当前时刻 {formatClock(nowMinutes)}，潮位 {nowPoint ? formatLevel(nowPoint.level) : '暂无数据'} 米。</span>
      </div>

      {/* 游标：拖动 / 键盘改值时用 snappy 跟随（契约 3.6）。 */}
      <motion.div
        className={`curve-cursor${dragging ? ' is-dragging' : ''}`}
        initial={false}
        animate={{ x: cursorX }}
        transition={reduceMotion ? { duration: 0 } : snappy}
      >
        <span className="cursor-line" />
        <span className="cursor-dot" style={{ top: `${cursorY}px` }} />
      </motion.div>
    </>
  );
}

/** SVG 的无障碍概述（契约 9.1：role=img + aria-label 概述当日高低潮时刻）。 */
function buildCanvasLabel(day: TideDay): string {
  const parts = day.extrema.map(
    item =>
      `${formatClock(item.minutes)} ${item.kind === 'high' ? '高潮' : '低潮'} ${formatLevel(item.level)} 米`,
  );
  if (parts.length === 0) return '今日潮汐曲线，暂无高低潮标注。';
  return `今日潮汐曲线：${parts.join('，')}。横轴为 00:00 到 24:00，纵轴为潮位米数。`;
}

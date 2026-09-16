/**
 * 共享的动效预设、减少动效判定、演示数据徽章。
 *
 * 弹簧参数只引用 .agents/skills/ui-design-agent/references/motion-contract.md 的具名预设，
 * 不自定义数值（契约 3.6）。
 */

import { useCallback, useEffect, useState } from 'react';
import { motion, type Transition } from 'motion/react';

/** motion-contract「Snappy / Crisp」：高频控件、按钮、开关（契约里的游标跟随、吸附、hover、按压）。 */
export const snappy: Transition = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
/** motion-contract「Elegant / Smooth」：大面积媒体的首次呈现（契约里的曲线描线）。 */
export const elegant: Transition = { type: 'spring', stiffness: 100, damping: 20, mass: 1 };
/** motion-contract 批准的唯一非弹簧缓动（契约里的脉冲）。 */
export const APPROVED_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** 微编排 stagger 起点（motion-contract 规定 0.04–0.08s）。 */
export const STAGGER_SECONDS = 0.06;

/**
 * `prefers-reduced-motion` 判定。MotionConfig 的 reducedMotion="user" 只管 Motion 自己的
 * transform/opacity，管不到描线、CSS 循环动画与自定义分支，所以这里单独读一次。
 */
export function useReducedMotionPreference(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * 是否有精确指针。契约 9.6 规定 hover 位移与缩放只在 `pointer: fine` 下生效；
 * motion-contract 也要求「Hover-only tilt runs only for an appropriate fine pointer」。
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return fine;
}

/**
 * 键盘按压反馈。motion-contract：可按压控件用约 0.98 的按压，且「键盘 active 须有等价状态」。
 * 只在 Enter / Space 按住期间为真，与 Motion 的 whileTap 互不冲突（同一个 transform 由 Motion 独占）。
 */
export function useKeyboardPress() {
  const [pressed, setPressed] = useState(false);
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') setPressed(true);
  }, []);
  const onKeyUp = useCallback(() => setPressed(false), []);
  const onBlur = useCallback(() => setPressed(false), []);
  return { pressed, handlers: { onKeyDown, onKeyUp, onBlur } };
}

/**
 * 可按压的链接。统一 hover / 按压 / 键盘 active 三种反馈，并遵守两条约束：
 *   - hover 位移与缩放只在 `pointer: fine` 下生效（契约 9.6）。
 *   - 减少动效下移除位移与缩放，只保留 CSS 的边框/底色变化（契约 9.6 / motion-contract）。
 * transform 由 Motion 独占，不存在两套动画系统写同一属性。
 */
export function PressableLink({
  className,
  href,
  children,
}: {
  className: string;
  href: string;
  children: React.ReactNode;
}) {
  const fine = useFinePointer();
  const reduceMotion = useReducedMotionPreference();
  const { pressed, handlers } = useKeyboardPress();

  return (
    <motion.a
      className={className}
      href={href}
      {...handlers}
      animate={reduceMotion ? undefined : { scale: pressed ? 0.98 : 1 }}
      whileHover={fine && !reduceMotion ? { scale: 1.02, y: -2 } : undefined}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={snappy}
    >
      {children}
    </motion.a>
  );
}

/**
 * `DemoDataBadge` —— A3 的执行单元。
 * 实心：`--caution` 底 + `#0d2431` 文字 = 9.52:1；描边变体：`--caution` 文字（surface-2 上 8.33:1）。
 * 文案固定「演示数据」。aria-label 按契约 9.7 给出的原文。
 */
export function DemoDataBadge({ variant = 'solid' }: { variant?: 'solid' | 'outline' }) {
  return (
    <span className={`demo-badge is-${variant}`} role="note" aria-label="本页潮位为演示数据，非真实潮汐预报">
      演示数据
    </span>
  );
}

/** 读数里的「米」单位：中文栈、小一号，不参与等宽数字对齐。 */
export function UnitLabel() {
  return <span className="readout-unit">米</span>;
}

/** 需要走等宽数字栈的字符：数字、冒号、句点、连接号、减号、空格分隔的数字串。 */
const NUMERIC_RUN = /[0-9][0-9:.\u2013-]*/g;

/**
 * 把混合字符串里的数字片段包进 `.num`（数字栈 + tabular-nums），
 * 其余（中文、单位、间隔符）留在中文栈。
 * 契约 Do #4 要求所有数字用数字栈，但中文不应被塞进等宽字体；
 * 像「10:20–12:20 · 低潮 0.09 米」这样的读数必须分开处理。
 */
export function NumericText({ children }: { children: string }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of children.matchAll(NUMERIC_RUN)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push(children.slice(cursor, start));
    parts.push(
      <span key={start} className="num" lang="en">
        {match[0]}
      </span>,
    );
    cursor = start + match[0].length;
  }
  if (cursor < children.length) parts.push(children.slice(cursor));
  return <>{parts}</>;
}

import { motion } from 'motion/react';
import { inkEase } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';
import { PandaMark } from './PandaMark';

export type LoadMoreState = 'idle' | 'pulling' | 'loading' | 'success' | 'failure' | 'end';

interface LoadMoreProps {
  state: LoadMoreState;
  /** 拉动进度 0–1（pulling 时驱动虚线节生长） */
  progress?: number;
  /** 已加载页数（实心节数，显示上限 5，超过循环替换） */
  pagesLoaded: number;
  onRetry?: () => void;
}

const LABELS: Record<LoadMoreState, string> = {
  idle: '上拉加载更多',
  pulling: '松开加载',
  loading: '正在加载…',
  success: '加载成功',
  failure: '加载失败，点击重试',
  end: '没有更多了',
};

/**
 * 上拉加载器（§7.9 / §8.2 H）：熊猫抱竹节（原创 SVG）+ 实心节 + 下一节虚线轮廓。
 * pulling：虚线节 scaleY 0→1（origin bottom）随拉动进度生长；
 * loading：脉冲 1.2s + 熊猫 ±3px 浮动（同周期）；success：虚线→实心 400ms inkEase；
 * failure：整块可点（命中 ≥48px）；end：打盹熊猫；reduced-motion 全静态仅文字变化。
 */
export function LoadMore({ state, progress = 0, pagesLoaded, onRetry }: LoadMoreProps) {
  const reduced = usePrefersReducedMotion();
  const label = LABELS[state];

  const inner = (
    <div className="flex flex-col items-center gap-3 py-8">
      {/* 竹节柱：实心节（已加载）+ 当前虚线节 */}
      <div className="relative flex flex-col items-center">
        {state !== 'end' && (
          <motion.div
            animate={state === 'loading' && !reduced ? { y: [-3, 3, -3] } : undefined}
            transition={state === 'loading' && !reduced ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
          >
            <PandaMark pose="hug" size={88} title="抱竹节的熊猫" />
          </motion.div>
        )}
        {state === 'end' && <PandaMark pose="nap" size={88} title="打盹的熊猫" />}
        <div className="-mt-1 flex flex-col items-center">
          {Array.from({ length: Math.min(pagesLoaded % 6, 5) }).map((_, i) => (
            <BambooNode key={i} solid />
          ))}
          {state !== 'end' && (
            <BambooNode
              dashed
              grow={!reduced && state === 'pulling' ? progress : undefined}
              pulse={!reduced && state === 'loading'}
              justSolid={!reduced && state === 'success'}
            />
          )}
        </div>
      </div>
      <p
        className={[
          'm-0 text-meta',
          state === 'failure' ? 'text-[var(--z-link)]' : 'text-text-tertiary',
        ].join(' ')}
      >
        {label}
      </p>
    </div>
  );

  if (state === 'failure' && onRetry) {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="w-full min-h-12 border-0 bg-transparent p-0"
        aria-label={label}
      >
        {inner}
      </button>
    );
  }
  return (
    <div aria-live="polite" aria-label={label}>
      {inner}
    </div>
  );
}

function BambooNode({
  solid = false,
  dashed = false,
  grow,
  pulse = false,
  justSolid = false,
}: {
  solid?: boolean;
  dashed?: boolean;
  /** 0–1 拉动进度（origin bottom 生长） */
  grow?: number;
  pulse?: boolean;
  justSolid?: boolean;
}) {
  return (
    <motion.svg
      width={44}
      height={24}
      viewBox="0 0 44 24"
      aria-hidden="true"
      animate={
        pulse
          ? { opacity: [0.4, 0.8, 0.4] }
          : justSolid
            ? { opacity: [0.5, 1, 1] }
            : undefined
      }
      transition={
        pulse
          ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          : justSolid
            ? { duration: 0.4, ease: inkEase }
            : undefined
      }
      style={
        grow !== undefined
          ? { scaleY: grow, transformOrigin: 'bottom', transformBox: 'fill-box' }
          : undefined
      }
    >
      <rect
        x={2}
        y={2}
        width={40}
        height={20}
        rx={9}
        fill={solid ? 'var(--z-accent)' : 'transparent'}
        fillOpacity={solid ? 0.28 : 0}
        stroke="var(--z-link)"
        strokeWidth={2}
        strokeDasharray={dashed && !solid ? '6 5' : undefined}
        strokeOpacity={solid ? 0.9 : 0.7}
      />
    </motion.svg>
  );
}

import type { Transition } from 'motion/react';

/**
 * 动效令牌（DESIGN.md §8.1，逐字落地）。
 * 已对照本地安装 motion@12.43.0 的 .d.ts 复核：
 * `import type { Transition } from 'motion/react'` 可用，
 * `{ type: 'spring', stiffness, damping, mass }` 满足 `Transition`（SpringOptions）。
 */
export const uiSprings = {
  snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }, // 按钮/指示条/按压
  playful: { type: 'spring', stiffness: 280, damping: 18, mass: 1.2 }, // 彩蛋/toast
  elegant: { type: 'spring', stiffness: 100, damping: 20, mass: 1 }, // 大型/换场连续性
} satisfies Record<string, Transition>;

/** 非弹性时长型过渡统一用 approved easing。 */
export const inkEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** 路由换场时长（§8.2 A）：旧 220ms + 新 280ms = 500ms（450–550ms 窗口）。 */
export const ROUTE_EXIT = { duration: 0.22, ease: inkEase };
export const ROUTE_ENTER = { duration: 0.28, ease: inkEase };
export const VEIL_SWEEP = { duration: 0.5, ease: inkEase };

/** 列表入场（§8.2 I）：320ms inkEase，stagger 0.06s。 */
export const LIST_ENTER = { duration: 0.32, ease: inkEase };
export const STAGGER = 0.06;

/** hover 反馈 ≤150ms 起效（§8.1）。 */
export const HOVER_FAST = { duration: 0.15, ease: inkEase };

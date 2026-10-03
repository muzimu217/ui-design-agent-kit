import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';

/**
 * 3D 立体翻页数字位（契约①，机械规格参考 pqina/flip）：
 * - 三层叶：上叶（旧值，亮度 1.05）/ 下叶（新值，亮度 0.85）/ 翻转叶（新值顶面）
 * - 容器 perspective 600px；翻转叶 rotateX(-90deg → 0)，铰链=中缝
 * - 450ms 弹簧（duration 型 spring，bounce 0.1 ≈ Snappy 手感的近临界小回弹）
 * - 亮度随角度动态：0.55 → 1.05
 * - prefers-reduced-motion：直切（无动画，透视保留）
 */

const FLIP_TRANSITION = {
  type: 'spring',
  duration: 0.45, // 450ms
  bounce: 0.1, // 近临界小回弹，机械卡片落位感
} as const;

interface FlipDigitProps {
  value: string;
  reduced: boolean;
}

function FlipDigit({ value, reduced }: FlipDigitProps) {
  // 上叶静止显示的值（翻转完成后与新值对齐）
  const [topValue, setTopValue] = useState(value);
  // 翻转叶当前承载的值
  const [leafValue, setLeafValue] = useState(value);
  const topRef = useRef(value);
  const animRef = useRef<AnimationPlaybackControls | null>(null);

  const rotate = useMotionValue(-90);
  // 亮度随翻转角度动态（-90deg 边缘暗 → 0deg 落平与上叶亮度一致）
  const brightness = useTransform(rotate, [-90, 0], [0.55, 1.05]);
  const leafFilter = useMotionTemplate`brightness(${brightness})`;

  useEffect(() => {
    if (value === topRef.current) {
      // 无进位不翻；若上一次翻转被中断，这里也不会误触发
      return;
    }
    if (reduced) {
      // 直切：无 rotateX 动画，透视仍在（CSS 常驻）
      animRef.current?.stop();
      animRef.current = null;
      topRef.current = value;
      setTopValue(value);
      setLeafValue(value);
      return;
    }
    animRef.current?.stop();
    setLeafValue(value);
    rotate.jump(-90);
    animRef.current = animate(rotate, 0, {
      ...FLIP_TRANSITION,
      onComplete: () => {
        topRef.current = value;
        setTopValue(value);
        rotate.jump(-90); // 瞬间复位到边沿位置，等待下一次翻转
        animRef.current = null;
      },
    });
  }, [value, reduced, rotate]);

  useEffect(() => () => animRef.current?.stop(), []);

  return (
    <div className="flip-digit">
      <div className="digit-card">
        <div className="digit-edge" />
        <div className="leaf leaf-top" aria-hidden="true">
          <span>{topValue}</span>
        </div>
        <div className="leaf leaf-bottom" aria-hidden="true">
          <span>{value}</span>
        </div>
        <motion.div
          className="leaf leaf-flip"
          style={{ rotateX: rotate, filter: leafFilter }}
          aria-hidden="true"
        >
          <span>{leafValue}</span>
        </motion.div>
        <div className="digit-seam" />
      </div>
    </div>
  );
}

function FlipColon() {
  return (
    <div className="flip-colon" aria-hidden="true">
      <i />
      <i />
    </div>
  );
}

export interface FlipClockProps {
  /** mm:ss，如 "24:37" */
  value: string;
  reduced: boolean;
  /** 供读屏的状态描述（aria-live=off 防每秒播报） */
  label: string;
}

export function FlipClock({ value, reduced, label }: FlipClockProps) {
  const chars = value.split('');
  return (
    <div>
      {/* 计时数字 aria-live="off"：视觉翻页不触发每秒播报 */}
      <div role="timer" aria-live="off" aria-atomic="true" className="sr-only">
        {label}
      </div>
      <div className="flip-clock" aria-hidden="true">
        {chars.map((c, i) =>
          c === ':' ? <FlipColon key={`c-${i}`} /> : <FlipDigit key={`d-${i}`} value={c} reduced={reduced} />,
        )}
      </div>
    </div>
  );
}

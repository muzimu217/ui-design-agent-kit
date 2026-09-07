import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { inkEase } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';

/**
 * button-ink-bloom（§8.2 B）：hover 墨点晕开。
 * 仅 fine pointer；径向墨晕层圆心=指针进入点；
 * scale 0→1 150ms 内可见起效（inkEase），随后 opacity 0.10→0（550ms），
 * 完整晕开-消散周期 ≈750ms（600–800ms 窗口）；离开 200ms 回落；reduced-motion 无晕层。
 * 属性仅 transform/opacity。
 */
export function InkBloom({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const start = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    controls.stop();
    controls.set({ scale: 0, opacity: 0.1 });
    void controls.start({ scale: 1, opacity: 0.1, transition: { duration: 0.15, ease: inkEase } });
    timers.current.push(
      window.setTimeout(() => {
        void controls.start({ opacity: 0, transition: { duration: 0.55, ease: inkEase } });
      }, 200),
    );
  };

  const leave = () => {
    if (reduced) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    void controls.start({ opacity: 0, transition: { duration: 0.2, ease: inkEase } });
  };

  return (
    <span
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className}`}
      onPointerEnter={start}
      onPointerLeave={leave}
    >
      {origin && !reduced && (
        <motion.span
          animate={controls}
          initial={{ scale: 0, opacity: 0.1 }}
          aria-hidden="true"
          className="pointer-events-none absolute z-0 block h-[max(96px,160%)] max-h-none aspect-square rounded-full"
          style={{
            left: origin.x,
            top: origin.y,
            x: '-50%',
            y: '-50%',
            background:
              'radial-gradient(circle, rgba(31,36,33,0.10) 0%, rgba(31,36,33,0.10) 40%, transparent 70%)',
          }}
        />
      )}
      {children}
    </span>
  );
}

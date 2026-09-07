import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LIST_ENTER, STAGGER } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';

/**
 * list-item-enter（§8.2 I）：滚动进入视口触发（一次性，触发即 unobserve，
 * 回滚不重播）；opacity 0→1、translateY 16px→0、320ms inkEase；
 * 同批 stagger 0.06s（首批 ≤8 个，后续不延迟）；reduced-motion 直出终态。
 */
export function Reveal({
  index = 0,
  children,
  className = '',
}: {
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(entry.target); // 一次性
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const delay = index < 8 ? index * STAGGER : 0;

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={reduced ? { duration: 0 } : { ...LIST_ENTER, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

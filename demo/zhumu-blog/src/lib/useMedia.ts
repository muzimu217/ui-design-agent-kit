import { useEffect, useState } from 'react';

/**
 * CSS/Canvas 自绘循环的 reduced-motion 监听（§8.1 / §9.3）。
 * MotionConfig 不覆盖 CSS 动画与 Canvas 循环，需另行监听。
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** 触屏 + 窄视口判定（§7.10 下拉刷新仅在 <768px 且 touch 设备）。 */
export function useTouchSmallViewport(): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)');
    const narrow = window.matchMedia('(width < 768px)');
    const update = () => setMatch(coarse.matches && narrow.matches);
    update();
    coarse.addEventListener('change', update);
    narrow.addEventListener('change', update);
    return () => {
      coarse.removeEventListener('change', update);
      narrow.removeEventListener('change', update);
    };
  }, []);
  return match;
}

/** 媒体查询订阅（≥768px 导航切换点等）。 */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() =>
    typeof window === 'undefined' || !window.matchMedia ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

/** 导航切换点（§3.1）。 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(width >= 768px)');
}

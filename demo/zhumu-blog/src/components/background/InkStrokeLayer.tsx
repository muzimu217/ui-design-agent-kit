/**
 * L2 周期运笔（§8.2 E ink-stroke-draw）：
 * 定时器 20–30s 均匀随机；一笔 stroke-dashoffset L→0 用时 4–6s（inkEase）；
 * 终笔端点墨渍 scale 0→1、α 0.2→0.14，保持 2–4s 后随末段淡出；
 * 5 个预置边缘锚段洗牌轮换（桌面）+ 移动端顶部锚段；
 * CLS=0（绝对定位层）；标签页隐藏暂停计时；reduced-motion 不绘制。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { inkEase } from '../../lib/motion';
import { useIsDesktop, usePrefersReducedMotion } from '../../lib/useMedia';

type Band = 'left' | 'right' | 'bottom' | 'mobileTop';

interface Anchor {
  band: Band;
  d: string; // band 本地坐标
  end: [number, number]; // 收笔端点
  viewBox: string;
}

const DESKTOP_ANCHORS: Anchor[] = [
  { band: 'left', d: 'M 20 700 Q 60 560 118 470', end: [118, 470], viewBox: '0 0 160 900' },
  { band: 'right', d: 'M 140 240 Q 90 150 46 96', end: [46, 96], viewBox: '0 0 160 900' },
  { band: 'bottom', d: 'M 1150 170 Q 1230 110 1300 70', end: [1300, 70], viewBox: '0 0 1440 200' },
  { band: 'bottom', d: 'M 240 180 Q 330 130 420 100', end: [420, 100], viewBox: '0 0 1440 200' },
  { band: 'right', d: 'M 150 640 Q 104 560 60 520', end: [60, 520], viewBox: '0 0 160 900' },
];

const MOBILE_ANCHORS: Anchor[] = [
  { band: 'mobileTop', d: 'M 320 110 Q 348 64 372 18', end: [372, 18], viewBox: '0 0 390 120' },
];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = 'idle' | 'draw' | 'blot' | 'fade';

export function InkStrokeLayer() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const [cycle, setCycle] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const orderRef = useRef<Anchor[]>([]);
  const orderPos = useRef(0);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<{ ms: number; next: Phase } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback((ms: number, next: Phase) => {
    pendingRef.current = { ms, next };
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      stepRef.current(next);
    }, ms);
  }, []);

  const step = useCallback(
    (phase: Phase) => {
      if (phase === 'idle') {
        if (orderPos.current >= orderRef.current.length) {
          orderRef.current = shuffle(isDesktop ? DESKTOP_ANCHORS : MOBILE_ANCHORS);
          orderPos.current = 0;
        }
        const a = orderRef.current[orderPos.current++];
        setAnchor(a);
        setCycle((c) => c + 1);
        schedule(rand(4000, 6000), 'blot'); // draw 4–6s（动画自身推进）
      } else if (phase === 'blot') {
        schedule(rand(2000, 4000), 'fade');
      } else {
        // fade：淡出 8–12s（CSS 端由 opacity 动画承担，这里等它结束）
        setAnchor(null);
        schedule(rand(20000, 30000), 'idle');
      }
    },
    [isDesktop, schedule],
  );

  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    if (reduced) return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // 恢复：从静默重新开始一轮（不等堆积）
        if (timerRef.current === null) schedule(rand(4000, 9000), 'idle');
      } else {
        clearTimer();
      }
    };
    schedule(rand(6000, 12000), 'idle'); // 首笔稍晚，让静态构图先入眼
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimer();
    };
  }, [reduced, schedule, clearTimer]);

  if (reduced || !anchor) return null;

  const drawDuration = rand(4, 6);

  return (
    <div className="bg-layer z-[2]" aria-hidden="true">
      {anchor.band === 'left' && (
        <SideBox side="left">
          <StrokeSvg key={cycle} anchor={anchor} duration={drawDuration} />
        </SideBox>
      )}
      {anchor.band === 'right' && (
        <SideBox side="right">
          <StrokeSvg key={cycle} anchor={anchor} duration={drawDuration} />
        </SideBox>
      )}
      {anchor.band === 'bottom' && (
        <div className="absolute inset-x-0 bottom-0 hidden md:block" style={{ height: 200 }}>
          <StrokeSvg key={cycle} anchor={anchor} duration={drawDuration} />
        </div>
      )}
      {anchor.band === 'mobileTop' && (
        <div className="absolute inset-x-0 top-0 md:hidden" style={{ height: 120 }}>
          <StrokeSvg key={cycle} anchor={anchor} duration={drawDuration} />
        </div>
      )}
    </div>
  );
}

function SideBox({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  const style: CSSProperties = {
    [side]: 0,
    top: 0,
    bottom: 0,
    width: 'max(0px, min(160px, (100vw - 720px) / 2 - 24px))',
  };
  return (
    <div className="absolute top-0 bottom-0 hidden md:block" style={style}>
      {children}
    </div>
  );
}

function StrokeSvg({ anchor, duration }: { anchor: Anchor; duration: number }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={anchor.viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* 一笔：dashoffset L→0，起笔快收笔慢（inkEase） */}
      <motion.path
        d={anchor.d}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        stroke="var(--z-ink)"
        strokeWidth={2.6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0.9 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{
          pathLength: { duration, ease: inkEase },
          opacity: { duration: 0.4, ease: inkEase },
        }}
      />
      {/* 墨渍：随收笔在端点洇开，α 0.2→0.14 后保持，随层移除即淡出 */}
      <motion.circle
        cx={anchor.end[0]}
        cy={anchor.end[1]}
        r={7}
        fill="var(--z-ink)"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.14 }}
        transition={{ delay: duration - 0.3, duration: 2.6, ease: inkEase }}
      />
    </svg>
  );
}

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { inkEase } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';

export type PullState = 'idle' | 'pulling' | 'loading' | 'success' | 'failure';

interface PullToRefreshProps {
  /** 刷新逻辑（async）；仅 touch + <768 挂载 */
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const THRESHOLD = 72;
const DAMP_START = 24;

/**
 * 下拉刷新（§7.10 / §8.2 G）：滚动位置 0 下拉、overscroll 由容器 CSS 约束；
 * pulling：竹叶随拉距生长摆动（叶柄 0→48px、叶 scale 0.2→1、摆角 ±5°）；
 * 拉距阻尼：超出 24px 后 delta×0.5；阈值 72px 松手 → 叶片飘出 400ms + 换入；
 * loading：竹叶 1.2s/圈 缓旋（线性豁免）；success 收回 300ms；
 * failure：内联「刷新失败」2s 收回；reduced-motion：文字指示，无生长动画。
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<PullState>('idle');
  const [dist, setDist] = useState(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const distRef = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!tracking.current || state === 'loading') return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0 || window.scrollY > 0) {
      if (distRef.current !== 0) {
        distRef.current = 0;
        setDist(0);
      }
      return;
    }
    // 阻尼：超出 24px 后减半
    const d = dy <= DAMP_START ? dy : DAMP_START + (dy - DAMP_START) * 0.5;
    distRef.current = Math.min(d, 96);
    setDist(distRef.current);
    setState('pulling');
    e.preventDefault(); // 阻止原生滚动/下拉
  };

  const onTouchEnd = () => {
    if (!tracking.current) return;
    tracking.current = false;
    if (distRef.current >= THRESHOLD) {
      setState('loading');
      onRefresh()
        .then(() => {
          setState('success');
          window.setTimeout(() => {
            setState('idle');
            setDist(0);
            distRef.current = 0;
          }, 300);
        })
        .catch(() => {
          setState('failure');
          window.setTimeout(() => {
            setState('idle');
            setDist(0);
            distRef.current = 0;
          }, 2000);
        });
    } else {
      setState('idle');
      setDist(0);
      distRef.current = 0;
    }
  };

  const progress = Math.min(1, dist / THRESHOLD);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="relative"
    >
      {/* 指示区：覆盖在列表上方，不挤占布局（CLS 0） */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-visible"
        style={{ height: THRESHOLD }}
        aria-hidden={state === 'idle'}
      >
        <AnimatePresence>
          {state !== 'idle' && (
            <motion.div
              key="ptr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3, ease: inkEase } }}
              className="relative"
              style={{ height: THRESHOLD, width: 120 }}
            >
              {reduced ? (
                <span className="absolute inset-x-0 top-2 text-center text-meta text-text-tertiary" aria-live="polite">
                  {state === 'loading' ? '刷新中…' : state === 'success' ? '已刷新' : state === 'failure' ? '刷新失败' : ''}
                </span>
              ) : state === 'loading' ? (
                // loading：竹叶 1.2s/圈缓旋（线性豁免）
                <LeafGlyph className="spin-slow absolute left-1/2 top-4" />
              ) : state === 'failure' ? (
                <span className="absolute inset-x-0 top-3 text-center text-meta text-text-tertiary" aria-live="assertive">
                  刷新失败
                </span>
              ) : (
                // pulling：叶随拉距生长（G）
                <motion.div
                  className="absolute left-1/2 top-2"
                  initial={false}
                  animate={{
                    rotate: Math.sin(dist * 0.35) * 5, // 摆角 ±5°（阻尼正弦近似）
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                >
                  <motion.svg
                    width={48}
                    height={48 + 48 * progress}
                    viewBox="0 0 48 96"
                    animate={{ scaleX: 0.6 + 0.4 * progress }}
                  >
                    {/* 叶柄 0→48px 生长 */}
                    <motion.path
                      d={`M 24 ${96 - progress * 48} q 6 -${progress * 24} 2 -${progress * 48}`}
                      stroke="var(--z-link)"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* 叶片 scale 0.2→1 */}
                    <motion.path
                      d="M 26 44 q 14 -8 20 -22 q -18 2 -20 22 z"
                      fill="var(--z-link)"
                      fillOpacity={0.55}
                      style={{
                        scale: 0.2 + 0.8 * progress,
                        transformOrigin: '26px 44px',
                        transformBox: 'fill-box',
                      }}
                    />
                  </motion.svg>
                </motion.div>
              )}
              {/* 释放瞬间：叶片飘出（G：translateY -24 / translateX +16 / rotate 30 / opacity→0，400ms） */}
              {state === 'success' && !reduced && (
                <motion.div
                  className="absolute left-1/2 top-2"
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 0.8 }}
                  animate={{ x: 16, y: -24, rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.4, ease: inkEase }}
                >
                  <LeafGlyph />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}

function LeafGlyph({ className = '' }: { className?: string }) {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M 20 36 q 5 -14 1 -28" stroke="var(--z-link)" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path
        d="M 21 12 q 12 -7 16 -19 q -16 3 -16 19 z"
        fill="var(--z-link)"
        fillOpacity={0.55}
        transform="translate(-6 20)"
      />
    </svg>
  );
}

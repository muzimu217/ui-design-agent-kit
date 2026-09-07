/**
 * 背景系统编排（§9）：
 * - L0 静态墨竹（InkPainting）+ 视差漂移层（极淡墨底晕瓦片，垂直周期平铺，
 *   translate = scrollY×0.4 mod 100vh，无接缝、无露底）。
 * - L1 飘叶 Canvas（FallingLeaves，视差系数 0.3）。
 * - L2 周期运笔（InkStrokeLayer）。
 * - 合并循环：单个 passive scroll listener 写 ref；rAF 循环只做视差变换；
 *   卸载全部移除。reduced-motion：无漂移、无飘叶、无运笔，仅静态画 + 绘死落叶。
 * 全部层 fixed inset-0 pointer-events-none，不产生 CLS。
 */
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../lib/useMedia';
import { useTheme } from '../../lib/theme';
import { InkPainting } from './InkPainting';
import { FallingLeaves } from './FallingLeaves';
import { InkStrokeLayer } from './InkStrokeLayer';
import { INK, InkWash } from './primitives';

export function BackgroundLayers() {
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const scrollRef = useRef(0);
  const driftRef = useRef<HTMLDivElement | null>(null);
  const [driftVh, setDriftVh] = useState(100); // 瓦片高度（px 化由 CSS 承担，这里只存 vh 数）

  // 视差合并循环：passive scroll 只写 ref，rAF 内应用变换（§9.3）
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let raf = 0;
    let running = !reduced;
    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const driftEl = driftRef.current;
      if (driftEl) {
        const t = (scrollRef.current * 0.4) % vh; // 100vh 周期平铺 → 无缝
        driftEl.style.transform = `translate3d(0, ${-t}px, 0)`;
      }
    };
    if (running) raf = requestAnimationFrame(tick);

    const onResize = () => setDriftVh(100);
    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  return (
    <>
      {/* 视差漂移层：极淡墨底晕，100vh 周期瓦片 ×5，覆盖位移区间不露底 */}
      {!reduced && (
        <div className="bg-layer z-0 overflow-hidden" aria-hidden="true">
          <div ref={driftRef} className="absolute left-0 right-0 will-change-transform" style={{ top: '-100vh', height: '500vh' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <DriftTile key={i} index={i} vh={driftVh} />
            ))}
          </div>
        </div>
      )}
      <InkPainting />
      <FallingLeaves reduced={reduced} theme={theme} scrollRef={scrollRef} />
      <InkStrokeLayer />
    </>
  );
}

/** 一块 100vh 的极淡墨晕瓦片（内容周期重复 → mod 位移无接缝）。 */
function DriftTile({ index, vh }: { index: number; vh: number }) {
  void vh;
  return (
    <svg
      className="absolute left-0 w-full"
      style={{ top: `${index * 100}vh`, height: '100vh' }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
    >
      <InkWash id={`drift-wash-${index}-a`} x={240} y={200} rx={260} ry={150} opacity={INK.jidan * 0.8} />
      <InkWash id={`drift-wash-${index}-b`} x={1200} y={640} rx={300} ry={170} opacity={INK.jidan * 0.7} />
      <InkWash id={`drift-wash-${index}-c`} x={760} y={860} rx={220} ry={120} opacity={INK.jidan * 0.5} />
    </svg>
  );
}

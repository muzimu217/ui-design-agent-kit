import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '../lib/useMedia';

/**
 * 全局品牌加载态（§7.14）：原创熊猫 + 竹芽，上下浮动 ±4px、1.2s 循环
 * （loading 豁免，CSS 实现）；reduced-motion：静态熊猫 + 「加载中…」。
 */
export function BrandLoader({ label = '加载中…' }: { label?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status" aria-label={label}>
      <motion.svg
        width="72"
        height="72"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        animate={reduced ? undefined : { y: [-4, 4, -4] }}
        transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className={reduced ? '' : 'will-change-transform'}
      >
        <PandaFloating />
      </motion.svg>
      <p className="m-0 text-meta text-text-tertiary">{label}</p>
    </div>
  );
}

/** 加载态专用：熊猫脸 + 旁边一株竹芽。 */
function PandaFloating() {
  return (
    <g>
      {/* 竹芽 */}
      <g transform="translate(46 34)">
        <path d="M 2 26 L 2 8" stroke="var(--z-link)" strokeWidth={3} strokeLinecap="round" />
        <path d="M 2 14 q -7 -1 -9 -8 q 8 0 9 8" fill="var(--z-link)" opacity={0.75} />
        <path d="M 2 10 q 7 -2 8 -9 q -8 1 -8 9" fill="var(--z-link)" opacity={0.55} />
      </g>
      <circle cx={16} cy={13} r={8} className="panda-body" />
      <circle cx={48} cy={13} r={8} className="panda-body" />
      <ellipse cx={32} cy={36} rx={26} ry={23.5} className="panda-body" />
      <path d="M -4.5 -7.8 A 9 9 0 0 1 4.5 -7.8" transform="translate(21.5 33) rotate(-20)" stroke="var(--z-link)" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <path d="M -4.5 -7.8 A 9 9 0 0 1 4.5 -7.8" transform="translate(42.5 33) rotate(20)" stroke="var(--z-link)" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <circle cx={21.5} cy={35} r={2.4} className="panda-dot" />
      <circle cx={42.5} cy={35} r={2.4} className="panda-dot" />
      <ellipse cx={32} cy={44} rx={2.6} ry={2} className="panda-dot" />
    </g>
  );
}

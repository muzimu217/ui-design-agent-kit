import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { uiSprings } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../lib/useMedia';
import { NAV_ITEMS, isNavActive } from './navData';

/**
 * 移动吸底标签栏【HC-1】（§2.2 / §7.2）：
 * position:fixed; bottom:0; left:0; right:0；设计高 64px + safe-area；
 * bg surface 96% + 顶部 1px hairline；五项：24px 图标 + 12px 文字；
 * 命中区 = 整列 ≥64px；当前项竹绿 + 顶部 16×3px 圆角指示条（layoutId Snappy）
 * + aria-current="page"；按压 scale 0.98 spring 回弹。
 */
export function TabBar() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  return (
    <nav
      aria-label="底部标签栏"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16 items-stretch border-t border-border-ink bg-[color-mix(in_srgb,var(--z-surface)_96%,transparent)] text-text-tertiary">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(location.pathname, item);
          const Icon = item.icon;
          return (
            <motion.div key={item.to} whileTap={reduced ? undefined : { scale: 0.98 }} transition={uiSprings.snappy} className="flex min-w-0 flex-1">
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={[
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 pt-1.5',
                  active ? 'text-[var(--z-link)]' : 'text-text-tertiary',
                ].join(' ')}
              >
                {active && (
                  <motion.span
                    layoutId="tabbar-indicator"
                    transition={uiSprings.snappy}
                    aria-hidden="true"
                    className="absolute top-0 h-[3px] w-4 rounded-full bg-[var(--z-link)]"
                  />
                )}
                <Icon size={24} />
                <span className="text-tab-label font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

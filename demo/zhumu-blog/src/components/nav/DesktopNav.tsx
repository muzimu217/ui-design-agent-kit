import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { uiSprings } from '../../lib/motion';
import { useSearch } from '../../lib/searchContext';
import { PandaMark } from '../PandaMark';
import { ThemeToggle } from '../ThemeToggle';
import { SearchIcon } from '../Icons';
import { InkBloom } from '../InkBloom';
import { NAV_ITEMS, desktopLabel, isNavActive } from './navData';

/**
 * 桌面顶部导航（§2.2 / §7.1）：64px sticky、bg 92%→96%（scrolled）、
 * hover 指示条 200ms inkEase 自左展开、当前页 layoutId 常驻条 + aria-current。
 */
export function DesktopNav() {
  const [scrolled, setScrolled] = useState(false);
  const { openSearch } = useSearch();
  const location = useLocation();
  const activeLabel = NAV_ITEMS.find((i) => isNavActive(location.pathname, i))?.label;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-40 hidden h-16 items-center md:flex',
        scrolled
          ? 'bg-[color-mix(in_srgb,var(--z-bg)_96%,transparent)] shadow-[0_1px_0_var(--z-border)]'
          : 'bg-[color-mix(in_srgb,var(--z-bg)_92%,transparent)]',
        'border-b border-border-ink backdrop-blur-[8px]',
      ].join(' ')}
    >
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-6 min-[1280px]:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="竹与墨 首页">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-ink bg-surface">
            <PandaMark size={34} />
          </span>
          <span className="font-kai text-[20px] font-bold tracking-[0.02em] text-text">竹与墨</span>
        </Link>

        <nav aria-label="主导航" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(location.pathname, item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className="group relative px-3 py-2 text-body text-text-secondary transition-colors duration-150 hover:text-text aria-[current=page]:text-text"
              >
                {desktopLabel(item)}
                {/* hover 指示条：自左展开 200ms（inkEase） */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 bg-[var(--z-link)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />
                {/* 当前页常驻指示条：layoutId 滑动（Snappy） */}
                {active && (
                  <motion.span
                    layoutId="desktop-nav-indicator"
                    transition={uiSprings.snappy}
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-[var(--z-link)]"
                  />
                )}
              </NavLink>
            );
          })}

          <InkBloom className="ml-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              transition={uiSprings.snappy}
              onClick={(e) => openSearch(e.currentTarget)}
              aria-label="搜索（Ctrl+K / Command+K）"
              className="flex h-10 items-center gap-2 rounded-full border border-border-ink px-3 text-meta text-text-tertiary hover:text-text"
            >
              <SearchIcon size={16} />
              <kbd className="hidden font-mono text-tab-label lg:inline">⌘K</kbd>
            </motion.button>
          </InkBloom>

          <span className="ml-1">
            <ThemeToggle />
          </span>
          {activeLabel && <span className="sr-only">当前页面：{activeLabel}</span>}
        </nav>
      </div>
    </header>
  );
}

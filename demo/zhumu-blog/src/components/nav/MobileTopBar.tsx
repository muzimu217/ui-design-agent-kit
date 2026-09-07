import { Link } from 'react-router-dom';
import { useSearch } from '../../lib/searchContext';
import { PandaMark } from '../PandaMark';
import { ThemeToggle } from '../ThemeToggle';
import { SearchIcon } from '../Icons';

/** 移动顶栏（§2.2）：56px sticky，logo 32 + 站名 + 搜索/主题各 40×40；不放主导航。 */
export function MobileTopBar() {
  const { openSearch } = useSearch();
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-ink bg-[color-mix(in_srgb,var(--z-bg)_94%,transparent)] px-4 backdrop-blur-[8px] md:hidden">
      <Link to="/" className="flex items-center gap-2" aria-label="竹与墨 首页">
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border-ink bg-surface">
          <PandaMark size={26} />
        </span>
        <span className="font-kai text-[20px] font-bold tracking-[0.02em] text-text">竹与墨</span>
      </Link>
      <div className="flex items-center">
        <button
          type="button"
          onClick={(e) => openSearch(e.currentTarget)}
          aria-label="搜索"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text"
        >
          <SearchIcon size={20} />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

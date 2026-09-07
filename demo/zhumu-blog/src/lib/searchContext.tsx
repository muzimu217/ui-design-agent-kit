import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface SearchContextValue {
  open: boolean;
  /** 打开浮层；trigger 元素将被记住，关闭后焦点归还。 */
  openSearch: (trigger?: HTMLElement | null) => void;
  closeSearch: () => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const SearchContext = createContext<SearchContextValue>({
  open: false,
  openSearch: () => {},
  closeSearch: () => {},
  triggerRef: { current: null },
});

/** 全局搜索浮层状态（§2.1 / §7.11）：⌘K / Ctrl+K、图标触发、焦点归还。 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openSearch = useCallback((trigger?: HTMLElement | null) => {
    if (trigger) triggerRef.current = trigger;
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    // 关闭后归还焦点给触发钮（§7.11）
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const value = useMemo(() => ({ open, openSearch, closeSearch, triggerRef }), [open, openSearch, closeSearch]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  return useContext(SearchContext);
}

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { essays } from '../content/essays';
import { posts } from '../content/posts';
import { inkEase } from '../lib/motion';
import { useSearch } from '../lib/searchContext';
import { usePrefersReducedMotion } from '../lib/useMedia';
import { CloseIcon, SearchIcon } from './Icons';
import { PandaMark } from './PandaMark';
import { TagPill } from './TagPill';

const SUGGESTED = ['Rust', 'React', 'TypeScript'];

interface Hit {
  kind: '文章' | '随笔';
  title: string;
  summary: string;
  to: string;
}

/**
 * 搜索浮层（§7.11）：surface 面板 max-height 80vh、输入 48px、Esc 关闭、
 * 焦点困住、关闭归还触发钮、防抖 300ms、loading 骨架条 ×3、空状态（插画+建议胶囊）。
 */
export function SearchOverlay() {
  const { open, closeSearch } = useSearch();
  const reduced = usePrefersReducedMotion();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const navigate = useNavigate();

  // 防抖 300ms
  useEffect(() => {
    if (!open) return;
    if (query === debounced) return;
    setSearching(true);
    const t = window.setTimeout(() => {
      setDebounced(query);
      setSearching(false);
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, debounced, open]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setQuery('');
      setDebounced('');
      setSearching(false);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  // Esc 关闭 + 焦点困住
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeSearch]);

  const hits = useMemo<Hit[]>(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    const match = (text: string) => text.toLowerCase().includes(q);
    return [
      ...posts
        .filter((p) => match(p.title) || match(p.summary) || p.tags.some(match))
        .map<Hit>((p) => ({ kind: '文章', title: p.title, summary: p.summary, to: `/posts/${p.slug}` })),
      ...essays
        .filter((e) => match(e.title) || match(e.summary) || match(e.series))
        .map<Hit>((e) => ({ kind: '随笔', title: e.title, summary: e.summary, to: `/essays` })),
    ];
  }, [debounced]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="search-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.15, ease: inkEase }}
        className="fixed inset-0 z-[80]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        {/* 遮罩 */}
        <button
          type="button"
          aria-label="关闭搜索"
          onClick={closeSearch}
          className="absolute inset-0 w-full bg-[rgb(var(--z-veil-rgb)/0.32)]"
          tabIndex={-1}
        />
        <motion.div
          ref={panelRef}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.28, ease: inkEase }}
          className="relative mx-auto mt-[8vh] flex max-h-[80vh] w-[min(560px,calc(100vw-48px))] flex-col overflow-hidden rounded-lg border border-border-ink bg-surface shadow-overlay"
        >
          <div className="flex items-center gap-3 border-b border-border-ink px-4">
            <SearchIcon size={20} className="shrink-0 text-text-tertiary" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章与随笔…"
              aria-labelledby={headingId}
              className="h-12 flex-1 bg-transparent text-body text-text outline-none placeholder:text-text-tertiary"
            />
            <button
              type="button"
              onClick={closeSearch}
              aria-label="关闭搜索"
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-tertiary hover:text-text"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <h2 id={headingId} className="sr-only">
            搜索结果
          </h2>

          <div className="overflow-y-auto px-4 py-4">
            {searching && (
              <div className="flex flex-col gap-4" aria-label="搜索中">
                <div className="skeleton h-5 w-3/5" />
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-4 w-2/5" />
              </div>
            )}

            {!searching && debounced.trim() === '' && (
              <div className="py-6 text-center">
                <div className="mx-auto flex w-fit items-end justify-center opacity-90">
                  <PandaMark pose="face" size={72} title="熊猫在等你的关键词" />
                </div>
                <p className="mt-3 text-body text-text-secondary">输入关键词，找找想读的内容</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTED.map((t) => (
                    <TagPill key={t} label={t} onClick={() => setQuery(t)} />
                  ))}
                </div>
              </div>
            )}

            {!searching && debounced.trim() !== '' && hits.length === 0 && (
              <div className="py-6 text-center">
                <img
                  src="/irasutoya/animal_stand_panda.png"
                  alt="いらすとや插画：安静站着的熊猫"
                  width={160}
                  height={200}
                  className="mx-auto w-40 max-w-full"
                />
                <p tabIndex={-1} className="mt-2 text-body font-medium text-text">
                  没有找到「{debounced.trim()}」相关内容
                </p>
                <p className="mt-1 text-meta text-text-tertiary">换个关键词试试？</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTED.map((t) => (
                    <TagPill key={t} label={t} onClick={() => setQuery(t)} />
                  ))}
                </div>
              </div>
            )}

            {!searching && hits.length > 0 && (
              <ul className="flex flex-col">
                {hits.map((h) => (
                  <li key={`${h.kind}-${h.to}-${h.title}`} className="hairline-t first:border-t-0">
                    <button
                      type="button"
                      onClick={() => {
                        closeSearch();
                        navigate(h.to);
                      }}
                      className="group w-full py-3 text-left transition-[background-color] duration-150 hover:bg-[rgba(47,107,79,0.06)] dark:hover:bg-[rgba(82,183,136,0.10)]"
                    >
                      <span className="text-meta text-text-tertiary">{h.kind}</span>
                      <span className="mt-0.5 block font-kai text-title-list text-text transition-colors duration-150 group-hover:text-link">
                        {h.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-meta text-text-secondary">{h.summary}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border-ink px-4 py-2 text-center text-tab-label text-text-tertiary">
            <Link to="/posts" onClick={closeSearch} className="hover:text-link">
              浏览全部文章 →
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

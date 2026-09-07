import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { Block } from '../content/types';
import { uiSprings } from '../lib/motion';
import { ChevronDownIcon } from './Icons';

/** 由 block 数组提取 TOC 条目（h2/h3）。 */
export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractToc(blocks: Block[]): TocItem[] {
  const items: TocItem[] = [];
  let h2 = 0;
  let h3 = 0;
  for (const b of blocks) {
    if (b.type === 'heading') {
      if (b.level === 2) {
        h2++;
        items.push({ id: `sec-h2-${h2}`, text: b.text, level: 2 });
      } else {
        h3++;
        items.push({ id: `sec-h3-${h3}`, text: b.text, level: 3 });
      }
    }
  }
  return items;
}

/** heading block 的序号 → id（与 extractToc 同步）。 */
export function headingId(blocks: Block[], index: number): string | null {
  const block = blocks[index];
  if (block.type !== 'heading') return null;
  let h2 = 0;
  let h3 = 0;
  for (let i = 0; i <= index; i++) {
    const b = blocks[i];
    if (b.type !== 'heading') continue;
    if (b.level === 2) h2++;
    else h3++;
  }
  return block.level === 2 ? `sec-h2-${h2}` : `sec-h3-${h3}`;
}

export function useTocState(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  );

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return { activeId, open, setOpen, jump };
}

function TocList({ items, activeId, jump }: { items: TocItem[]; activeId: string | null; jump: (id: string) => void }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <li key={it.id} className={it.level === 3 ? 'pl-4' : ''}>
            <button
              type="button"
              onClick={() => jump(it.id)}
              className={[
                'relative block w-full py-1 pl-3 text-left text-[14px] leading-[1.6] transition-colors duration-150',
                active ? 'text-[var(--z-link)]' : 'text-text-tertiary hover:text-text',
              ].join(' ')}
            >
              {/* 左 2px 指示轨：active 竹绿（layoutId 滑动） */}
              {active ? (
                <motion.span
                  layoutId="toc-indicator"
                  transition={uiSprings.snappy}
                  aria-hidden="true"
                  className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-[var(--z-link)]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-transparent"
                />
              )}
              {it.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** <1024：正文上方折叠 disclosure（§7.7），默认收起。 */
export function TocInline({ items }: { items: TocItem[] }) {
  const { activeId, open, setOpen, jump } = useTocState(items);
  if (items.length === 0) return null;
  return (
    <div className="mb-6 border border-border-ink rounded-md lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="toc-disclosure"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between px-4 text-body text-text-secondary"
      >
        目录
        <ChevronDownIcon
          size={18}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id="toc-disclosure" className="border-t border-border-ink px-4 py-3">
          <TocList items={items} activeId={activeId} jump={jump} />
        </div>
      )}
    </div>
  );
}

/** ≥1024：右栏 200px sticky top-24（§7.7）。无标题不渲染。 */
export function TocPanel({ items }: { items: TocItem[] }) {
  const { activeId, jump } = useTocState(items);
  if (items.length === 0) return null;
  return (
    <nav aria-label="文章目录" className="hidden w-[200px] shrink-0 lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
        <TocList items={items} activeId={activeId} jump={jump} />
      </div>
    </nav>
  );
}

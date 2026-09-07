import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { posts } from '../content/posts';
import { PostListItem, PostListEmpty } from '../components/PostListItem';
import { TagPill } from '../components/TagPill';
import { LoadMore } from '../components/LoadMore';
import type { LoadMoreState } from '../components/LoadMore';
import { PullToRefresh } from '../components/PullToRefresh';
import { useTouchSmallViewport } from '../lib/useMedia';

const PAGE_SIZE = 3;
const PULL_TARGET = 200; // 上拉手势累计像素 → 进度 1
const FILTER_TAGS = [
  '全部',
  'Rust',
  '前端',
  'TypeScript',
  'React',
  '独立开发',
  '成都',
  'WebAssembly',
  '设计', // 无内容的标签：用于指认空状态
];

/**
 * 文章列表（§2.1 /posts）：标签筛选（横滑 scroll-snap）+ 上拉分页（§7.9）
 * + 移动端下拉刷新（<768 且 touch，§7.10）。分页/刷新为演示模拟异步。
 */
export default function PostsPage() {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') ?? '全部';
  const [tag, setTag] = useState(FILTER_TAGS.includes(initialTag) ? initialTag : '全部');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadState, setLoadState] = useState<LoadMoreState>('idle');
  const [pullProgress, setPullProgress] = useState(0);
  const attemptRef = useRef(0);
  const loadStateRef = useRef<LoadMoreState>('idle');
  loadStateRef.current = loadState;
  const isTouchSmall = useTouchSmallViewport();

  const filtered = useMemo(
    () =>
      [...posts]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .filter((p) => tag === '全部' || p.tags.includes(tag)),
    [tag],
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const loadNext = useCallback(() => {
    if (loadStateRef.current === 'loading') return; // 加载中忽略（§8.2 H 防抖）
    setLoadState('loading');
    attemptRef.current += 1;
    window.setTimeout(() => {
      // 演示：让 failure 态可被指认（第 2 次尝试失败一次，重试成功）
      if (attemptRef.current === 2) {
        setLoadState('failure');
        return;
      }
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadState('idle');
    }, 700);
  }, []);

  // 上拉手势：接近底部后继续向上拖（滚轮/触屏）→ 进度 → 释放触发
  useEffect(() => {
    if (!hasMore) return;
    const nearBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

    let wheelAcc = 0;
    let touchStartY = 0;
    let touchAcc = 0;
    let active = false;

    const beginPull = (progress: number) => {
      if (!active) {
        active = true;
        setLoadState((s) => (s === 'pulling' || s === 'idle' ? 'pulling' : s));
      }
      setPullProgress(Math.min(1, progress));
    };

    const endPull = (reach: boolean) => {
      if (!active) return;
      active = false;
      if (reach) {
        setPullProgress(1);
        loadNext();
      } else {
        setLoadState((s) => (s === 'pulling' ? 'idle' : s));
        setPullProgress(0);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (loadStateRef.current === 'loading') return;
      if (!nearBottom()) {
        wheelAcc = 0;
        return;
      }
      wheelAcc = Math.max(0, wheelAcc + e.deltaY);
      if (wheelAcc > 12) beginPull(wheelAcc / PULL_TARGET);
      if (wheelAcc >= PULL_TARGET) endPull(true);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchAcc = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (loadStateRef.current === 'loading') return;
      if (!nearBottom()) return;
      const dy = touchStartY - e.touches[0].clientY; // 向上滑为正
      touchAcc = Math.max(touchAcc, dy);
      if (touchAcc > 12) beginPull(touchAcc / PULL_TARGET);
    };
    const onTouchEnd = () => endPull(touchAcc >= PULL_TARGET);

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [hasMore, loadNext]);

  // 没有更多 → end 态
  useEffect(() => {
    setLoadState((s) => (hasMore ? (s === 'end' ? 'idle' : s) : 'end'));
  }, [hasMore]);

  const onRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 900));
    setVisibleCount(PAGE_SIZE);
    attemptRef.current = 0;
  }, []);

  const pagesLoaded = Math.ceil(visibleCount / PAGE_SIZE);

  const body = (
    <div className="mt-2">
      {visible.length === 0 ? (
        <PostListEmpty
          suggestions={['Rust', '前端', '成都']}
          onSelect={(t) => setTag(t)}
        />
      ) : (
        <>
          {visible.map((post, i) => (
            <PostListItem key={post.slug} post={post} index={i} />
          ))}
          <LoadMore
            state={loadState}
            progress={pullProgress}
            pagesLoaded={pagesLoaded}
            onRetry={loadNext}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="content-col pt-6 md:pt-10">
      <h1 className="m-0 font-kai text-h1 font-bold text-text">文章</h1>

      <div className="pill-strip mt-4 -mx-6 px-6 md:mx-0 md:px-0" role="group" aria-label="标签筛选">
        {FILTER_TAGS.map((t) => (
          <TagPill
            key={t}
            label={t}
            selected={tag === t}
            onClick={() => {
              setTag(t);
              setVisibleCount(PAGE_SIZE);
              setLoadState('idle');
              setPullProgress(0);
              attemptRef.current = 0;
            }}
          />
        ))}
      </div>

      {isTouchSmall ? (
        <PullToRefresh onRefresh={onRefresh}>{body}</PullToRefresh>
      ) : (
        body
      )}
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { essays } from '../content/essays';
import { posts } from '../content/posts';
import { HeroScene } from '../components/HeroScene';
import { PostListItem } from '../components/PostListItem';
import { TagPill } from '../components/TagPill';
import { ChevronDownIcon } from '../components/Icons';

const HERO_TAGS = ['Rust', '前端', '追番', '成都'];

/**
 * 首页（§2.1）：hero（桌面含 nav ≤60% 视口 / 移动紧凑 ≤280px，首条文章进首屏）
 * → 最新文章 ≤5（首条置顶）→ 追番周记横向栏目条 → 页脚。
 */
export default function HomePage() {
  const navigate = useNavigate();
  const latest = [...posts]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);
  const weekly = [...essays]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  return (
    <div className="content-col">
      {/* hero：移动端紧凑（56 顶栏 + hero ≤280px → 首篇文章标题在 844 首屏内） */}
      <section aria-label="介绍" className="flex flex-col items-start gap-4 pb-10 pt-6 md:flex-row md:items-center md:justify-between md:gap-8 md:pb-14 md:pt-10">
        <div className="max-w-[560px]">
          <h1 className="m-0 font-kai text-display font-bold text-text">你好，我是小墨</h1>
          <p className="mt-2 text-body text-text-secondary">
            成都开发者 · 写代码、看番、啃竹子
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {HERO_TAGS.map((t) => (
              <TagPill
                key={t}
                label={t}
                onClick={() => navigate(t === '追番' ? '/essays' : '/posts')}
              />
            ))}
          </div>
        </div>
        <div className="hidden md:block md:shrink-0">
          <HeroScene />
        </div>
      </section>

      {/* 最新文章：无底色带，1px hairline 分隔 */}
      <section aria-labelledby="latest-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="latest-heading" className="m-0 font-kai text-h2 font-bold text-text">
            最新文章
          </h2>
          <Link
            to="/posts"
            className="text-meta text-text-tertiary transition-colors duration-150 hover:text-[var(--z-link)]"
          >
            全部文章 →
          </Link>
        </div>
        <div className="mt-2">
          {latest.map((post, i) => (
            <PostListItem key={post.slug} post={post} index={i} />
          ))}
        </div>
      </section>

      {/* 追番周记横向栏目条 */}
      <section aria-labelledby="weekly-heading" className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 id="weekly-heading" className="m-0 font-kai text-h2 font-bold text-text">
            追番周记
          </h2>
          <Link
            to="/essays"
            className="text-meta text-text-tertiary transition-colors duration-150 hover:text-[var(--z-link)]"
          >
            全部随笔 →
          </Link>
        </div>
        <div className="pill-strip mt-4 -mx-6 px-6 pb-1 md:mx-0 md:px-0">
          {weekly.map((e) => (
            <Link
              key={e.slug}
              to="/essays"
              className="group flex w-[280px] shrink-0 flex-col rounded-lg border border-border-ink bg-surface/80 p-4 transition-colors duration-150 hover:border-[var(--z-link)]"
            >
              <span className="text-meta text-[var(--z-link)]">{e.volume}</span>
              <span className="mt-1 font-kai text-title-list font-semibold text-text transition-colors duration-150 group-hover:text-[var(--z-link)]">
                {e.title}
              </span>
              <span className="mt-2 line-clamp-2 text-meta text-text-secondary">{e.summary}</span>
            </Link>
          ))}
          <Link
            to="/essays"
            aria-label="更多随笔"
            className="flex w-12 shrink-0 items-center justify-center rounded-lg border border-border-ink text-text-tertiary hover:text-[var(--z-link)]"
          >
            <ChevronDownIcon size={18} className="-rotate-90" />
          </Link>
        </div>
      </section>
    </div>
  );
}

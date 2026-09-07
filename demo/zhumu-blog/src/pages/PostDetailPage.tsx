import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts } from '../content/posts';
import { formatChineseDate } from '../content/types';
import { ArticleRenderer } from '../components/ArticleRenderer';
import { extractToc, TocInline, TocPanel } from '../components/Toc';
import { TagChip } from '../components/TagPill';
import { NotFoundPage } from './NotFoundPage';

/**
 * 文章详情（§2.1 /posts/:slug）：正文排版区（禁止插画）+ 代码块 +
 * TOC（lg 右栏 sticky / 小屏 disclosure）+ 上下篇。
 */
export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => posts.find((p) => p.slug === slug), [slug]);
  const toc = useMemo(() => (post ? extractToc(post.blocks) : []), [post]);

  if (!post) {
    return <NotFoundPage message="这篇文章不存在，可能被熊猫叼走了" />;
  }

  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const idx = sorted.findIndex((p) => p.slug === post.slug);
  const prev = sorted[idx - 1]; // 更新一篇
  const next = sorted[idx + 1]; // 更旧一篇

  return (
    <div className="content-col pt-6 md:pt-10">
      <article>
        <header className="max-w-[680px]">
          <h1 className="m-0 font-kai text-h1 font-bold text-text">{post.title}</h1>
          <p className="mt-2 text-meta text-text-tertiary">
            {formatChineseDate(post.date)} · 约 {post.minutes} 分钟
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link
                key={t}
                to={`/posts?tag=${encodeURIComponent(t)}`}
                className="no-underline transition-opacity duration-150 hover:opacity-80"
              >
                <TagChip label={t} />
              </Link>
            ))}
          </div>
        </header>

        <div className="mt-8 flex gap-10">
          <div className="article-col min-w-0 flex-1">
            <TocInline items={toc} />
            <ArticleRenderer blocks={post.blocks} />
          </div>
          <TocPanel items={toc} />
        </div>
      </article>

      {/* 上下篇 */}
      <nav aria-label="上下篇" className="mx-auto mt-12 grid max-w-[680px] grid-cols-2 gap-4">
        {prev ? (
          <Link
            to={`/posts/${prev.slug}`}
            className="group rounded-md border border-border-ink p-3 no-underline transition-colors duration-150 hover:border-[var(--z-link)]"
          >
            <span className="text-meta text-text-tertiary">← 上一篇</span>
            <span className="mt-1 block font-kai text-title-list text-text transition-colors duration-150 group-hover:text-[var(--z-link)]">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/posts/${next.slug}`}
            className="group rounded-md border border-border-ink p-3 text-right no-underline transition-colors duration-150 hover:border-[var(--z-link)]"
          >
            <span className="text-meta text-text-tertiary">下一篇 →</span>
            <span className="mt-1 block font-kai text-title-list text-text transition-colors duration-150 group-hover:text-[var(--z-link)]">
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}

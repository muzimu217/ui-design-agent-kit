import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { essays } from '../content/essays';
import { formatChineseDate } from '../content/types';
import { ArticleRenderer } from '../components/ArticleRenderer';
import { NotFoundPage } from './NotFoundPage';

/** 随笔详情（契约路由表的补充项，见 README 实现笔记）：正文排版区无插画。 */
export default function EssayDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const essay = useMemo(() => essays.find((e) => e.slug === slug), [slug]);

  if (!essay) {
    return <NotFoundPage message="这篇随笔不存在，可能被熊猫啃掉了" />;
  }

  return (
    <div className="content-col pt-6 md:pt-10">
      <article className="article-col">
        <p className="m-0 text-meta text-[var(--z-link)]">
          {essay.series} · {essay.volume}
        </p>
        <h1 className="m-0 mt-1 font-kai text-h1 font-bold text-text">{essay.title}</h1>
        <p className="mt-2 text-meta text-text-tertiary">{formatChineseDate(essay.date)}</p>
        <div className="mt-8">
          <ArticleRenderer blocks={essay.blocks} />
        </div>
      </article>
      <p className="mt-10 text-center">
        <Link
          to="/essays"
          className="text-meta text-text-tertiary transition-colors duration-150 hover:text-[var(--z-link)]"
        >
          ← 返回随笔列表
        </Link>
      </p>
    </div>
  );
}

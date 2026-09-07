import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { Post } from '../content/types';
import { formatChineseDate } from '../content/types';
import { uiSprings } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';
import { PinnedBadge } from './PinnedBadge';
import { Reveal } from './Reveal';
import { TagChip, TagPill } from './TagPill';

/**
 * 文章列表项（§7.3）：title-list WenKai 标题 + meta 日期/时长 + ≤2 胶囊 +
 * 两行摘要；项间 1px hairline、无底色带；hover 标题转链接色（150ms）+
 * 整项 -2px（Snappy）、布局不位移；active 0.995；置顶项含朱砂印章与读屏 [置顶]。
 */
export function PostListItem({
  post,
  index = 0,
  reveal = true,
}: {
  post: Post;
  index?: number;
  reveal?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const inner = (
    <motion.div
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.995 }}
      transition={uiSprings.snappy}
      className="group py-5"
    >
      <Link to={`/posts/${post.slug}`} className="block focus-visible:outline-offset-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 font-kai text-title-list font-semibold text-text transition-colors duration-150 group-hover:text-[var(--z-link)]">
            {post.pinned && <span className="sr-only">[置顶] </span>}
            {post.title}
          </h3>
          {post.pinned && <PinnedBadge />}
        </div>
        <p className="mt-1 text-meta text-text-tertiary">
          {formatChineseDate(post.date)} · 约 {post.minutes} 分钟
        </p>
        <p className="mt-2 line-clamp-2 text-body text-text-secondary">{post.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 2).map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="hairline-t first:border-t-0">
      {reveal ? (
        <Reveal index={index}>
          {inner}
        </Reveal>
      ) : (
        inner
      )}
    </div>
  );
}

/** 骨架屏（§7.3 loading）：标题条 60%、meta 条 30%、摘要两行，脉冲 1.6s。 */
export function PostListItemSkeleton() {
  return (
    <div className="hairline-t py-5 first:border-t-0" aria-hidden="true">
      <div className="skeleton h-6 w-3/5" />
      <div className="skeleton mt-2 h-4 w-[30%]" />
      <div className="skeleton mt-3 h-4 w-full" />
      <div className="skeleton mt-1.5 h-4 w-11/12" />
    </div>
  );
}

/** 空状态（§7.3 empty）：irasutoya 插画 160px + 文案 + 建议胶囊 ×3。 */
export function PostListEmpty({ suggestions, onSelect }: { suggestions: string[]; onSelect: (tag: string) => void }) {
  return (
    <div className="py-10 text-center">
      <img
        src="/irasutoya/animal_stand_panda.png"
        alt="いらすとや插画：安静站着的熊猫"
        width={160}
        height={200}
        className="mx-auto w-40 max-w-full"
      />
      <p className="mt-2 font-kai text-title-list text-text">这里还没有文章</p>
      <p className="mt-1 text-meta text-text-tertiary">看看这些标签下的内容吧</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map((t) => (
          <TagPill key={t} label={t} onClick={() => onSelect(t)} />
        ))}
      </div>
    </div>
  );
}

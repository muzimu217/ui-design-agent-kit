import type { Block } from '../content/types';
import { CodeBlock } from './CodeBlock';
import { headingId } from './Toc';

/**
 * 极简 block 渲染器（§5.2 正文排版）：无 markdown 依赖。
 * 正文 17px/1.9 Noto Sans、段落间距 1em、阅读列由外层 .article-col 控制。
 * 正文排版区禁止出现任何插画【HC 边界】。
 */
export function ArticleRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-[1em]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            const id = headingId(blocks, i);
            if (block.level === 2) {
              return (
                <h2
                  key={i}
                  id={id ?? undefined}
                  className="mt-8 scroll-mt-24 font-kai text-h2 font-bold text-text"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={i}
                id={id ?? undefined}
                className="mt-6 scroll-mt-24 font-kai text-h3 font-semibold text-text"
              >
                {block.text}
              </h3>
            );
          }
          case 'paragraph':
            return (
              <p key={i} className="m-0 text-body-article text-text">
                {block.text}
              </p>
            );
          case 'code':
            return (
              <div key={i} className="my-2">
                <CodeBlock code={block.code} lang={block.lang} />
              </div>
            );
          case 'list': {
            const Tag = block.ordered ? 'ol' : 'ul';
            return (
              <Tag
                key={i}
                className={[
                  'm-0 flex flex-col gap-1 pl-6 text-body-article text-text',
                  block.ordered ? 'list-decimal' : 'list-disc',
                ].join(' ')}
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </Tag>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

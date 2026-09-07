import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../content/posts';
import { yearMonth } from '../content/types';
import { essays } from '../content/essays';
import { Reveal } from '../components/Reveal';

interface Entry {
  date: string;
  title: string;
  to: string;
  kind: '文章' | '随笔';
}

/** 归档（§2.1 /archives）：按年/月分组时间线，紧凑列表项复用。 */
export default function ArchivesPage() {
  const groups = useMemo(() => {
    const entries: Entry[] = [
      ...posts.map((p) => ({ date: p.date, title: p.title, to: `/posts/${p.slug}`, kind: '文章' as const })),
      ...essays.map((e) => ({ date: e.date, title: e.title, to: `/essays/${e.slug}`, kind: '随笔' as const })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1));

    const byYear = new Map<string, Entry[]>();
    for (const e of entries) {
      const { year } = yearMonth(e.date);
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push(e);
    }
    return [...byYear.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, []);

  return (
    <div className="content-col pt-6 md:pt-10">
      <h1 className="m-0 font-kai text-h1 font-bold text-text">归档</h1>
      <p className="mt-2 text-meta text-text-tertiary">
        共 {groups.reduce((n, [, es]) => n + es.length, 0)} 篇
      </p>

      {groups.map(([year, entries], gi) => (
        <section key={year} aria-label={`${year} 年`} className="mt-8">
          <h2 className="m-0 font-kai text-h2 font-bold text-text">
            {year}
            <span className="ml-2 align-middle text-meta font-normal text-text-tertiary">
              {entries.length} 篇
            </span>
          </h2>
          <ol className="m-0 mt-2 list-none p-0">
            {entries.map((e, i) => {
              const { month } = yearMonth(e.date);
              return (
                <li key={`${e.to}-${e.date}`} className="hairline-t first:border-t-0">
                  <Reveal index={i}>
                    <Link
                      to={e.to}
                      className="group flex items-baseline gap-4 py-3 no-underline"
                    >
                      <span className="w-12 shrink-0 text-meta text-text-tertiary">
                        {Number(month)} 月
                      </span>
                      <span className="min-w-0 flex-1 font-kai text-body text-text transition-colors duration-150 group-hover:text-[var(--z-link)]">
                        {e.title}
                        <span className="ml-2 text-tab-label text-text-tertiary">[{e.kind}]</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ol>
          {gi < groups.length - 1 && <div className="mt-6" />}
        </section>
      ))}
    </div>
  );
}

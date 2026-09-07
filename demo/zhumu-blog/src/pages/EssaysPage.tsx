import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { essays } from '../content/essays';
import { formatChineseDate } from '../content/types';
import { TagPill } from '../components/TagPill';
import { Reveal } from '../components/Reveal';

const SERIES = ['全部', '追番周记'];

/** 随笔（§2.1 /essays）：列表 + 系列筛选；头图插画仅列表层。 */
export default function EssaysPage() {
  const [series, setSeries] = useState('全部');
  const list = useMemo(
    () =>
      [...essays]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .filter((e) => series === '全部' || e.series === series),
    [series],
  );

  return (
    <div className="content-col pt-6 md:pt-10">
      <h1 className="m-0 font-kai text-h1 font-bold text-text">随笔</h1>

      <div className="pill-strip mt-4 -mx-6 px-6 md:mx-0 md:px-0" role="group" aria-label="系列筛选">
        {SERIES.map((s) => (
          <TagPill key={s} label={s} selected={series === s} onClick={() => setSeries(s)} />
        ))}
      </div>

      <div className="mt-2">
        {list.map((e, i) => (
          <div key={e.slug} className="hairline-t first:border-t-0">
            <Reveal index={i}>
              <Link to={`/essays/${e.slug}`} className="group flex items-start gap-4 py-5 no-underline">
                {e.image && (
                  <img
                    src={e.image}
                    alt={e.alt ?? e.title}
                    width={120}
                    height={120}
                    loading="lazy"
                    className="h-[120px] w-[120px] shrink-0 rounded-lg border border-border-ink bg-surface object-contain p-1"
                  />
                )}
                <div className="min-w-0">
                  <p className="m-0 text-meta text-[var(--z-link)]">
                    {e.series} · {e.volume}
                  </p>
                  <h2 className="m-0 mt-1 font-kai text-title-list font-semibold text-text transition-colors duration-150 group-hover:text-[var(--z-link)]">
                    {e.title}
                  </h2>
                  <p className="m-0 mt-1 text-meta text-text-tertiary">
                    {formatChineseDate(e.date)}
                  </p>
                  <p className="m-0 mt-2 line-clamp-2 text-body text-text-secondary">{e.summary}</p>
                </div>
              </Link>
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}

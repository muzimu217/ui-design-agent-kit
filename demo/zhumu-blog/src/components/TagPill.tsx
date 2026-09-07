import type { ButtonHTMLAttributes } from 'react';

interface TagPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
}

/** 标签胶囊（§7.4）：高 32px、full 圆角、meta 字号、1px border-strong；选中 = 品牌底。 */
export function TagPill({ label, selected = false, className = '', ...rest }: TagPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        'h-8 shrink-0 rounded-full border px-[14px] text-meta transition-colors duration-150',
        selected
          ? 'border-link bg-link text-on-brand'
          : 'border-border-strong bg-transparent text-text-secondary hover:border-link hover:bg-[rgba(47,107,79,0.08)] dark:hover:bg-[rgba(82,183,136,0.12)]',
        className,
      ].join(' ')}
      {...rest}
    >
      {label}
    </button>
  );
}

/** 骨架胶囊（§7.4 loading）：80×32。 */
export function TagPillSkeleton() {
  return <span className="skeleton inline-block h-8 w-20 rounded-full" aria-hidden="true" />;
}

/** 展示用标签（不可交互，供装饰性场合；交互场合用 TagPill）。 */
export function TagChip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 shrink-0 items-center rounded-full border border-border-strong px-[14px] text-meta text-text-secondary"
    >
      {label}
    </span>
  );
}

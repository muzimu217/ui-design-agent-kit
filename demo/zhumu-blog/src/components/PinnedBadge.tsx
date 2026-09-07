/** 置顶徽标（§7.5 朱砂印章）：仅此组件可用朱砂；亮色描边体、暗色纸字朱砂底实心变体。 */
export function PinnedBadge() {
  return (
    <span
      className={[
        'inline-block -rotate-2 whitespace-nowrap rounded-sm px-2 py-0.5 align-middle text-meta font-medium leading-[1.4]',
        'border-2 border-badge text-badge', // 亮色：2px 朱砂描边 + 朱砂字
        'dark:border-badge dark:bg-badge dark:text-[#FAF7F0]', // 暗色：实心印章（纸字 5.5:1）
      ].join(' ')}
      aria-hidden="true"
    >
      置顶
    </span>
  );
}

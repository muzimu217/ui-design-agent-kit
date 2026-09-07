/** 文章体类型化 block 数组（不引 markdown 依赖，渲染见 ArticleRenderer）。 */
export type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'list'; ordered?: boolean; items: string[] };

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO 日期
  minutes: number; // 预计阅读时长
  tags: string[];
  summary: string;
  pinned?: boolean; // 首页置顶（朱砂印章）
  blocks: Block[];
}

export interface Essay {
  slug: string;
  title: string;
  date: string;
  series: '追番周记'; // 随笔系列（§2.1）
  volume: string; // Vol.xx
  summary: string;
  image?: string; // 随笔头图插画，仅列表层（正文排版区禁止插画）
  alt?: string;
  blocks: Block[];
}

export const ALL_TAGS = ['Rust', '前端', 'TypeScript', 'React', '独立开发', '成都', 'WebAssembly'];

export function formatChineseDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

export function yearMonth(iso: string): { year: string; month: string } {
  const [y, m] = iso.split('-');
  return { year: y, month: m };
}

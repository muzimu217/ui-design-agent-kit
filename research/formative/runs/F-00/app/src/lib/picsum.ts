/** Picsum Photos 免 key API（图片实际源自 Unsplash 免费库） */

export interface PicsumPhoto {
  /** Picsum 图片 id */
  id: string;
  /** 作者名 */
  author: string;
  width: number;
  height: number;
  /** Unsplash 原页 URL（署名用） */
  url: string;
  download_url: string;
}

export const PICSUM_PAGE_MIN = 1;
export const PICSUM_PAGE_MAX = 100;
export const PICSUM_PAGE_SIZE = 24;

/** 列表走本地代理（/picsum-api → https://picsum.photos，见 vite.config.ts） */
export async function fetchPicsumPage(
  page: number,
  signal?: AbortSignal,
): Promise<PicsumPhoto[]> {
  const res = await fetch(`/picsum-api/v2/list?page=${page}&limit=${PICSUM_PAGE_SIZE}`, {
    signal,
  });
  if (!res.ok) throw new Error(`picsum-http-${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('picsum-shape');
  return data.filter(isPicsumPhoto);
}

function isPicsumPhoto(raw: unknown): raw is PicsumPhoto {
  if (typeof raw !== 'object' || raw === null) return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    r.id !== '' &&
    typeof r.author === 'string' &&
    typeof r.url === 'string' &&
    r.url.startsWith('http')
  );
}

/** 随机页码（1-100），avoid 用于换一批时避开上一批 */
export function randomPicsumPage(avoid?: number): number {
  const span = PICSUM_PAGE_MAX - PICSUM_PAGE_MIN + 1;
  for (let i = 0; i < 8; i += 1) {
    const p = PICSUM_PAGE_MIN + Math.floor(Math.random() * span);
    if (p !== avoid) return p;
  }
  return PICSUM_PAGE_MIN + Math.floor(Math.random() * span);
}

/** 缩略图 CDN 直链（浏览器直连，无需代理） */
export function picsumThumb(id: string): string {
  return `https://picsum.photos/id/${id}/360/220`;
}

/** 全尺寸背景 CDN 直链 */
export function picsumFull(id: string): string {
  return `https://picsum.photos/id/${id}/2400/1500`;
}

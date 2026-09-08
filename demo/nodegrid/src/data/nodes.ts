// ============================================================
// NODEGRID 网络数据（虚构演示数据）
// 32 节点 / 21 城市 / 3 大洲（亚太 · 北美 · 欧洲）
// tier: core 核心 / edge 边缘 / planned 规划中
// 延迟为演示值（参考接入点：上海）
// ============================================================

export type Region = 'apac' | 'na' | 'eu';
export type Tier = 'core' | 'edge' | 'planned';

export interface NodeInfo {
  id: string;
  city: string;
  cityEn: string;
  cc: string;
  country: string;
  region: Region;
  tier: Tier;
  lat: number;
  lng: number;
  /** 演示延迟 ms（参考接入点：上海） */
  latency: number;
  lines: string[];
  promo: boolean;
}

export const REGION_LABEL: Record<Region, string> = {
  apac: '亚太',
  na: '北美',
  eu: '欧洲',
};

export const TIER_LABEL: Record<Tier, string> = {
  core: '核心节点',
  edge: '边缘节点',
  planned: '规划中',
};

export const NODES: NodeInfo[] = [
  // —— 亚太 ——
  { id: 'HKG-01', city: '香港', cityEn: 'Hong Kong', cc: 'HK', country: '中国香港', region: 'apac', tier: 'core', lat: 22.32, lng: 114.17, latency: 32, lines: ['CN2 直连', 'CMI', 'BGP 多线'], promo: true },
  { id: 'HKG-02', city: '香港', cityEn: 'Hong Kong', cc: 'HK', country: '中国香港', region: 'apac', tier: 'core', lat: 22.28, lng: 113.95, latency: 34, lines: ['CN2 直连', 'CMI', 'BGP 多线'], promo: true },
  { id: 'NRT-01', city: '东京', cityEn: 'Tokyo', cc: 'JP', country: '日本', region: 'apac', tier: 'core', lat: 35.68, lng: 139.69, latency: 46, lines: ['国际 BGP', 'CN2'], promo: false },
  { id: 'NRT-02', city: '东京', cityEn: 'Tokyo', cc: 'JP', country: '日本', region: 'apac', tier: 'edge', lat: 35.44, lng: 139.75, latency: 48, lines: ['国际 BGP'], promo: false },
  { id: 'KIX-01', city: '大阪', cityEn: 'Osaka', cc: 'JP', country: '日本', region: 'apac', tier: 'edge', lat: 34.69, lng: 135.5, latency: 52, lines: ['国际 BGP'], promo: false },
  { id: 'SIN-01', city: '新加坡', cityEn: 'Singapore', cc: 'SG', country: '新加坡', region: 'apac', tier: 'core', lat: 1.35, lng: 103.82, latency: 68, lines: ['CN2', '国际 BGP'], promo: false },
  { id: 'SIN-02', city: '新加坡', cityEn: 'Singapore', cc: 'SG', country: '新加坡', region: 'apac', tier: 'edge', lat: 1.29, lng: 103.86, latency: 70, lines: ['国际 BGP'], promo: false },
  { id: 'ICN-01', city: '首尔', cityEn: 'Seoul', cc: 'KR', country: '韩国', region: 'apac', tier: 'edge', lat: 37.57, lng: 126.98, latency: 58, lines: ['国际 BGP'], promo: false },
  { id: 'BKK-01', city: '曼谷', cityEn: 'Bangkok', cc: 'TH', country: '泰国', region: 'apac', tier: 'planned', lat: 13.76, lng: 100.5, latency: 88, lines: [], promo: false },
  { id: 'CGK-01', city: '雅加达', cityEn: 'Jakarta', cc: 'ID', country: '印度尼西亚', region: 'apac', tier: 'planned', lat: -6.21, lng: 106.85, latency: 96, lines: [], promo: false },
  { id: 'SYD-01', city: '悉尼', cityEn: 'Sydney', cc: 'AU', country: '澳大利亚', region: 'apac', tier: 'edge', lat: -33.87, lng: 151.21, latency: 148, lines: ['国际 BGP'], promo: false },
  { id: 'SYD-02', city: '悉尼', cityEn: 'Sydney', cc: 'AU', country: '澳大利亚', region: 'apac', tier: 'edge', lat: -33.81, lng: 151.11, latency: 150, lines: ['国际 BGP'], promo: false },
  { id: 'SHA-01', city: '上海', cityEn: 'Shanghai', cc: 'CN', country: '中国内地', region: 'apac', tier: 'core', lat: 31.23, lng: 121.47, latency: 6, lines: ['BGP 多线'], promo: false },
  { id: 'SHA-02', city: '上海', cityEn: 'Shanghai', cc: 'CN', country: '中国内地', region: 'apac', tier: 'edge', lat: 31.02, lng: 121.4, latency: 8, lines: ['BGP 多线'], promo: false },
  { id: 'PEK-01', city: '北京', cityEn: 'Beijing', cc: 'CN', country: '中国内地', region: 'apac', tier: 'edge', lat: 39.9, lng: 116.4, latency: 18, lines: ['BGP 多线'], promo: false },
  { id: 'PEK-02', city: '北京', cityEn: 'Beijing', cc: 'CN', country: '中国内地', region: 'apac', tier: 'edge', lat: 39.86, lng: 116.3, latency: 20, lines: ['BGP 多线'], promo: false },
  { id: 'SZX-01', city: '深圳', cityEn: 'Shenzhen', cc: 'CN', country: '中国内地', region: 'apac', tier: 'edge', lat: 22.54, lng: 114.06, latency: 12, lines: ['BGP 多线', 'CMI'], promo: false },
  { id: 'SZX-02', city: '深圳', cityEn: 'Shenzhen', cc: 'CN', country: '中国内地', region: 'apac', tier: 'edge', lat: 22.62, lng: 113.95, latency: 14, lines: ['BGP 多线'], promo: false },
  // —— 北美 ——
  { id: 'SJC-01', city: '圣何塞', cityEn: 'San Jose', cc: 'US', country: '美国', region: 'na', tier: 'core', lat: 37.34, lng: -121.89, latency: 135, lines: ['CN2 GIA', '国际 BGP'], promo: false },
  { id: 'SJC-02', city: '圣何塞', cityEn: 'San Jose', cc: 'US', country: '美国', region: 'na', tier: 'edge', lat: 37.29, lng: -121.93, latency: 137, lines: ['国际 BGP'], promo: false },
  { id: 'LAX-01', city: '洛杉矶', cityEn: 'Los Angeles', cc: 'US', country: '美国', region: 'na', tier: 'core', lat: 34.05, lng: -118.24, latency: 130, lines: ['CN2 GIA', '国际 BGP'], promo: false },
  { id: 'LAX-02', city: '洛杉矶', cityEn: 'Los Angeles', cc: 'US', country: '美国', region: 'na', tier: 'edge', lat: 33.98, lng: -118.3, latency: 132, lines: ['国际 BGP'], promo: false },
  { id: 'SEA-01', city: '西雅图', cityEn: 'Seattle', cc: 'US', country: '美国', region: 'na', tier: 'edge', lat: 47.61, lng: -122.33, latency: 142, lines: ['国际 BGP'], promo: false },
  { id: 'DFW-01', city: '达拉斯', cityEn: 'Dallas', cc: 'US', country: '美国', region: 'na', tier: 'edge', lat: 32.78, lng: -96.8, latency: 155, lines: ['国际 BGP'], promo: false },
  { id: 'NYC-01', city: '纽约', cityEn: 'New York', cc: 'US', country: '美国', region: 'na', tier: 'edge', lat: 40.71, lng: -74.01, latency: 168, lines: ['国际 BGP'], promo: false },
  { id: 'YYZ-01', city: '多伦多', cityEn: 'Toronto', cc: 'CA', country: '加拿大', region: 'na', tier: 'planned', lat: 43.65, lng: -79.38, latency: 178, lines: [], promo: false },
  // —— 欧洲 ——
  { id: 'FRA-01', city: '法兰克福', cityEn: 'Frankfurt', cc: 'DE', country: '德国', region: 'eu', tier: 'core', lat: 50.11, lng: 8.68, latency: 182, lines: ['国际 BGP'], promo: false },
  { id: 'FRA-02', city: '法兰克福', cityEn: 'Frankfurt', cc: 'DE', country: '德国', region: 'eu', tier: 'edge', lat: 50.05, lng: 8.63, latency: 184, lines: ['国际 BGP'], promo: false },
  { id: 'LON-01', city: '伦敦', cityEn: 'London', cc: 'GB', country: '英国', region: 'eu', tier: 'core', lat: 51.51, lng: -0.13, latency: 195, lines: ['国际 BGP'], promo: false },
  { id: 'LON-02', city: '伦敦', cityEn: 'London', cc: 'GB', country: '英国', region: 'eu', tier: 'edge', lat: 51.46, lng: -0.19, latency: 197, lines: ['国际 BGP'], promo: false },
  { id: 'AMS-01', city: '阿姆斯特丹', cityEn: 'Amsterdam', cc: 'NL', country: '荷兰', region: 'eu', tier: 'edge', lat: 52.37, lng: 4.9, latency: 188, lines: ['国际 BGP'], promo: false },
  { id: 'CDG-01', city: '巴黎', cityEn: 'Paris', cc: 'FR', country: '法国', region: 'eu', tier: 'planned', lat: 48.86, lng: 2.35, latency: 192, lines: [], promo: false },
];

/** 骨干光弧（核心节点互联，地球与地图共用） */
export interface ArcLink {
  from: string;
  to: string;
}

export const ARCS: ArcLink[] = [
  { from: 'HKG-01', to: 'SJC-01' },
  { from: 'HKG-01', to: 'SIN-01' },
  { from: 'HKG-01', to: 'NRT-01' },
  { from: 'SHA-01', to: 'LAX-01' },
  { from: 'SHA-01', to: 'HKG-01' },
  { from: 'SIN-01', to: 'SYD-01' },
  { from: 'NRT-01', to: 'SEA-01' },
  { from: 'LAX-01', to: 'SJC-01' },
  { from: 'SJC-01', to: 'FRA-01' },
  { from: 'FRA-01', to: 'LON-01' },
  { from: 'FRA-01', to: 'AMS-01' },
  { from: 'PEK-01', to: 'FRA-01' },
];

export const nodeById = new Map(NODES.map((n) => [n.id, n]));

export const arcPairs = ARCS.map((a) => ({
  ...a,
  a: nodeById.get(a.from)!,
  b: nodeById.get(a.to)!,
})).filter((p) => p.a && p.b);

/** 大区分组（S5 城市折叠列表 + 移动端区域列表） */
export const citiesByRegion = (region: Region) =>
  NODES.filter((n) => n.region === region && n.tier !== 'planned').reduce<
    { city: string; cityEn: string; cc: string; count: number; tier: Tier }[]
  >((acc, n) => {
    const hit = acc.find((c) => c.city === n.city);
    if (hit) hit.count += 1;
    else acc.push({ city: n.city, cityEn: n.cityEn, cc: n.cc, count: 1, tier: n.tier });
    return acc;
  }, []);

/** 相邻节点：按大圆距离取最近的其它可售节点 */
export function nearestNode(from: NodeInfo): NodeInfo {
  let best: NodeInfo | null = null;
  let bestD = Infinity;
  for (const n of NODES) {
    if (n.id === from.id || n.tier === 'planned') continue;
    const d = haversine(from, n);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best ?? from;
}

export function haversine(a: NodeInfo, b: NodeInfo): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// ============================================================
// 定价数据 —— 数字全部取自 DIRECTION.md 定价表（演示数据）
// ============================================================

export type Shelf = 'sale' | 'standard' | 'global';

export const SHELF_LABEL: Record<Shelf, string> = {
  sale: '特惠区',
  standard: '普通区',
  global: '全球节点',
};

export interface PriceItem {
  /** 产品名 */
  name: string;
  /** 配置行（等宽展示） */
  spec: string;
  /** 区域徽标 */
  region: string;
  /** 月价（元）。GPU 按时计费另见 hourly */
  monthly: number;
  /** 按时价（仅 GPU） */
  hourly?: number;
  /** 计价单位说明 */
  unit?: string;
  badge?: '特惠·限量' | '特惠';
  /** 是否参与年付 -10%（按时计费项不参与） */
  yearly?: boolean;
}

export interface RegionCard {
  region: string;
  note: string;
  items: PriceItem[];
}

/** 普通区货架 */
export const STANDARD_ITEMS: PriceItem[] = [
  {
    name: '弹性云服务器 ECS',
    spec: '2C4G · 1 独立 IP · 30M · 国际 BGP',
    region: '美西 · 圣何塞',
    monthly: 69,
    yearly: true,
  },
  {
    name: '弹性云服务器 ECS',
    spec: '2C4G · 30M · CN2 直连',
    region: '新加坡',
    monthly: 89,
    yearly: true,
  },
  {
    name: '弹性云服务器 ECS',
    spec: '2C4G · 5M · BGP 多线（电信/联通/移动）',
    region: '中国大陆 · 含备案指引',
    monthly: 129,
    yearly: true,
  },
  {
    name: '独立服务器 · 裸金属',
    spec: 'E3-1230v6 · 16G · 1TB · 1Gbps · IPMI',
    region: '美西',
    monthly: 399,
    yearly: true,
  },
  {
    name: 'GPU 云服务器',
    spec: 'RTX 4090 整卡 · 推理 / 渲染',
    region: '美西',
    monthly: 4299,
    hourly: 8.9,
    yearly: true,
  },
  {
    name: '独立公网 IPv4',
    spec: '单 IP 独享 · 非共享 NAT · 可解绑迁移',
    region: '海外 / 大陆',
    monthly: 10,
    yearly: true,
  },
  {
    name: 'IPv4 段 /29',
    spec: '5 可用 · 按段购买 · 适合自建集群与反代',
    region: '海外',
    monthly: 60,
    yearly: true,
  },
  {
    name: 'Anycast 弹性公网 IP',
    spec: '多节点播撒 · 就近接入抗抖动',
    region: '全球',
    monthly: 25,
    unit: '月 + 流量',
    yearly: true,
  },
];

/** 特惠区货架（限量促销机型） */
export const SALE_ITEMS: PriceItem[] = [
  {
    name: '轻量应用服务器',
    spec: '2C2G · 30M CN2 · 40G SSD · 套餐制',
    region: '香港 · 免备案',
    monthly: 39,
    badge: '特惠·限量',
    yearly: true,
  },
  {
    name: '独立服务器 · 裸金属',
    spec: 'i9-9900K · 32G · NVMe · 100M',
    region: '香港 · 免备案',
    monthly: 899,
    badge: '特惠',
    yearly: true,
  },
];

/** 全球节点货架（按区域分组，起价取自定价表） */
export const GLOBAL_REGIONS: RegionCard[] = [
  {
    region: '香港 HK',
    note: 'CN2 直连 / CMI · 免备案',
    items: [
      {
        name: '轻量应用服务器',
        spec: '2C2G · 30M CN2 · 40G SSD',
        region: '起价',
        monthly: 39,
        badge: '特惠·限量',
        yearly: true,
      },
      {
        name: '独立服务器 · 裸金属',
        spec: 'i9-9900K · 32G · NVMe · 100M',
        region: '起价',
        monthly: 899,
        yearly: true,
      },
    ],
  },
  {
    region: '美西 · 圣何塞 USW',
    note: 'CN2 GIA 优质回程 · 国际 BGP',
    items: [
      { name: '弹性云 ECS', spec: '2C4G · 1 独立 IP · 30M', region: '起价', monthly: 69, yearly: true },
      { name: '独立服务器 · 裸金属', spec: 'E3-1230v6 · 16G · 1TB · 1Gbps', region: '起价', monthly: 399, yearly: true },
      { name: 'GPU 云服务器', spec: 'RTX 4090 整卡', region: '起价', monthly: 4299, hourly: 8.9, yearly: true },
    ],
  },
  {
    region: '新加坡 SG',
    note: 'CN2 直连 · 国际 BGP',
    items: [{ name: '弹性云 ECS', spec: '2C4G · 30M · CN2', region: '起价', monthly: 89, yearly: true }],
  },
  {
    region: '中国大陆 CN',
    note: 'BGP 多线 · 大陆节点含备案指引',
    items: [
      { name: '弹性云 ECS', spec: '2C4G · 5M · BGP 多线', region: '起价', monthly: 129, yearly: true },
      { name: '独立公网 IPv4', spec: '单 IP 独享', region: '起价', monthly: 35, yearly: true },
    ],
  },
  {
    region: '全球网络 GLOBAL',
    note: '跨区域网络与 IP 产品',
    items: [
      { name: '独立公网 IPv4', spec: '单 IP 独享 · 非共享 NAT', region: '起价', monthly: 10, yearly: true },
      { name: 'IPv4 段 /29', spec: '5 可用 · 按段购买', region: '起价', monthly: 60, yearly: true },
      { name: 'Anycast 弹性公网 IP', spec: '多节点播撒 · 就近接入', region: '起价', monthly: 25, unit: '月 + 流量', yearly: true },
    ],
  },
];

/** S3 节点面板：按节点区域取产品起价（数字取自定价表） */
export function productsForNode(node: { cc: string; region: string; country: string }): PriceItem[] {
  const cc = node.cc;
  if (cc === 'HK') {
    return [
      { name: '轻量应用服务器', spec: '2C2G · 30M CN2 · 40G SSD', region: '特惠', monthly: 39, badge: '特惠·限量', yearly: true },
      { name: '独立服务器 · 裸金属', spec: 'i9-9900K · 32G · NVMe · 100M', region: '特惠', monthly: 899, yearly: true },
      { name: '独立公网 IPv4', spec: '单 IP 独享', region: '海外', monthly: 10, yearly: true },
    ];
  }
  if (cc === 'CN') {
    return [
      { name: '弹性云 ECS', spec: '2C4G · 5M · BGP 多线', region: '含备案指引', monthly: 129, yearly: true },
      { name: '独立公网 IPv4', spec: '单 IP 独享', region: '大陆', monthly: 35, yearly: true },
    ];
  }
  if (cc === 'SG') {
    return [
      { name: '弹性云 ECS', spec: '2C4G · 30M · CN2 直连', region: '起价', monthly: 89, yearly: true },
      { name: '独立公网 IPv4', spec: '单 IP 独享', region: '海外', monthly: 10, yearly: true },
    ];
  }
  if (cc === 'US') {
    return [
      { name: '弹性云 ECS', spec: '2C4G · 1 独立 IP · 30M', region: '起价', monthly: 69, yearly: true },
      { name: '独立服务器 · 裸金属', spec: 'E3-1230v6 · 16G · 1TB · 1Gbps', region: '起价', monthly: 399, yearly: true },
      { name: 'GPU 云服务器', spec: 'RTX 4090 整卡', region: '起价', monthly: 4299, hourly: 8.9, yearly: true },
      { name: '独立公网 IPv4', spec: '单 IP 独享', region: '海外', monthly: 10, yearly: true },
    ];
  }
  // 其它海外节点：全球网络产品（数字取自定价表）
  return [
    { name: '独立公网 IPv4', spec: '单 IP 独享 · 非共享 NAT', region: '海外', monthly: 10, yearly: true },
    { name: 'IPv4 段 /29', spec: '5 可用 · 按段购买', region: '海外', monthly: 60, yearly: true },
    { name: 'Anycast 弹性公网 IP', spec: '多节点播撒 · 就近接入抗抖动', region: '全球', monthly: 25, unit: '月 + 流量', yearly: true },
  ];
}

/** 年付价：-10%，四舍五入到整数 */
export const yearlyPrice = (m: number) => Math.round(m * 0.9);

/** 配置滑杆实时改价（演示公式，基准：美西 ECS 2C4G/30M ¥69） */
export function configPrice(vcpu: number, ram: number, bw: number, yearly: boolean): number {
  const base = 69 + (vcpu - 2) * 18 + (ram - 4) * 7 + (bw - 30) * 0.22;
  const v = Math.max(69, base);
  return Math.round(yearly ? v * 0.9 : v);
}

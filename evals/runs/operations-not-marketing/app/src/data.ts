export interface Item {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  threshold: number;
}

export const CATEGORIES = ["货架", "周转箱", "搬运", "包装"] as const;

export type StockStatus = "有库存" | "低库存" | "缺货";

export function stockStatus(item: Item): StockStatus {
  if (item.stock <= 0) return "缺货";
  if (item.stock <= item.threshold) return "低库存";
  return "有库存";
}

export interface Movement {
  date: string;
  delta: number;
  note: string;
}

/** 演示动线：由库存与阈值确定性合成（非随机、非真实数据）。 */
export function recentMovements(item: Item): Movement[] {
  const base = item.stock + item.threshold;
  return [
    { date: "09-05 14:20", delta: -(base % 7 + 2), note: "出库 · 生产线领用" },
    { date: "09-04 10:05", delta: base % 12 + 6, note: "入库 · 采购到货" },
    { date: "09-03 16:40", delta: -(base % 5 + 1), note: "出库 · 门店调拨" },
  ];
}

export const DEMO_ITEMS: Item[] = [
  { id: "D-01", name: "演示 · 轻型仓储货架 200kg", sku: "RACK-200-L", category: "货架", stock: 42, threshold: 10 },
  { id: "D-02", name: "演示 · 中型仓储货架 500kg", sku: "RACK-500-M", category: "货架", stock: 6, threshold: 8 },
  { id: "D-03", name: "演示 · 折叠周转箱 60L", sku: "BOX-F60", category: "周转箱", stock: 128, threshold: 30 },
  { id: "D-04", name: "演示 · 堆叠周转箱 40L", sku: "BOX-S40", category: "周转箱", stock: 0, threshold: 20 },
  { id: "D-05", name: "演示 · 手动液压搬运车 3t", sku: "JACK-M3T", category: "搬运", stock: 9, threshold: 4 },
  { id: "D-06", name: "演示 · 电动搬运车 1.5t", sku: "JACK-E15", category: "搬运", stock: 3, threshold: 3 },
  { id: "D-07", name: "演示 · 气泡膜卷 50cm", sku: "WRAP-B50", category: "包装", stock: 210, threshold: 50 },
  { id: "D-08", name: "演示 · 打包纸箱 五号", sku: "CTN-05", category: "包装", stock: 0, threshold: 100 },
  { id: "D-09", name: "演示 · 立柱横梁组件（含配件包与安装说明书）", sku: "RACK-BM-C", category: "货架", stock: 64, threshold: 16 },
  { id: "D-10", name: "演示 · 网格料箱 A3", sku: "BOX-MA3", category: "周转箱", stock: 18, threshold: 24 },
  { id: "D-11", name: "演示 · 称重传感器托盘", sku: "JACK-WS-P", category: "搬运", stock: 5, threshold: 6 },
  { id: "D-12", name: "演示 · 缠绕膜机用膜卷", sku: "WRAP-M20", category: "包装", stock: 88, threshold: 40 },
];

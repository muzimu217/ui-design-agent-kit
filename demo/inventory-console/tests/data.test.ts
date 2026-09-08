import { describe, expect, it } from "vitest";
import { CATEGORIES, DEMO_ITEMS, recentMovements, stockStatus, type Item } from "../src/data";

const item: Item = { id: "test", name: "Test", sku: "TEST", category: "货架", stock: 10, threshold: 10 };

describe("stockStatus", () => {
  it.each([
    [-1, "缺货"],
    [0, "缺货"],
    [1, "低库存"],
    [10, "低库存"],
    [11, "有库存"],
  ] as const)("classifies stock %s at a threshold of 10 as %s", (stock, status) => {
    expect(stockStatus({ ...item, stock })).toBe(status);
  });

  it("keeps an empty item out of stock when its threshold is zero", () => {
    expect(stockStatus({ ...item, stock: 0, threshold: 0 })).toBe("缺货");
    expect(stockStatus({ ...item, stock: 1, threshold: 0 })).toBe("有库存");
  });
});

describe("demo fixtures", () => {
  it("has 12 explicitly marked fixtures with unique IDs and SKUs", () => {
    expect(DEMO_ITEMS).toHaveLength(12);
    expect(new Set(DEMO_ITEMS.map((entry) => entry.id)).size).toBe(12);
    expect(new Set(DEMO_ITEMS.map((entry) => entry.sku)).size).toBe(12);
    for (const entry of DEMO_ITEMS) {
      expect(entry.name.startsWith("演示 · ")).toBe(true);
      expect(CATEGORIES).toContain(entry.category);
      expect(Number.isInteger(entry.stock) && entry.stock >= 0).toBe(true);
      expect(Number.isInteger(entry.threshold) && entry.threshold >= 0).toBe(true);
    }
  });

  it("creates deterministic sample movements without changing stock", () => {
    const fixture = Object.freeze({ ...DEMO_ITEMS[0] });
    const expected = [
      { date: "09-05 14:20", delta: -5, note: "出库 · 生产线领用" },
      { date: "09-04 10:05", delta: 10, note: "入库 · 采购到货" },
      { date: "09-03 16:40", delta: -3, note: "出库 · 门店调拨" },
    ];
    expect(recentMovements(fixture)).toEqual(expected);
    expect(recentMovements(fixture)).toEqual(expected);
    expect(fixture.stock).toBe(42);
  });
});

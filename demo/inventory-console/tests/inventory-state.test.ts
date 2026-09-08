import { describe, expect, it } from "vitest";
import { DEMO_ITEMS } from "../src/data";
import { readInventoryState, selectInventory, serializeInventoryState, type InventoryState } from "../src/inventory-state";

const defaults: InventoryState = { query: "", category: "全部", status: "全部", sort: "none" };
const emptyCounts = { 全部: 0, 有库存: 0, 低库存: 0, 缺货: 0 };

describe("inventory URL state", () => {
  it("uses defaults for an empty URL", () => {
    expect(readInventoryState("")).toEqual(defaults);
  });

  it("restores all supported parameters", () => {
    const search = new URLSearchParams({ q: "rack", cat: "货架", status: "低库存", sort: "desc" });
    expect(readInventoryState(`?${search}`)).toEqual({
      query: "rack", category: "货架", status: "低库存", sort: "desc",
    });
  });

  it("discards unsupported enum values without losing the search text", () => {
    expect(readInventoryState("?q=test&cat=unknown&status=unknown&sort=sideways")).toEqual({
      ...defaults, query: "test",
    });
  });

  it("omits default filters and whitespace-only searches", () => {
    expect(serializeInventoryState(defaults)).toBe("");
    expect(serializeInventoryState({ ...defaults, query: "   " })).toBe("");
  });

  it("round-trips Chinese text and reserved query characters", () => {
    const state: InventoryState = { query: "箱 & rack+?", category: "周转箱", status: "缺货", sort: "asc" };
    const encoded = serializeInventoryState({ ...state, query: `  ${state.query}  ` });
    expect(readInventoryState(encoded)).toEqual(state);
    expect(new URLSearchParams(encoded).get("q")).toBe(state.query);
  });
});

describe("inventory selection", () => {
  it("retains fixture order and all status counts with default filters", () => {
    const result = selectInventory(DEMO_ITEMS, defaults);
    expect(result.visible).toEqual(DEMO_ITEMS);
    expect(result.counts).toEqual({ 全部: 12, 有库存: 6, 低库存: 4, 缺货: 2 });
  });

  it("matches trimmed SKUs without regard to case", () => {
    const result = selectInventory(DEMO_ITEMS, { ...defaults, query: "  bOx-f60 " });
    expect(result.visible.map((entry) => entry.id)).toEqual(["D-03"]);
  });

  it("searches Chinese item names", () => {
    const result = selectInventory(DEMO_ITEMS, { ...defaults, query: "传感器" });
    expect(result.visible.map((entry) => entry.id)).toEqual(["D-11"]);
  });

  it("combines category, search, and status while retaining unselected status counts", () => {
    const result = selectInventory(DEMO_ITEMS, {
      query: "rack", category: "货架", status: "低库存", sort: "desc",
    });
    expect(result.visible.map((entry) => entry.id)).toEqual(["D-02"]);
    expect(result.counts).toEqual({ 全部: 3, 有库存: 2, 低库存: 1, 缺货: 0 });
  });

  it("returns an empty state when search and category do not intersect", () => {
    const result = selectInventory(DEMO_ITEMS, { ...defaults, query: "rack", category: "包装" });
    expect(result.visible).toEqual([]);
    expect(result.counts).toEqual(emptyCounts);
  });

  it("treats only zero-stock fixtures as out of stock", () => {
    const result = selectInventory(DEMO_ITEMS, { ...defaults, status: "缺货" });
    expect(result.visible.map((entry) => entry.id)).toEqual(["D-04", "D-08"]);
    expect(result.counts).toEqual({ 全部: 12, 有库存: 6, 低库存: 4, 缺货: 2 });
  });

  it("sorts ascending and preserves original order for equal stock values", () => {
    const result = selectInventory(DEMO_ITEMS, { ...defaults, sort: "asc" });
    expect(result.visible.map((entry) => entry.stock)).toEqual([0, 0, 3, 5, 6, 9, 18, 42, 64, 88, 128, 210]);
    expect(result.visible.slice(0, 2).map((entry) => entry.id)).toEqual(["D-04", "D-08"]);
  });

  it("sorts descending without mutating the source collection or its items", () => {
    const items = Object.freeze(DEMO_ITEMS.map((entry) => Object.freeze({ ...entry })));
    const originalIds = items.map((entry) => entry.id);
    const result = selectInventory(items, { ...defaults, sort: "desc" });
    expect(result.visible.map((entry) => entry.stock)).toEqual([210, 128, 88, 64, 42, 18, 9, 6, 5, 3, 0, 0]);
    expect(result.visible.slice(-2).map((entry) => entry.id)).toEqual(["D-04", "D-08"]);
    expect(items.map((entry) => entry.id)).toEqual(originalIds);
  });

  it("handles an empty collection", () => {
    expect(selectInventory([], { ...defaults, sort: "desc", status: "低库存" })).toEqual({
      counts: emptyCounts, visible: [],
    });
  });
});

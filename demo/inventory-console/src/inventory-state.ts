import { CATEGORIES, stockStatus, type Item, type StockStatus } from "./data";

export type CategoryFilter = "全部" | (typeof CATEGORIES)[number];
export type StatusFilter = "全部" | StockStatus;
export type SortMode = "none" | "asc" | "desc";

export interface InventoryState {
  query: string;
  category: CategoryFilter;
  status: StatusFilter;
  sort: SortMode;
}

export const STATUS_FILTERS: readonly StatusFilter[] = ["全部", "有库存", "低库存", "缺货"];

export function readInventoryState(search: string): InventoryState {
  const params = new URLSearchParams(search);
  const category = params.get("cat");
  const status = params.get("status");
  const sort = params.get("sort");
  return {
    query: params.get("q") ?? "",
    category: (CATEGORIES as readonly string[]).includes(category ?? "")
      ? (category as CategoryFilter)
      : "全部",
    status: STATUS_FILTERS.includes(status as StatusFilter) ? (status as StatusFilter) : "全部",
    sort: sort === "asc" || sort === "desc" ? sort : "none",
  };
}

export function serializeInventoryState(state: InventoryState): string {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.category !== "全部") params.set("cat", state.category);
  if (state.status !== "全部") params.set("status", state.status);
  if (state.sort !== "none") params.set("sort", state.sort);
  return params.toString();
}

export function selectInventory(items: readonly Item[], state: InventoryState) {
  const query = state.query.trim().toLowerCase();
  const matching = items.filter((item) => {
    if (state.category !== "全部" && item.category !== state.category) return false;
    return !query || item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query);
  });

  // Status counts reflect search/category matches before applying the active status.
  const counts: Record<StatusFilter, number> = { 全部: matching.length, 有库存: 0, 低库存: 0, 缺货: 0 };
  for (const item of matching) counts[stockStatus(item)] += 1;

  if (state.sort !== "none") {
    matching.sort((a, b) => (state.sort === "asc" ? a.stock - b.stock : b.stock - a.stock));
  }

  return {
    counts,
    visible: state.status === "全部" ? matching : matching.filter((item) => stockStatus(item) === state.status),
  };
}

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, PackageSearch, Search, X } from "lucide-react";
import { CATEGORIES, DEMO_ITEMS, recentMovements, stockStatus, type Item, type StockStatus } from "./data";
import {
  readInventoryState,
  selectInventory,
  serializeInventoryState,
  STATUS_FILTERS,
  type CategoryFilter,
  type SortMode,
  type StatusFilter,
} from "./inventory-state";

const pillClass: Record<StockStatus, string> = { 有库存: "pill--ok", 低库存: "pill--low", 缺货: "pill--out" };
const showcaseHref = new URL("../../", new URL(import.meta.env.BASE_URL, window.location.href)).href;

function StatusPill({ item }: { item: Item }) {
  const status = stockStatus(item);
  return (
    <span className={`pill ${pillClass[status]}`}>
      <i className="pill__dot" aria-hidden="true" />
      {status}
    </span>
  );
}

function StockBar({ item }: { item: Item }) {
  const scale = Math.max(item.threshold * 2, item.stock, 1);
  const status = stockStatus(item);
  return (
    <div className="stock-bar" role="img" aria-label={`当前库存 ${item.stock}，低库存阈值 ${item.threshold}`}>
      <i
        className={`stock-bar__fill stock-bar__fill--${status === "有库存" ? "ok" : status === "低库存" ? "low" : "out"}`}
        style={{ width: `${Math.round((item.stock / scale) * 100)}%` }}
      />
      <i className="stock-bar__tick" style={{ left: `${Math.round((item.threshold / scale) * 100)}%` }} aria-hidden="true" />
    </div>
  );
}

function ItemDetail({
  item,
  onClose,
  onDemoAction,
}: {
  item: Item;
  onClose: () => void;
  onDemoAction: (label: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Esc 关闭不依赖焦点在面板内：焦点可能已移到面板外（如搜索框），
  // 因此在 document 级监听，而不是只挂在 aside 上
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside className="panel" aria-label={`商品详情：${item.name}`}>
      <div className="panel__head">
        <div className="panel__title">
          <StatusPill item={item} />
          <h2>{item.name}</h2>
          <p className="panel__sku">{item.sku} · {item.category}</p>
        </div>
        <button ref={closeRef} type="button" className="icon-btn" aria-label="关闭详情" title="关闭详情" onClick={onClose}>
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      <section className="panel__section">
        <div className="stock-row">
          <span>当前库存</span>
          <b className="mono">{item.stock}</b>
        </div>
        <StockBar item={item} />
        <p className="panel__note">低库存阈值 {item.threshold} · 建议补货至 {item.threshold * 3}</p>
      </section>

      <section className="panel__section">
        <h3>最近动线（演示）</h3>
        <ul className="movements">
          {recentMovements(item).map((movement) => (
            <li key={movement.date}>
              <span className="movements__date mono">{movement.date}</span>
              <span className="movements__note">{movement.note}</span>
              <b className={`mono ${movement.delta < 0 ? "delta-out" : "delta-in"}`}>
                {movement.delta < 0 ? movement.delta : `+${movement.delta}`}
              </b>
            </li>
          ))}
        </ul>
      </section>

      <div className="panel__actions">
        <button type="button" className="btn btn--primary" onClick={() => onDemoAction("发起调拨")}>
          发起调拨
        </button>
        <button type="button" className="btn" onClick={() => onDemoAction("创建盘点")}>
          创建盘点
        </button>
      </div>
      <p className="panel__hint">演示样本数据，操作不会写入任何真实系统。</p>
    </aside>
  );
}

export default function App() {
  const initial = useMemo(() => readInventoryState(window.location.search), []);
  const [query, setQuery] = useState(initial.query);
  const [category, setCategory] = useState<CategoryFilter>(initial.category);
  const [status, setStatus] = useState<StatusFilter>(initial.status);
  const [sort, setSort] = useState<SortMode>(initial.sort);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // URL 状态同步（v2.3）：q/cat/status/sort 进查询参数，replaceState 不产生历史
  useEffect(() => {
    const qs = serializeInventoryState({ query, category, status, sort });
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, category, status, sort]);

  // 移动端底部门打开时锁定背景滚动（桌面侧栏为非模态，不锁）
  useEffect(() => {
    if (!selectedId) return;
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedId]);

  const { counts, visible } = useMemo(
    () => selectInventory(DEMO_ITEMS, { query, category, status, sort }),
    [query, category, status, sort],
  );

  const selected = DEMO_ITEMS.find((item) => item.id === selectedId) ?? null;

  const openDetail = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    detailTriggerRef.current = event.currentTarget;
    setSelectedId(id);
  };

  const closeDetail = () => {
    setSelectedId(null);
    const trigger = detailTriggerRef.current;
    if (trigger && document.contains(trigger)) {
      trigger.focus();
    } else {
      // 触发行已被筛除（卸载）时，焦点回落到搜索框而不是丢到 body
      document.querySelector<HTMLInputElement>(".search-box input")?.focus();
    }
    detailTriggerRef.current = null;
  };

  const toggleSort = () => setSort((mode) => (mode === "none" ? "asc" : mode === "asc" ? "desc" : "none"));

  const resetFilters = () => {
    setQuery("");
    setCategory("全部");
    setStatus("全部");
    setSort("none");
  };

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="shell">
      <a className="showcase-link" href={showcaseHref}>
        <ArrowLeft size={15} aria-hidden="true" />
        返回成果库
      </a>
      <header className="topbar">
        <h1>库存运营台</h1>
        <span className="badge-demo">DEMO · 演示数据</span>
      </header>

      <p className="banner" role="note">
        本页所有库存数字为<b>演示样本</b>，不连接任何真实库存系统，刷新后不保存。
      </p>

      <div className="stat-row" role="group" aria-label="库存概览">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={`stat-card${status === option ? " is-active" : ""}`}
            aria-pressed={status === option}
            onClick={() => setStatus(option)}
          >
            <span className="stat-card__label">{option === "全部" ? "全部商品" : option}</span>
            <span className="stat-card__value mono">{counts[option]}</span>
            <span className="stat-card__hint">{status === option ? "当前筛选" : "点击筛选"}</span>
          </button>
        ))}
      </div>

      <section className="toolbar" aria-label="筛选">
        <label className="field field--search">
          <span className="field__label">搜索</span>
          <span className="search-box">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="名称或 SKU"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" className="search-box__clear" aria-label="清空搜索" title="清空搜索" onClick={() => setQuery("")}>
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </span>
        </label>

        <label className="field">
          <span className="field__label">分类</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as CategoryFilter)}>
            <option value="全部">全部</option>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="segmented" role="group" aria-label="库存状态">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={status === option}
              className={status === option ? "is-active" : undefined}
              onClick={() => setStatus(option)}
            >
              {option}
              <small className="segmented__count">{counts[option]}</small>
            </button>
          ))}
        </div>
        <div className="mobile-sort" role="group" aria-label="移动端排序">
          <span>排序</span>
          <button type="button" className="th-sort" onClick={toggleSort} aria-label="按库存排序">
            库存
            {sort === "asc" ? <ArrowUp size={13} aria-hidden="true" /> : sort === "desc" ? <ArrowDown size={13} aria-hidden="true" /> : <ArrowUpDown size={13} aria-hidden="true" />}
          </button>
        </div>
      </section>

      <p className="count" aria-live="polite">
        共 {DEMO_ITEMS.length} 项演示数据 · 匹配 {visible.length} 项
        {sort !== "none" && ` · 库存${sort === "asc" ? "升" : "降"}序`}
      </p>

      <div className="table-wrap">
        <table className="stock-table">
          <thead>
            <tr>
              <th scope="col">商品</th>
              <th scope="col">SKU</th>
              <th scope="col">分类</th>
              <th
                scope="col"
                className="num"
                aria-sort={sort === "none" ? "none" : sort === "asc" ? "ascending" : "descending"}
              >
                <button type="button" className="th-sort" onClick={toggleSort}>
                  库存
                  {sort === "asc" ? <ArrowUp size={12} aria-hidden="true" /> : sort === "desc" ? <ArrowDown size={12} aria-hidden="true" /> : <ArrowUpDown size={12} aria-hidden="true" />}
                </button>
              </th>
              <th scope="col">状态</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr
                key={item.id}
                className={selectedId === item.id ? "is-selected" : undefined}
                onClick={(event) => {
                  detailTriggerRef.current = event.currentTarget.querySelector(".row-link");
                  setSelectedId(item.id);
                }}
              >
                <td className="cell-name">
                  <button type="button" className="row-link" title={item.name}>
                    {item.name}
                  </button>
                </td>
                <td className="mono">{item.sku}</td>
                <td>{item.category}</td>
                <td className="num mono">{item.stock}</td>
                <td>
                  <StatusPill item={item} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  <PackageSearch size={40} aria-hidden="true" />
                  <p>没有匹配的商品</p>
                  <button type="button" className="btn" onClick={resetFilters}>
                    清空筛选
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ul className="cards">
          {visible.map((item) => (
            <li key={item.id}>
              <button type="button" className="card" onClick={(event) => openDetail(event, item.id)}>
                <span className="card__name">{item.name}</span>
                <span className="card__meta">
                  {item.sku} · {item.category} · 库存 {item.stock}
                </span>
                <StatusPill item={item} />
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="empty">
              <PackageSearch size={40} aria-hidden="true" />
              <p>没有匹配的商品</p>
              <button type="button" className="btn" onClick={resetFilters}>
                清空筛选
              </button>
            </li>
          )}
        </ul>
      </div>

      {selected && (
        <ItemDetail
          item={selected}
          onClose={closeDetail}
          onDemoAction={(label) => showToast(`演示环境：「${label}」未接通真实库存`)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

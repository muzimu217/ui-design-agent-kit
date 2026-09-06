import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { CATEGORIES, DEMO_ITEMS, stockStatus, type Item, type StockStatus } from "./data";

type CategoryFilter = "全部" | (typeof CATEGORIES)[number];
type StatusFilter = "全部" | StockStatus;

const STATUS_FILTERS: StatusFilter[] = ["全部", "有库存", "低库存", "缺货"];
const pillClass: Record<StockStatus, string> = { 有库存: "pill--ok", 低库存: "pill--low", 缺货: "pill--out" };

function StatusPill({ item }: { item: Item }) {
  const status = stockStatus(item);
  return <span className={`pill ${pillClass[status]}`}>{status}</span>;
}

function ItemDetail({ item, onClose }: { item: Item; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <aside
      className="panel"
      aria-label={`商品详情：${item.name}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="panel__head">
        <h2>{item.name}</h2>
        <button ref={closeRef} type="button" className="panel__close" onClick={onClose}>
          关闭
        </button>
      </div>
      <dl className="panel__body">
        <div>
          <dt>SKU</dt>
          <dd>{item.sku}</dd>
        </div>
        <div>
          <dt>分类</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>当前库存</dt>
          <dd>{item.stock}</dd>
        </div>
        <div>
          <dt>低库存阈值</dt>
          <dd>{item.threshold}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>
            <StatusPill item={item} />
          </dd>
        </div>
      </dl>
      <p className="panel__hint">演示样本数据，不代表真实库存与动线。</p>
    </aside>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [status, setStatus] = useState<StatusFilter>("全部");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openDetail = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    detailTriggerRef.current = event.currentTarget;
    setSelectedId(id);
  };

  const closeDetail = () => {
    setSelectedId(null);
    detailTriggerRef.current?.focus();
    detailTriggerRef.current = null;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_ITEMS.filter((item) => {
      if (category !== "全部" && item.category !== category) return false;
      if (status !== "全部" && stockStatus(item) !== status) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category, status]);

  const selected = DEMO_ITEMS.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="shell">
      <header className="topbar">
        <h1>库存运营台</h1>
        <span className="badge-demo">DEMO · 演示数据</span>
      </header>

      <p className="banner" role="note">
        本页所有库存数字为<b>演示样本</b>，不连接任何真实库存系统，刷新后不保存。
      </p>

      <section className="toolbar" aria-label="筛选">
        <label className="field">
          <span className="field__label">搜索</span>
          <input
            type="search"
            value={query}
            placeholder="名称或 SKU"
            onChange={(event) => setQuery(event.target.value)}
          />
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
            </button>
          ))}
        </div>
      </section>

      <p className="count" aria-live="polite">
        共 {DEMO_ITEMS.length} 项演示数据 · 匹配 {filtered.length} 项
      </p>

      <div className="table-wrap">
        <table className="stock-table">
          <thead>
            <tr>
              <th scope="col">商品</th>
              <th scope="col">SKU</th>
              <th scope="col">分类</th>
              <th scope="col" className="num">
                库存
              </th>
              <th scope="col">状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className={selectedId === item.id ? "is-selected" : undefined}
                onClick={() => setSelectedId(item.id)}
              >
                <td>
                  <button
                    type="button"
                    className="row-link"
                    onClick={(event) => openDetail(event, item.id)}
                  >
                    {item.name}
                  </button>
                </td>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td className="num">{item.stock}</td>
                <td>
                  <StatusPill item={item} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  没有匹配的商品，试试清空搜索或筛选。
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ul className="cards">
          {filtered.map((item) => (
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
          {filtered.length === 0 && <li className="empty">没有匹配的商品，试试清空搜索或筛选。</li>}
        </ul>
      </div>

      {selected && <ItemDetail item={selected} onClose={closeDetail} />}
    </div>
  );
}

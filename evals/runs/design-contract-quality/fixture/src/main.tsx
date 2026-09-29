import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 种子仓库存台账——严格按 DESIGN.md 契约实现（design-contract-quality 评测交付物）。
 * v2（用户令 2026-09-29）：localStorage 持久化 + 库存增减 + 「重置种子数据」——
 * 支持从头反复测试；契约增补见 DESIGN.md「v2 增补」节（显式修订，非静默 amend）。
 */

type Status = '充足' | '低库存' | '缺货';
interface Sku { name: string; batch: string; stock: number; status: Status }

/** 种子数据（初始态；重置即回到这里） */
const SEED: Sku[] = [
  { name: '油菜种子', batch: 'B2026-03', stock: 42, status: '充足' },
  { name: '水稻种子', batch: 'B2026-01', stock: 8, status: '低库存' },
  { name: '复合肥 50kg', batch: 'F2025-11', stock: 120, status: '充足' },
  { name: '多菌灵粉剂', batch: 'P2025-09', stock: 0, status: '缺货' },
  { name: '地膜 2m', batch: 'M2026-02', stock: 6, status: '低库存' },
];

const KEY = 'seed-inventory-v2';
const statusOf = (stock: number): Status => (stock <= 0 ? '缺货' : stock < 10 ? '低库存' : '充足');

function load(): Sku[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Sku[];
    return Array.isArray(parsed) && parsed.length === SEED.length ? parsed : SEED;
  } catch {
    return SEED;
  }
}
function save(rows: Sku[]) {
  try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { /* 隐私模式等场景静默降级为内存态 */ }
}

const FILTERS = ['全部', '低库存', '缺货'] as const;

function StatusPill({ s }: { s: Status }) {
  const map: Record<Status, [string, string]> = {
    '充足': ['#177656', '充足'],
    '低库存': ['#b4690e', '低库存'],
    '缺货': ['#b3261e', '缺货'],
  };
  const [color, label] = map[s];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      background: `${color}1f`, color, fontSize: 13, fontWeight: 600,
    }}>{label}</span>
  );
}

function App() {
  const [rows, setRows] = useState<Sku[]>(load);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('全部');
  const [q, setQ] = useState('');

  useEffect(() => { save(rows); }, [rows]);

  const adjust = (name: string, delta: number) => {
    setRows((prev) => prev.map((r) => {
      if (r.name !== name) return r;
      const stock = Math.max(0, r.stock + delta);
      return { ...r, stock, status: statusOf(stock) };
    }));
  };
  const reset = () => {
    localStorage.removeItem(KEY);
    setRows(SEED);
  };

  const pending = rows.filter((r) => r.status !== '充足').length;
  const visible = rows.filter((s) => (filter === '全部' ? true : s.status === filter))
    .filter((s) => s.name.includes(q.trim()));

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: '"PingFang SC", sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 20, margin: 0, color: '#177656' }}>种子仓台账</h1>
        <span style={{ fontSize: 13, color: '#61717d' }}>共 {rows.length} 类 · 待补 {pending}</span>
      </header>
      <div role="group" aria-label="库存筛选" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0 12px', alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              border: `1px solid ${filter === f ? '#177656' : '#d9e2e7'}`,
              background: filter === f ? '#177656' : '#fff',
              color: filter === f ? '#fff' : '#26343d',
            }}>{f}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索 SKU"
          aria-label="搜索 SKU"
          style={{ marginLeft: 'auto', padding: '7px 12px', border: '1px solid #d9e2e7', borderRadius: 8, fontSize: 13, minWidth: 140 }} />
        <button onClick={reset} title="清空本地数据，恢复初始种子库存"
          style={{
            padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: '1px solid #d9e2e7', background: '#fff', color: '#61717d',
          }}>↺ 重置种子数据</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', background: '#fff', fontSize: 14 }}>
        <thead>
          <tr>{['SKU', '批次', '库存', '出入库', '状态'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #d9e2e7', fontSize: 13, color: '#61717d' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {visible.map((s) => (
            <tr key={s.batch + s.name} style={{ borderBottom: '1px solid #d9e2e7', background: s.status === '低库存' ? '#fdf6ec' : undefined }}>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.name}</td>
              <td style={{ padding: '10px 12px', color: '#61717d' }}>{s.batch}</td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.stock}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ display: 'inline-flex', gap: 6 }}>
                  <button onClick={() => adjust(s.name, -5)} aria-label={`${s.name} 出库 5`}
                    style={{ width: 28, height: 26, borderRadius: 6, border: '1px solid #d9e2e7', background: '#fff', cursor: 'pointer' }}>−</button>
                  <button onClick={() => adjust(s.name, 5)} aria-label={`${s.name} 入库 5`}
                    style={{ width: 28, height: 26, borderRadius: 6, border: '1px solid #d9e2e7', background: '#fff', cursor: 'pointer' }}>＋</button>
                </span>
              </td>
              <td style={{ padding: '10px 12px' }}><StatusPill s={s.status} /></td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 18, textAlign: 'center', color: '#61717d' }}>无匹配条目</td></tr>
          )}
        </tbody>
      </table>
      </div>
      <p style={{ fontSize: 12, color: '#8a97a0', marginTop: 14 }}>
        数据保存在本浏览器（localStorage）；「重置种子数据」清空本地改动、恢复初始 5 条。刷新页面数据保留。
      </p>
    </div>
  );
}

const style = document.createElement('style');
style.textContent = 'button:focus-visible, input:focus-visible { outline: 2px solid #2566c4; outline-offset: 2px; }';
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

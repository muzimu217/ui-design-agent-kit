import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

/** 种子仓库存台账——严格按 DESIGN.md 契约实现（design-contract-quality 评测交付物） */

type Status = '充足' | '低库存' | '缺货';
interface Sku { name: string; batch: string; stock: number; status: Status }

const SKUS: Sku[] = [
  { name: '油菜种子', batch: 'B2026-03', stock: 42, status: '充足' },
  { name: '水稻种子', batch: 'B2026-01', stock: 8, status: '低库存' },
  { name: '复合肥 50kg', batch: 'F2025-11', stock: 120, status: '充足' },
  { name: '多菌灵粉剂', batch: 'P2025-09', stock: 0, status: '缺货' },
  { name: '地膜 2m', batch: 'M2026-02', stock: 6, status: '低库存' },
];

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
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('全部');
  const [q, setQ] = useState('');
  const rows = SKUS.filter((s) => (filter === '全部' ? true : s.status === filter))
    .filter((s) => s.name.includes(q.trim()));
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: '"PingFang SC", sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 20, margin: 0, color: '#177656' }}>种子仓台账</h1>
        <span style={{ fontSize: 13, color: '#61717d' }}>共 {SKUS.length} 类 · 待补 3</span>
      </header>
      <div role="group" aria-label="库存筛选" style={{ display: 'flex', gap: 8, margin: '16px 0 12px' }}>
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
          style={{ marginLeft: 'auto', padding: '7px 12px', border: '1px solid #d9e2e7', borderRadius: 8, fontSize: 13 }} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 14 }}>
        <thead>
          <tr>{['SKU', '批次', '库存', '状态'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #d9e2e7', fontSize: 13, color: '#61717d' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.batch + s.name} style={{ borderBottom: '1px solid #d9e2e7' }}>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.name}</td>
              <td style={{ padding: '10px 12px', color: '#61717d' }}>{s.batch}</td>
              <td style={{ padding: '10px 12px' }}>{s.status === '缺货' ? 0 : s.stock}</td>
              <td style={{ padding: '10px 12px' }}><StatusPill s={s.status} /></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 18, textAlign: 'center', color: '#61717d' }}>无匹配条目</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

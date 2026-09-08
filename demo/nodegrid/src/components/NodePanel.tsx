import { useRef, useState } from 'react';

import { nearestNode, TIER_LABEL, type NodeInfo } from '../data/nodes';
import { productsForNode } from '../data/pricing';
import { useFocusTrap } from '../hooks/useFocusTrap';

import './NodePanel.css';

export interface NodePanelProps {
  node: NodeInfo;
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onNeighbor: (n: NodeInfo) => void;
  onDeploy: () => void;
}

export default function NodePanel({ node, open, triggerRef, onClose, onNeighbor, onDeploy }: NodePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [photoError, setPhotoError] = useState(false);
  useFocusTrap(open, panelRef, onClose, triggerRef);

  const neighbor = nearestNode(node);
  const products = productsForNode(node);
  const planned = node.tier === 'planned';

  return (
    <aside
      ref={panelRef}
      className={`nodepanel${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${node.city} 节点详情`}
      aria-hidden={!open}
    >
      <button type="button" className="nodepanel-close" aria-label="关闭节点面板（Esc）" onClick={onClose}>
        ✕
      </button>

      <div className="nodepanel-photo">
        {photoError ? (
          <div className="photo-fallback" role="img" aria-label="机房照片占位：图片加载失败">
            <span>机房照片加载失败</span>
          </div>
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}photos/nasa.jpg`}
            alt={`${node.city} 节点演示配图（NASA 机房照片）`}
            onError={() => setPhotoError(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className="nodepanel-body">
        <header className="nodepanel-head">
          <h2 className="nodepanel-city">
            {node.city}
            <span className="nodepanel-cc mono">{node.cc}</span>
          </h2>
          <p className="nodepanel-meta mono">
            {node.id} · {node.country} · {TIER_LABEL[node.tier]}
          </p>
          <div className="nodepanel-lines">
            {planned ? (
              <span className="badge badge-plan">规划中 · 暂未开服</span>
            ) : (
              node.lines.map((l) => (
                <span key={l} className="badge">
                  {l}
                </span>
              ))
            )}
          </div>
        </header>

        <div className="nodepanel-latency">
          <span className="nodepanel-latency-label">演示延迟（参考接入点：上海）</span>
          <span className="nodepanel-latency-num mono">
            {planned ? '—' : node.latency}
            <small>ms</small>
          </span>
          <span className="nodepanel-coords mono">
            {formatLat(node.lat)} / {formatLng(node.lng)}
          </span>
        </div>

        <section className="nodepanel-products" aria-label="该节点产品起价">
          <h3 className="nodepanel-sub">产品起价</h3>
          {planned ? (
            <p className="nodepanel-empty">该节点规划中，开服后上架产品。</p>
          ) : (
            <ul>
              {products.map((p) => (
                <li key={`${p.name}-${p.monthly}`}>
                  <span className="np-name">
                    {p.name}
                    {p.badge && <em className="np-badge">{p.badge}</em>}
                  </span>
                  <span className="np-spec mono">{p.spec}</span>
                  <span className="np-price mono">
                    {p.hourly != null && <i className="np-hourly">¥{p.hourly}/时</i>}¥{p.monthly}
                    <small>/{p.unit ?? '月'}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="nodepanel-note">价格与延迟均为产品演示数据</p>
        </section>

        <div className="nodepanel-actions">
          <button
            type="button"
            className="btn btn-primary nodepanel-deploy"
            onClick={onDeploy}
            disabled={planned}
          >
            {planned ? '规划中 · 暂不可部署' : '部署到此节点'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onNeighbor(neighbor)}>
            相邻节点 → {neighbor.city}
          </button>
        </div>
      </div>
    </aside>
  );
}

function formatLat(lat: number) {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
}
function formatLng(lng: number) {
  return `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
}

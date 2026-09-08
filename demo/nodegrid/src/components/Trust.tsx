import { useState } from 'react';

import { citiesByRegion, NODES, REGION_LABEL, type Region } from '../data/nodes';
import { useCountUp, useInViewOnce } from '../hooks/useCountUp';

import './Trust.css';

const BASE = import.meta.env.BASE_URL;

const PHOTOS = [
  {
    src: `${BASE}photos/nasa.jpg`,
    alt: '数据中心机房实拍（NASA，公有领域）',
    caption: '核心机房 · 机架阵列',
  },
  {
    src: `${BASE}photos/mgb.jpg`,
    alt: '服务器机房实拍（Wikimedia Commons，公有领域）',
    caption: '节点机房 · 列间走线',
  },
  {
    src: `${BASE}photos/postgirot.jpg`,
    alt: '数据中心机房实拍（Postmuseum 馆藏，公有领域）',
    caption: '数据中心 · 早期机房',
  },
];

function SlaStat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [ref, active] = useInViewOnce<HTMLDivElement>();
  const v = useCountUp(target, active);
  return (
    <div className="sla-stat" ref={ref}>
      <span className="sla-num mono">
        {target % 1 === 0 ? Math.round(v) : v.toFixed(2)}
        <small>{suffix}</small>
      </span>
      <span className="sla-label">{label}</span>
    </div>
  );
}

export default function Trust() {
  const [openRegion, setOpenRegion] = useState<Region | null>('apac');

  return (
    <section className="section trust" id="trust" aria-label="网络与信任">
      <div className="container">
        <h2 className="section-title">一张网，跑你的全部业务</h2>
        <p className="section-sub">从核心机房到边缘节点，同一张骨干网承载你的全部业务。</p>

        {/* SLA 数字条 */}
        <div className="sla-bar" role="img" aria-label="服务指标：99.99% SLA、32 个节点、21 座城市、3 大洲骨干网">
          <SlaStat target={99.99} suffix="%" label="服务可用性 SLA" />
          <SlaStat target={NODES.length} suffix="" label="在线节点" />
          <SlaStat target={21} suffix="" label="城市" />
          <SlaStat target={3} suffix="" label="大洲骨干网" />
        </div>

        {/* 照片墙 */}
        <div className="photo-wall">
          {PHOTOS.map((p) => (
            <figure className="photo-item" key={p.src}>
              <img src={p.src} alt={p.alt} loading="lazy" />
              <figcaption>
                <span>{p.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* 大区分组城市列表（Cloudflare 式折叠） */}
        <div className="city-groups">
          <h3 className="city-groups-title">全球节点城市</h3>
          {(['apac', 'na', 'eu'] as Region[]).map((r) => {
            const cities = citiesByRegion(r);
            const open = openRegion === r;
            return (
              <div key={r} className="city-group">
                <button
                  type="button"
                  className="city-group-head"
                  aria-expanded={open}
                  aria-controls={`cg-${r}`}
                  onClick={() => setOpenRegion(open ? null : r)}
                >
                  <span className="city-group-region">
                    {REGION_LABEL[r]}
                    <span className="mono city-group-count">
                      {cities.length} 城 · {cities.reduce((a, c) => a + c.count, 0)} 节点
                    </span>
                  </span>
                  <span className="city-group-arrow" aria-hidden="true">
                    {open ? '−' : '+'}
                  </span>
                </button>
                <div id={`cg-${r}`} className="city-group-body" hidden={!open}>
                  <ul>
                    {cities.map((c) => (
                      <li key={c.city}>
                        <span className="dot" aria-hidden="true" />
                        <span className="city-name">{c.city}</span>
                        <span className="mono city-meta">
                          {c.cc} · ×{c.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          <p className="city-groups-note">
            另有 4 个规划中节点（曼谷 / 雅加达 / 多伦多 / 巴黎），上线后自动进入列表。
          </p>
        </div>
      </div>
    </section>
  );
}

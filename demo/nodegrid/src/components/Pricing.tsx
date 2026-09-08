import { useEffect, useMemo, useRef, useState } from 'react';

import {
  GLOBAL_REGIONS,
  SALE_ITEMS,
  SHELF_LABEL,
  STANDARD_ITEMS,
  configPrice,
  yearlyPrice,
  type PriceItem,
  type Shelf,
} from '../data/pricing';
import { useInViewOnce } from '../hooks/useCountUp';

import './Pricing.css';

const SHELVES: Shelf[] = ['sale', 'standard', 'global'];

function readShelfFromUrl(): Shelf {
  try {
    const v = new URLSearchParams(window.location.search).get('shelf') as Shelf | null;
    if (v && SHELVES.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return 'sale';
}

function PriceBlock({ item, yearly }: { item: PriceItem; yearly: boolean }) {
  const price = item.yearly !== false && yearly ? yearlyPrice(item.monthly) : item.monthly;
  return (
    <>
      {item.hourly != null && <span className="price-hourly mono">¥{item.hourly}/时</span>}
      <span className="price-num mono">
        ¥{price}
        <small>/{item.unit ?? '月'}</small>
      </span>
      {yearly && item.yearly !== false && item.hourly == null && (
        <span className="price-year-note mono">年付已省 ¥{item.monthly - price}</span>
      )}
      {item.hourly != null && <span className="price-year-note mono">按时计费项不参与年付折扣</span>}
    </>
  );
}

function PriceCard({ item, yearly, index, onDeploy }: { item: PriceItem; yearly: boolean; index: number; onDeploy?: () => void }) {
  return (
    <article className={`price-card stagger-item${item.badge ? ' has-badge' : ''}`} style={{ ['--i' as string]: Math.min(index, 12) }}>
      {item.badge && <span className="price-badge">{item.badge}</span>}
      <h3 className="price-name">{item.name}</h3>
      <p className="price-spec mono">{item.spec}</p>
      <div className="price-region">
        <span className="badge">{item.region}</span>
      </div>
      <div className="price-block">
        <PriceBlock item={item} yearly={yearly} />
      </div>
      <div className="price-foot">
        <button type="button" className="btn btn-ghost price-buy" onClick={onDeploy}>
          立即部署
        </button>
      </div>
    </article>
  );
}

function Configurator({ yearly }: { yearly: boolean }) {
  const [vcpu, setVcpu] = useState(2);
  const [ram, setRam] = useState(4);
  const [bw, setBw] = useState(30);
  const [debounced, setDebounced] = useState({ vcpu, ram, bw });
  const timer = useRef<number | null>(null);

  // 防抖 120ms 实时改价
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebounced({ vcpu, ram, bw }), 120);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [vcpu, ram, bw]);

  const price = configPrice(debounced.vcpu, debounced.ram, debounced.bw, yearly);

  return (
    <section className="config" aria-label="自定义配置实时报价">
      <h3 className="config-title">自定义配置 · 实时报价</h3>
      <div className="config-grid">
        <label className="config-row">
          <span className="config-label">
            vCPU <output className="mono config-val" htmlFor="cfg-vcpu">{debounced.vcpu} 核</output>
          </span>
          <input
            id="cfg-vcpu"
            type="range"
            min={1}
            max={16}
            step={1}
            value={vcpu}
            aria-label="vCPU 核数（1 到 16）"
            onChange={(e) => setVcpu(Number(e.target.value))}
          />
        </label>
        <label className="config-row">
          <span className="config-label">
            内存 <output className="mono config-val" htmlFor="cfg-ram">{debounced.ram} GB</output>
          </span>
          <input
            id="cfg-ram"
            type="range"
            min={2}
            max={64}
            step={2}
            value={ram}
            aria-label="内存容量（2 到 64 GB）"
            onChange={(e) => setRam(Number(e.target.value))}
          />
        </label>
        <label className="config-row">
          <span className="config-label">
            带宽 <output className="mono config-val" htmlFor="cfg-bw">{debounced.bw} Mbps</output>
          </span>
          <input
            id="cfg-bw"
            type="range"
            min={5}
            max={500}
            step={5}
            value={bw}
            aria-label="带宽（5 到 500 Mbps）"
            onChange={(e) => setBw(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="config-price" aria-live="polite">
        <span className="config-price-label">预估价格</span>
        <span className="price-num mono">
          ¥{price}
          <small>/月{yearly ? ' · 年付' : ''}</small>
        </span>
      </p>
    </section>
  );
}

export default function Pricing({ onDeploy }: { onDeploy?: () => void }) {
  const [shelf, setShelf] = useState<Shelf>(readShelfFromUrl);
  const [yearly, setYearly] = useState(false);
  const [sectionRef, inView] = useInViewOnce<HTMLDivElement>();
  const shelfTouched = useRef(false);

  // ?shelf= URL 同步：仅用户切换页签后写入，首挂载默认值不改 URL
  useEffect(() => {
    if (!shelfTouched.current) return;
    const u = new URL(window.location.href);
    u.searchParams.set('shelf', shelf);
    window.history.replaceState(null, '', u);
  }, [shelf]);

  const saleCount = useMemo(() => SALE_ITEMS.length, []);

  return (
    <section className="section pricing" id="pricing" aria-label="定价货架">
      <div className="container">
        <h2 className="section-title">定价货架</h2>
        <p className="section-sub">
          特惠区限量促销 · 普通区常规全配置 · 全球节点按区域选购。
        </p>

        <div className="pricing-controls">
          <div className="pricing-tabs" role="tablist" aria-label="货架选择">
            {SHELVES.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={shelf === s}
                className={`pricing-tab${shelf === s ? ' is-on' : ''}`}
                onClick={() => {
                  shelfTouched.current = true;
                  setShelf(s);
                }}
              >
                {SHELF_LABEL[s]}
                {s === 'sale' && <span className="pricing-tab-hot mono">{saleCount} 款</span>}
              </button>
            ))}
          </div>
          <div className="billing-toggle" role="group" aria-label="计费周期">
            <button
              type="button"
              className={`billing-btn${!yearly ? ' is-on' : ''}`}
              aria-pressed={!yearly}
              onClick={() => setYearly(false)}
            >
              月付
            </button>
            <button
              type="button"
              className={`billing-btn${yearly ? ' is-on' : ''}`}
              aria-pressed={yearly}
              onClick={() => setYearly(true)}
            >
              年付 <span className="mono">-10%</span>
            </button>
          </div>
        </div>

        <div ref={sectionRef} role="tabpanel" aria-label={`${SHELF_LABEL[shelf]}货架`} className="pricing-panel">
          {shelf === 'sale' && (
            <div className="price-grid">
              {SALE_ITEMS.map((item, i) => (
                <PriceCard key={item.name} item={item} yearly={yearly} index={i} onDeploy={onDeploy} />
              ))}
            </div>
          )}
          {shelf === 'standard' && (
            <div className="price-grid">
              {STANDARD_ITEMS.map((item, i) => (
                <PriceCard key={`${item.name}-${item.region}`} item={item} yearly={yearly} index={i} onDeploy={onDeploy} />
              ))}
            </div>
          )}
          {shelf === 'global' && (
            <div className="price-groups">
              {GLOBAL_REGIONS.map((g, gi) => (
                <div key={g.region} className="price-group stagger-item" style={{ ['--i' as string]: Math.min(gi, 12) }}>
                  <header className="price-group-head">
                    <h3 className="price-group-region mono">{g.region}</h3>
                    <span className="price-group-note">{g.note}</span>
                  </header>
                  <div className="price-group-items">
                    {g.items.map((item) => (
                      <div key={item.name} className="price-line">
                        <span className="price-name">{item.name}</span>
                        <span className="price-spec mono">{item.spec}</span>
                        <PriceBlock item={item} yearly={yearly} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {inView && <Configurator yearly={yearly} />}
        </div>
      </div>
    </section>
  );
}

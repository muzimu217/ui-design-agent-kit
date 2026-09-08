import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NODES, REGION_LABEL, citiesByRegion, type NodeInfo, type Region } from '../data/nodes';
import { probe } from '../lib/probe';
import NetworkMap, { type NetworkMapHandle } from './NetworkMap';
import NodePanel from './NodePanel';

import './NetworkStage.css';

export interface NetworkStageProps {
  active: boolean;
  /** 非 VT 降级：zoom-through-in 类 */
  entering: boolean;
  /** 辉光过桥叠加层（两种路径共用） */
  flash: boolean;
  /** 进入后把焦点移入舞台（直接落地的初始加载不抢焦点） */
  autoFocus: boolean;
  /** 换场期间参与 View Transitions 命名（由 App 动态控制） */
  vtNamed?: boolean;
  onExit: () => void;
  onDeploy: () => void;
}

type RegionFilter = 'all' | Region | 'promo';
const REGION_TABS: { id: RegionFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'apac', label: '亚太' },
  { id: 'na', label: '北美' },
  { id: 'eu', label: '欧洲' },
  { id: 'promo', label: '特惠区' },
];

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setMatch(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [query]);
  return match;
}

export default function NetworkStage({ active, entering, flash, autoFocus, vtNamed, onExit, onDeploy }: NetworkStageProps) {
  const mobile = useMediaQuery('(max-width: 720px)');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<NodeInfo | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [rovingId, setRovingId] = useState<string | null>(NODES[0]?.id ?? null);
  const mapHandle = useRef<NetworkMapHandle | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const firstTabRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NODES.filter((n) => {
      if (region === 'promo' && !n.promo) return false;
      if (region !== 'all' && region !== 'promo' && n.region !== region) return false;
      if (!q) return true;
      return (
        n.city.toLowerCase().includes(q) ||
        n.cityEn.toLowerCase().includes(q) ||
        n.country.toLowerCase().includes(q) ||
        n.cc.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q)
      );
    });
  }, [region, query]);

  const matchSet = useMemo(() => new Set(filtered.map((n) => n.id)), [filtered]);
  const hasFilter = region !== 'all' || query.trim().length > 0;

  // 筛选变化 → 视图适配到结果集（仅激活时、且每次筛选变化只适配一次）；roving 重置到第一个结果
  const lastFit = useRef('');
  useEffect(() => {
    const key = `${region}|${query}`;
    if (key === lastFit.current) return;
    lastFit.current = key;
    if (!active || filtered.length === 0) {
      if (filtered.length > 0) setRovingId(filtered[0].id);
      return;
    }
    setRovingId(filtered[0].id);
    if (!mobile) mapHandle.current?.fitNodes(filtered.map((n) => n.id));
  }, [region, query, active, mobile, filtered]);

  const handleSelect = useCallback((n: NodeInfo) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelected(n);
    setPanelOpen(true);
    mapHandle.current?.focusNode(n.id);
  }, []);

  const handleNeighbor = useCallback((n: NodeInfo) => {
    setSelected(n);
    setRovingId(n.id);
    mapHandle.current?.focusNode(n.id);
  }, []);

  const closePanel = useCallback(() => setPanelOpen(false), []);

  const handleVisible = useCallback((count: number) => {
    probe.visibleLabels = count;
  }, []);

  // Esc：面板开启时由焦点陷阱处理；否则退出地图
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !panelOpen) onExit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, panelOpen, onExit]);

  // 进入后聚焦首个页签（键盘全旅程）
  useEffect(() => {
    if (active && autoFocus) firstTabRef.current?.focus();
  }, [active, autoFocus]);

  return (
    <section
      className={`netstage${active ? ' is-active' : ''}${entering ? ' is-entering' : ''}${vtNamed ? ' vt-named' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="全球网络地图"
      aria-hidden={!active}
    >
      {/* 辉光过桥（进入瞬间一步） */}
      {flash && <div className="netstage-flash" aria-hidden="true" />}

      <header className="netstage-hud">
        <button type="button" className="btn btn-ghost netstage-back" onClick={onExit}>
          ← 返回首页
        </button>

        <div className="netstage-tabs" role="tablist" aria-label="区域筛选">
          {REGION_TABS.map((t, i) => (
            <button
              key={t.id}
              ref={i === 0 ? firstTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={region === t.id}
              className={`netstage-tab${region === t.id ? ' is-on' : ''}`}
              onClick={() => setRegion(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="netstage-search">
          <input
            ref={searchRef}
            type="search"
            placeholder="搜索城市 / 国家 / 节点 ID"
            aria-label="搜索节点（城市 / 国家 / 节点 ID）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="netstage-search-clear" aria-label="清空搜索" onClick={() => {
              setQuery('');
              searchRef.current?.focus();
            }}>
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="netstage-main">
        <div className="netstage-map">
          <NetworkMap
            active={active}
            mobile={mobile}
            nodes={NODES}
            focusNodes={filtered}
            matchSet={matchSet}
            selectedId={selected?.id ?? null}
            rovingId={rovingId}
            handleRef={mapHandle}
            onRoving={setRovingId}
            onSelect={handleSelect}
            onVisibleChange={handleVisible}
          />
          {hasFilter && filtered.length === 0 && (
            <div className="netstage-empty" role="status">
              <p>未找到匹配「{query || REGION_TABS.find((t) => t.id === region)?.label}」的节点</p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQuery('');
                  setRegion('all');
                }}
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        {/* 图例（HUD 左下） */}
        <div className="netstage-legend" aria-hidden="true">
          <span className="lg lg-core" /> 核心节点
          <span className="lg lg-edge" /> 边缘节点
          <span className="lg lg-plan" /> 规划中
          <span className="lg lg-arc" /> 骨干光弧
        </div>

        {/* ≤720px：区域列表（地图降级配套） */}
        {mobile && (
          <div className="netstage-list" aria-label="按区域浏览节点">
            {(['apac', 'na', 'eu'] as Region[]).map((r) => (
              <div key={r} className="netstage-list-group">
                <h3 className="netstage-list-title">{REGION_LABEL[r]}</h3>
                <div className="netstage-list-cities">
                  {citiesByRegion(r).map((c) => (
                    <button
                      key={c.city}
                      type="button"
                      className="netstage-list-city"
                      onClick={() => {
                        const n = NODES.find((x) => x.city === c.city && x.tier !== 'planned') ?? NODES.find((x) => x.city === c.city);
                        if (n) handleSelect(n);
                      }}
                    >
                      <span className="dot" aria-hidden="true" />
                      {c.city}
                      <span className="mono netstage-list-count">×{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <NodePanel
          node={selected}
          open={panelOpen}
          triggerRef={triggerRef}
          onClose={closePanel}
          onNeighbor={handleNeighbor}
          onDeploy={onDeploy}
        />
      )}
    </section>
  );
}

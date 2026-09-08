import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useCountUp, useInViewOnce } from '../hooks/useCountUp';

import './Hero.css';
import DataGlobe from './DataGlobe';

/** 2D lockup（logo-lockup.svg 的内联形态：图标 + NODEGRID 字标 + 副标） */
function Lockup() {
  return (
    <a className="lockup" href="#top" aria-label="NODEGRID 全球节点云 · 返回顶部">
      <svg viewBox="-1 -1.2 13 9" role="img" aria-hidden="true" focusable="false" className="lockup-mark">
        <g>
          <g fill="#9df3ff">
            <rect x="4.04" y="0.04" width="0.92" height="0.92" />
            <rect x="5.04" y="0.04" width="0.92" height="0.92" />
            <rect x="6.04" y="0.04" width="0.92" height="0.92" />
          </g>
          <g fill="#38d9f0">
            <rect x="3.04" y="1.04" width="0.92" height="0.92" />
            <rect x="4.04" y="1.04" width="0.92" height="0.92" />
            <rect x="5.04" y="1.04" width="0.92" height="0.92" />
            <rect x="6.04" y="1.04" width="0.92" height="0.92" />
            <rect x="7.04" y="1.04" width="0.92" height="0.92" />
          </g>
          <g fill="#22d3ee">
            <rect x="1.04" y="2.04" width="0.92" height="0.92" />
            <rect x="2.04" y="2.04" width="0.92" height="0.92" />
            <rect x="6.04" y="2.04" width="0.92" height="0.92" />
            <rect x="7.04" y="2.04" width="0.92" height="0.92" />
            <rect x="8.04" y="2.04" width="0.92" height="0.92" />
          </g>
          <g fill="#eafcff">
            <rect x="3.04" y="2.04" width="0.92" height="0.92" />
            <rect x="4.04" y="2.04" width="0.92" height="0.92" />
            <rect x="5.04" y="2.04" width="0.92" height="0.92" />
          </g>
          <g fill="#0e7490">
            <rect x="0.04" y="3.04" width="0.92" height="0.92" />
            <rect x="1.04" y="3.04" width="0.92" height="0.92" />
            <rect x="2.04" y="3.04" width="0.92" height="0.92" />
            <rect x="3.04" y="3.04" width="0.92" height="0.92" />
            <rect x="4.04" y="3.04" width="0.92" height="0.92" />
            <rect x="5.04" y="3.04" width="0.92" height="0.92" />
            <rect x="6.04" y="3.04" width="0.92" height="0.92" />
            <rect x="7.04" y="3.04" width="0.92" height="0.92" />
            <rect x="8.04" y="3.04" width="0.92" height="0.92" />
            <rect x="9.04" y="3.04" width="0.92" height="0.92" />
            <rect x="10.04" y="3.04" width="0.92" height="0.92" />
          </g>
          <g fill="#0a5068">
            <rect x="2.04" y="4.04" width="0.92" height="0.92" />
            <rect x="3.04" y="4.04" width="0.92" height="0.92" />
            <rect x="4.04" y="4.04" width="0.92" height="0.92" />
            <rect x="5.04" y="4.04" width="0.92" height="0.92" />
            <rect x="6.04" y="4.04" width="0.92" height="0.92" />
            <rect x="7.04" y="4.04" width="0.92" height="0.92" />
            <rect x="8.04" y="4.04" width="0.92" height="0.92" />
          </g>
        </g>
      </svg>
      <span className="lockup-text">
        <span className="lockup-word">
          NODE<b>GRID</b>
        </span>
        <span className="lockup-sub">全球节点云 · CLOUD &amp; BARE METAL</span>
      </span>
    </a>
  );
}

function Stat({ target, decimals = 0, suffix, label, active }: { target: number; decimals?: number; suffix: string; label: string; active: boolean }) {
  const v = useCountUp(target, active);
  return (
    <div className="stat">
      <span className="stat-num mono">
        {v.toFixed(decimals)}
        <small>{suffix}</small>
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export interface HeroProps {
  onEnterNetwork: () => void;
  onDeploy: () => void;
  enterBtnRef: React.RefObject<HTMLButtonElement | null>;
  /** 换场期间参与 View Transitions 命名（由 App 动态控制） */
  vtNamed?: boolean;
  /** 进入全屏地图后暂停地球渲染 */
  paused?: boolean;
}

export default function Hero({ onEnterNetwork, onDeploy, enterBtnRef, vtNamed, paused }: HeroProps) {
  const reduced = usePrefersReducedMotion();
  const [statsRef, statsActive] = useInViewOnce<HTMLDivElement>();

  return (
    <section className={`hero${vtNamed ? ' vt-named' : ''}`} id="top" aria-label="NODEGRID 全球节点云">
      <header className="hero-head">
        <Lockup />
      </header>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            你的下一个节点，
            <br />
            在世界地图上等你。
          </h1>
          <p className="hero-sub">
            全球 21 座城市云服务器 · 独立服务器 · 裸金属与 GPU，
            CN2 / BGP 多线直连。从一颗数据地球走进全球网络，
            点亮你的下一台机器。
          </p>
          <div className="hero-ctas">
            <button type="button" className="btn btn-primary" onClick={onDeploy}>
              部署到最近的节点
            </button>
            <button type="button" className="btn btn-ghost" ref={enterBtnRef} onClick={onEnterNetwork}>
              进入全球网络 →
            </button>
          </div>
          <p className="hero-hint mono" aria-hidden="true">
            // 拖拽地球环视 · 点击节点进入全球网络 · ESC 返回
          </p>
        </div>
        <div className="hero-globe" aria-label="数据地球：32 个节点的全球分布">
          <DataGlobe onEnter={onEnterNetwork} paused={paused} />
        </div>
      </div>
      <div className="hero-stats" ref={statsRef} aria-hidden="true">
        <Stat target={32} suffix="" label="节点" active={statsActive} />
        <Stat target={21} suffix="" label="城市" active={statsActive} />
        <Stat target={3} suffix="" label="大洲骨干网" active={statsActive} />
        <Stat target={99.99} decimals={2} suffix="%" label="SLA（演示标注）" active={statsActive} />
        <span className="hero-stats-note mono">{reduced ? 'REDUCED MOTION' : 'LIVE · DEMO DATA'}</span>
      </div>
    </section>
  );
}

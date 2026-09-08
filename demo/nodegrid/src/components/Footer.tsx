import VoxelLogo from './VoxelLogo';

import './Footer.css';

export interface FooterProps {
  onEnterNetwork: () => void;
  onDeploy: () => void;
}

export default function Footer({ onEnterNetwork, onDeploy }: FooterProps) {
  return (
    <>
      {/* S6 CTA：3D 体素云 logo（点击轮转展示） */}
      <section className="section brand-cta" aria-label="品牌与行动">
        <div className="container brand-cta-grid">
          <div className="brand-cta-copy">
            <h2 className="section-title">把你的下一台机器，放到世界地图上。</h2>
            <p className="section-sub">点亮一枚节点，从演示货架走进真实部署流程。</p>
            <div className="hero-ctas">
              <button type="button" className="btn btn-primary" onClick={onDeploy}>
                部署到最近的节点
              </button>
              <button type="button" className="btn btn-ghost" onClick={onEnterNetwork}>
                进入全球网络 →
              </button>
            </div>
          </div>
          <div className="brand-cta-logo">
            <VoxelLogo size={16} showState />
          </div>
        </div>
      </section>

      <footer className="footer" aria-label="页脚">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="footer-word mono">
                NODE<b>GRID</b>
              </span>
              <span className="footer-tag mono">全球节点云 · CLOUD &amp; BARE METAL</span>
              <p className="footer-note">
                本站为产品演示页面，品牌与页面数据均为演示内容，不构成任何真实服务要约。
              </p>
            </div>
          </div>
          <p className="footer-bottom mono">© 2026 NODEGRID · 产品演示</p>
        </div>
      </footer>
    </>
  );
}

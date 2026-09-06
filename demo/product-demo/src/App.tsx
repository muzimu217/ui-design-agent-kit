import { useState } from "react";

const NAV_LINKS = [
  { href: "#features", label: "特性" },
  { href: "#specs", label: "规格" },
  { href: "#buy", label: "购买" },
] as const;

const FEATURES = [
  {
    title: "全天候健康监测",
    desc: "连续心率与血氧追踪，睡眠自动分期分析，异常时主动提醒，把身体信号变成看得懂的建议。",
    icon: (
      <svg
        className="feature-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: "两周超长续航",
    desc: "智能省电引擎按使用习惯调度功耗，一次充电支持典型使用 14 天，摆脱每日一充。",
    icon: (
      <svg
        className="feature-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="1" y="7" width="17" height="10" rx="2.5" />
        <line x1="22" y1="11" x2="22" y2="13" />
        <line x1="4.5" y1="10.6" x2="4.5" y2="13.4" />
      </svg>
    ),
  },
  {
    title: "5ATM 专业防水",
    desc: "水下 50 米级防护，日常洗手、雨中跑步、游泳训练都能从容应对。",
    icon: (
      <svg
        className="feature-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    title: "双频精准定位",
    desc: "L1 + L5 双频 GNSS，城市高楼与户外山林都能快速锁定轨迹，跑步划水不错过。",
    icon: (
      <svg
        className="feature-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="22" y1="12" x2="16.5" y2="12" />
        <line x1="7.5" y1="12" x2="2" y2="12" />
        <line x1="12" y1="22" x2="12" y2="16.5" />
        <line x1="12" y1="7.5" x2="12" y2="2" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
];

const SPECS = [
  { label: "表盘", value: "1.39 英寸 AMOLED · 454 × 454 · 326 ppi" },
  { label: "表体", value: "铝合金 + 不锈钢 · 46 mm" },
  { label: "重量", value: "约 42 g（含表带）" },
  { label: "电池", value: "535 mAh · 典型续航 14 天" },
  { label: "防水", value: "5ATM · 支持游泳模式" },
  { label: "连接", value: "蓝牙 5.3 · 2.4GHz Wi-Fi · 双频 GNSS" },
  { label: "传感器", value: "光学心率 · 血氧 · 加速度 · 陀螺仪 · 环境光" },
  { label: "兼容", value: "iOS 15+ / Android 9+ · 曜时健康 App" },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [joined, setJoined] = useState(false);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="曜时首页">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">曜时</span>
          </a>
          <nav className="nav" aria-label="页面导航">
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              菜单
            </button>
            <ul id="nav-menu" className={`nav-list${menuOpen ? " is-open" : ""}`}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">全新一代智能腕表</p>
              <h1 className="hero-title">
                曜时 <span className="hero-title-highlight">X1</span>
              </h1>
              <p className="hero-sub">把健康、效率与风格戴在手腕上，一次充电，安心两周。</p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => scrollToSection("specs")}
                >
                  查看规格参数
                </button>
                <a className="btn btn-ghost" href="#features">
                  了解特性
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div
                className="watch"
                role="img"
                aria-label="曜时 X1 智能手表示意图：圆形表盘、表冠与深色表带"
              >
                <div className="watch__band watch__band--top" aria-hidden="true" />
                <div className="watch__body" aria-hidden="true">
                  <div className="watch__screen">
                    <div className="watch__pill">心率 72</div>
                    <div className="watch__hand watch__hand--hour" />
                    <div className="watch__hand watch__hand--min" />
                    <div className="watch__center" />
                  </div>
                </div>
                <div className="watch__crown" aria-hidden="true" />
                <div className="watch__band watch__band--bottom" aria-hidden="true" />
              </div>
              <div className="watch-chips" aria-hidden="true">
                <div className="watch-chip watch-chip--top">
                  睡眠 <strong>7h 42m</strong>
                </div>
                <div className="watch-chip watch-chip--bottom">
                  步数 <strong>8,412</strong>
                </div>
              </div>
              <p className="hero-caption">曜石黑 · 星光银 · 云杉绿</p>
            </div>
          </div>
        </section>

        <section id="features" className="section section-features">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">为什么选曜时 X1</h2>
              <p className="section-sub">四件小事，让每一天更从容。</p>
            </div>
            <div className="feature-grid">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="feature-card">
                  <div className="feature-icon-wrap">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="specs" className="section section-specs">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">规格一览</h2>
              <p className="section-sub">参数背后，是对日常的周到考虑。</p>
            </div>
            <div className="specs-wrap">
              <table className="specs-table">
                <tbody>
                  {SPECS.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="buy" className="section section-buy">
          <div className="container buy-inner">
            <div className="buy-copy">
              <h2 className="buy-title">曜时 X1 · 预约已开启</h2>
              <p className="buy-price">
                ¥1,299<span className="buy-price-note"> 起</span>
              </p>
              <p className="buy-desc">2025 年 6 月起发货 · 7 天无理由退换 · 全国联保</p>
            </div>
            <button
              type="button"
              className={`btn btn-primary btn-buy${joined ? " is-done" : ""}`}
              onClick={() => setJoined(true)}
            >
              {joined ? "已加入意向清单 ✓" : "加入意向清单"}
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© 2025 曜时科技 · 本页为虚构产品演示</p>
          <a href="#top">回到顶部</a>
        </div>
      </footer>
    </div>
  );
}

import { useState, type MouseEvent, type ReactElement } from "react";

type Model = "pro" | "promax";
type Capacity = "256GB" | "512GB" | "1TB";

interface ModelConfig {
  capacity: Capacity;
  color: string;
}

interface ModelInfo {
  name: string;
  tagline: string;
  cta: string;
}

interface ColorOption {
  id: string;
  name: string;
}

const MODEL_INFO: Record<Model, ModelInfo> = {
  pro: {
    name: "曜石 12 Pro",
    tagline: "轻巧均衡 · 影像满配",
    cta: "选择曜石 12 Pro",
  },
  promax: {
    name: "曜石 12 Pro Max",
    tagline: "大屏长续航 · 性能一步到位",
    cta: "选择曜石 12 Pro Max",
  },
};

const CAPACITIES: Capacity[] = ["256GB", "512GB", "1TB"];

const COLORS: ColorOption[] = [
  { id: "obsidian", name: "曜石黑" },
  { id: "frost", name: "霜白银" },
  { id: "jade", name: "翡翠绿" },
];

const BASE_PRICE: Record<Model, number> = { pro: 6999, promax: 8999 };
const CAPACITY_PRICE: Record<Capacity, number> = {
  "256GB": 0,
  "512GB": 800,
  "1TB": 1600,
};

const DEMO_RESERVATIONS = "1,286";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "「锁定首发优惠」需要支付定金吗？",
    a: "不需要。本页面为虚构品牌演示页，所有按钮仅在本页内存中记录演示意向，不产生任何实际订单或支付。",
  },
  {
    q: "价格与预约人数是真实的吗？",
    a: "不是。页面中的价格、首发优惠、预约人数与日期均为演示数据，仅用于演示界面交互，不构成任何购买要约。",
  },
  {
    q: "在意向清单里可以做什么？",
    a: "「加入我的意向」仅把状态保存在当前页面会话中，刷新即恢复初始状态，无任何后台写入。",
  },
  {
    q: "什么时候发货？",
    a: "演示数据：预计 2025 年 12 月起陆续发货。实际日期以官方公布为准，本页不作任何承诺。",
  },
];

const FEATURES: Array<{ title: string; desc: string; icon: ReactElement }> = [
  {
    title: "影像",
    desc: "三摄矩阵与自研影像引擎，暗光直出更纯净，街头抓拍更果断。",
    icon: <CameraIcon />,
  },
  {
    title: "性能",
    desc: "曜石 A2 仿生芯片与新一代散热系统，重度工作与游戏保持冷静流畅。",
    icon: <ChipIcon />,
  },
  {
    title: "续航",
    desc: "硅碳大电池与智能能效调度，通勤、差旅一整天不再依赖充电宝。",
    icon: <BatteryIcon />,
  },
  {
    title: "材质与工艺",
    desc: "钛金属中框与微晶玻璃背板，握持温润，抗刮耐摔。",
    icon: <CraftIcon />,
  },
];

const SPECS: Array<[string, string]> = [
  ["屏幕", "6.8 英寸 OLED 超视网膜屏 · 1–120Hz 自适应刷新 · 3200×1440"],
  ["芯片", "曜石 A2 仿生（自研）· 3nm 制程 · 新一代 NPU"],
  ["影像", "5000 万三摄矩阵 · 潜望式长焦 5× · 自研影像引擎"],
  ["电池", "5500 mAh 硅碳电池 · 90W 有线闪充 · 50W 无线充电"],
  ["存储", "256GB / 512GB / 1TB · UFS 4.0"],
  ["接口", "USB-C · WiFi 7 · 卫星消息（演示参数）"],
];

function colorName(id: string): string {
  return COLORS.find((c) => c.id === id)?.name ?? id;
}

function modelPrice(model: Model, capacity: Capacity): number {
  return BASE_PRICE[model] + CAPACITY_PRICE[capacity];
}

function preventDemoLink(event: MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
}

export default function App() {
  return (
    <div className="page" id="top">
      <SiteNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SpecsSection />
        <BuySection />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- 导航 ---------- */

function SiteNav() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-nav">
      <nav className="nav-inner" aria-label="主导航">
        <a className="brand" href="#top">
          曜石
          <span className="brand-sub">12 Pro</span>
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-icon" aria-hidden="true">
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </span>
          <span>菜单</span>
        </button>

        <div id="nav-menu" className={open ? "nav-menu is-open" : "nav-menu"}>
          <a href="#features" onClick={closeMenu}>特性</a>
          <a href="#specs" onClick={closeMenu}>规格</a>
          <a href="#buy" onClick={closeMenu}>预订</a>
          <a className="nav-cta" href="#buy" onClick={closeMenu}>锁定首发优惠</a>
        </div>
      </nav>
    </header>
  );
}

/* ---------- Hero ---------- */

function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-eyebrow">影像 · 性能 双旗舰</p>
        <h1 id="hero-title">
          曜石 12 Pro
          <span className="hero-title-accent">影像与性能，皆旗舰</span>
        </h1>
        <p className="hero-sub">
          自研影像引擎与新一代能效核心，通勤路上拍得清，差旅途中撑得住。
          曜石 12 Pro 与 12 Pro Max，一套设计，两种尺度。
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lg" href="#buy">锁定首发优惠</a>
          <a className="btn btn-ghost btn-lg" href="#specs">查看规格</a>
        </div>
        <p className="hero-note">
          12 期免息 · 以旧换新最高抵 ¥1,200 · 全国联保
          <span className="demo-badge">演示权益</span>
        </p>
      </div>
      <div className="hero-visual">
        <PhoneSvg />
      </div>
    </section>
  );
}

function PhoneSvg() {
  return (
    <svg
      className="hero-phone"
      viewBox="0 0 300 580"
      role="img"
      aria-label="曜石 12 Pro 设备示意图"
    >
      {/* 机身 */}
      <rect x="50" y="20" width="200" height="540" rx="34" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
      {/* 音量键 / 电源键 */}
      <rect x="46" y="120" width="4" height="56" rx="2" fill="var(--color-border)" />
      <rect x="46" y="196" width="4" height="56" rx="2" fill="var(--color-border)" />
      <rect x="250" y="160" width="4" height="72" rx="2" fill="var(--color-border)" />
      {/* 屏幕 */}
      <rect x="66" y="40" width="168" height="500" rx="20" fill="var(--color-surface-2)" />
      {/* 镜头模组 */}
      <circle cx="150" cy="96" r="30" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
      <circle cx="142" cy="88" r="9" fill="var(--color-primary)" />
      <circle cx="158" cy="88" r="6" fill="var(--color-primary-hover)" />
      <circle cx="150" cy="104" r="7" fill="var(--color-primary)" opacity="0.85" />
      {/* 参数光点 */}
      <line x1="112" y1="200" x2="188" y2="200" stroke="var(--color-border)" strokeWidth="1" />
      <line x1="112" y1="230" x2="188" y2="230" stroke="var(--color-border)" strokeWidth="1" />
      <circle cx="124" cy="200" r="3.5" fill="var(--color-primary)" />
      <circle cx="176" cy="200" r="3.5" fill="var(--color-primary)" opacity="0.7" />
      <circle cx="124" cy="230" r="3.5" fill="var(--color-primary)" opacity="0.5" />
      <circle cx="176" cy="230" r="3.5" fill="var(--color-primary)" opacity="0.8" />
      <circle cx="150" cy="260" r="3.5" fill="var(--color-primary)" />
      {/* 屏内性能曲线 */}
      <polyline points="90,430 120,388 150,412 180,364 210,400" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.85" />
      <polyline points="90,472 120,442 150,456 180,410 210,442" fill="none" stroke="var(--color-border)" strokeWidth="2" />
    </svg>
  );
}

/* ---------- 特性 ---------- */

function FeaturesSection() {
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <div className="container">
        <h2 className="section-title" id="features-title">为影像与性能而生</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <article className="feature-card" key={f.title}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 规格 ---------- */

function SpecsSection() {
  return (
    <section className="section" id="specs" aria-labelledby="specs-title">
      <div className="container">
        <h2 className="section-title" id="specs-title">规格一览</h2>
        <p className="section-note">以下为演示规格，不代表真实产品参数。</p>
        <table className="spec-table">
          <caption className="sr-only">曜石 12 Pro 与 12 Pro Max 演示规格表</caption>
          <tbody>
            {SPECS.map(([term, detail]) => (
              <tr key={term}>
                <th scope="row">{term}</th>
                <td>{detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- 购买 / 意向 ---------- */

function BuySection() {
  const [selectedModel, setSelectedModel] = useState<Model>("promax");
  const [proConfig, setProConfig] = useState<ModelConfig>({ capacity: "256GB", color: "obsidian" });
  const [promaxConfig, setPromaxConfig] = useState<ModelConfig>({ capacity: "256GB", color: "obsidian" });
  const [intent, setIntent] = useState(false);
  const [hideReservations, setHideReservations] = useState(false);

  const config = selectedModel === "pro" ? proConfig : promaxConfig;
  const info = MODEL_INFO[selectedModel];

  return (
    <section className="section" id="buy" aria-labelledby="buy-title">
      <div className="container">
        <h2 className="section-title" id="buy-title">预订曜石 12 Pro 系列</h2>
        <p className="section-note">价格为演示价格；选择配置后加入你的意向，无需真实下单。</p>

        <div className="buy-layout">
          <div className="price-cards">
            <PriceCard
              model="pro"
              config={proConfig}
              selected={selectedModel === "pro"}
              onConfigChange={setProConfig}
              onSelect={() => setSelectedModel("pro")}
            />
            <PriceCard
              model="promax"
              config={promaxConfig}
              selected={selectedModel === "promax"}
              onConfigChange={setPromaxConfig}
              onSelect={() => setSelectedModel("promax")}
            />
          </div>

          <aside className="intent-panel" aria-labelledby="intent-title">
            <h3 id="intent-title">我的意向</h3>
            <div className="reservation-row">
              <span className="reservation-count" aria-live="polite">
                {hideReservations ? "预约人数已隐藏" : `已有 ${DEMO_RESERVATIONS} 位用户预约`}
              </span>
              <span className="demo-badge">演示数据 · 更新于今日</span>
              <button type="button" className="link-btn" onClick={() => setHideReservations((v) => !v)}>
                {hideReservations ? "显示" : "隐藏"}
              </button>
            </div>

            <p className="config-summary">
              当前选择：{info.name} · {config.capacity} · {colorName(config.color)}
            </p>

            <button
              type="button"
              className={intent ? "btn btn-primary btn-block intent-btn is-active" : "btn btn-primary btn-block intent-btn"}
              onClick={() => setIntent((v) => !v)}
              aria-pressed={intent}
            >
              {intent ? "已在意向清单" : "加入我的意向"}
              {intent && <CheckIcon className="btn-check" />}
            </button>

            <p className="sr-only" aria-live="polite">
              {intent ? "已加入意向清单" : "已撤销意向"}
            </p>
            <p className="intent-note">
              {intent
                ? "已保存在本地意向清单中（仅当前页面会话，刷新即恢复初始状态）。"
                : "点击「加入我的意向」仅在本页内存中记录，不产生任何真实订单。"}
            </p>

            <div className="assurance">
              12 期免息 · 以旧换新最高抵 ¥1,200 · 全国联保
            </div>
          </aside>
        </div>

        <div className="faq">
          <h3>常见问题</h3>
          {FAQS.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

interface PriceCardProps {
  model: Model;
  config: ModelConfig;
  selected: boolean;
  onConfigChange: (config: ModelConfig) => void;
  onSelect: () => void;
}

function PriceCard({ model, config, selected, onConfigChange, onSelect }: PriceCardProps) {
  const info = MODEL_INFO[model];
  const price = modelPrice(model, config.capacity);

  return (
    <article
      className={selected ? "price-card is-selected" : "price-card"}
      aria-labelledby={`${model}-card-title`}
    >
      <div className="price-card-head">
        <h3 id={`${model}-card-title`}>{info.name}</h3>
        {selected && <span className="selected-badge">当前选择</span>}
      </div>
      <p className="card-tagline">{info.tagline}</p>
      <p className="price-row">
        <span className="price-value">¥{price.toLocaleString("zh-CN")}</span>
        <span className="price-note">起 · 演示价格</span>
      </p>

      <fieldset className="option-fieldset">
        <legend>容量</legend>
        <div className="option-group">
          {CAPACITIES.map((cap) => (
            <label className="option" key={cap}>
              <input
                type="radio"
                name={`capacity-${model}`}
                value={cap}
                checked={config.capacity === cap}
                onChange={() => onConfigChange({ ...config, capacity: cap })}
              />
              <span className="option-label">{cap}</span>
              <CheckIcon />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="option-fieldset">
        <legend>颜色</legend>
        <div className="option-group">
          {COLORS.map((color) => (
            <label className="option option-color" key={color.id}>
              <input
                type="radio"
                name={`color-${model}`}
                value={color.id}
                checked={config.color === color.id}
                onChange={() => onConfigChange({ ...config, color: color.id })}
              />
              <span className={`color-swatch swatch-${color.id}`} aria-hidden="true" />
              <span className="option-label">{color.name}</span>
              <CheckIcon />
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" className="btn btn-outline btn-block card-cta" onClick={onSelect}>
        {info.cta}
      </button>
      <p className="card-footnote">演示操作：仅在本页选择配置，不构成真实订单。</p>
    </article>
  );
}

function CheckIcon({ className = "option-check" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8.5 6.5 12 13 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- 页脚 ---------- */

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-brand">曜石 · 虚构品牌</p>
        <ul className="footer-links">
          {["客服", "保修", "隐私"].map((label) => (
            <li key={label}>
              <a href="#" onClick={preventDemoLink}>
                {label}
                <span className="demo-link-tag">演示</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="footer-declaration">
          本页面为虚构品牌演示页，价格与预约数据均为演示数据，不构成任何购买要约。
        </p>
        <p className="footer-copyright">© 2025 曜石（虚构品牌）· 仅供 UI 演示</p>
      </div>
    </footer>
  );
}

/* ---------- 图标（内联 SVG，无外部资源） ---------- */

function CameraIcon() {
  return (
    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" fill="currentColor" stroke="none" />
      <path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <rect x="2.5" y="7.5" width="17" height="9" rx="2" />
      <path d="M21.5 10.5v3" />
      <rect x="5" y="10.5" width="9" height="3" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CraftIcon() {
  return (
    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 3 8l9 5 9-5-9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 16.5 12 21l9-4.5" opacity="0.5" />
    </svg>
  );
}

import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import { Check, ChevronDown, Menu, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'motion/react'
import './styles.css'

type Finish = {
  id: string
  name: string
  nameEn: string
  color: string
  shine: string
  ink: string
}

type Storage = {
  id: string
  label: string
  price: number
}

const finishes: Finish[] = [
  { id: 'chalk', name: '窑白', nameEn: 'Chalk', color: '#e7e1d6', shine: '#ffffff', ink: '#17211f' },
  { id: 'cobalt', name: '钴蓝', nameEn: 'Cobalt', color: '#1b4fd2', shine: '#7fa7ff', ink: '#ffffff' },
  { id: 'saffron', name: '藏红', nameEn: 'Saffron', color: '#d89b26', shine: '#ffe2a1', ink: '#17211f' },
  { id: 'moss', name: '苔绿', nameEn: 'Moss', color: '#67795a', shine: '#c8d9bc', ink: '#ffffff' },
]

const storages: Storage[] = [
  { id: '128', label: '128 GB', price: 0 },
  { id: '256', label: '256 GB', price: 900 },
  { id: '512', label: '512 GB', price: 1800 },
]

const basePrice = 5999

const uiSprings = {
  snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
  playful: { type: 'spring', stiffness: 280, damping: 18, mass: 1.2 },
  elegant: { type: 'spring', stiffness: 100, damping: 20, mass: 1 },
} as const

function formatPrice(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`
}

function PhoneRender({ finish }: { finish: Finish }) {
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const phoneStyle = {
    '--phone-back': finish.color,
    '--phone-shine': finish.shine,
    '--phone-ink': finish.ink,
  } as CSSProperties

  useEffect(() => {
    if (!videoRef.current) return
    if (reduceMotion) videoRef.current.pause()
    else void videoRef.current.play().catch(() => undefined)
  }, [reduceMotion])

  return (
    <motion.figure
      className="product-figure"
      aria-label={`FORMA One ${finish.name} ${finish.nameEn} 手机产品渲染`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={uiSprings.elegant}
    >
      <div className="figure-meta">
        <span>BATCH 01</span>
        <span>FORM / 001</span>
      </div>
      <div className="kiln-shelf">
        <video ref={videoRef} className="kiln-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/assets/forma-kiln-loop.mp4" type="video/mp4" />
        </video>
        <span className="shelf-mark shelf-mark-left">F-ONE</span>
        <span className="shelf-mark shelf-mark-right">24° / GLAZE</span>
        <div className="phone-shadow" aria-hidden="true" />
        <motion.div
          className="phone-shell"
          style={phoneStyle}
          initial={{ rotate: 17, y: 6 }}
          animate={reduceMotion ? { backgroundColor: finish.color, rotate: 0, y: 0, scale: 1 } : { backgroundColor: finish.color, rotate: 14, y: -4, scale: 1 }}
          whileHover={reduceMotion ? undefined : { rotate: 10, y: -12, scale: 1.025 }}
          transition={uiSprings.elegant}
        >
          <div className="phone-edge" aria-hidden="true" />
          <div className="phone-screen">
            <div className="screen-island" aria-hidden="true" />
            <div className="screen-copy">
              <span>FORMA</span>
              <strong>ONE</strong>
            </div>
            <span className="screen-time">09:41</span>
          </div>
          <div className="phone-camera" aria-label="双摄像头">
            <span className="lens lens-a" />
            <span className="lens lens-b" />
            <span className="lens lens-c" />
            <span className="camera-flash" />
          </div>
          <span className="phone-logo" aria-hidden="true">F</span>
        </motion.div>
        <motion.div className="glaze-run glaze-run-one" aria-hidden="true" animate={reduceMotion ? undefined : { x: [0, 16, 0], rotate: [8, 15, 8] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="glaze-run glaze-run-two" aria-hidden="true" animate={reduceMotion ? undefined : { x: [0, -12, 0], rotate: [-10, -3, -10] }} transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} />
      </div>
      <figcaption>
        <span className="caption-dot" style={{ backgroundColor: finish.color }} />
        {finish.name}釉 / {finish.nameEn} glaze
      </figcaption>
    </motion.figure>
  )
}

function App() {
  const [finishId, setFinishId] = useState('cobalt')
  const [storageId, setStorageId] = useState('256')
  const [bagged, setBagged] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const finish = finishes.find((item) => item.id === finishId) ?? finishes[0]
  const storage = storages.find((item) => item.id === storageId) ?? storages[0]
  const total = useMemo(() => basePrice + storage.price, [storage.price])

  const handleFinishChange = (id: string) => {
    setFinishId(id)
    setBagged(false)
  }

  const handleStorageChange = (id: string) => {
    setStorageId(id)
    setBagged(false)
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FORMA One 首页">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FORMA</span>
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="主导航">
          <a href="#product">产品</a>
          <a href="#details">技术</a>
          <a href="#support">支持</a>
        </nav>
        <div className="topbar-actions">
          <span className="batch-note">DROP 01 · 2026</span>
          <motion.button className="bag-button" type="button" aria-label={`购物袋，${bagged ? 1 : 0} 件`} whileTap={{ scale: 0.92 }}>
            <ShoppingBag size={17} strokeWidth={1.8} aria-hidden="true" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={bagged ? 'one' : 'zero'} className="bag-count" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={uiSprings.playful}>{bagged ? 1 : 0}</motion.span>
            </AnimatePresence>
          </motion.button>
          <motion.button className="menu-button" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? '关闭菜单' : '打开菜单'} onClick={() => setMenuOpen((open) => !open)} whileTap={{ scale: 0.92 }}>
            <Menu size={21} strokeWidth={1.8} aria-hidden="true" />
          </motion.button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" id="product">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} aria-hidden="true" /> 新一代陶瓷机身</p>
            <h1>FORMA One<br /><em>触手可及的质感。</em></h1>
            <p className="hero-intro">把一块真正有温度的釉面，装进每天都在使用的设备。轻盈、安静，且经得起时间。</p>
            <div className="hero-proof" aria-label="产品亮点">
              <span><strong>6.1″</strong> OLED 视网膜屏</span>
              <span><strong>198 g</strong> 航空级铝框</span>
            </div>
          </div>

          <div className="hero-config">
            <PhoneRender finish={finish} />
            <motion.div className="purchase-panel" aria-label="配置 FORMA One" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ ...uiSprings.elegant, delay: 0.12 }}>
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">YOUR FORM / 001</p>
                  <h2>选一块釉色</h2>
                </div>
                <span className="stock-mark"><span aria-hidden="true" /> 现货</span>
              </div>

              <fieldset className="choice-group">
                <legend>机身颜色 <span>Finish</span></legend>
                <LayoutGroup id="forma-finish-options"><div className="finish-options">
                  {finishes.map((item) => (
                    <motion.button
                      className={`finish-option ${finishId === item.id ? 'is-selected' : ''}`}
                      key={item.id}
                      type="button"
                      aria-pressed={finishId === item.id}
                      onClick={() => handleFinishChange(item.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="swatch" style={{ backgroundColor: item.color, '--swatch-shine': item.shine } as CSSProperties} />
                      <span className="finish-label"><strong>{item.name}</strong><small>{item.nameEn}</small></span>
                      {finishId === item.id && <><motion.span layoutId="finish-indicator" className="finish-indicator" transition={uiSprings.snappy} /><Check size={15} strokeWidth={2.5} aria-hidden="true" /></>}
                    </motion.button>
                  ))}
                </div></LayoutGroup>
              </fieldset>

              <fieldset className="choice-group storage-group">
                <legend>容量 <span>Storage</span></legend>
                <LayoutGroup id="forma-storage-options"><div className="storage-options">
                  {storages.map((item) => (
                    <motion.button
                      className={`storage-option ${storageId === item.id ? 'is-selected' : ''}`}
                      key={item.id}
                      type="button"
                      aria-pressed={storageId === item.id}
                      onClick={() => handleStorageChange(item.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <strong>{item.label}</strong>
                      <small>{item.price === 0 ? '标准配置' : `+${formatPrice(item.price)}`}</small>
                      {storageId === item.id && <motion.span layoutId="storage-indicator" className="storage-indicator" transition={uiSprings.snappy} />}
                    </motion.button>
                  ))}
                </div></LayoutGroup>
              </fieldset>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${finish.id}-${storage.id}`} className="price-row" aria-live="polite" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={uiSprings.snappy}>
                  <div><span>FORMA One · {storage.label}</span><small>{finish.name}釉色 / 24 个月保修</small></div>
                  <strong>{formatPrice(total)}</strong>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                {bagged ? (
                  <motion.div className="bag-confirm" role="status" key="bagged" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={uiSprings.playful}>
                    <div><Check size={17} strokeWidth={2.5} aria-hidden="true" /><span>已加入购物袋</span></div>
                    <button type="button" onClick={() => setBagged(false)}>撤销</button>
                  </motion.div>
                ) : (
                  <motion.button className="primary-cta" type="button" key="cta" onClick={() => setBagged(true)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={uiSprings.snappy}>
                    加入购物袋 <Plus size={18} strokeWidth={2} aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
              <p className="demo-note">演示配置 · 价格为概念产品示意，不产生真实订单</p>
            </motion.div>
          </div>
        </section>

        <section className="details-section" id="details">
          <div className="section-heading">
            <p className="eyebrow">CRAFTED FOR THE EVERYDAY</p>
            <h2>一件每天都会<br /><em>被触摸的作品。</em></h2>
          </div>
          <div className="highlight-grid">
            <motion.article className="highlight highlight-large" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ ...uiSprings.elegant, delay: 0.02 }}>
              <span className="highlight-index">01 / MATERIAL</span>
              <h3>陶瓷釉面，<br />越看越有层次。</h3>
              <p>手感细腻，耐刮的微晶陶瓷经过 1,240°C 高温烧制。每一块的流痕都略有不同。</p>
              <div className="mini-material" aria-hidden="true"><span /></div>
            </motion.article>
            <motion.article className="highlight highlight-dark" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ ...uiSprings.elegant, delay: 0.08 }}>
              <span className="highlight-index">02 / CAMERA</span>
              <div className="camera-glyph" aria-hidden="true"><span /><span /><span /></div>
              <h3>把光留在<br />该在的地方。</h3>
              <p>48MP 主摄与新一代低光算法，让夜晚保持它本来的颜色。</p>
            </motion.article>
            <motion.article className="highlight highlight-yellow" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ ...uiSprings.elegant, delay: 0.14 }}>
              <span className="highlight-index">03 / BATTERY</span>
              <div className="battery-glyph" aria-hidden="true"><span /></div>
              <h3>一整天，<br />不必寻找插座。</h3>
              <p>整日续航与 30W 快充。把电量留给真正重要的时刻。</p>
            </motion.article>
          </div>
        </section>

        <section className="specs-section" id="support">
          <details className="specs-disclosure" open>
            <summary>技术规格 <span>TECHNICAL SPECIFICATIONS</span><ChevronDown size={19} aria-hidden="true" /></summary>
            <div className="specs-table" role="list">
              <div role="listitem"><span>芯片</span><strong>Forma A1 · 3nm</strong></div>
              <div role="listitem"><span>屏幕</span><strong>6.1″ OLED · 120Hz</strong></div>
              <div role="listitem"><span>防护</span><strong>IP68 · 航空级铝框</strong></div>
              <div role="listitem"><span>连接</span><strong>5G · Wi-Fi 7 · USB-C</strong></div>
              <div role="listitem"><span>系统</span><strong>FormaOS 01</strong></div>
              <div role="listitem"><span>机身厚度</span><strong>7.8 mm</strong></div>
            </div>
          </details>
        </section>
      </main>

      <footer className="footer">
        <span>FORMA / OBJECTS FOR EVERY DAY</span>
        <span>概念产品 · 2026</span>
      </footer>
    </div>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

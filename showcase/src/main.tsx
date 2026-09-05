import { StrictMode, useState } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Layers3,
  Menu,
  MousePointer2,
  Orbit,
  Plus,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './styles.css';

type DisplayMode = 'time' | 'focus';
type MaterialKey = 'ceramic' | 'graphite' | 'ultraviolet';

const materials: Record<MaterialKey, {
  label: string;
  note: string;
  caseColor: string;
  accent: string;
  strap: string;
  face: string;
}> = {
  ceramic: {
    label: 'Ceramic white',
    note: 'Soft ceramic / light catches',
    caseColor: '#e8e5dc',
    accent: '#b9c9ff',
    strap: '#cecac0',
    face: '#11151d',
  },
  graphite: {
    label: 'Graphite black',
    note: 'Brushed graphite / quiet contrast',
    caseColor: '#3a3e49',
    accent: '#8e9bff',
    strap: '#20242d',
    face: '#080a0e',
  },
  ultraviolet: {
    label: 'Ultraviolet blue',
    note: 'Anodized blue / electric edge',
    caseColor: '#4f5ec1',
    accent: '#d5d8ff',
    strap: '#282e79',
    face: '#0b0d24',
  },
};

const details = [
  { icon: Clock3, tag: '01 / TIME', title: 'See the shape of a day.', text: 'A calm time face keeps the hour legible and leaves room for the next deliberate move.' },
  { icon: CircleDot, tag: '02 / FOCUS', title: 'A second hand for deep work.', text: 'Focus mode turns the dial into one quiet remaining-time signal. Nothing competes with the block.' },
  { icon: ScanLine, tag: '03 / MATERIAL', title: 'Light, held in the case.', text: 'A ceramic body, graphite hardware, and an ultraviolet edge make the object feel precise before it moves.' },
];

const spring = { type: 'spring', stiffness: 280, damping: 22, mass: 1 } as const;

function App() {
  const [mode, setMode] = useState<DisplayMode>('time');
  const [materialKey, setMaterialKey] = useState<MaterialKey>('ceramic');
  const [detailIndex, setDetailIndex] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const material = materials[materialKey];
  const detail = details[detailIndex];
  const DetailIcon = detail.icon;
  const surfaceStyle = {
    '--case-color': material.caseColor,
    '--material-accent': material.accent,
    '--strap-color': material.strap,
    '--face-color': material.face,
  } as CSSProperties;

  const saveConcept = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="aurelis-shell" style={surfaceStyle}>
      <header className="aurelis-nav">
        <a className="wordmark" href="#top" aria-label="Aurelis M2 home">
          <span className="wordmark-dot" /> AURELIS <span className="wordmark-sub">/ M2</span>
        </a>
        <nav className={menuOpen ? 'nav-menu is-open' : 'nav-menu'} aria-label="Product navigation">
          <a href="#object" onClick={() => setMenuOpen(false)}>The object</a>
          <a href="#details" onClick={() => setMenuOpen(false)}>Design notes</a>
          <a href="#material" onClick={() => setMenuOpen(false)}>Materials</a>
        </nav>
        <div className="nav-actions">
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button className="nav-cta" type="button" onClick={saveConcept}>{saved ? <Check size={15} /> : <Plus size={15} />} {saved ? 'Saved' : 'Save concept'}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero" id="object">
          <div className="hero-copy">
            <p className="overline"><span className="pulse" /> CONCEPT OBJECT / 01</p>
            <h1>A second hand<br /><em>for deep work.</em></h1>
            <p className="hero-intro">AURELIS M2 is a quiet instrument for people who move between meetings, ideas, and the hours that matter.</p>
            <div className="hero-actions">
              <a className="primary-cta" href="#details">Explore the object <ArrowUpRight size={16} /></a>
              <button className="secondary-cta" type="button" onClick={saveConcept}>{saved ? 'Concept saved' : 'Save for later'} <Plus size={15} /></button>
            </div>
            <div className="hero-meta"><span>Designed for the in-between</span><span>01:18 / 04:00</span></div>
          </div>

          <div className="hero-product" aria-label="Interactive AURELIS M2 watch preview">
            <div className="product-coordinate top-left">A / 44.8mm</div>
            <div className="product-coordinate top-right">MATERIAL STUDY</div>
            <div className="watch-shadow" />
            <motion.button
              className="watch-object"
              type="button"
              aria-label={`Switch to ${mode === 'time' ? 'focus' : 'time'} mode`}
              aria-pressed={mode === 'focus'}
              onClick={() => setMode((value) => value === 'time' ? 'focus' : 'time')}
              animate={prefersReducedMotion ? { rotateY: 0, rotateZ: 0, y: 0 } : { rotateY: mode === 'focus' ? -8 : 5, rotateZ: mode === 'focus' ? -2 : 2, y: mode === 'focus' ? -7 : 0 }}
              transition={spring}
              whileHover={prefersReducedMotion ? undefined : { y: -10, scale: 1.015 }}
              whileTap={prefersReducedMotion ? undefined : { scale: .985 }}
            >
              <div className="watch-strap strap-top" />
              <div className="watch-case">
                <div className="watch-bezel"><div className="watch-face">
                  <div className="face-reflection" />
                  <div className="face-topline"><span>AURELIS</span><span>{mode === 'time' ? 'M2 / 01' : 'FOCUS / 01'}</span></div>
                  <AnimatePresence mode="wait" initial={false}>
                    {mode === 'time' ? (
                      <motion.div className="face-time" key="time" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring}>
                        <span className="time-digits">10<span>:</span>09</span>
                        <span className="time-date">WED 18 / APRIL</span>
                      </motion.div>
                    ) : (
                      <motion.div className="face-focus" key="focus" initial={{ opacity: 0, scale: .86 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={spring}>
                        <span className="focus-label">FOCUS REMAINING</span>
                        <span className="focus-digits">42:00</span>
                        <span className="focus-ring"><span /></span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="face-bottomline"><span>{mode === 'time' ? 'TAP TO FOCUS' : 'TAP TO RETURN'}</span><span className="face-signal" /></div>
                </div></div>
                <div className="watch-crown"><span /></div>
                <div className="watch-side-button" />
              </div>
              <div className="watch-strap strap-bottom" />
            </motion.button>
            <div className="product-coordinate bottom-left">{mode === 'time' ? 'TIME / OPEN' : 'FOCUS / HELD'}</div>
            <div className="product-coordinate bottom-right">TAP THE DIAL <MousePointer2 size={12} /></div>
          </div>
        </section>

        <section className="mode-bar" aria-label="Watch face mode">
          <div className="mode-label"><span>INTERFACE /</span> The watch face changes with you.</div>
          <div className="mode-switch" role="group" aria-label="Select watch mode">
            <button type="button" className={mode === 'time' ? 'mode-button active' : 'mode-button'} aria-pressed={mode === 'time'} onClick={() => setMode('time')}><Clock3 size={15} /> Time mode</button>
            <button type="button" className={mode === 'focus' ? 'mode-button active' : 'mode-button'} aria-pressed={mode === 'focus'} onClick={() => setMode('focus')}><CircleDot size={15} /> Focus mode</button>
          </div>
        </section>

        <section className="details-section" id="details">
          <div className="section-intro"><p className="overline">02 / DESIGN NOTES</p><h2>Quiet hardware.<br /><em>Clear intent.</em></h2><p>Every detail is tuned for the moment where the room gets quiet and the work begins.</p></div>
          <div className="detail-view">
            <div className="detail-visual"><div className="detail-orbit orbit-a" /><div className="detail-orbit orbit-b" /><div className="detail-center"><DetailIcon size={24} /><span>0{detailIndex + 1}</span></div><div className="detail-axis axis-horizontal" /><div className="detail-axis axis-vertical" /></div>
            <div className="detail-copy"><p className="overline">{detail.tag}</p><h3>{detail.title}</h3><p>{detail.text}</p><a href="#material" className="inline-link">Trace the material <ChevronRight size={15} /></a></div>
          </div>
          <div className="detail-tabs" role="tablist" aria-label="Design notes">
            {details.map((item, index) => { const Icon = item.icon; return <button key={item.tag} type="button" role="tab" aria-selected={detailIndex === index} className={detailIndex === index ? 'detail-tab selected' : 'detail-tab'} onClick={() => setDetailIndex(index)}><span>0{index + 1}</span><Icon size={16} /><strong>{item.tag.split(' / ')[1]}</strong></button>; })}
          </div>
        </section>

        <section className="material-section" id="material">
          <div className="material-header"><div><p className="overline">03 / MATERIAL STUDY</p><h2>Choose your<br /><em>quiet signal.</em></h2></div><p>Three surface treatments. One object that knows when to step forward.</p></div>
          <div className="material-content">
            <div className="material-picker" role="radiogroup" aria-label="Choose watch material">
              {(Object.keys(materials) as MaterialKey[]).map((key) => { const item = materials[key]; return <button key={key} type="button" role="radio" aria-checked={materialKey === key} className={materialKey === key ? 'material-option selected' : 'material-option'} onClick={() => setMaterialKey(key)}><span className="material-swatch" style={{ background: item.caseColor }} /><span><strong>{item.label}</strong><small>{item.note}</small></span><span className="material-check">{materialKey === key && <Check size={14} />}</span></button>; })}
              <div className="material-note"><ShieldCheck size={15} /> Concept finish / visual study only</div>
            </div>
            <div className="material-card"><div className="material-card-top"><span>CASE / {material.label.toUpperCase()}</span><span>03 — 07</span></div><div className="material-slice"><div className="slice-ring" /><div className="slice-core" /><span className="slice-label label-one">CERAMIC / 01</span><span className="slice-label label-two">LIGHT / 02</span><span className="slice-label label-three">EDGE / 03</span></div><div className="material-card-bottom"><strong>{material.label}</strong><span>{material.note}</span></div></div>
          </div>
        </section>

        <section className="closing-section"><div className="closing-mark"><Orbit size={30} /></div><p className="overline">AURELIS M2 / CONCEPT 01</p><h2>Time, made<br /><em>more intentional.</em></h2><p className="closing-copy">A considered object for the spaces between noise and focus.</p><button className="primary-cta closing-cta" type="button" onClick={saveConcept}>{saved ? <Check size={16} /> : <Plus size={16} />} {saved ? 'Saved to your shortlist' : 'Save the concept'}</button></section>
      </main>

      <footer className="aurelis-footer"><span>AURELIS M2 / 2026</span><span>CONCEPT OBJECT / NOT FOR SALE</span><span>BUILT WITH INTENT</span></footer>
      <AnimatePresence>{saved && <motion.div className="save-toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={spring} role="status"><Check size={15} /> AURELIS M2 saved</motion.div>}</AnimatePresence>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

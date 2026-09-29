import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';

/**
 * mcp-gate-enforcement 评测夹具：交互产品页（三能力 + 详情模态，Motion 转场）。
 * MCP trace 见 EVIDENCE §一（context7 ×2 fetch failed 如实留痕；Motion MCP 缺席；
 * 浏览器工具=唯一可用 MCP 型通道，承担渲染证据）。骨架沿用批次五已验证模态模式
 * （普通触发按钮 + 单模态 + AnimatePresence/spring/MotionConfig reducedMotion="user"）。
 */

const FEATURES = [
  { id: 'sync', icon: '⇄', title: '实时同步', desc: '多端改动秒级一致，冲突自动合并。', detail: '基于操作变换的同步引擎，断网可离线工作，恢复后增量合并——不覆盖他人改动。' },
  { id: 'audit', icon: '☰', title: '审计台账', desc: '每一次变更有据可查。', detail: '谁在何时改了什么、依据哪条指令，逐条留痕并支持导出，满足内审与外审。' },
  { id: 'alert', icon: '⚠', title: '阈值告警', desc: '指标越线即刻通知。', detail: '自定义阈值与通知渠道，支持静默窗口与升级策略，避免告警疲劳。' },
];

function Modal({ item, onClose }) {
  const panelRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (item) {
      const t = setTimeout(() => panelRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [item]);

  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    if (e.key === 'Tab') {
      const focusables = panelRef.current?.querySelectorAll('button');
      if (!focusables?.length) return;
      const list = Array.from(focusables);
      const idx = list.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && idx === list.length - 1) { e.preventDefault(); list[0].focus(); }
    }
  };

  const v = {
    hidden: { opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.97 },
    shown: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div className="scrim" key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }} onClick={onClose}>
          <motion.div key="panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="d-title"
            className="panel" tabIndex={-1} onKeyDown={onKey} style={{ outline: 'none' }}
            initial="hidden" animate="shown" exit="hidden" variants={v}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}>
            <h2 id="d-title">{item.icon} {item.title}</h2>
            <p>{item.detail}</p>
            <div className="row"><button onClick={onClose}>关闭</button></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  const [activeId, setActiveId] = useState(null);
  const triggerRefs = useRef({});
  const active = FEATURES.find((f) => f.id === activeId) || null;
  const close = () => { setActiveId(null); if (activeId) triggerRefs.current[activeId]?.focus(); };

  return (
    <MotionConfig reducedMotion="user">
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px', fontFamily: '"PingFang SC", sans-serif' }}>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Acme 工作台</h1>
        <p style={{ color: '#61717d', fontSize: 14, marginBottom: 26 }}>三个核心能力，点卡片看细节。</p>
        <div className="cards">
          {FEATURES.map((f, i) => (
            <button key={f.id} className="feat"
              ref={(el) => { triggerRefs.current[f.id] = el; }}
              onClick={() => setActiveId(f.id)}>
              <span className="ico" aria-hidden="true">{f.icon}</span>
              <b>{f.title}</b>
              <span className="d">{f.desc}</span>
            </button>
          ))}
        </div>
      </main>
      <Modal item={active} onClose={close} />
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')).render(<App />);

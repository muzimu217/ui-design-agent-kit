import { StrictMode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';

/**
 * motion-free-tier 评测夹具：可访问模态 + Motion 原创公共 API 转场。
 * 文档基线：.agents/skills/motion best-practices/react.md:42-52（MotionConfig reducedMotion="user"）
 * 与 base-ui.md:23-38（AnimatePresence + exit）。
 * 转场为公共 API 原创（initial/animate/exit + spring）；Motion+ 未启用（不索取/不引用 premium 源码，
 * 不跑不报 MotionScore）；焦点系统为本夹具一次性实现且测试中不替换（failCondition #4 防线）。
 */

function Modal({ open, onClose, title }) {
  const panelRef = useRef(null);
  const reduced = useReducedMotion();

  // 打开即聚焦面板（焦点进入对话框：Esc/Tab 圈才能生效；关闭回焦由 close() 负责）
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => panelRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    if (e.key === 'Tab') {
      // 简洁 Tab 圈（既有焦点系统的组成部分，测试中不替换）
      const focusables = panelRef.current?.querySelectorAll('button, a[href]');
      if (!focusables?.length) return;
      const list = Array.from(focusables);
      const idx = list.indexOf(document.activeElement);
      if (e.shiftKey && (idx <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && idx === list.length - 1) { e.preventDefault(); list[0].focus(); }
    }
  };

  // 转场参数：单一 spring 族（stiffness 100 / damping 20），reduced 时 MotionConfig 全局退化为 opacity
  const variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 18, scale: reduced ? 1 : 0.97 },
    shown: { opacity: 1, y: 0, scale: 1 },
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          className="scrim"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
            className="panel"
            initial="hidden" animate="shown" exit="hidden"
            variants={variants}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            tabIndex={-1}
            onKeyDown={onKey}
            style={{ outline: 'none' }}
          >
            <h2 id="modal-title">导出作品</h2>
            <p>将当前拼搭导出为 JSON 存档。</p>
            <div className="row">
              <button onClick={onClose}>取消</button>
              <button className="primary" onClick={onClose}>导出</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  return (
    <MotionConfig reducedMotion="user">
      <main style={{ padding: 24, fontFamily: '"PingFang SC", sans-serif' }}>
        <h1>作品库</h1>
        <button ref={triggerRef} onClick={() => setOpen(true)}>打开导出</button>
      </main>
      <Modal open={open} onClose={close} title="导出作品" />
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);

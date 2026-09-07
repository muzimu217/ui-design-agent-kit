import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { uiSprings } from './motion';
import { usePrefersReducedMotion } from './useMedia';

interface Toast {
  id: number;
  text: string;
}

const ToastContext = createContext<{ toast: (text: string, ms?: number) => void }>({
  toast: () => {},
});

/** 极简 toast（§7.6 复制失败 / §7.13 彩蛋）。底部居中、浮层投影、playful 入场。 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const reduced = usePrefersReducedMotion();

  const toast = useCallback((text: string, ms = 2000) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ms);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 md:bottom-8"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : uiSprings.playful}
              className="rounded-md border border-border-ink bg-surface px-4 py-2 text-meta text-text shadow-overlay"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

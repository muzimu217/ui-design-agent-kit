import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { tokenize } from '../lib/highlight';
import { uiSprings } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';
import { useToast } from '../lib/toast';
import { CheckIcon, CopyIcon } from './Icons';

interface CodeBlockProps {
  code: string;
  lang: string;
}

/**
 * 代码块（§7.6 / §5.3）：code-bg 底、1px 边、圆角 8、内边距 16、overflow-x auto；
 * 头部条 40px：左语言标签（12px 大写 tertiary）、右复制钮 28×28；
 * copied 1.6s 还原；剪贴板失败 → toast「复制失败」2s、文本保持可选中；
 * 长代码容器内滚动、头部条 sticky 于块顶。
 */
export function CodeBlock({ code, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast('复制失败', 2000);
    }
  };

  const tokens = tokenize(code, lang);

  return (
    <div className="overflow-hidden rounded-md border border-border-ink bg-code-bg">
      <div className="code-head z-10 flex h-10 items-center justify-between border-b border-border-ink bg-code-bg px-4">
        <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-tertiary">
          {lang}
        </span>
        <motion.button
          type="button"
          onClick={copy}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={uiSprings.snappy}
          aria-label={copied ? '已复制' : '复制代码'}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-text-tertiary hover:bg-[rgba(31,36,33,0.06)] hover:text-text dark:hover:bg-[rgba(232,230,221,0.08)]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-1 text-[var(--z-link)]"
              >
                <CheckIcon size={16} />
                <span className="text-meta">已复制</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.15 }}
              >
                <CopyIcon size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <pre className="code-body max-h-[480px] overflow-x-auto overflow-y-auto px-4 py-4 font-mono text-code">
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={t.cls}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

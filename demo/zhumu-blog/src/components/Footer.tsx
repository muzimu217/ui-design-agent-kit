import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimationControls } from 'motion/react';
import { uiSprings } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';
import { useToast } from '../lib/toast';
import { PandaMark } from './PandaMark';

/**
 * 页脚（§7.13）：顶部 hairline；左 归档/RSS/友链 + 一行授权致谢；
 * 右原创打盹熊猫 72px。彩蛋：连点 5 次 → 翻滚一圈（Playful spring rotate 360°）
 * + toast「熊猫被吵醒了！」（每次会话一次）；reduced-motion 仅 toast。
 */
export function Footer() {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  const clicks = useRef(0);
  const played = useRef<boolean | null>(null);
  if (played.current === null) {
    try {
      played.current = sessionStorage.getItem('zhumu-egg') === '1';
    } catch {
      played.current = false;
    }
  }
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  const poke = () => {
    clicks.current += 1;
    if (resetting) return;
    if (clicks.current >= 5 && !played.current) {
      played.current = true;
      try {
        sessionStorage.setItem('zhumu-egg', '1');
      } catch {
        /* 会话存储不可用时忽略 */
      }
      toast('熊猫被吵醒了！', 2000);
      if (!reduced) {
        void controls
          .start({ rotate: 360, transition: uiSprings.playful })
          .then(() => controls.set({ rotate: 0 }));
      }
      // 同会话不重播（§7.13 / §8.2 M）
      setResetting(true);
      window.setTimeout(() => setResetting(false), 1200);
      clicks.current = 0;
    }
  };

  return (
    <footer className="mt-16 border-t border-border-ink">
      <div className="content-col flex items-end justify-between gap-6 py-8">
        <div className="min-w-0">
          <nav aria-label="页脚导航" className="flex flex-wrap gap-5">
            <Link to="/archives" className="text-meta text-text-secondary transition-colors duration-150 hover:text-[var(--z-link)]">
              归档
            </Link>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title="RSS（演示数据，未实现）"
              className="text-meta text-text-secondary transition-colors duration-150 hover:text-[var(--z-link)]"
            >
              RSS
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title="友链（演示数据，未实现）"
              className="text-meta text-text-secondary transition-colors duration-150 hover:text-[var(--z-link)]"
            >
              友链
            </a>
          </nav>
          <p className="mt-3 text-meta text-text-tertiary">
            插画：いらすとや https://www.irasutoya.com/ ｜ 字体：霞鹜文楷 · 思源黑体 · JetBrains Mono（OFL）｜
            本站为演示数据
          </p>
        </div>
        <motion.button
          type="button"
          animate={controls}
          onClick={poke}
          aria-label="打盹的熊猫（彩蛋）"
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0"
        >
          <PandaMark pose="nap" size={72} title="打盹的熊猫" />
        </motion.button>
      </div>
    </footer>
  );
}

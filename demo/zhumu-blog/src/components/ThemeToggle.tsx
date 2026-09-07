import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../lib/theme';
import { uiSprings } from '../lib/motion';
import { usePrefersReducedMotion } from '../lib/useMedia';
import { MoonIcon, SunIcon } from './Icons';
import { InkBloom } from './InkBloom';

/** 主题切换（§7.8 / §8.2 J）：40×40，图标 300ms Snappy 旋转形变，按压 0.98。 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const reduced = usePrefersReducedMotion();
  const dark = theme === 'dark';

  return (
    <InkBloom>
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        transition={uiSprings.snappy}
        aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={reduced ? false : { rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={reduced ? undefined : { rotate: 90, scale: 0.6, opacity: 0 }}
            transition={reduced ? { duration: 0 } : uiSprings.snappy}
            className="block"
          >
            {dark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </InkBloom>
  );
}

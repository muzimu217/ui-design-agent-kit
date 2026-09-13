import { motion } from 'motion/react'
import { PRODUCT_COLORS, THEMES, useApp } from '../store'

export function BackgroundLayer() {
  const { theme, colorIndex } = useApp()
  const crossfade = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div aria-hidden className="fixed inset-0 z-0">
      {THEMES.map((t) => (
        <motion.div
          key={t.id}
          className="absolute inset-0"
          style={{ background: t.bg }}
          animate={{ opacity: theme === t.id ? 1 : 0 }}
          transition={crossfade}
        />
      ))}
      {/* color-theater tint follows the selected finish */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: theme === 'color' ? 1 : 0 }}
        transition={crossfade}
      >
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{
            background: `radial-gradient(90% 70% at 50% 30%, ${PRODUCT_COLORS[colorIndex].swatch}30 0%, transparent 65%)`,
          }}
        />
      </motion.div>
    </div>
  )
}

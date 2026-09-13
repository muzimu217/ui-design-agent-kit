import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, filter: 'blur(4px)' }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={
        reduced
          ? { duration: 0.25 }
          : { type: 'spring', stiffness: 100, damping: 20, mass: 1, delay }
      }
    >
      {children}
    </motion.div>
  )
}

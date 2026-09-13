import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { themeById, useApp, type ThemeId } from '../store'

/** Concentric color-ring wash played when the active section (theme) changes. */
export function RingTransition() {
  const { theme } = useApp()
  const reduced = useReducedMotion()
  const [pulse, setPulse] = useState<{ id: number; theme: ThemeId } | null>(null)
  const last = useRef<{ theme: ThemeId; time: number }>({ theme, time: Date.now() })
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const now = Date.now()
    if (theme === last.current.theme) return
    if (reduced || now - last.current.time < 1200) {
      last.current = { theme, time: now }
      return
    }
    last.current = { theme, time: now }
    setPulse({ id: now, theme })
  }, [theme, reduced])

  if (!pulse) return null
  const accent = themeById(pulse.theme).accent

  return (
    <div key={pulse.id} className="ring-overlay" style={{ color: accent }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="ring" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
      <div
        className="wash"
        style={{ background: accent, animationDelay: '60ms' }}
        onAnimationEnd={() => setPulse(null)}
      />
    </div>
  )
}

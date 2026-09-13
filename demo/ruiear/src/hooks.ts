import { useEffect, useRef } from 'react'
import { useApp, type ThemeId } from './store'

export function useSectionTheme<T extends HTMLElement = HTMLElement>(theme: ThemeId) {
  const ref = useRef<T>(null)
  const { setTheme } = useApp()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setTheme(theme)
        }
      },
      { rootMargin: '-42% 0px -42% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [theme, setTheme])

  return ref
}

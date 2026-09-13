import { useEffect } from 'react'
import Lenis from 'lenis'

export const lenisRef: { current: Lenis | null } = { current: null }

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    lenisRef.current = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])
  return null
}

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  if (lenisRef.current && !prefersReduced()) {
    lenisRef.current.scrollTo(el as HTMLElement, { offset: -56 })
  } else {
    el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
  }
}

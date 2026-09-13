import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { useSectionTheme } from '../hooks'
import { useLang } from '../i18n'
import { useApp } from '../store'
import { DragZone } from './DragZone'
import { Reveal } from './Reveal'

export function ProcessSection() {
  const ref = useSectionTheme<HTMLElement>('process')
  const { processProgress, processAuto } = useApp()
  const { t } = useLang()
  const reduced = useReducedMotion()
  const barRef = useRef<HTMLDivElement>(null)

  // scroll-scrub: viewport progress through the tall section drives the baked animation
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
      processProgress.current = p
      processAuto.current = false
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, processProgress, processAuto])

  // keep the progress bar in sync without re-rendering per frame
  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (barRef.current) barRef.current.style.width = `${Math.round(processProgress.current * 100)}%`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [processProgress])

  const replay = () => {
    if (reduced) {
      processProgress.current = 1
      return
    }
    processProgress.current = 0
    processAuto.current = true
  }

  return (
    <section id="process" ref={ref} className="relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden px-6 pb-10 pt-28">
        <DragZone className="absolute inset-0" />
        <div className="pointer-events-none relative mx-auto w-full max-w-6xl text-white">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/55">
              {t.process.kicker}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 text-[clamp(32px,4.6vw,54px)] font-semibold tracking-[-0.02em]">
              {t.process.title}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-3 max-w-lg text-[15px] text-white/70">{t.process.sub}</p>
          </Reveal>
        </div>
        <div className="pointer-events-none relative mx-auto flex w-full max-w-6xl items-center gap-4 text-white/80">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
            <div ref={barRef} className="h-full w-0 rounded-full bg-white/90" />
          </div>
          <span className="hidden text-[12px] sm:block">{t.process.hint}</span>
          <button
            onClick={replay}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-white/10"
          >
            <RotateCcw size={13} />
            {t.process.replay}
          </button>
        </div>
      </div>
    </section>
  )
}

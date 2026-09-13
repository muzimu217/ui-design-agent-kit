import { useReducedMotion } from 'motion/react'
import { MoveDown } from 'lucide-react'
import { useSectionTheme } from '../hooks'
import { useLang } from '../i18n'
import { DragZone } from './DragZone'
import { Reveal } from './Reveal'
import { scrollToHash } from './SmoothScroll'
import type { MouseEvent } from 'react'

export function Hero() {
  const ref = useSectionTheme<HTMLElement>('hero')
  const { t } = useLang()
  const reduced = useReducedMotion()

  const go = (hash: string) => (e: MouseEvent) => {
    e.preventDefault()
    scrollToHash(hash)
  }

  return (
    <section id="overview" ref={ref} className="relative min-h-[100svh]">
      <div className="mx-auto grid min-h-[100svh] max-w-6xl grid-cols-1 gap-4 px-6 pb-10 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-32">
        <div className="text-white">
          <Reveal>
            <p className="mb-5 inline-block rounded-full border border-white/40 px-4 py-1.5 text-[13px] font-medium tracking-wide">
              {t.hero.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-[clamp(42px,7vw,78px)] font-semibold leading-[1.06] tracking-[-0.03em]">
              {t.hero.titleA}
              <br />
              {t.hero.titleB}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-[17px] text-white/85">{t.hero.sub}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-[15px] font-medium text-white/90">{t.hero.price}*</span>
              <a
                href="#pricing"
                onClick={go('#pricing')}
                className="rounded-full bg-white px-6 py-2.5 text-[14px] font-medium text-[#1d1d1f] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
              >
                {t.hero.buy}
              </a>
              <span className="text-[12px] text-white/60">{t.hero.demo}</span>
            </div>
          </Reveal>
          <Reveal delay={0.26}>
            <p className="mt-12 flex items-center gap-2 text-[12px] text-white/60">
              <MoveDown size={14} className={reduced ? '' : 'animate-bounce'} />
              {t.hero.scroll}
            </p>
          </Reveal>
        </div>
        <div className="relative h-[38svh] lg:h-[62vh]">
          <DragZone className="absolute inset-0" />
          <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[12px] text-white/55">
            {t.hero.drag}
          </p>
        </div>
      </div>
    </section>
  )
}

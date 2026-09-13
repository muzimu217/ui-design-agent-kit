import { useRef, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSectionTheme } from '../hooks'
import { useLang } from '../i18n'
import { PRODUCT_COLORS, useApp } from '../store'
import { DragZone } from './DragZone'
import { Reveal } from './Reveal'

export function ColorTheater() {
  const ref = useSectionTheme<HTMLElement>('color')
  const { colorIndex, setColorIndex } = useApp()
  const { lang, t } = useLang()
  const active = PRODUCT_COLORS[colorIndex]
  const name = lang === 'zh' ? active.zh : active.en
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const select = (i: number) => {
    setColorIndex(((i % PRODUCT_COLORS.length) + PRODUCT_COLORS.length) % PRODUCT_COLORS.length)
  }

  const onKey = (e: KeyboardEvent) => {
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = colorIndex + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = colorIndex - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = PRODUCT_COLORS.length - 1
    if (next === null) return
    e.preventDefault()
    const i = ((next % PRODUCT_COLORS.length) + PRODUCT_COLORS.length) % PRODUCT_COLORS.length
    setColorIndex(i)
    buttons.current[i]?.focus()
  }

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col">
      <DragZone className="relative mx-auto w-full max-w-6xl flex-1" />
      <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-4 text-center">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#2a6ca8]">
            {t.color.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 text-[clamp(30px,4.5vw,48px)] font-semibold tracking-[-0.02em] text-[#17324a]">
            {t.color.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-3 text-[15px] text-[#46617a]">{t.color.sub}</p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-8 flex h-8 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={active.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="text-[16px] font-semibold text-[#17324a]"
              >
                {name}
              </motion.span>
            </AnimatePresence>
          </div>
          <div
            role="radiogroup"
            aria-label={t.color.picker}
            onKeyDown={onKey}
            className="mx-auto mt-3 inline-flex items-center gap-2.5 rounded-full bg-white/85 px-3.5 py-2.5 shadow-[0_12px_36px_rgba(23,50,74,0.14)] backdrop-blur"
          >
            {PRODUCT_COLORS.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => {
                  buttons.current[i] = el
                }}
                role="radio"
                aria-checked={i === colorIndex}
                tabIndex={i === colorIndex ? 0 : -1}
                onClick={() => select(i)}
                aria-label={lang === 'zh' ? c.zh : c.en}
                style={{ backgroundColor: c.swatch }}
                className={`h-7 w-7 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition-transform duration-150 hover:scale-110 active:scale-95 ${
                  i === colorIndex ? 'ring-2 ring-[#1d1d1f] ring-offset-2 ring-offset-white' : ''
                }`}
              />
            ))}
          </div>
          <p className="mt-6 text-[12px] text-[#6b8299]">{t.color.finish}</p>
        </Reveal>
      </div>
    </section>
  )
}

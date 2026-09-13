import { useSectionTheme } from '../hooks'
import { useLang } from '../i18n'
import { Reveal } from './Reveal'

export function Footer() {
  const ref = useSectionTheme<HTMLElement>('footer')
  const { t } = useLang()

  return (
    <footer ref={ref} className="relative">
      <div className="mx-auto max-w-4xl px-6 pb-10 pt-32 text-center">
        <Reveal>
          <h2 className="text-[clamp(30px,4.4vw,52px)] font-semibold tracking-[-0.02em]">
            {t.footer.title}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <button className="mt-8 rounded-full bg-[#0071e3] px-7 py-3 text-[15px] font-medium text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]">
            {t.footer.buy}
          </button>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-6 text-[12px] text-[#a1a1a6]">{t.footer.demo}</p>
        </Reveal>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1.5 border-t border-black/10 px-6 py-8 text-center text-[12px] text-[#a1a1a6]">
        <p>{t.footer.brand}</p>
        <p>{t.footer.credit}</p>
      </div>
    </footer>
  )
}

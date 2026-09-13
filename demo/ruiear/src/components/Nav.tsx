import type { MouseEvent } from 'react'
import { useApp, themeById } from '../store'
import { useLang } from '../i18n'
import { scrollToHash } from './SmoothScroll'

export function Nav() {
  const { theme } = useApp()
  const { lang, setLang, t } = useLang()
  const dark = themeById(theme).dark

  const go = (hash: string) => (e: MouseEvent) => {
    e.preventDefault()
    scrollToHash(hash)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 backdrop-blur-md transition-colors duration-500 ${
        dark ? 'bg-black/25 text-white' : 'bg-white/70 text-[#1d1d1f]'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <a
          href="#overview"
          onClick={go('#overview')}
          className="text-[15px] font-semibold tracking-tight"
        >
          睿耳 <span className="opacity-70">RuiEar</span>
        </a>
        <nav className="hidden items-center gap-7 text-[13px] md:flex" aria-label="Sections">
          <a href="#overview" onClick={go('#overview')} className="opacity-80 transition-opacity hover:opacity-100">
            {t.nav.overview}
          </a>
          <a href="#process" onClick={go('#process')} className="opacity-80 transition-opacity hover:opacity-100">
            {t.nav.process}
          </a>
          <a href="#pricing" onClick={go('#pricing')} className="opacity-80 transition-opacity hover:opacity-100">
            {t.nav.pricing}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            className={`rounded-full border px-3 py-1 text-[12px] font-medium opacity-80 transition hover:opacity-100 ${
              dark ? 'border-white/30' : 'border-black/15'
            }`}
          >
            {t.nav.toEn}
          </button>
          <a
            href="#pricing"
            onClick={go('#pricing')}
            className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[12px] font-medium text-white transition-transform duration-150 hover:scale-[1.04] active:scale-[0.97]"
          >
            {t.nav.buy}
          </a>
        </div>
      </div>
    </header>
  )
}

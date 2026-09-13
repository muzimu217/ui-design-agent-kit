import { Check, Minus } from 'lucide-react'
import { useSectionTheme } from '../hooks'
import { useLang } from '../i18n'
import { Reveal } from './Reveal'

export function Pricing() {
  const ref = useSectionTheme<HTMLElement>('pricing')
  const { lang, t } = useLang()
  const noAncLabels = lang === 'zh' ? ['无降噪'] : ['No ANC']

  return (
    <section id="pricing" ref={ref} className="relative">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#86868b]">
            {t.pricing.kicker}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 text-[clamp(32px,4.6vw,54px)] font-semibold tracking-[-0.02em]">
            {t.pricing.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-3 text-[15px] text-[#6e6e73]">{t.pricing.sub}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.pricing.tiers.map((tier, i) => {
            const hot = i === 1
            return (
              <Reveal key={tier.name} delay={0.06 * i} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-3xl bg-white p-7 ${
                    hot
                      ? 'shadow-[0_20px_60px_rgba(0,0,0,0.10)] ring-2 ring-[#1d1d1f]'
                      : 'border border-black/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[17px] font-semibold">{tier.name}</h3>
                    {tier.badge !== '' && (
                      <span className="shrink-0 rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[11px] font-medium text-white">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="text-[30px] font-semibold tracking-tight">{tier.price}</span>
                    <span className="text-[12px] text-[#86868b]">*{t.pricing.illustrative}</span>
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 text-[14px] text-[#3a3a3e]">
                    {tier.features.map((f) => {
                      const isLack = noAncLabels.includes(f)
                      return (
                        <li key={f} className="flex items-start gap-2.5">
                          {isLack ? (
                            <Minus size={15} className="mt-0.5 shrink-0 text-[#b0b0b5]" />
                          ) : (
                            <Check size={15} className="mt-0.5 shrink-0 text-[#0071e3]" />
                          )}
                          <span className={isLack ? 'text-[#86868b]' : ''}>{f}</span>
                        </li>
                      )
                    })}
                  </ul>
                  <button
                    className={`mt-8 w-full rounded-full py-2.5 text-[14px] font-medium transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                      hot ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'
                    }`}
                  >
                    {t.pricing.buy}
                  </button>
                </div>
              </Reveal>
            )
          })}
        </div>

        <div className="mt-20 border-t border-black/10 pt-10">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#86868b]">
            {t.pricing.specsTitle}
          </h3>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-5">
            {t.pricing.specs.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] uppercase tracking-wide text-[#86868b]">{k}</dt>
                <dd className="mt-1 text-[14px] font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

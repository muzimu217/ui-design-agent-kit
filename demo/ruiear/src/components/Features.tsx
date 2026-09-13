import { useSectionTheme } from '../hooks'
import { useLang } from '../i18n'
import { Reveal } from './Reveal'
import { AncVisual, BatteryVisual, TranslateVisual } from './visuals'

const BASE = import.meta.env.BASE_URL

export function Features() {
  const { t } = useLang()
  const ref1 = useSectionTheme<HTMLElement>('translate')
  const ref2 = useSectionTheme<HTMLElement>('anc')
  const ref3 = useSectionTheme<HTMLElement>('battery')

  const items = [
    {
      ref: ref1,
      d: t.translate,
      light: false,
      Visual: TranslateVisual,
      flip: false,
      photo: `${BASE}photos/feature-translate.jpg`,
      aspect: 'aspect-[4/3]',
      cardPos: 'lg:absolute lg:-bottom-14 lg:-left-10',
    },
    {
      ref: ref2,
      d: t.anc,
      light: false,
      Visual: AncVisual,
      flip: true,
      photo: `${BASE}photos/feature-anc.jpg`,
      aspect: 'aspect-[4/5] lg:aspect-[3/4]',
      cardPos: 'lg:absolute lg:-bottom-12 lg:-right-8',
    },
    {
      ref: ref3,
      d: t.battery,
      light: true,
      Visual: BatteryVisual,
      flip: false,
      photo: `${BASE}photos/feature-battery.jpg`,
      aspect: 'aspect-[4/3]',
      cardPos: 'lg:absolute lg:-bottom-14 lg:-right-8',
    },
  ]

  return (
    <>
      {items.map((it, idx) => (
        <section key={idx} ref={it.ref} className="relative flex min-h-[100svh] items-center">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-28 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-32">
            <div className={`${it.flip ? 'lg:order-2' : ''} ${it.light ? 'text-[#1d1d1f]' : 'text-white'}`}>
              <Reveal>
                <p
                  className={`text-[13px] font-semibold uppercase tracking-[0.2em] ${
                    it.light ? 'text-[#86868b]' : 'text-white/60'
                  }`}
                >
                  {it.d.kicker}
                </p>
              </Reveal>
              <Reveal delay={0.06}>
                <h2 className="mt-4 text-[clamp(34px,5vw,56px)] font-semibold tracking-[-0.02em]">
                  {it.d.title}
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p
                  className={`mt-5 max-w-xl text-[17px] leading-relaxed ${
                    it.light ? 'text-[#4b4b50]' : 'text-white/80'
                  }`}
                >
                  {it.d.body}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {it.d.chips.map((c) => (
                    <li
                      key={c}
                      className={`rounded-full border px-4 py-1.5 text-[13px] ${
                        it.light ? 'border-black/15 text-[#4b4b50]' : 'border-white/30 text-white/85'
                      }`}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={0.14} className={it.flip ? 'lg:order-1' : ''}>
              <div className="relative pb-16 lg:pb-20">
                <img
                  src={it.photo}
                  alt={it.d.visual.photoAlt}
                  loading="lazy"
                  className={`w-full rounded-3xl object-cover shadow-[0_36px_90px_rgba(0,0,0,0.30)] ${it.aspect}`}
                />
                <div
                  className={`relative z-10 mx-4 -mt-16 max-w-md lg:absolute lg:mx-0 lg:mt-0 ${it.cardPos}`}
                >
                  <it.Visual />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ))}
    </>
  )
}

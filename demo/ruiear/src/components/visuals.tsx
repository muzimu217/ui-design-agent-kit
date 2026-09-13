import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  AudioLines,
  BatteryCharging,
  Check,
  ChevronDown,
  Languages,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useLang } from '../i18n'

interface ConvoLang {
  code: string
  zh: string
  en: string
  foreign: string
  answer: { zh: string; en: string }
}

/** Demo conversations: the original line per language + the interpreted answer per UI language. */
const CONVO: ConvoLang[] = [
  {
    code: 'es',
    zh: '西班牙语',
    en: 'Spanish',
    foreign: '¿Dónde puedo probar los RuiEar Buds?',
    answer: {
      zh: '我在哪里可以试戴睿耳 Buds？',
      en: 'Where can I try on the RuiEar Buds?',
    },
  },
  {
    code: 'ja',
    zh: '日语',
    en: 'Japanese',
    foreign: 'RuiEar Budsはどこで試せますか？',
    answer: {
      zh: '哪里可以试戴睿耳 Buds？',
      en: 'Where can I try the RuiEar Buds?',
    },
  },
  {
    code: 'fr',
    zh: '法语',
    en: 'French',
    foreign: 'Où puis-je essayer les RuiEar Buds ?',
    answer: {
      zh: '我在哪里能试戴睿耳 Buds？',
      en: 'Where can I try the RuiEar Buds?',
    },
  },
  {
    code: 'de',
    zh: '德语',
    en: 'German',
    foreign: 'Wo kann ich die RuiEar Buds ausprobieren?',
    answer: {
      zh: '我在哪儿能试戴睿耳 Buds？',
      en: 'Where can I try out the RuiEar Buds?',
    },
  },
  {
    code: 'ko',
    zh: '韩语',
    en: 'Korean',
    foreign: '루이어 버즈는 어디서 사용해 볼 수 있나요?',
    answer: {
      zh: '在哪里可以体验睿耳 Buds？',
      en: 'Where can I try out the RuiEar Buds?',
    },
  },
]

function EqBars({
  bars,
  className = '',
  animate = false,
}: {
  bars: number[]
  className?: string
  animate?: boolean
}) {
  return (
    <span className={`flex items-end gap-[3px] ${className}`} aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current ${animate ? 'eq-bar' : ''}`}
          style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot h-1.5 w-1.5 rounded-full bg-current"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

/**
 * Live two-way conversation card. Messages appear one by one (detect → typing →
 * original → translating → translated); the source language pill opens a menu
 * and switching replays the sequence.
 */
export function TranslateVisual() {
  const { lang, t } = useLang()
  const v = t.translate.visual
  const reduced = useReducedMotion()
  const [langIdx, setLangIdx] = useState(0)
  const [step, setStep] = useState(reduced ? 3 : 0)
  const [open, setOpen] = useState(false)
  const cur = CONVO[langIdx]
  const curName = lang === 'zh' ? cur.zh : cur.en

  useEffect(() => {
    if (reduced) {
      setStep(3)
      return
    }
    setStep(0)
    const timers = [600, 1500, 2700].map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    return () => timers.forEach((t) => clearTimeout(t))
  }, [langIdx, reduced])

  return (
    <figure className="w-full max-w-md rounded-3xl border border-white/20 bg-[#1d2733]/60 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <figcaption className="flex items-center justify-between text-[12px] font-medium text-white/75">
        <span className="inline-flex items-center gap-1.5">
          <Languages size={13} /> {v.title}
        </span>
        <span>{v.scene}</span>
      </figcaption>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={v.pick}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1 text-white/90 transition-colors duration-150 hover:bg-white/10"
          >
            {curName}
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <>
              <button
                aria-hidden
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <ul
                role="menu"
                aria-label={v.pick}
                className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-white/15 bg-[#1d2733]/95 p-1.5 shadow-2xl backdrop-blur-xl"
              >
                {CONVO.map((c, i) => (
                  <li key={c.code}>
                    <button
                      role="menuitemradio"
                      aria-checked={i === langIdx}
                      onClick={() => {
                        setLangIdx(i)
                        setOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                        i === langIdx
                          ? 'bg-white/15 text-white'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {lang === 'zh' ? c.zh : c.en}
                      {i === langIdx && <Check size={13} className="text-emerald-300" />}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <ArrowRight size={13} className="text-white/60" />
        <span className="rounded-full bg-white px-3 py-1 font-medium text-[#2a6ca8]">
          {lang === 'zh' ? '中文' : 'English'}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
          <Sparkles size={11} className="text-sky-300" /> {v.detect} · {curName}
        </span>
      </div>

      <div className="mt-4 min-h-[128px] space-y-2.5">
        {step >= 2 && (
          <motion.div
            key={`o-${cur.code}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl rounded-tl-md bg-white/10 px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-white/50">{v.originalTag}</p>
            <p className="mt-0.5 text-[14px] leading-snug text-white/90">{cur.foreign}</p>
          </motion.div>
        )}
        {step >= 3 && (
          <motion.div
            key={`t-${cur.code}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="ml-8 rounded-2xl rounded-br-md bg-[#0071e3] px-4 py-3 shadow-[0_10px_28px_rgba(0,113,227,0.35)]"
          >
            <p className="text-[10px] uppercase tracking-wide text-white/60">{v.translatedTag}</p>
            <p className="mt-0.5 text-[14px] font-medium leading-snug text-white">
              {lang === 'zh' ? cur.answer.zh : cur.answer.en}
            </p>
          </motion.div>
        )}
      </div>

      <div className="mt-3 flex h-5 items-center gap-2.5 text-[12px] text-white/65">
        {step === 3 ? (
          <>
            <Check size={14} className="text-emerald-300" /> {v.done}
          </>
        ) : step === 2 ? (
          <>
            <EqBars bars={[6, 11, 15, 9, 13, 7]} animate className="text-white" /> {v.status}
          </>
        ) : (
          <>
            <TypingDots /> {v.typing} · {curName}
          </>
        )}
      </div>
    </figure>
  )
}

/**
 * Noise-control card with an interactive switch: raw spectrum while off, the
 * cancelled spectrum only after the user flips it on.
 */
export function AncVisual() {
  const { t } = useLang()
  const v = t.anc.visual
  const reduced = useReducedMotion()
  const [on, setOn] = useState(false)

  const raw = [18, 30, 12, 26, 34, 16, 28, 20, 32, 14, 24, 10]
  const calm = [4, 3, 5, 2, 4, 3, 5, 2, 3, 4, 2, 3]

  return (
    <figure className="w-full max-w-md rounded-3xl border border-white/12 bg-[#101013]/70 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <figcaption className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/75">
          <AudioLines size={13} /> {v.title}
        </span>
        <span className="inline-flex items-center gap-2.5">
          <span className="text-[12px] text-white/60">{v.switchLabel}</span>
          <button
            role="switch"
            aria-checked={on}
            aria-label={v.switchLabel}
            onClick={() => setOn((o) => !o)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
              on ? 'bg-emerald-400' : 'bg-white/25'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 [transition-timing-function:var(--ease-elegant)] ${
                on ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </span>
      </figcaption>

      <div className="mt-6">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className={on ? 'text-emerald-300' : 'text-rose-300/90'}>{on ? v.on : v.off}</span>
          <span
            className={`tabular-nums ${on ? 'text-emerald-300' : 'text-rose-300/90'} transition-colors duration-500`}
          >
            {on ? '-42 dB' : '-6 dB'}
          </span>
        </div>
        <div className="mt-3 flex h-24 items-end gap-[5px]">
          {raw.map((h, i) => (
            <span
              key={i}
              className={`w-[6px] rounded-full transition-[height,background-color] duration-700 [transition-timing-function:var(--ease-elegant)] ${
                on ? 'bg-emerald-300' : 'bg-rose-300/80'
              } ${!on && !reduced ? 'eq-bar' : ''}`}
              style={{
                height: on ? `${calm[i] * 2.2}px` : `${h * 1.7}px`,
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 text-[11px] text-white/45">{on ? v.note : v.hint}</p>
    </figure>
  )
}

/** Battery ring + breakdown card for the battery screen. */
export function BatteryVisual() {
  const { t } = useLang()
  const v = t.battery.visual
  const R = 52
  const C = 2 * Math.PI * R
  return (
    <figure className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
      <figcaption className="flex items-center justify-between text-[12px] font-medium text-[#86868b]">
        <span className="inline-flex items-center gap-1.5">
          <BatteryCharging size={13} /> {v.title}
        </span>
        <span>{v.tag}</span>
      </figcaption>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#ececef" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#0071e3"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${C * 0.82} ${C}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-semibold tracking-tight">{v.hours}</span>
            <span className="text-[11px] text-[#86868b]">{v.unit}</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2.5 text-[13px] text-[#3a3a3e]">
          <li className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-3 py-2.5">
            <span>{v.buds}</span>
            <span className="font-semibold">8h</span>
          </li>
          <li className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-3 py-2.5">
            <span>{v.kase}</span>
            <span className="font-semibold">+24h</span>
          </li>
        </ul>
      </div>
      <p className="mt-5 flex items-center gap-1.5 text-[12px] text-[#86868b]">
        <Zap size={13} className="text-[#f4633a]" />
        {v.quick}
      </p>
    </figure>
  )
}

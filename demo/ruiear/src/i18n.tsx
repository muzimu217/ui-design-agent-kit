import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Lang } from './store'

const zh = {
  nav: { overview: '概览', process: '工艺', pricing: '价格', buy: '购买', toEn: 'EN' },
  hero: {
    eyebrow: '睿耳 Buds',
    titleA: '听懂世界，',
    titleB: '也让你被听懂。',
    sub: '实时 AI 翻译 · 自适应降噪 · 超长续航',
    price: 'RMB 299 起',
    demo: '概念演示 · 示意价格',
    buy: '购买',
    drag: '拖拽旋转',
    scroll: '向下滚动',
  },
  color: {
    eyebrow: '五种表达',
    title: '你的颜色，替你说话。',
    sub: '轻点色板，壳体与充电盒同步换装。',
    picker: '选取产品配色',
    finish: '同色系充电盒 · 指示灯常伴',
  },
  translate: {
    kicker: 'AI 01',
    title: '实时 AI 翻译',
    body: '对方开口，你用母语听懂。对话即时互译，像身边带了一位随身译员。',
    chips: ['对话互译', '自动识别语种', '免手动切换'],
    visual: {
      title: '实时互译',
      scene: '马德里 · 街头',
      detect: '已自动识别',
      typing: '对方正在说话',
      status: '翻译中',
      done: '已互译',
      pick: '切换语种',
      originalTag: '原声',
      translatedTag: '译文',
      photoAlt: '金色夕阳下，佩戴睿耳耳机的年轻女性走在街头',
    },
  },
  anc: {
    kicker: 'AI 02',
    title: '自适应降噪',
    body: '察觉周围环境，自动调节降噪深度。地铁里、机舱中、办公室，各自刚刚好。',
    chips: ['环境感知', '进阶版起配备'],
    visual: {
      title: '噪声控制',
      on: '降噪后',
      off: '原声 · 未开启',
      switchLabel: '自适应降噪',
      hint: '点开右上开关，体验降噪前后（数值为演示示意）',
      note: '数值为演示示意',
      photoAlt: '地铁车厢内，闭眼聆听睿耳耳机的通勤者',
    },
  },
  battery: {
    kicker: '03',
    title: '超长续航',
    body: '一周通勤，一次充电。搭配充电盒，电量随时接得上。',
    chips: ['USB-C', '快充 10 分钟（示意）'],
    visual: {
      title: '电量',
      tag: '含充电盒（示意）',
      hours: '32',
      unit: '小时',
      buds: '耳机单次',
      kase: '充电盒补充',
      quick: '快充 10 分钟 ≈ 2 小时播放（示意）',
      photoAlt: '清晨出门前，佩戴睿耳耳机的年轻人在桌前收拾背包',
    },
  },
  process: {
    kicker: '工艺',
    title: '开盖，即上场。',
    sub: '耳机归仓，盒盖轻合，电量满格待发。',
    hint: '滚动浏览开合过程',
    drag: '拖拽旋转',
    replay: '重播动画',
    done: '已就绪',
  },
  pricing: {
    kicker: '价格',
    title: '三档选择。',
    sub: '从纯粹续航，到全部 AI 能力。',
    illustrative: '示意价格',
    tiers: [
      {
        name: '标准版',
        price: 'RMB 299',
        badge: '',
        features: ['超长续航', 'USB-C 充电', '基础佩戴体验', '无降噪'],
      },
      {
        name: '进阶版',
        price: 'RMB 599',
        badge: '约 2 倍价',
        features: ['标准版全部权益', '自适应降噪', '超久续航翻倍', '通透模式'],
      },
      {
        name: 'AI 尊享版',
        price: 'RMB 899',
        badge: '全部 AI 能力',
        features: ['进阶版全部权益', '实时 AI 翻译', 'AI 语音助手', '最高配功能'],
      },
    ],
    buy: '购买（演示）',
    specsTitle: '技术规格（示意）',
    specs: [
      ['蓝牙', '5.4（示意）'],
      ['续航', '至高 32 小时含盒（示意）'],
      ['充电', 'USB-C'],
      ['防汗防溅', 'IPX4（示意）'],
      ['单耳重量', '4.6 克（示意）'],
    ],
  },
  footer: {
    title: '睿耳 Buds，随时开讲。',
    buy: '购买（演示）',
    demo: '本页为概念演示页，非真实产品；价格与参数均为示意数据，人像照片为 AI 生成示意图。',
    credit: '3D 模型：Jed Falcone（CC BY 4.0）',
    brand: '© 2026 睿数 · 睿耳 RuiEar',
  },
}

export type Dict = typeof zh

const en: Dict = {
  nav: { overview: 'Overview', process: 'Design', pricing: 'Pricing', buy: 'Buy', toEn: '中' },
  hero: {
    eyebrow: 'RuiEar Buds',
    titleA: 'Understand the world.',
    titleB: 'Be understood.',
    sub: 'Live AI Translation · Adaptive ANC · Marathon Battery',
    price: 'From RMB 299',
    demo: 'Concept demo · illustrative price',
    buy: 'Buy',
    drag: 'Drag to rotate',
    scroll: 'Scroll',
  },
  color: {
    eyebrow: 'Five ways to say it',
    title: 'A color that speaks for you.',
    sub: 'Tap a swatch — shell and charging case change together.',
    picker: 'Choose a finish',
    finish: 'Matching case · status LED included',
  },
  translate: {
    kicker: 'AI 01',
    title: 'Live AI Translation',
    body: 'They speak. You hear your language. Conversations translate on the fly, like a personal interpreter by your side.',
    chips: ['Two-way dialogue', 'Auto language detect', 'Zero switching'],
    visual: {
      title: 'Live translate',
      scene: 'Madrid · street',
      detect: 'Auto-detected',
      typing: 'They are speaking',
      status: 'Translating',
      done: 'Translated',
      pick: 'Switch language',
      originalTag: 'Original',
      translatedTag: 'Translated',
      photoAlt: 'A young woman wearing RuiEar earbuds walking down a golden-hour street',
    },
  },
  anc: {
    kicker: 'AI 02',
    title: 'Adaptive Noise Control',
    body: 'It senses your surroundings and tunes cancellation on the fly — subway, cabin, or office, just right.',
    chips: ['Environment aware', 'Advanced tier and up'],
    visual: {
      title: 'Noise control',
      on: 'After ANC',
      off: 'Raw sound · off',
      switchLabel: 'Adaptive ANC',
      hint: 'Flip the switch to feel the before/after (figures illustrative)',
      note: 'Figures are illustrative',
      photoAlt: 'A commuter with eyes closed listening to RuiEar earbuds on the subway',
    },
  },
  battery: {
    kicker: '03',
    title: 'Marathon Battery',
    body: 'A week of commutes on a single charge, with the case keeping every top-up handy.',
    chips: ['USB-C', '10-min quick charge (illustrative)'],
    visual: {
      title: 'Battery',
      tag: 'With case (illustrative)',
      hours: '32',
      unit: 'hours',
      buds: 'Buds on a charge',
      kase: 'Case top-ups',
      quick: '10-min quick charge ≈ 2 h playback (illustrative)',
      photoAlt: 'A young professional packing up at sunrise, wearing RuiEar earbuds',
    },
  },
  process: {
    kicker: 'Design',
    title: 'Open. And it is on.',
    sub: 'Buds snap home, the lid closes soft, and a full charge waits inside.',
    hint: 'Scroll through the ritual',
    drag: 'Drag to rotate',
    replay: 'Replay',
    done: 'Ready',
  },
  pricing: {
    kicker: 'Pricing',
    title: 'Three tiers.',
    sub: 'From pure battery to the full AI stack.',
    illustrative: 'Illustrative',
    tiers: [
      {
        name: 'Standard',
        price: 'RMB 299',
        badge: '',
        features: ['Marathon battery', 'USB-C charging', 'Everyday comfort fit', 'No ANC'],
      },
      {
        name: 'Advanced',
        price: 'RMB 599',
        badge: '~2× price',
        features: ['Everything in Standard', 'Adaptive noise control', 'Doubled battery life', 'Transparency mode'],
      },
      {
        name: 'AI Premium',
        price: 'RMB 899',
        badge: 'Full AI stack',
        features: ['Everything in Advanced', 'Live AI translation', 'AI voice assistant', 'Top-spec features'],
      },
    ],
    buy: 'Buy (demo)',
    specsTitle: 'Tech specs (illustrative)',
    specs: [
      ['Bluetooth', '5.4 (illustrative)'],
      ['Battery', 'Up to 32 h with case (illustrative)'],
      ['Charging', 'USB-C'],
      ['Sweat & splash', 'IPX4 (illustrative)'],
      ['Bud weight', '4.6 g each (illustrative)'],
    ],
  },
  footer: {
    title: 'RuiEar Buds. Ready when you are.',
    buy: 'Buy (demo)',
    demo: 'This is a concept demo page, not a real product. Prices and specs are illustrative; portrait photos are AI-generated mockups.',
    credit: '3D model: Jed Falcone (CC BY 4.0)',
    brand: '© 2026 RuiShu · RuiEar',
  },
}

const dicts: Record<Lang, Dict> = { zh, en }

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict } | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('ruiear-lang')
    return saved === 'en' || saved === 'zh' ? saved : 'zh'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('ruiear-lang', l)
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>
}

export function useLang() {
  const v = useContext(LangCtx)
  if (!v) throw new Error('useLang must be used within LangProvider')
  return v
}

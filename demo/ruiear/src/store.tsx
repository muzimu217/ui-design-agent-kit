import { createContext, useContext, useRef, useState, type ReactNode, type RefObject } from 'react'

export type Lang = 'zh' | 'en'
export type ThemeId =
  | 'hero'
  | 'color'
  | 'translate'
  | 'anc'
  | 'battery'
  | 'process'
  | 'pricing'
  | 'footer'

export interface ProductColor {
  id: string
  zh: string
  en: string
  swatch: string
  tint: string
}

export const PRODUCT_COLORS: ProductColor[] = [
  { id: 'moonlight', zh: '月光白', en: 'Moonlight', swatch: '#ececee', tint: '#efefed' },
  { id: 'midnight', zh: '午夜黑', en: 'Midnight', swatch: '#1d1d1f', tint: '#2b2b30' },
  { id: 'sky', zh: '天空蓝', en: 'Sky', swatch: '#4da3e8', tint: '#59a6e4' },
  { id: 'sunset', zh: '落日橙', en: 'Sunset', swatch: '#f4633a', tint: '#e5693f' },
  { id: 'rose', zh: '玫瑰红', en: 'Rose', swatch: '#e0475b', tint: '#d8546c' },
]

export interface ThemeDef {
  id: ThemeId
  bg: string
  accent: string
  dark: boolean
}

export const THEMES: ThemeDef[] = [
  { id: 'hero', bg: 'linear-gradient(160deg, #F4633A 0%, #E0475B 58%, #B33757 100%)', accent: '#E0475B', dark: true },
  { id: 'color', bg: 'linear-gradient(180deg, #DBEEFD 0%, #F3F9FF 100%)', accent: '#4DA3E8', dark: false },
  { id: 'translate', bg: 'linear-gradient(180deg, #6D97C6 0%, #4F7BA8 100%)', accent: '#5B87B8', dark: true },
  { id: 'anc', bg: 'linear-gradient(180deg, #2A2A2E 0%, #17171A 100%)', accent: '#8A8A92', dark: true },
  { id: 'battery', bg: 'linear-gradient(180deg, #F0F0F3 0%, #E6E6EA 100%)', accent: '#B9B9C0', dark: false },
  { id: 'process', bg: 'linear-gradient(180deg, #333338 0%, #242428 100%)', accent: '#7A7A84', dark: true },
  { id: 'pricing', bg: 'linear-gradient(180deg, #ECECEF 0%, #E4E4E8 100%)', accent: '#A9A9B2', dark: false },
  { id: 'footer', bg: 'linear-gradient(180deg, #FAFAFC 0%, #F2F2F5 100%)', accent: '#D6D6DC', dark: false },
]

export const themeById = (id: ThemeId): ThemeDef => THEMES.find((t) => t.id === id) ?? THEMES[0]

interface AppState {
  colorIndex: number
  setColorIndex: (i: number) => void
  theme: ThemeId
  setTheme: (t: ThemeId) => void
  /** scroll-scrub progress of the process section, 0..1 (mutable, no re-render) */
  processProgress: RefObject<number>
  /** whether the baked animation is auto-advancing (replay) */
  processAuto: RefObject<boolean>
  /** user drag rotation offset, radians (mutable) */
  modelDrag: RefObject<number>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [colorIndex, setColorIndex] = useState(0)
  const [theme, setTheme] = useState<ThemeId>('hero')
  const processProgress = useRef(0)
  const processAuto = useRef(false)
  const modelDrag = useRef(0)

  return (
    <Ctx.Provider
      value={{ colorIndex, setColorIndex, theme, setTheme, processProgress, processAuto, modelDrag }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}

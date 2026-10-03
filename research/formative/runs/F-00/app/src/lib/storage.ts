import { BG_IDS } from './backgrounds';
import type {
  BgId,
  BgMode,
  Durations,
  Persisted,
  RemoteBackground,
  Task,
  ThemeId,
  TodayRecord,
} from './types';

const KEY = 'cyberfocus.v1';

export function todayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeTask(raw: unknown): Task | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  return {
    id: r.id,
    name: r.name,
    est: clampInt(r.est, 1, 24, 1),
    done: clampInt(r.done, 0, 999, 0),
    completed: r.completed === true,
  };
}

/** 合法背景 id = 注册表 6 图 + gradient + custom + remote */
function isKnownBgId(raw: unknown): raw is BgId {
  return typeof raw === 'string' && [...BG_IDS, 'custom', 'remote'].includes(raw);
}

/** 自定义背景 dataURL：仅接受 data:image/ 前缀，防御性限长 3MB（上传侧硬限 2.5MB） */
function parseCustomBg(raw: unknown): string | null {
  if (typeof raw === 'string' && raw.startsWith('data:image/') && raw.length <= 3_000_000) {
    return raw;
  }
  return null;
}

/** 素材工坊来源：三字段齐备且 page 为 http(s) 链接才有效 */
function parseRemoteBg(raw: unknown): RemoteBackground | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || r.id === '') return null;
  if (typeof r.author !== 'string' || r.author === '') return null;
  if (typeof r.page !== 'string' || !r.page.startsWith('http')) return null;
  return { id: r.id, author: r.author, page: r.page };
}

export function defaultPersisted(): Persisted {
  return {
    tasks: [],
    activeTaskId: null,
    themeId: 'neon-city',
    bgMode: 'photo',
    bgId: 'neon-city',
    customBg: null,
    durations: { focus: 25, short: 5, long: 15 },
    soundOn: true,
    today: { date: todayKey(), focusCount: 0, cycle: 0 },
  };
}

export function loadPersisted(): Persisted {
  const base = defaultPersisted();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.map(normalizeTask).filter((t): t is Task => t !== null)
      : [];
    const durations: Durations = {
      focus: clampInt(parsed.durations?.focus, 1, 180, 25),
      short: clampInt(parsed.durations?.short, 1, 180, 5),
      long: clampInt(parsed.durations?.long, 1, 180, 15),
    };
    const themeId: ThemeId = parsed.themeId === 'magenta-rain' ? 'magenta-rain' : 'neon-city';
    const customBg = parseCustomBg(parsed.customBg);
    const remoteBg = parseRemoteBg(parsed.remoteBg);
    // 向后兼容：v1 只有 bgMode（photo/gradient）→ 迁移 photo→默认图、gradient→渐变原样保留；
    // v2 起优先读 bgId。custom 无图、remote 无来源时回退默认图。
    let bgId: BgId = isKnownBgId(parsed.bgId)
      ? parsed.bgId
      : parsed.bgMode === 'gradient'
        ? 'gradient'
        : 'neon-city';
    if (bgId === 'custom' && customBg === null) bgId = 'neon-city';
    if (bgId === 'remote' && remoteBg === null) bgId = 'neon-city';
    const bgMode: BgMode = bgId === 'gradient' ? 'gradient' : 'photo';
    const todayIn = parsed.today;
    const sameDay = typeof todayIn?.date === 'string' && todayIn.date === base.today.date;
    const today: TodayRecord = sameDay
      ? {
          date: base.today.date,
          focusCount: clampInt(todayIn.focusCount, 0, 9999, 0),
          cycle: clampInt(todayIn.cycle, 0, 3, 0),
        }
      : base.today; // 跨天自动清零
    return {
      tasks,
      activeTaskId:
        typeof parsed.activeTaskId === 'string' && tasks.some((t) => t.id === parsed.activeTaskId)
          ? parsed.activeTaskId
          : null,
      themeId,
      bgMode,
      bgId,
      customBg,
      remoteBg,
      durations,
      soundOn: parsed.soundOn !== false,
      today,
    };
  } catch {
    return base;
  }
}

export function savePersisted(state: Persisted): void {
  // bgMode 为旧版兼容字段，写入时由 bgId 派生
  const payload: Persisted = {
    ...state,
    bgMode: state.bgId === 'gradient' ? 'gradient' : 'photo',
    remoteBg: state.remoteBg ?? null,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // 容量兜底：丢弃自定义背景重试，保住任务/主题等核心数据
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...payload, customBg: null }));
    } catch {
      /* 彻底失败则放弃本次写入 */
    }
  }
}

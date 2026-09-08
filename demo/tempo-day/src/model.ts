export type TaskKind = 'focus' | 'admin' | 'break';

export type Task = {
  id: string;
  title: string;
  note: string;
  kind: TaskKind;
  minutes: number;
  remaining: number;
  completed: boolean;
};

export type DayState = {
  version: 1;
  tasks: Task[];
  selectedId: string | null;
  session: { taskId: string; endAt: number } | null;
  sample: boolean;
};

export const STORAGE_KEY = 'tempo-day:v1';

export const kindLabels: Record<TaskKind, string> = {
  focus: '深度工作',
  admin: '日常事务',
  break: '休息片刻',
};

export function createInitialState(): DayState {
  const samples: Array<[string, string, TaskKind, number]> = [
    ['完成品牌首页提案', '把第一版视觉方向整理成可评审的方案。', 'focus', 25],
    ['回复客户邮件', '确认反馈、交付范围与下一次会议。', 'admin', 15],
    ['离开屏幕，喝杯水', '休息也是今天的一部分。', 'break', 5],
    ['打磨作品集项目页', '完成项目背景与成果展示。', 'focus', 45],
    ['整理明日待办', '留下一条清楚的起点。', 'admin', 10],
  ];
  const tasks = samples.map(([title, note, kind, minutes], index): Task => ({
    id: `sample-${index}`, title, note, kind, minutes, remaining: minutes * 60, completed: false,
  }));
  return { version: 1, tasks, selectedId: tasks[0].id, session: null, sample: true };
}

export function remainingSeconds(task: Task, session: DayState['session'], now: number): number {
  if (session?.taskId === task.id) return Math.max(0, Math.min(task.minutes * 60, Math.ceil((session.endAt - now) / 1000)));
  return task.remaining;
}

export function pauseSession(state: DayState, now: number): DayState {
  if (!state.session) return state;
  return {
    ...state,
    tasks: state.tasks.map(task => task.id === state.session?.taskId ? { ...task, remaining: remainingSeconds(task, state.session, now) } : task),
    session: null,
  };
}

export function startSession(state: DayState, id: string, now: number): DayState {
  const paused = pauseSession(state, now);
  const task = paused.tasks.find(item => item.id === id);
  if (!task || task.completed || task.remaining <= 0) return paused;
  return { ...paused, selectedId: id, session: { taskId: id, endAt: now + task.remaining * 1000 } };
}

export function parseSavedState(raw: string | null): DayState | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const state = value as Partial<DayState>;
    if (state.version !== 1 || !Array.isArray(state.tasks) || state.tasks.length > 500) return null;
    const valid = state.tasks.every(task => task && typeof task.id === 'string' && typeof task.title === 'string' && task.title.length > 0 && task.title.length <= 100 && typeof task.note === 'string' && task.note.length <= 300 && ['focus', 'admin', 'break'].includes(task.kind) && Number.isInteger(task.minutes) && task.minutes >= 1 && task.minutes <= 180 && Number.isFinite(task.remaining) && task.remaining >= 0 && task.remaining <= task.minutes * 60 && typeof task.completed === 'boolean');
    if (!valid || new Set(state.tasks.map(task => task.id)).size !== state.tasks.length) return null;
    const selectedId = state.tasks.some(task => task.id === state.selectedId) ? state.selectedId! : state.tasks.find(task => !task.completed)?.id ?? state.tasks[0]?.id ?? null;
    const session = state.session && typeof state.session.taskId === 'string' && Number.isFinite(state.session.endAt) && state.tasks.some(task => task.id === state.session?.taskId && !task.completed) ? state.session : null;
    return { version: 1, tasks: state.tasks, selectedId: session?.taskId ?? selectedId, session, sample: state.sample === true };
  } catch { return null; }
}

export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export type Mode = 'focus' | 'short' | 'long';
export type Phase = 'idle' | 'running' | 'paused';
export type ThemeId = 'neon-city' | 'magenta-rain';

/** 背景位：6 张预设照片 + 渐变 + 自定义上传 + 素材工坊远程图（v2/v3 迭代） */
export type BgId =
  | 'neon-city'
  | 'building-lights'
  | 'neon-signs'
  | 'aerial-night'
  | 'night-train'
  | 'skyline'
  | 'gradient'
  | 'custom'
  | 'remote';

/** 旧字段类型：v2 起由 bgId 派生，仅为 localStorage 向后兼容保留 */
export type BgMode = 'photo' | 'gradient';

export interface Task {
  id: string;
  name: string;
  /** 计划番茄数 */
  est: number;
  /** 已完成番茄数 */
  done: number;
  completed: boolean;
}

export interface Durations {
  /** 分钟 */
  focus: number;
  short: number;
  long: number;
}

export interface TodayRecord {
  /** YYYY-MM-DD（本地时区） */
  date: string;
  focusCount: number;
  /** 当前 4 番茄轮次中的进度 0-3 */
  cycle: number;
}

/** 素材工坊远程背景来源（v3 迭代新增，随背景持久化用于署名） */
export interface RemoteBackground {
  /** Picsum 图片 id */
  id: string;
  /** 作者名（图片实际源自 Unsplash 免费库） */
  author: string;
  /** Unsplash 原页 URL（署名链接） */
  page: string;
}

export interface Persisted {
  tasks: Task[];
  activeTaskId: string | null;
  themeId: ThemeId;
  /** 旧字段：v1 数据兼容保留；v2 写入时由 bgId 派生（photo = 非 gradient） */
  bgMode: BgMode;
  /** v2 新增：当前背景位。v1 数据无此字段，加载时按 bgMode 迁移 */
  bgId: BgId;
  /** v2 新增：自定义背景 dataURL（canvas 压缩后 ≤ ~2.5MB） */
  customBg: string | null;
  /** v3 新增：素材工坊远程背景来源（bgId='remote' 时生效） */
  remoteBg?: RemoteBackground | null;
  durations: Durations;
  soundOn: boolean;
  today: TodayRecord;
}

export const MODE_LABEL: Record<Mode, string> = {
  focus: '番茄',
  short: '短休',
  long: '长休',
};

export const MODE_TITLE: Record<Mode, string> = {
  focus: '专注中',
  short: '短休中',
  long: '长休中',
};

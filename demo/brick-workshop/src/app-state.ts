import { CHALLENGES, STARTER, createHistory, validateDocument } from './domain';
import type { BuildDocument, History } from './domain';

export const STORAGE_KEY = 'brick-workshop.workspace.v1';
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_SAVED_WORKS = 20;
export const MODES = ['free', 'house', 'rocket', 'castle'] as const;
export type Mode = typeof MODES[number];
export type Documents = Record<Mode, BuildDocument>;
export type Histories = Record<Mode, History<BuildDocument>>;
export interface SavedWork {
  id: string;
  mode: Mode;
  savedAt: string;
  document: BuildDocument;
}
export interface Workspace {
  version: 1;
  activeMode: Mode;
  documents: Documents;
  saved: SavedWork[];
}
export interface RestoreResult {
  workspace: Workspace;
  restored: boolean;
  protected: boolean;
  error: string | null;
  raw: string | null;
}

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && MODES.some((mode) => mode === value);
}

export function cloneDocument(document: BuildDocument): BuildDocument {
  return { version: 1, name: document.name, bricks: document.bricks.map((brick) => ({ ...brick })) };
}

export function freshWorkspace(): Workspace {
  const documents = { free: cloneDocument(STARTER) } as Documents;
  for (const challenge of CHALLENGES) {
    documents[challenge.id] = { version: 1, name: challenge.title, bricks: [] };
  }
  return { version: 1, activeMode: 'free', documents, saved: [] };
}

export function historiesFrom(documents: Documents): Histories {
  return Object.fromEntries(MODES.map((mode) => [mode, createHistory(documents[mode])])) as Histories;
}

export function documentsFrom(histories: Histories): Documents {
  return Object.fromEntries(MODES.map((mode) => [mode, histories[mode].present])) as Documents;
}

export function validateWorkspace(value: unknown): Workspace {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('本地存档格式不正确');
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || !isMode(data.activeMode)) throw new Error('本地存档版本或模式不受支持');
  if (!data.documents || typeof data.documents !== 'object' || Array.isArray(data.documents)) throw new Error('本地存档缺少作品');
  const documents = {} as Documents;
  for (const mode of MODES) {
    const result = validateDocument((data.documents as Record<string, unknown>)[mode]);
    if (!result.ok) throw new Error(`本地存档未恢复：${result.error}`);
    documents[mode] = result.document;
  }
  if (!Array.isArray(data.saved) || data.saved.length > MAX_SAVED_WORKS) throw new Error('本地作品集格式不正确');
  const ids = new Set<string>();
  const saved = data.saved.map((item: unknown): SavedWork => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('作品集记录无效');
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || !/^[A-Za-z0-9_.:-]{1,96}$/.test(row.id) || ids.has(row.id)
      || !isMode(row.mode) || typeof row.savedAt !== 'string' || !Number.isFinite(Date.parse(row.savedAt))) throw new Error('作品集记录无效');
    const result = validateDocument(row.document);
    if (!result.ok) throw new Error(`作品集未恢复：${result.error}`);
    ids.add(row.id);
    return { id: row.id, mode: row.mode, savedAt: row.savedAt, document: result.document };
  });
  return { version: 1, activeMode: data.activeMode, documents, saved };
}

export function restoreWorkspace(read: () => string | null): RestoreResult {
  let raw: string | null = null;
  try {
    raw = read();
    if (raw === null) return { workspace: freshWorkspace(), restored: false, protected: false, error: null, raw };
    if (raw.length > MAX_FILE_BYTES * 8) throw new Error('本地存档超出大小限制');
    const workspace = validateWorkspace(JSON.parse(raw));
    return { workspace, restored: true, protected: false, error: null, raw };
  } catch (error) {
    const message = error instanceof Error ? error.message : '无法读取本地存档';
    return { workspace: freshWorkspace(), restored: false, protected: true, error: `${message}。原存档未改写。`, raw };
  }
}

export function encodeWorkspace(workspace: Workspace): string {
  return JSON.stringify(validateWorkspace(workspace));
}

export function parseImport(text: string): BuildDocument {
  if (new TextEncoder().encode(text).byteLength > MAX_FILE_BYTES) throw new Error('作品文件不能超过 2 MB');
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error('这不是有效的 JSON 作品文件'); }
  const result = validateDocument(data);
  if (!result.ok) throw new Error(result.error);
  return result.document;
}

export function exportFilename(name: string, extension: 'json' | 'png'): string {
  const safe = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').trim().slice(0, 80) || '积木作品';
  return `${safe}.${extension}`;
}

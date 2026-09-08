import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Blocks, Box, Camera, Castle, Check,
  ChevronDown, ChevronUp, Copy, Eraser, Expand, FileDown, FilePlus2, FileUp,
  FolderOpen, House, Layers3, Lightbulb, MoreHorizontal, MousePointer2, Move,
  Pencil, Plus, Redo2, Rocket, RotateCcw, RotateCw, Save, SlidersHorizontal, Trash2,
  Trophy, Undo2, Volume2, VolumeX, X, ZoomIn, ZoomOut, AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Scene from './Scene';
import type { CameraCommand, GridPoint, SceneHandle } from './Scene';
import BrickThumbnail from './BrickThumbnail';
import {
  BOARD_SIZE, BRICK_TYPES, CHALLENGES, COLORS, MAX_BRICKS, MAX_HEIGHT,
  canPlace, challengeProgress, commitHistory, dimensions, dropY, getBrickType,
  makeId, redoHistory, serializeDocument, undoHistory, validateBuild, validateDocument,
} from './domain';
import type { Brick, BrickTypeId, BuildDocument, Rotation } from './domain';
import {
  MAX_FILE_BYTES, MAX_SAVED_WORKS, MODES, STORAGE_KEY, cloneDocument, documentsFrom,
  encodeWorkspace, exportFilename, historiesFrom, parseImport, restoreWorkspace,
} from './app-state';
import type { Histories, Mode, SavedWork } from './app-state';

const SNAPPY = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 } as const;
type Tool = 'build' | 'select' | 'erase';
type Notice = { kind: 'success' | 'error' | 'info'; text: string };
type ConfirmDialog = { title: string; description: string; confirm: string; destructive?: boolean; action: () => void };
type Modal = { kind: 'confirm'; data: ConfirmDialog } | { kind: 'works' } | null;
type Cursor = { x: number; z: number; level: number };

function ToolButton({ icon: Icon, label, onClick, disabled = false, active = false, compact = false, className = '' }: {
  icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; active?: boolean; compact?: boolean; className?: string;
}) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active || undefined}
    className={`tool-button ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''} ${className}`}
    onClick={onClick} disabled={disabled}>
    <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
    {!compact && <span>{label}</span>}
  </button>;
}

class SceneBoundary extends Component<{ children: ReactNode; onRetry: () => void; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() {
    if (this.state.failed) return <div className="scene-fallback" role="alert">
      <Box size={36} strokeWidth={1.5} aria-hidden="true" />
      <h2>3D 画面暂不可用</h2>
      <p>作品仍在。请重试，或导出 JSON 保留作品。</p>
      <button className="primary-button" onClick={this.props.onRetry}><RotateCcw size={18} />重新加载画面</button>
    </div>;
    return this.props.children;
  }
}

function ModalShell({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="dialog" aria-labelledby="dialog-title"
    onCancel={(event) => { event.preventDefault(); closeRef.current(); }}
    onClick={(event) => { if (event.target === ref.current) closeRef.current(); }}>
    <div className="dialog-inner">
      <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><ToolButton icon={X} label="关闭对话框" compact onClick={onClose} /></div>
      {children}
    </div>
  </dialog>;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export default function App() {
  const [restoration] = useState(() => restoreWorkspace(() => localStorage.getItem(STORAGE_KEY)));
  const [histories, setHistories] = useState<Histories>(() => historiesFrom(restoration.workspace.documents));
  const [mode, setMode] = useState<Mode>(restoration.workspace.activeMode);
  const [lastChallenge, setLastChallenge] = useState<Exclude<Mode, 'free'>>('house');
  const [saved, setSaved] = useState(restoration.workspace.saved);
  const [protectedStorage, setProtectedStorage] = useState(restoration.protected);
  const [storageError, setStorageError] = useState<string | null>(restoration.error);
  const [savedSignatures, setSavedSignatures] = useState<Partial<Record<Mode, string>>>(() => restoration.restored
    ? Object.fromEntries(MODES.map((key) => [key, JSON.stringify(restoration.workspace.documents[key])])) : {});
  const [tool, setTool] = useState<Tool>('build');
  const [type, setType] = useState<BrickTypeId>('brick-2x4');
  const [color, setColor] = useState('blue');
  const [rotation, setRotation] = useState<Rotation>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moveId, setMoveId] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [cursor, setCursor] = useState<Cursor>({ x: 6, z: 9, level: 0 });
  const [minimumLayer, setMinimumLayer] = useState(0);
  const [autoHeight, setAutoHeight] = useState(true);
  const [hasPreview, setHasPreview] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [coordinatesOpen, setCoordinatesOpen] = useState(false);
  const [partFilter, setPartFilter] = useState('all');
  const [showTarget, setShowTarget] = useState(true);
  const [ready, setReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [sceneRevision, setSceneRevision] = useState(0);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>({ id: 0, type: 'reset' });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<'png' | 'import' | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const sceneRef = useRef<SceneHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const previewId = useRef(makeId());
  const reducedMotion = useReducedMotion() ?? false;
  const current = histories[mode].present;
  const [nameDraft, setNameDraft] = useState(current.name);
  const selected = current.bricks.find((brick) => brick.id === selectedId) ?? null;
  const challenge = CHALLENGES.find((item) => item.id === mode);
  const progress = useMemo(() => challenge ? challengeProgress(current.bricks, challenge) : null, [current.bricks, challenge]);
  const currentColor = COLORS.find((item) => item.id === color)!;
  const modified = savedSignatures[mode] !== JSON.stringify(current) || nameDraft !== current.name;

  useEffect(() => { setNameDraft(current.name); }, [mode, current.name]);
  useEffect(() => {
    if (!notice || notice.kind === 'error') return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menuOpen]);
  useEffect(() => () => { void audioRef.current?.close(); }, []);

  const inform = (text: string, kind: Notice['kind'] = 'info') => setNotice({ text, kind });
  const closeMenu = () => { setMenuOpen(false); menuTriggerRef.current?.focus(); };
  const clickSound = () => {
    if (!soundOn || !audioRef.current) return;
    const context = audioRef.current;
    void context.resume().catch(() => { setSoundOn(false); });
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(720, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(260, context.currentTime + 0.055);
    gain.gain.setValueAtTime(0.055, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.065);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.07);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  };
  const toggleSound = () => {
    if (soundOn) { setSoundOn(false); return; }
    try {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume().then(() => setSoundOn(true)).catch(() => inform('声音未能开启，可继续无声搭建', 'error'));
    } catch { inform('此浏览器暂不支持声音', 'error'); }
  };

  const commitFor = (target: Mode, document: BuildDocument) => {
    setHistories((previous) => ({ ...previous, [target]: commitHistory(previous[target], document) }));
  };
  const commitBricks = (bricks: Brick[], message: string) => {
    const result = validateBuild(bricks);
    if (!result.ok) { inform(result.reason ?? '无法完成编辑', 'error'); return false; }
    commitFor(mode, { ...current, bricks });
    inform(message, 'success');
    clickSound();
    return true;
  };
  const cancelPlacement = () => { setMoveId(null); setCopying(false); setHasPreview(false); setNotice(null); };
  const chooseTool = (next: Tool) => {
    cancelPlacement();
    setTool(next);
    if (next !== 'select') setSelectedId(null);
  };
  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (nameDraft.trim() && nameDraft !== current.name) commitFor(mode, { ...current, name: nameDraft.trim() });
    setMode(next);
    if (next !== 'free') setLastChallenge(next);
    setSelectedId(null);
    cancelPlacement();
    setTool('build');
    setMinimumLayer(0);
    setAutoHeight(true);
    setCursor({ x: 10, z: 10, level: 0 });
    setReady(false);
    setSceneFailed(false);
    setCameraCommand((previous) => ({ id: previous.id + 1, type: 'reset' }));
  };
  const choosePart = (next: BrickTypeId) => {
    setType(next); setTool('build'); setMoveId(null); setCopying(false); setSelectedId(null); setHasPreview(true); setNotice(null);
  };
  const chooseColor = (next: string) => {
    setColor(next);
    if (tool === 'select' && selected && !moveId) {
      if (selected.color !== next) commitBricks(current.bricks.map((brick) => brick.id === selected.id ? { ...brick, color: next } : brick), '颜色已更新');
    } else if (tool === 'build') setHasPreview(true);
  };
  const selectBrick = (id: string | null) => {
    const brick = current.bricks.find((item) => item.id === id);
    cancelPlacement(); setSelectedId(brick?.id ?? null); setTool('select');
    if (brick) { setColor(brick.color); setType(brick.type); setRotation(brick.rotation); setMinimumLayer(brick.y); setCursor({ x: brick.x, z: brick.z, level: brick.y }); }
  };
  const removeBrick = (id: string) => {
    if (commitBricks(current.bricks.filter((brick) => brick.id !== id), '积木已拆除')) {
      setSelectedId(null); cancelPlacement();
    }
  };
  const rotate = () => {
    if (tool === 'select' && selected && !moveId) {
      const turned = { ...selected, rotation: ((selected.rotation + 1) % 4) as Rotation };
      if (commitBricks(current.bricks.map((brick) => brick.id === selected.id ? turned : brick), '积木已旋转')) setRotation(turned.rotation);
    } else { setRotation((value) => ((value + 1) % 4) as Rotation); setHasPreview(true); }
  };
  const editSelected = (isCopy: boolean) => {
    if (!selected) return;
    setType(selected.type); setColor(selected.color); setRotation(selected.rotation);
    setMoveId(isCopy ? null : selected.id); setCopying(isCopy); setTool('build');
    setCursor({ x: selected.x + (isCopy ? dimensions(selected.type, selected.rotation).width + 1 : 0), z: selected.z, level: isCopy ? 0 : selected.y });
    setMinimumLayer(0); setAutoHeight(true); setHasPreview(true); setNotice(null);
  };
  const prepareCoordinateEdit = () => {
    if (tool !== 'build') {
      setMoveId(selected?.id ?? null);
      setCopying(false);
      setTool('build');
    }
    setHasPreview(true);
  };
  const makeCandidate = (point?: GridPoint): Brick => {
    const size = dimensions(type, rotation);
    const position = point ? { x: point.x - Math.floor((size.width - 1) / 2), z: point.z - Math.floor((size.depth - 1) / 2), level: point.level } : cursor;
    const lower = Math.max(position.level, minimumLayer);
    const y = autoHeight ? dropY(current.bricks, type, rotation, position.x, position.z, lower, moveId ?? undefined) ?? lower : minimumLayer;
    return { id: moveId ?? previewId.current, type, color, rotation, x: position.x, z: position.z, y };
  };
  const preview = tool === 'build' && hasPreview ? makeCandidate() : null;
  const previewResult = preview ? canPlace(current.bricks, preview, moveId ?? undefined) : { ok: false, reason: '' };
  const place = (candidate: Brick | null = preview) => {
    if (!candidate) return;
    const result = canPlace(current.bricks, candidate, moveId ?? undefined);
    if (!result.ok) { inform(result.reason ?? '这个位置暂不可放置', 'error'); return; }
    const isMoving = Boolean(moveId);
    const placed = { ...candidate, id: moveId ?? makeId() };
    const bricks = isMoving ? current.bricks.map((brick) => brick.id === moveId ? placed : brick) : [...current.bricks, placed];
    if (commitBricks(bricks, isMoving ? '积木已移动' : copying ? '积木已复制' : '积木已放置')) {
      previewId.current = makeId();
      setMoveId(null); setCopying(false); setHasPreview(false);
      if (isMoving) { setSelectedId(placed.id); setTool('select'); }
    }
  };
  const hover = (point: GridPoint | null) => {
    if (!point || tool !== 'build' || modal) return;
    const size = dimensions(type, rotation);
    const next = { x: point.x - Math.floor((size.width - 1) / 2), z: point.z - Math.floor((size.depth - 1) / 2), level: point.level };
    setCursor((value) => value.x === next.x && value.z === next.z && value.level === next.level ? value : next);
    setHasPreview(true);
  };
  const activate = (point: GridPoint, brickId: string | null, pointerType: string) => {
    if (tool === 'select') { selectBrick(brickId); return; }
    if (tool === 'erase') { if (brickId) removeBrick(brickId); return; }
    hover(point);
    if (pointerType !== 'touch') place(makeCandidate(point));
  };
  const moveHistory = (redo: boolean) => {
    cancelPlacement(); setSelectedId(null);
    setHistories((previous) => ({ ...previous, [mode]: redo ? redoHistory(previous[mode]) : undoHistory(previous[mode]) }));
    inform(redo ? '已重做' : '已撤销');
  };
  const requestClear = () => {
    const reset = () => { commitFor(mode, { version: 1, name: challenge?.title ?? '未命名作品', bricks: [] }); cancelPlacement(); setSelectedId(null); inform(challenge ? '挑战已重新开始' : '空白作品已就绪'); };
    if (!current.bricks.length) { reset(); return; }
    setModal({ kind: 'confirm', data: { title: challenge ? '重新开始这个挑战？' : '新建空白作品？', description: '当前草稿将清空。此操作可以撤销，已保存的作品不受影响。', confirm: challenge ? '重新开始' : '新建空白', destructive: true, action: reset } });
  };
  const namedDocument = (): BuildDocument | null => {
    const candidate = { ...current, name: nameDraft.trim() };
    const result = validateDocument(candidate);
    if (!result.ok) { inform(result.error, 'error'); return null; }
    return result.document;
  };
  const rename = () => {
    if (nameDraft === current.name) return;
    const next = namedDocument();
    if (next) commitFor(mode, next);
    else setNameDraft(current.name);
  };
  const writeLocal = (nextSaved: SavedWork[], nextDocument: BuildDocument = current) => {
    const documents = { ...documentsFrom(histories), [mode]: nextDocument };
    try {
      localStorage.setItem(STORAGE_KEY, encodeWorkspace({ version: 1, activeMode: mode, documents, saved: nextSaved }));
      setSaved(nextSaved); setProtectedStorage(false); setStorageError(null);
      setSavedSignatures(Object.fromEntries(MODES.map((key) => [key, JSON.stringify(documents[key])])));
      return true;
    } catch {
      const text = '本地保存失败：存储空间不足或浏览器禁止写入。作品仍在，可重试或导出 JSON。';
      setStorageError(text); inform(text, 'error'); return false;
    }
  };
  const save = () => {
    const document = namedDocument();
    if (!document) return;
    const action = () => {
      const existing = saved.find((item) => item.mode === mode && item.document.name === document.name);
      if (!existing && saved.length >= MAX_SAVED_WORKS) { inform('本机作品集已满，请删除一个存档或导出 JSON', 'error'); setModal({ kind: 'works' }); return; }
      const entry: SavedWork = { id: existing?.id ?? makeId(), mode, document: cloneDocument(document), savedAt: new Date().toISOString() };
      const next = [entry, ...saved.filter((item) => item.id !== entry.id)];
      if (writeLocal(next, document)) {
        if (document.name !== current.name) commitFor(mode, document);
        inform('作品已保存到本机', 'success');
      }
    };
    if (protectedStorage) setModal({ kind: 'confirm', data: { title: '替换无法读取的本地存档？', description: '原始存档尚未改写。继续后将用当前草稿和作品集替换它。', confirm: '确认替换并保存', destructive: true, action } });
    else action();
  };
  const exportJSON = () => {
    const document = namedDocument(); if (!document) return;
    try { download(new Blob([serializeDocument(document)], { type: 'application/json' }), exportFilename(document.name, 'json')); inform('已生成 JSON 下载', 'success'); }
    catch { inform('JSON 导出失败，请重试', 'error'); }
    closeMenu();
  };
  const exportPNG = async () => {
    closeMenu();
    if (!ready || !sceneRef.current) { inform('画面尚未就绪，请稍后重试', 'error'); return; }
    setBusy('png');
    try { const blob = await sceneRef.current.capture(); if (!blob.size) throw new Error('Empty image'); download(blob, exportFilename(current.name, 'png')); inform('已生成 PNG 下载', 'success'); }
    catch { inform('截图失败，作品未改变。请重试或导出 JSON。', 'error'); }
    finally { setBusy(null); }
  };
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const importMode = mode;
    if (file.size > MAX_FILE_BYTES) { inform('作品文件不能超过 2 MB', 'error'); if (fileRef.current) fileRef.current.value = ''; return; }
    setBusy('import');
    try {
      const imported = parseImport(await file.text());
      setModal({ kind: 'confirm', data: { title: '导入这个作品？', description: `“${imported.name}”包含 ${imported.bricks.length} 块积木，将替换当前${importMode === 'free' ? '自由' : '挑战'}草稿。此操作可以撤销。`, confirm: '导入作品', action: () => { commitFor(importMode, imported); cancelPlacement(); setSelectedId(null); inform('作品已导入，尚未保存到本机', 'success'); } } });
    } catch (error) { inform(`${error instanceof Error ? error.message : '无法读取文件'}。原作品未改变。`, 'error'); }
    finally { setBusy(null); if (fileRef.current) fileRef.current.value = ''; }
  };
  const loadSaved = (work: SavedWork) => {
    setModal({ kind: 'confirm', data: { title: '打开保存的作品？', description: `“${work.document.name}”将替换当前草稿。此操作可以撤销，原存档不变。`, confirm: '打开作品', action: () => { commitFor(mode, cloneDocument(work.document)); cancelPlacement(); setSelectedId(null); inform('存档已打开'); } } });
  };
  const deleteSaved = (work: SavedWork) => {
    setModal({ kind: 'confirm', data: { title: '删除这个本机存档？', description: `“${work.document.name}”的保存副本将被删除。当前草稿不会被拆除。`, confirm: '删除存档', destructive: true, action: () => { if (writeLocal(saved.filter((item) => item.id !== work.id))) inform('本机存档已删除'); } } });
  };
  const nextHint = () => {
    if (!progress || !challenge) return;
    const missing = [...progress.missing].sort((a, b) => a.y - b.y);
    const target = missing.find((brick) => canPlace(current.bricks, { ...brick, id: previewId.current }).ok) ?? missing[0];
    if (!target) return;
    setTool('build'); setSelectedId(null); setMoveId(null); setCopying(false);
    setType(target.type); setColor(target.color); setRotation(target.rotation);
    setCursor({ x: target.x, z: target.z, level: target.y }); setMinimumLayer(target.y); setAutoHeight(false); setHasPreview(true); setNotice(null);
  };
  const camera = (type: CameraCommand['type']) => setCameraCommand((value) => ({ id: value.id + 1, type }));
  const retryScene = useCallback(() => { setReady(false); setSceneFailed(false); setSceneRevision((value) => value + 1); }, []);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target;
      if (modal || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
        || (target instanceof HTMLElement && target.isContentEditable)) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === 'z') { event.preventDefault(); moveHistory(event.shiftKey); }
      else if (command && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
      else if (event.key === 'Escape') { cancelPlacement(); if (menuOpen) closeMenu(); }
      else if (!command && event.key.toLowerCase() === 'r') { event.preventDefault(); rotate(); }
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selected) { event.preventDefault(); removeBrick(selected.id); }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  });

  const filteredTypes = BRICK_TYPES.filter((item) => partFilter === 'all' || (partFilter === 'brick' ? item.shape === 'brick' : item.shape !== 'brick'));
  const previewLabel = moveId ? '移动积木' : copying ? '复制积木' : '待放置';
  const selectionStatus = selected && tool === 'select' ? getBrickType(selected.type).label : getBrickType(type).label;

  return <div className="app-shell" data-mode={mode} data-testid="workshop" data-brick-count={current.bricks.length} data-selected-id={selectedId ?? ''}>
    <header className="main-header">
      <div className="brand"><Blocks size={28} strokeWidth={2} aria-hidden="true" /><h1>积木小工坊</h1></div>
      <nav className="mode-switch" aria-label="游戏模式">
        <button aria-pressed={mode === 'free'} className={mode === 'free' ? 'active' : ''} onClick={() => switchMode('free')}><Blocks size={17} />自由搭建</button>
        <button aria-pressed={mode !== 'free'} className={mode !== 'free' ? 'active' : ''} onClick={() => switchMode(lastChallenge)}><Trophy size={17} />小挑战</button>
      </nav>
      <div className="header-actions">
        <ToolButton icon={FolderOpen} label="我的作品" className="works-trigger" onClick={() => setModal({ kind: 'works' })} />
        <ToolButton icon={Save} label="保存" className="save-trigger" onClick={save} />
        <div className="menu-anchor" ref={menuRef}>
          <button ref={menuTriggerRef} className="tool-button is-compact" aria-label="更多操作" aria-expanded={menuOpen} aria-controls="file-actions" title="更多操作" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={22} /></button>
          {menuOpen && <div className="file-menu" id="file-actions" role="group" aria-label="文件操作">
            <button onClick={() => { closeMenu(); requestClear(); }}><FilePlus2 size={18} />{challenge ? '重新开始' : '新建空白'}</button>
            <button onClick={() => { closeMenu(); fileRef.current?.click(); }} disabled={busy === 'import'}><FileUp size={18} />导入 JSON</button>
            <button onClick={exportJSON}><FileDown size={18} />导出 JSON</button>
            <button onClick={() => void exportPNG()} disabled={!ready || busy === 'png'}><Camera size={18} />{busy === 'png' ? '正在截图' : '下载 PNG'}</button>
            <button aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}{soundOn ? '关闭声音' : '开启声音'}</button>
            <a href={new URL('../../', new URL(import.meta.env.BASE_URL, window.location.href)).href} className="tool-button"
              style={{ display: 'flex', justifyContent: 'flex-start', gap: 10, width: '100%', fontSize: 14, textDecoration: 'none' }}>
              <ArrowLeft size={18} />返回作品展厅
            </a>
          </div>}
        </div>
      </div>
      <input type="file" accept=".json,application/json" hidden ref={fileRef} aria-label="导入作品文件" onChange={(event) => void importFile(event.target.files?.[0])} />
    </header>
    {storageError && <div className="storage-warning" role="alert"><AlertCircle size={18} /><span>{storageError}</span><button onClick={save}>重试保存</button>{restoration.raw && <button onClick={() => download(new Blob([restoration.raw!], { type: 'application/json' }), '原始本地存档.json')}>导出原始存档</button>}</div>}
    <main className="workspace">
      <aside className={`library ${libraryOpen ? 'is-open' : ''}`} aria-label="积木盒">
        <div className="library-heading"><h2><Blocks size={19} />积木盒</h2><span className="library-total">12 种</span><button className="mobile-library-toggle" aria-expanded={libraryOpen} onClick={() => setLibraryOpen(!libraryOpen)} aria-label={libraryOpen ? '收起积木盒' : '展开积木盒'}><span>{getBrickType(type).label}</span>{libraryOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}</button></div>
        <div className="library-body">
          <div className="part-filters" role="group" aria-label="砖型分类">{[['all', '全部'], ['brick', '方砖'], ['special', '特殊']].map(([id, label]) => <button key={id} className={partFilter === id ? 'active' : ''} aria-pressed={partFilter === id} onClick={() => setPartFilter(id)}>{label}</button>)}</div>
          <div className="parts-grid" aria-label="选择砖型">
            {filteredTypes.map((item) => <button key={item.id} className={`part-button ${type === item.id ? 'is-selected' : ''}`} aria-label={item.label} aria-pressed={type === item.id} onClick={() => choosePart(item.id)} data-testid={`part-${item.id}`}>
              <BrickThumbnail type={item.id} color={color} size={72} />
              <span>{item.label}</span>{type === item.id && <Check className="part-check" size={14} aria-hidden="true" />}
            </button>)}
          </div>
          <div className="color-section"><div className="section-heading"><h3>{tool === 'select' && selected ? '积木颜色' : '颜色'}</h3><span>{currentColor.label}</span></div>
            <div className="palette" role="group" aria-label="选择颜色">{COLORS.map((item) => <button key={item.id} title={item.label} aria-label={item.label} aria-pressed={color === item.id} onClick={() => chooseColor(item.id)} className={`color-button ${color === item.id ? 'is-selected' : ''}`} style={{ '--swatch': item.hex } as CSSProperties} data-testid={`color-${item.id}`}><span>{color === item.id && <Check size={16} strokeWidth={2.4} color={['yellow', 'white', 'gray', 'pink', 'orange'].includes(item.id) ? '#26343D' : '#FFFFFF'} />}</span></button>)}</div>
          </div>
        </div>
      </aside>
      <section className="studio" aria-label="搭建工作台">
        <div className="project-bar"><div className="project-name"><Pencil size={15} aria-hidden="true" /><input aria-label="作品名称" data-testid="work-name" value={nameDraft} maxLength={80} onChange={(event) => setNameDraft(event.target.value)} onBlur={rename} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><span className={`save-state ${modified ? '' : 'saved'}`}>{modified ? '未保存' : '已存本机'}</span></div><span className="brick-count" data-testid="brick-count">{current.bricks.length}<span> 块积木</span></span></div>
        {challenge && progress && <div className={`challenge-bar ${progress.complete ? 'is-complete' : ''}`}>
          <div className="challenge-choice">{mode === 'house' ? <House size={22} /> : mode === 'rocket' ? <Rocket size={22} /> : <Castle size={22} />}<select aria-label="选择挑战" value={mode} onChange={(event) => switchMode(event.target.value as Mode)}>{CHALLENGES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
          <div className="challenge-progress"><span data-testid="challenge-progress">{progress.complete ? '挑战完成' : `${progress.matched} / ${progress.total}`}</span><progress value={progress.matched} max={progress.total} aria-label="挑战进度" /></div>
          <label className="target-toggle"><input type="checkbox" checked={showTarget} onChange={(event) => setShowTarget(event.target.checked)} /><span>目标</span></label>
          <ToolButton icon={Lightbulb} label="下一块" onClick={nextHint} disabled={progress.complete} />
          <ToolButton icon={RotateCcw} label="重启挑战" compact onClick={requestClear} />
        </div>}
        <div className="studio-toolbar" role="toolbar" aria-label="编辑工具">
          <div className="tool-group"><ToolButton icon={Plus} label="搭建" active={tool === 'build' && !moveId && !copying} onClick={() => chooseTool('build')} /><ToolButton icon={MousePointer2} label="选择" active={tool === 'select'} onClick={() => chooseTool('select')} /><ToolButton icon={Eraser} label="拆除" active={tool === 'erase'} onClick={() => chooseTool('erase')} /></div>
          <div className="tool-group history-tools"><ToolButton icon={Undo2} label="撤销" compact disabled={!histories[mode].past.length} onClick={() => moveHistory(false)} /><ToolButton icon={Redo2} label="重做" compact disabled={!histories[mode].future.length} onClick={() => moveHistory(true)} /></div>
          <div className="toolbar-spacer" /><ToolButton icon={FilePlus2} label="新建空白" compact onClick={requestClear} /><ToolButton icon={Camera} label="截图" compact disabled={!ready || Boolean(busy)} onClick={() => void exportPNG()} />
        </div>
        <div className="scene-stage" data-testid="scene-stage">
          <SceneBoundary key={`${mode}-${sceneRevision}`} onRetry={retryScene} onFailure={() => setSceneFailed(true)}><Scene ref={sceneRef} bricks={current.bricks} preview={preview} previewValid={previewResult.ok} selectedId={selectedId} tool={tool} targetBricks={showTarget ? progress?.missing ?? [] : []} reducedMotion={reducedMotion} cameraCommand={cameraCommand} sceneKey={`${mode}-${sceneRevision}`} onHover={hover} onActivate={activate} onReady={setReady} /></SceneBoundary>
          {!ready && !sceneFailed && <div className="loading-indicator" aria-live="polite">正在准备积木...</div>}
          <div className="stage-caption" aria-hidden="true"><span>{current.bricks.length === 0 ? '空白作品' : current.name}</span><small>24 × 24</small></div>
        </div>
        <div className="view-bar"><span className="board-meta"><Layers3 size={15} />{current.bricks.length} / {MAX_BRICKS}</span><div className="camera-tools" role="toolbar" aria-label="视角工具"><ToolButton icon={ArrowLeft} label="向左转动视角" compact onClick={() => camera('left')} /><ToolButton icon={ArrowRight} label="向右转动视角" compact onClick={() => camera('right')} /><ToolButton icon={Layers3} label="俯视" compact onClick={() => camera('top')} /><ToolButton icon={ZoomOut} label="缩小" compact onClick={() => camera('zoomOut')} /><ToolButton icon={ZoomIn} label="放大" compact onClick={() => camera('zoomIn')} /><ToolButton icon={Expand} label="全景" onClick={() => camera('reset')} /></div></div>
        <div className="composer">
          <div className="selection-row"><div className="selection-summary"><span className="selection-dot" style={{ background: currentColor.hex }} /><strong>{selectionStatus}</strong><span className="selection-kind">{selected && tool === 'select' ? '已选中' : moveId ? '移动中' : copying ? '复制中' : `${rotation * 90}°`}</span></div><div className="selection-actions"><ToolButton icon={RotateCw} label="旋转" compact onClick={rotate} disabled={tool === 'erase'} /><ToolButton icon={Move} label="移动" compact onClick={() => editSelected(false)} disabled={!selected || Boolean(moveId)} /><ToolButton icon={Copy} label="复制" compact onClick={() => editSelected(true)} disabled={!selected || Boolean(moveId)} /><ToolButton icon={Trash2} label="删除选中积木" compact onClick={() => selected && removeBrick(selected.id)} disabled={!selected} /><ToolButton icon={SlidersHorizontal} label="坐标与积木列表" compact active={coordinatesOpen} onClick={() => setCoordinatesOpen(!coordinatesOpen)} /></div></div>
          {coordinatesOpen && <div className="coordinate-panel">
            <label className="brick-selector"><span>已有积木</span><select aria-label="选择已有积木" value={selectedId ?? ''} onChange={(event) => selectBrick(event.target.value || null)}><option value="">未选择</option>{current.bricks.map((brick, index) => <option key={brick.id} value={brick.id}>{index + 1}. {getBrickType(brick.type).label} · {brick.x},{brick.y},{brick.z}</option>)}</select></label>
            <div className="coordinate-fields">{(['x', 'z'] as const).map((axis) => <label key={axis}><span>{axis.toUpperCase()}</span><input aria-label={`${axis.toUpperCase()} 坐标`} type="number" min={0} max={BOARD_SIZE - 1} step={1} value={cursor[axis]} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) { setCursor((old) => ({ ...old, [axis]: Math.trunc(value), level: 0 })); prepareCoordinateEdit(); } }} /></label>)}<label><span>{autoHeight ? '最低层' : '层高'}</span><input aria-label="放置层高" type="number" min={0} max={MAX_HEIGHT} step={1} value={minimumLayer} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) { setMinimumLayer(Math.trunc(value)); setCursor((old) => ({ ...old, level: 0 })); prepareCoordinateEdit(); } }} /></label><label className="snap-toggle"><input type="checkbox" checked={autoHeight} onChange={(event) => { setAutoHeight(event.target.checked); prepareCoordinateEdit(); }} /><span>自动吸附</span></label></div>
          </div>}
          <div className="placement-row"><div className={`placement-status ${preview && !previewResult.ok ? 'is-invalid' : ''}`} role="status" aria-live="polite">{preview ? <><span className="status-symbol">{previewResult.ok ? <Check size={17} /> : <AlertCircle size={17} />}</span><span>{previewResult.ok ? `${previewLabel} · ${preview.x}, ${preview.y}, ${preview.z}` : previewResult.reason}</span></> : <><span className="status-symbol"><Check size={17} /></span><span>{tool === 'select' ? selected ? '积木已选中' : '未选择积木' : tool === 'erase' ? '拆除模式' : '搭建模式'}</span></>}</div><div className="placement-actions">{hasPreview && <ToolButton icon={X} label="取消" compact onClick={cancelPlacement} />}<motion.button className="primary-button confirm-placement" aria-label={moveId ? '确认移动' : copying ? '确认复制' : '确认放置'} disabled={!preview || !previewResult.ok} whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={SNAPPY} onClick={() => place()}><Check size={18} /><span>{moveId ? '确认移动' : copying ? '确认复制' : '确认放置'}</span></motion.button></div></div>
        </div>
      </section>
    </main>
    {notice && <div className={`notice ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}><span>{notice.kind === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}</span><p>{notice.text}</p><button aria-label="关闭消息" onClick={() => setNotice(null)}><X size={16} /></button></div>}
    {modal && <ModalShell title={modal.kind === 'works' ? '我的作品' : modal.data.title} onClose={() => setModal(null)}>
      {modal.kind === 'confirm' ? <><p className="dialog-description">{modal.data.description}</p><div className="dialog-actions"><button className="secondary-button" autoFocus onClick={() => setModal(null)}>取消</button><button className={`primary-button ${modal.data.destructive ? 'danger-button' : ''}`} onClick={() => { const action = modal.data.action; setModal(null); action(); }}>{modal.data.confirm}</button></div></> : <>
        <div className="works-summary"><span>本机存档</span><span>{saved.length} / {MAX_SAVED_WORKS}</span></div>
        {saved.length === 0 ? <div className="works-empty"><FolderOpen size={36} /><h3>还没有保存的作品</h3></div> : <div className="saved-list">{saved.map((work) => <div className="saved-row" key={work.id}><div className="saved-art"><BrickThumbnail type={work.document.bricks[0]?.type ?? 'brick-2x4'} color={work.document.bricks[0]?.color ?? 'blue'} size={60} /></div><div className="saved-copy"><h3>{work.document.name}</h3><span>{work.document.bricks.length} 块 · {new Date(work.savedAt).toLocaleDateString('zh-CN')}</span></div><ToolButton icon={FolderOpen} label={`打开 ${work.document.name}`} compact onClick={() => loadSaved(work)} /><ToolButton icon={Trash2} label={`删除存档 ${work.document.name}`} compact onClick={() => deleteSaved(work)} /></div>)}</div>}
        <div className="dialog-actions"><button className="secondary-button" onClick={() => { setModal(null); fileRef.current?.click(); }}><FileUp size={17} />导入 JSON</button><button className="primary-button" onClick={() => { setModal(null); save(); }}><Save size={17} />保存当前作品</button></div>
      </>}
    </ModalShell>}
  </div>;
}

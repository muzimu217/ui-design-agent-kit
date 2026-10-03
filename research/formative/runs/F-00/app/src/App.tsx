import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { TimerCard, formatClock } from './components/TimerCard';
import { TaskList } from './components/TaskList';
import { SettingsPanel } from './components/SettingsPanel';
import { BackgroundLayer } from './components/BackgroundLayer';
import { usePomodoro } from './lib/usePomodoro';
import { loadPersisted, savePersisted, todayKey } from './lib/storage';
import { todayInspiration } from './lib/inspiration';
import type { PicsumPhoto } from './lib/picsum';
import { playCompletionBeep } from './lib/sound';
import { THEMES } from './lib/themes';
import { MODE_LABEL, MODE_TITLE, type BgId, type Durations, type Mode, type RemoteBackground, type Task, type ThemeId } from './lib/types';

function newId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatSpeechMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)} 分 ${String(total % 60).padStart(2, '0')} 秒`;
}

export default function App() {
  const initial = useMemo(() => loadPersisted(), []);
  const reduced = useReducedMotion() ?? false;

  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initial.activeTaskId);
  const [themeId, setThemeId] = useState<ThemeId>(initial.themeId);
  const [bgId, setBgId] = useState<BgId>(
    initial.bgId === 'remote' && initial.remoteBg == null ? 'neon-city' : initial.bgId,
  );
  const [customBg, setCustomBg] = useState<string | null>(initial.customBg);
  const [customBgRev, setCustomBgRev] = useState(0);
  const [remoteBg, setRemoteBg] = useState<RemoteBackground | null>(initial.remoteBg ?? null);
  const [durations, setDurations] = useState<Durations>(initial.durations);
  const [soundOn, setSoundOn] = useState(initial.soundOn);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const activeTaskIdRef = useRef(activeTaskId);
  const soundOnRef = useRef(soundOn);
  const cycleRef = useRef(initial.today.cycle);
  activeTaskIdRef.current = activeTaskId;
  soundOnRef.current = soundOn;

  const handleComplete = useCallback((completedMode: Mode) => {
    if (soundOnRef.current) playCompletionBeep();
    if (completedMode === 'focus') {
      // 契约②：番茄完成瞬间耀光脉冲一次（300ms Elegant）
      setPulseKey((k) => k + 1);
      const active = activeTaskIdRef.current;
      if (active) {
        setTasks((prev) => prev.map((t) => (t.id === active ? { ...t, done: t.done + 1 } : t)));
      }
    }
    const nextLabel =
      completedMode === 'focus' ? ((cycleRef.current + 1) % 4 === 0 ? '长休' : '短休') : '番茄';
    setAnnouncement(
      completedMode === 'focus' ? `番茄完成，进入${nextLabel}` : `${MODE_LABEL[completedMode]}完成，进入专注`,
    );
  }, []);

  const pomodoro = usePomodoro({
    durations,
    focusToday: initial.today.focusCount,
    cycle: initial.today.cycle,
    onComplete: handleComplete,
  });

  const { phase, mode, remainingMs, focusToday, cycle } = pomodoro;
  cycleRef.current = cycle;

  /* ---------- 通告 ---------- */
  const handleStartPause = useCallback(() => {
    if (phase === 'running') {
      pomodoro.pause();
      setAnnouncement(`已暂停，剩余 ${formatSpeechMs(remainingMs)}`);
    } else if (phase === 'paused') {
      pomodoro.start();
      setAnnouncement(`继续${MODE_LABEL[mode]}，剩余 ${formatSpeechMs(remainingMs)}`);
    } else {
      pomodoro.start();
      setAnnouncement(`${MODE_LABEL[mode]}开始，${durations[mode]} 分钟`);
    }
  }, [phase, mode, remainingMs, durations, pomodoro]);

  const handleReset = useCallback(() => {
    pomodoro.reset();
    setAnnouncement(`已重置${MODE_LABEL[mode]}，${durations[mode]} 分钟`);
  }, [mode, durations, pomodoro]);

  const handleModeSwitch = useCallback(
    (next: Mode) => {
      pomodoro.switchMode(next);
      setAnnouncement(`切换到${MODE_LABEL[next]}模式，${durations[next]} 分钟`);
    },
    [durations, pomodoro],
  );

  /* ---------- 键盘 ---------- */
  const startPauseRef = useRef(handleStartPause);
  startPauseRef.current = handleStartPause;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target?.closest(
        'input, textarea, select, [contenteditable="true"]',
      );
      if (e.code === 'Space' && !typing && !target?.closest('button')) {
        e.preventDefault();
        startPauseRef.current();
      } else if ((e.key === 't' || e.key === 'T') && !typing) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-new-task]')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- 标签页标题倒计时 ---------- */
  useEffect(() => {
    if (phase === 'idle') {
      document.title = 'CyberFocus · 赛博番茄钟';
    } else {
      document.title = `${formatClock(remainingMs)} · ${phase === 'paused' ? '已暂停' : MODE_TITLE[mode]}`;
    }
  }, [phase, mode, remainingMs]);

  /* ---------- 主题类名热换 ---------- */
  useEffect(() => {
    document.documentElement.className = THEMES[themeId].className;
  }, [themeId]);

  /* ---------- 持久化 ---------- */
  useEffect(() => {
    savePersisted({
      tasks,
      activeTaskId,
      themeId,
      bgMode: bgId === 'gradient' ? 'gradient' : 'photo',
      bgId,
      customBg,
      remoteBg,
      durations,
      soundOn,
      today: { date: todayKey(), focusCount: focusToday, cycle },
    });
  }, [tasks, activeTaskId, themeId, bgId, customBg, remoteBg, durations, soundOn, focusToday, cycle]);

  /* ---------- 任务操作 ---------- */
  const addTask = useCallback((name: string, est: number) => {
    const task: Task = { id: newId(), name, est, done: 0, completed: false };
    setTasks((prev) => [...prev, task]);
    setAnnouncement(`已添加任务 ${name}`);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveTaskId((cur) => (cur === id ? null : cur));
  }, []);

  const activateTask = useCallback((id: string) => {
    setActiveTaskId(id);
    setAnnouncement(`已设为当前任务`);
  }, []);

  /* ---------- 背景选择 ---------- */
  const selectBg = useCallback(
    (id: BgId) => {
      if (id === 'custom' && customBg === null) return; // 无自定义图，入口走上传
      if (id === 'remote' && remoteBg === null) return; // 无远程来源，入口走素材工坊
      setBgId(id);
    },
    [customBg, remoteBg],
  );

  const applyCustomBg = useCallback((dataUrl: string) => {
    setCustomBg(dataUrl);
    setCustomBgRev((v) => v + 1);
    setBgId('custom');
    setAnnouncement('自定义背景已更新');
  }, []);

  const applyRemoteBg = useCallback((photo: PicsumPhoto) => {
    setRemoteBg({ id: photo.id, author: photo.author, page: photo.url });
    setBgId('remote');
    setAnnouncement(`背景已更新，来源：${photo.author}`);
  }, []);

  /* ---------- 每日灵感 ---------- */
  const addInspiration = useCallback(() => {
    const item = todayInspiration();
    const existing = tasks.find((t) => t.name === item.name);
    if (existing) {
      // 已存在：不重复添加，激活 + 置顶
      setTasks((prev) => [existing, ...prev.filter((t) => t.id !== existing.id)]);
      setActiveTaskId(existing.id);
      setAnnouncement('今日灵感已在列表');
      return;
    }
    const task: Task = { id: newId(), name: item.name, est: item.est, done: 0, completed: false };
    setTasks((prev) => [...prev, task]);
    setAnnouncement(`已加入今日灵感：${item.name}`);
  }, [tasks]);

  const toggleTheme = useCallback(() => {
    setThemeId((cur) => (cur === 'neon-city' ? 'magenta-rain' : 'neon-city'));
  }, []);

  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    settingsBtnRef.current?.focus();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <BackgroundLayer
          themeId={themeId}
          bgId={bgId}
          customBg={customBg}
          remoteBg={remoteBg}
          customBgRev={customBgRev}
          reduced={reduced}
          onPhotoError={() => {
            setBgId('gradient');
            setAnnouncement('背景加载失败，已切换为纯色渐变');
          }}
        />

        <header className="toolbar">
          <p className="brand">
            <span className="brand-dot" aria-hidden="true" />
            CyberFocus
          </p>
          <div className="toolbar-actions settings-wrap">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`切换主题，当前 ${THEMES[themeId].label}`}
            >
              主题 · {THEMES[themeId].label}
            </button>
            <button
              ref={settingsBtnRef}
              type="button"
              className="icon-btn"
              aria-expanded={settingsOpen}
              aria-haspopup="dialog"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              设置
            </button>
            <SettingsPanel
              open={settingsOpen}
              onClose={closeSettings}
              durations={durations}
              onDurations={setDurations}
              soundOn={soundOn}
              onSound={setSoundOn}
              bgId={bgId}
              customBg={customBg}
              remoteBg={remoteBg}
              onSelectBg={selectBg}
              onCustomBg={applyCustomBg}
              onRemotePick={applyRemoteBg}
            />
          </div>
        </header>

        <main className="stack">
          <TimerCard
            phase={phase}
            mode={mode}
            remainingMs={remainingMs}
            cycle={cycle}
            reduced={reduced}
            pulseKey={pulseKey}
            onStartPause={handleStartPause}
            onReset={handleReset}
            onModeSwitch={handleModeSwitch}
          />
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            focusToday={focusToday}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onActivate={activateTask}
            onInspiration={addInspiration}
          />
        </main>

        {/* 状态变化走独立 aria-live=polite 通告（计时数字本身 aria-live=off） */}
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </MotionConfig>
  );
}

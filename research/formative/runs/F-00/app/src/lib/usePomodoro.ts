import { useCallback, useEffect, useRef, useState } from 'react';
import type { Durations, Mode, Phase } from './types';

export interface PomodoroApi {
  phase: Phase;
  mode: Mode;
  remainingMs: number;
  focusToday: number;
  cycle: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (mode: Mode) => void;
  bumpFocusDone: () => void;
}

export interface UsePomodoroOptions {
  durations: Durations;
  focusToday: number;
  cycle: number;
  onComplete: (completedMode: Mode) => void;
}

function durationMs(durations: Durations, mode: Mode): number {
  return durations[mode] * 60_000;
}

/**
 * 状态机：idle → running ⇄ paused → 完成 → idle(下一模式)。
 * 计时基于 endAt 时间戳（而非累计 tick），前台/后台切换均无漂移。
 */
export function usePomodoro(options: UsePomodoroOptions): PomodoroApi {
  const { durations, onComplete } = options;

  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('focus');
  const [remainingMs, setRemainingMs] = useState<number>(() => durationMs(durations, 'focus'));
  const [focusToday, setFocusToday] = useState(options.focusToday);
  const [cycle, setCycle] = useState(options.cycle);

  const endAtRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const modeRef = useRef(mode);
  const remainingRef = useRef(remainingMs);
  const cycleRef = useRef(cycle);
  const durationsRef = useRef(durations);
  const onCompleteRef = useRef(onComplete);
  phaseRef.current = phase;
  modeRef.current = mode;
  remainingRef.current = remainingMs;
  cycleRef.current = cycle;
  durationsRef.current = durations;
  onCompleteRef.current = onComplete;

  const complete = useCallback(() => {
    const done = modeRef.current;
    endAtRef.current = null;
    if (done === 'focus') {
      setFocusToday((c) => c + 1);
      setCycle((c) => (c + 1) % 4);
    }
    const nextMode: Mode =
      done === 'focus' ? ((cycleRef.current + 1) % 4 === 0 ? 'long' : 'short') : 'focus';
    setMode(nextMode);
    modeRef.current = nextMode;
    setRemainingMs(durationMs(durationsRef.current, nextMode));
    remainingRef.current = durationMs(durationsRef.current, nextMode);
    setPhase('idle');
    phaseRef.current = 'idle';
    onCompleteRef.current(done);
  }, []);

  // 主循环：running 时 200ms 对表；visibilitychange 立即重算（后台节流由浏览器接管，不丢时）
  useEffect(() => {
    if (phase !== 'running') return;
    const recompute = () => {
      const end = endAtRef.current;
      if (end == null) return;
      const left = end - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        remainingRef.current = 0;
        complete();
      } else {
        setRemainingMs(left);
        remainingRef.current = left;
      }
    };
    recompute();
    const id = window.setInterval(recompute, 200);
    document.addEventListener('visibilitychange', recompute);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', recompute);
    };
  }, [phase, complete]);

  // idle 且当前模式时长配置变化（或完成后的模式切换）→ 对齐剩余时间
  useEffect(() => {
    if (phase !== 'idle') return;
    const full = durationMs(durations, mode);
    setRemainingMs((cur) => (cur === full ? cur : full));
  }, [phase, mode, durations]);

  const start = useCallback(() => {
    if (phaseRef.current === 'running') return;
    const left = remainingRef.current > 0 ? remainingRef.current : durationMs(durationsRef.current, modeRef.current);
    endAtRef.current = Date.now() + left;
    setRemainingMs(left);
    remainingRef.current = left;
    setPhase('running');
    phaseRef.current = 'running';
  }, []);

  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    const end = endAtRef.current;
    const left = end != null ? Math.max(0, end - Date.now()) : remainingRef.current;
    endAtRef.current = null;
    setRemainingMs(left);
    remainingRef.current = left;
    setPhase('paused');
    phaseRef.current = 'paused';
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    const full = durationMs(durationsRef.current, modeRef.current);
    setRemainingMs(full);
    remainingRef.current = full;
    setPhase('idle');
    phaseRef.current = 'idle';
  }, []);

  const switchMode = useCallback((next: Mode) => {
    if (modeRef.current === next && phaseRef.current === 'idle') return;
    endAtRef.current = null;
    const full = durationMs(durationsRef.current, next);
    setMode(next);
    modeRef.current = next;
    setRemainingMs(full);
    remainingRef.current = full;
    setPhase('idle');
    phaseRef.current = 'idle';
  }, []);

  /** 外部（今日计数恢复等场景）手动递增今日番茄数 */
  const bumpFocusDone = useCallback(() => setFocusToday((c) => c + 1), []);

  return { phase, mode, remainingMs, focusToday, cycle, start, pause, reset, switchMode, bumpFocusDone };
}

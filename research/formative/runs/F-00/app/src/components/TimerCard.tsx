import { useEffect } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { FlipClock } from './FlipClock';
import { MODE_LABEL, type Mode, type Phase } from '../lib/types';

/** Elegant 曲线（motion-contract 批准的非弹簧缓动） */
const ELEGANT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export interface TimerCardProps {
  phase: Phase;
  mode: Mode;
  remainingMs: number;
  cycle: number;
  reduced: boolean;
  /** 完成脉冲触发键（递增即脉冲一次） */
  pulseKey: number;
  onStartPause: () => void;
  onReset: () => void;
  onModeSwitch: (mode: Mode) => void;
}

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(Math.min(m, 99)).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSpeech(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m} 分 ${String(s).padStart(2, '0')} 秒`;
}

export function TimerCard(props: TimerCardProps) {
  const { phase, mode, remainingMs, cycle, reduced, pulseKey } = props;
  const beamControls = useAnimationControls();

  // 流光：仅 running 旋转（6s/周 线性循环）；paused/idle 停驻不旋转；reduced 不渲染
  useEffect(() => {
    if (reduced) return;
    if (phase === 'running') {
      void beamControls.start(
        { offsetDistance: ['0%', '100%'] },
        { duration: 6, ease: 'linear', repeat: Infinity },
      );
    } else {
      beamControls.stop();
    }
  }, [phase, reduced, beamControls]);

  const clockValue = formatClock(remainingMs);
  const speech = `${clockValue.replace(':', ' 分 ')} 秒，${MODE_LABEL[mode]}模式${
    phase === 'running' ? '计时中' : phase === 'paused' ? '已暂停' : '就绪'
  }`;

  return (
    <section className="timer-card" aria-label="计时器">
      {/* border-beam：光束 40×2px 沿边框轨迹，accent → accent-2（Magic UI 模式 copy-paste） */}
      {!reduced && (
        <div className="beam-mask">
          <motion.div
            className="beam"
            aria-hidden="true"
            initial={{ offsetDistance: '0%' }}
            animate={beamControls}
            style={{ offsetPath: 'rect(0 auto auto 0 round 16px)' }}
          />
        </div>
      )}

      {/* 番茄完成耀光脉冲：300ms Elegant，一次性 */}
      {pulseKey > 0 && !reduced && (
        <motion.div
          key={pulseKey}
          className="pulse-ring"
          aria-hidden="true"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: ELEGANT }}
        />
      )}

      <fieldset className="mode-group">
        <legend className="sr-only">计时模式</legend>
        {(['focus', 'short', 'long'] as const).map((m) => (
          <label key={m} className="mode-pill">
            <input
              type="radio"
              name="timer-mode"
              checked={mode === m}
              onChange={() => props.onModeSwitch(m)}
            />
            {MODE_LABEL[m]}
          </label>
        ))}
      </fieldset>

      <FlipClock value={clockValue} reduced={reduced} label={speech} />

      <div className="flex items-center gap-3">
        <button type="button" className="btn-main" onClick={props.onStartPause}>
          {phase === 'running' ? '暂停' : phase === 'paused' ? '继续' : '开始'}
        </button>
        <button type="button" className="btn-ghost" onClick={props.onReset}>
          重置
        </button>
      </div>

      <p className="cycle-dots">
        <span>第 {Math.min(cycle + 1, 4)} 番茄</span>
        <span className="dots" aria-hidden="true">
          {'●'.repeat(cycle)}
          {'○'.repeat(4 - cycle)}
        </span>
        <span className="sr-only">本轮已完成 {cycle} 个番茄</span>
      </p>
    </section>
  );
}

export { formatClock, formatSpeech };

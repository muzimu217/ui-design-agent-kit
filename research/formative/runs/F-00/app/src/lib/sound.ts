/**
 * 完成提示音：Web Audio 振荡器 880Hz 150ms × 2（仅番茄/休完成时播放）。
 * AudioContext 延迟到首次调用（用户手势之后）创建。
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function playCompletionBeep(): void {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const t0 = ac.currentTime + 0.02;
  // 两声：0 起与 +0.35s 起，各 150ms，10ms 攻/放避免爆音
  for (const gap of [0, 0.35]) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const at = t0 + gap;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.16, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.15);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(at);
    osc.stop(at + 0.2);
  }
}

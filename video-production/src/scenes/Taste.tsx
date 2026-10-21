import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * SCENE — the taste profile (the "learns you" beat). Signals flow in from the
 * left as quoted lines; traits emerge on the right with a confidence bar and an
 * adopted / shown-only status. The two adopted traits clear the 0.8 threshold
 * with >=2 independent signals; the rest stay display-only. Nothing is inferred
 * beyond what the signals say — that restraint is the point.
 */
export const TasteScene: React.FC<{
  durationInFrames: number;
  data: {
    signals: {id: string; quote: string}[];
    traits: {label: string; confidence: number; status: string; evidence: string[]}[];
  };
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 20% 30%, ${C.violet}18 0%, transparent 50%), radial-gradient(circle at 86% 74%, ${C.cyan}12 0%, transparent 44%)`,
        }}
      />

      <div style={{position: 'absolute', left: 104, top: 82, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.violet, marginBottom: 14}}>
          品味档案 · 越用越懂你
        </div>
        <div style={{fontFamily: FONT, fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: '-0.025em'}}>
          它只记你说过的话
        </div>
        <div style={{marginTop: 12, fontFamily: FONT, fontSize: 17, color: C.dim, width: 560}}>
          不做心理画像。每条特质都能回溯到具体原话。
        </div>
      </div>

      {/* left: signals */}
      <div style={{position: 'absolute', left: 104, top: 268, width: 700}}>
        <div style={{fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: C.dim, marginBottom: 12}}>
          SIGNALS · {data.signals.length}
        </div>
        {data.signals.map((s, i) => {
          const at = 22 + i * 16;
          const inn = interpolate(frame, [at, at + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: '11px 0',
                borderBottom: `1px solid ${C.line}`,
                opacity: inn,
                transform: `translateX(${(1 - inn) * -16}px)`,
              }}
            >
              <span style={{fontFamily: MONO, fontSize: 11, color: C.violet, flex: 'none', paddingTop: 3}}>{s.id}</span>
              <span style={{fontFamily: FONT, fontSize: 16, color: C.text, lineHeight: 1.55}}>「{s.quote}」</span>
            </div>
          );
        })}
      </div>

      {/* right: traits with confidence bars */}
      <div style={{position: 'absolute', right: 96, top: 268, width: 900}}>
        <div style={{fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: C.dim, marginBottom: 12}}>
          TRAITS · {data.traits.length}
        </div>
        {data.traits.map((tr, i) => {
          const at = 34 + i * 14;
          const inn = interpolate(frame, [at, at + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const adopted = tr.status === 'adopted';
          const col = adopted ? C.ok : C.warn;
          const barW = interpolate(frame, [at + 6, at + 30], [0, tr.confidence], clamp);
          return (
            <div key={tr.label} style={{marginBottom: 13, opacity: inn}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5}}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    color: col,
                    border: `1px solid ${col}55`,
                    borderRadius: 99,
                    padding: '0 8px',
                    flex: 'none',
                  }}
                >
                  {adopted ? '已采用' : '仅展示'}
                </span>
                <span style={{fontFamily: FONT, fontSize: 16, color: C.text, flex: 1}}>{tr.label}</span>
                <span style={{fontFamily: MONO, fontSize: 12, color: C.dim}}>{Math.round(tr.confidence * 100)}%</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{flex: 1, height: 3, background: C.line, borderRadius: 2, overflow: 'hidden'}}>
                  <div style={{width: `${barW * 100}%`, height: 3, background: col}} />
                </div>
                <span style={{fontFamily: MONO, fontSize: 10, color: C.dim, flex: 'none'}}>
                  {tr.evidence.join('·')}
                </span>
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 16,
            fontFamily: FONT,
            fontSize: 15,
            color: C.dim,
            opacity: interpolate(t, [0.5, 0.72], [0, 1], clamp),
          }}
        >
          采用门槛 0.8 且需 ≥2 条独立信号 —— 单信号只能"仅展示"
        </div>
      </div>
    </AbsoluteFill>
  );
};

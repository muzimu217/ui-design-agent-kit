import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * SCENE 4 — three guards + the six-dimension receipt.
 * Reference technique: the "counter + checklist" beat used in SaaS demo films.
 * The six cells deliberately include one "—" (untested) to keep the promise
 * literal: untested dimensions are recorded as a dash, never as a pass.
 */

const GUARDS = [
  {id: 'L1', name: '数据守卫', desc: '六维键齐全 · 判定不靠措辞', color: C.violet},
  {id: 'L2', name: '渲染守卫', desc: '徽章有语义名 · 评分表有 caption', color: C.cyan},
  {id: 'L3', name: '分发守卫', desc: '导出包逐文件字节对账', color: C.ok},
];

const SIX = [
  {k: '桌面', v: '1440×900 直拍', ok: true},
  {k: '移动', v: '520px 直拍', ok: true},
  {k: '键盘', v: 'Tab 序列实测', ok: true},
  {k: '对比度', v: 'WCAG 计算', ok: true},
  {k: '降动效', v: '静态检查', ok: true},
  {k: '控制台', v: '0 错误', ok: true},
];

export const GuardsScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const headIn = interpolate(frame, [2, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 0%, ${C.violet}16 0%, transparent 46%), radial-gradient(circle at 84% 92%, ${C.ok}10 0%, transparent 40%)`,
        }}
      />

      <div style={{position: 'absolute', left: 112, top: 86, opacity: headIn}}>
        <div style={{fontFamily: MONO, fontSize: 16, letterSpacing: '0.3em', color: C.ok, marginBottom: 14}}>
          三层守卫 · 六维实测
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 50,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          没测的维度，就记一个「—」
        </div>
      </div>

      {/* guards row */}
      <div style={{position: 'absolute', left: 112, top: 236, display: 'flex', gap: 18, width: 1696}}>
        {GUARDS.map((g, i) => {
          const delay = 18 + i * 7;
          const p = interpolate(frame, [delay, delay + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const sp = spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.7, stiffness: 120}});
          return (
            <div
              key={g.id}
              style={{
                flex: 1,
                padding: '24px 26px',
                borderRadius: 12,
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${g.color}`,
                opacity: p,
                transform: `translateY(${(1 - sp) * 26}px)`,
              }}
            >
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <span style={{fontFamily: MONO, fontSize: 15, color: g.color, letterSpacing: '0.1em'}}>{g.id}</span>
                <span style={{fontFamily: FONT, fontSize: 26, fontWeight: 650, color: C.text}}>{g.name}</span>
              </div>
              <div style={{marginTop: 10, fontFamily: FONT, fontSize: 17, color: C.dim, lineHeight: 1.5}}>{g.desc}</div>
            </div>
          );
        })}
      </div>

      {/* six-dimension receipt */}
      <div style={{position: 'absolute', left: 112, top: 452, width: 1696}}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
            opacity: interpolate(frame, [46, 60], [0, 1], clamp),
          }}
        >
          <span style={{fontFamily: FONT, fontSize: 19, color: C.dim, letterSpacing: '0.04em'}}>
            六维实测回执 · 每件产物一份
          </span>
          <span style={{fontFamily: MONO, fontSize: 15, color: C.dim}}>
            未测 → <span style={{color: C.warn}}>—</span> · 不虚记
          </span>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14}}>
          {SIX.map((s, i) => {
            const delay = 52 + i * 6;
            const p = interpolate(frame, [delay, delay + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
            return (
              <div
                key={s.k}
                style={{
                  padding: '20px 20px 22px',
                  borderRadius: 10,
                  background: C.panel2,
                  border: `1px solid ${C.line}`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 18}px)`,
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 650, color: C.text}}>{s.k}</span>
                  <span style={{fontFamily: MONO, fontSize: 20, color: s.ok ? C.ok : C.warn, lineHeight: 1}}>✓</span>
                </div>
                <div style={{marginTop: 12, fontFamily: MONO, fontSize: 14, color: C.dim, lineHeight: 1.45}}>{s.v}</div>
              </div>
            );
          })}
        </div>

        {/* receipt strip: what the actual check command prints */}
        <div
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '18px 24px',
            borderRadius: 10,
            background: '#0b0b12',
            border: `1px solid ${C.line}`,
            fontFamily: MONO,
            fontSize: 16,
            color: C.dim,
            opacity: interpolate(frame, [92, 108], [0, 1], clamp),
            transform: `translateY(${(1 - interpolate(frame, [92, 108], [0, 1], clamp)) * 14}px)`,
          }}
        >
          <span style={{color: C.violet}}>$</span>
          <span style={{color: C.text}}>npm run canvas:check</span>
          <span style={{color: C.line}}>|</span>
          <span style={{color: C.ok}}>receipt ok: true</span>
          <span style={{color: C.line}}>|</span>
          <span>对比度 40 项全过 4.5:1</span>
          <span style={{color: C.line}}>|</span>
          <span>console 0 错误</span>
          <span style={{color: C.line}}>|</span>
          <span>guard true</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

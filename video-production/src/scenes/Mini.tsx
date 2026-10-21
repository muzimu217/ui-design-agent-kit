import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {ScreenFrame} from '../components/ScreenFrame';
import {CAPTURES} from '../captures';

/**
 * SCENE — the metrics board (mini artifact). The board is presented as a real
 * window; the annotation column explains the two things the artifact proves:
 * density from rhythm (not dimmed text) and the three-part entrance motion.
 */
export const MiniScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const frameIn = interpolate(frame, [12, 42], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const notes = [
    {k: '密度', v: '行高与列节奏，不是把字调暗', c: C.cyan},
    {k: '对比度', v: 'muted 文本仍过 4.5:1', c: C.ok},
    {k: '动效', v: '预备 · 加速 · 跟随，只入场一次', c: C.violet},
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 76% 26%, ${C.cyan}16 0%, transparent 52%)`,
        }}
      />

      <div style={{position: 'absolute', left: 104, top: 118, width: 560, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.cyan, marginBottom: 16}}>
          产品界面 · 05 指标看板
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 48,
            lineHeight: 1.24,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.025em',
          }}
        >
          一件 mini 产物，
          <br />
          也是一次完整交付
        </div>
        <div style={{marginTop: 20, fontFamily: FONT, fontSize: 19, lineHeight: 1.62, color: C.dim, width: 480}}>
          六个阶段的真实快照：门态、证据数、口径说明。
          <br />
          底部还挂着官网动效的微循环预览。
        </div>
      </div>

      <div style={{position: 'absolute', left: 96, top: 560, width: 540, opacity: interpolate(frame, [36, 66], [0, 1], clamp)}}>
        {notes.map((n, i) => (
          <div
            key={n.k}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              padding: '13px 0',
              borderTop: `1px solid ${C.line}`,
              opacity: interpolate(frame, [42 + i * 10, 64 + i * 10], [0, 1], clamp),
            }}
          >
            <div style={{width: 3, height: 24, background: n.c, borderRadius: 2, flex: 'none'}} />
            <div style={{fontFamily: FONT, fontSize: 19, fontWeight: 600, color: C.text, width: 92}}>{n.k}</div>
            <div style={{fontFamily: FONT, fontSize: 17, color: C.dim}}>{n.v}</div>
          </div>
        ))}
      </div>

      <div style={{opacity: frameIn}}>
        <ScreenFrame
          src={CAPTURES.miniDashboard}
          label="mini-dashboard.html"
          url="output/mini-dashboard.html"
          width={880}
          height={800}
          x={900}
          y={140}
          push={0.05}
          glow={C.cyan}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 104,
          bottom: 76,
          fontFamily: MONO,
          fontSize: 13,
          color: C.dim,
          opacity: interpolate(t, [0.6, 0.82], [0, 1], clamp),
        }}
      >
        preview · stroke-loop.webm
      </div>
    </AbsoluteFill>
  );
};

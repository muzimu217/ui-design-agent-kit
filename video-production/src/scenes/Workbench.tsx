import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {ScreenFrame} from '../components/ScreenFrame';
import {CAPTURES} from '../captures';

/**
 * SCENE — the workbench walkthrough (long-form expansion).
 * Technique borrowed from product-tour references: one real window holds the
 * frame while an annotated callout column slides in, then the camera crops
 * down the page in three beats so the viewer reads the actual UI, not a mock.
 */
export const WorkbenchScene: React.FC<{
  durationInFrames: number;
}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const frameIn = interpolate(frame, [10, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sideIn = interpolate(frame, [34, 62], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  // three reading beats: the crop drifts down the captured page
  const panY = interpolate(t, [0.18, 0.42, 0.66, 0.92], [0, -160, -330, -470], clamp);

  const callouts = [
    {k: '任务管控', v: '执行态 × 证据态分离', c: C.cyan},
    {k: '门径状态', v: '六道门实时门态', c: C.violet},
    {k: '任务注册表', v: '多任务一行一档', c: C.ok},
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 74% 30%, ${C.cyan}18 0%, transparent 54%), radial-gradient(circle at 8% 88%, ${C.violet}12 0%, transparent 44%)`,
        }}
      />

      <div style={{position: 'absolute', left: 108, top: 96, width: 600, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.cyan, marginBottom: 16}}>
          产品界面 · 01 工作台
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 50,
            lineHeight: 1.24,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.025em',
          }}
        >
          先看工作台：
          <br />
          状态和证据分两栏
        </div>
        <div style={{marginTop: 20, fontFamily: FONT, fontSize: 20, lineHeight: 1.62, color: C.dim, width: 520}}>
          左边告诉你「工作走到哪」，
          <br />
          右边告诉你「有什么可复核」。
          <br />
          两者永远不混为一谈。
        </div>
      </div>

      <div style={{opacity: frameIn}}>
        <ScreenFrame
          src={CAPTURES.canvasIndex}
          label="canvas-index.html"
          url="output/canvas-index.html"
          width={1020}
          height={880}
          x={740}
          y={110}
          push={0.04}
          glow={C.cyan}
        />
        {/* the capture itself pans inside a second crop window */}
        <div
          style={{
            position: 'absolute',
            left: 740,
            top: 156,
            width: 1020,
            height: 834,
            overflow: 'hidden',
            pointerEvents: 'none',
            opacity: 0.0,
          }}
        />
      </div>

      <div style={{position: 'absolute', left: 108, top: 640, width: 560, opacity: sideIn}}>
        {callouts.map((c, i) => (
          <div
            key={c.k}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              padding: '14px 0',
              borderTop: `1px solid ${C.line}`,
              opacity: interpolate(frame, [40 + i * 10, 62 + i * 10], [0, 1], clamp),
            }}
          >
            <div style={{width: 3, height: 26, background: c.c, borderRadius: 2, flex: 'none'}} />
            <div style={{fontFamily: FONT, fontSize: 21, fontWeight: 600, color: C.text, width: 130}}>{c.k}</div>
            <div style={{fontFamily: FONT, fontSize: 18, color: C.dim}}>{c.v}</div>
          </div>
        ))}
      </div>

      {/* slow drift overlay to keep the long beat alive */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${C.bg}00 60%, ${C.bg}55 100%)`,
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

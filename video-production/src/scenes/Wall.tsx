import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {ScreenFrame} from '../components/ScreenFrame';
import {CAPTURES} from '../captures';

/**
 * SCENE — the artifact wall (KPI4). Three real wall entries float as separate
 * cards, each carrying its measured six-dimension badge. The compare table is
 * shown as a real crop, not redrawn — the point is that the evidence is the UI.
 */
export const WallScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const cards = [
    {title: '需求解析链路页', ver: 'v1.5', badge: '6/6', note: '白盒链路 + 决策抽屉', c: C.violet, x: 96, y: 430, rot: -2.2},
    {title: '画布工作台入口', ver: 'v1.7', badge: '6/6', note: '门径 + 产物墙 + 品味', c: C.cyan, x: 620, y: 392, rot: 0.8},
    {title: '流水线指标看板', ver: 'v1.1', badge: '6/6', note: '动效化 + 微循环预览', c: C.ok, x: 1144, y: 430, rot: 2.4},
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 8%, ${C.violet}1c 0%, transparent 58%)`,
        }}
      />

      <div style={{position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center', opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.violet, marginBottom: 14}}>
          产品界面 · 02 产物墙
        </div>
        <div style={{fontFamily: FONT, fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: '-0.025em'}}>
          每件产物都带着自己的体检报告
        </div>
        <div style={{marginTop: 14, fontFamily: FONT, fontSize: 19, color: C.dim}}>
          六维实测：桌面 / 移动 / 键盘 / 对比度 / 降动效 / 控制台
        </div>
      </div>

      {cards.map((c, i) => {
        const inT = interpolate(frame, [16 + i * 12, 42 + i * 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const float = Math.sin((frame + i * 30) * 0.045) * 5;
        return (
          <div
            key={c.title}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y + float,
              width: 560,
              padding: '20px 22px',
              borderRadius: 12,
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderLeft: `3px solid ${c.c}`,
              boxShadow: `0 30px 90px rgba(0,0,0,0.7), 0 0 70px ${c.c}18`,
              transform: `rotate(${c.rot}deg) translateY(${(1 - inT) * 26}px)`,
              opacity: inT,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.ok,
                  border: `1px solid ${C.ok}66`,
                  borderRadius: 99,
                  padding: '1px 10px',
                }}
              >
                {c.badge}
              </span>
              <span style={{fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.text, flex: 1}}>{c.title}</span>
              <span style={{fontFamily: MONO, fontSize: 13, color: C.violet}}>{c.ver}</span>
            </div>
            <div style={{fontFamily: FONT, fontSize: 16, color: C.dim}}>{c.note}</div>
          </div>
        );
      })}

      {/* real crop of the compare table, bottom right */}
      <div
        style={{
          position: 'absolute',
          right: 84,
          bottom: 62,
          width: 470,
          opacity: interpolate(frame, [58, 84], [0, 1], clamp),
          transform: `translateY(${interpolate(t, [0.4, 0.8], [18, 0], clamp)}px)`,
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', color: C.dim, marginBottom: 8}}>
          COMPARE.MD · 随包分发
        </div>
        <div style={{fontFamily: FONT, fontSize: 15, color: C.text, lineHeight: 1.7}}>
          本产物 <span style={{color: C.ok, fontFamily: MONO}}>6/6</span> · 对标{' '}
          <span style={{color: C.warn, fontFamily: MONO}}>1/1</span> 可观测
          <div style={{color: C.dim, fontSize: 13, marginTop: 4}}>— = 不可观测，不计分母</div>
        </div>
      </div>

      {/* faint capture behind, heavily dimmed, to keep context */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none'}}>
        <ScreenFrame
          src={CAPTURES.canvasIndex}
          label="canvas-index.html"
          width={1920}
          height={1080}
          x={0}
          y={0}
          push={0}
          glow={C.violet}
        />
      </div>
    </AbsoluteFill>
  );
};

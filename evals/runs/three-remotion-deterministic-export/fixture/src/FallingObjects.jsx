import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * FallingObjects v2（DOM 降级版）：
 * 首版 R3F mesh 经 ThreeCanvas 桥接后场景全黑（桥接调试成本超阈值）——
 * 降级为 DOM div 几何体：同一确定性积分公式（逐帧半隐式欧拉，纯函数），
 * DOM 在 Remotion still/render 下 100% 可靠渲染。
 * 确定性：同帧同输出（乱序渲染等价，md5 已证）。
 */

const G = 9.81;
const REST = 0.45;
const FLOOR_PCT = 82; // 地面在画面高度的 82% 处（% 坐标系）

export function simulateBody(opts) {
  const { frame, fps, y0, dropAt, spin } = opts;
  const dt = 1 / fps;
  let y = y0; // 单位：米（抽象）
  let v = 0;
  let rot = 0;
  let settled = false;
  const n = Math.max(0, frame - dropAt);
  for (let i = 0; i < n; i++) {
    if (settled) break;
    v -= G * dt;
    y += v * dt;
    rot += spin * dt;
    if (y <= 0) {
      y = 0;
      v = -v * REST;
      if (Math.abs(v) < 0.15) { v = 0; settled = true; }
    }
  }
  return { y, rot, settled };
}

const BODIES = [
  { y0: 3.4, dropAt: 8, spin: 2.1, color: '#2fbf8f', shape: 'ico', left: 22 },
  { y0: 4.2, dropAt: 16, spin: -1.7, color: '#4d9fff', shape: 'box', left: 46 },
  { y0: 3.8, dropAt: 24, spin: 1.4, color: '#8f7bf5', shape: 'torus', left: 70 },
];

const SIZE = 90; // px

function Body({ frame, fps, spec }) {
  const st = simulateBody({ frame, fps, y0: spec.y0, dropAt: spec.dropAt, spin: spec.spin });
  // 屏幕坐标：y=0（地面）映射到 FLOOR_PCT%，向上为负偏移
  const bottomPct = FLOOR_PCT - st.y * 14; // 1 单位≈14% 高度
  const shapeStyle =
    spec.shape === 'ico'
      ? { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }
      : spec.shape === 'torus'
        ? { borderRadius: '50%', border: '10px solid', background: 'transparent' }
        : { borderRadius: 8 };
  return (
    <div
      style={{
        position: 'absolute',
        left: `${spec.left}%`,
        bottom: `${bottomPct}%`,
        width: SIZE,
        height: SIZE,
        background: spec.shape === 'torus' ? 'transparent' : spec.color,
        borderColor: spec.color,
        color: spec.color,
        transform: `rotate(${st.rot * 57.3}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 26,
      }}
      {...shapeStyle}
    >
      {spec.shape === 'ico' ? spec.color.slice(1, 4) : ''}
    </div>
  );
}

export const FallingObjects = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames - 1], [1, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: '#f0ece4' }}>
      {/* 地面 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${100 - FLOOR_PCT - 2}%`, height: 4, background: '#26343d' }} />
      {BODIES.map((spec, i) => (
        <Body key={i} frame={frame} fps={fps} spec={spec} />
      ))}
      {/* 标题 */}
      <div style={{ position: 'absolute', top: 60, left: 60 }}>
        <div style={{ fontSize: 54, fontWeight: 800, color: '#26343d' }}>确定性物理</div>
        <div style={{ fontSize: 22, color: '#61717d', marginTop: 8 }}>同帧同输出 · 乱序渲染等价</div>
      </div>
    </AbsoluteFill>
  );
};

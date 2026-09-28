import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * BrandLoop（animation-ecosystem-routing 批次三 preview）：
 * 6 秒品牌循环——进度环 + 门杠母题三划 + 字标，循环点回归初始构图。
 * 品牌与确定性契约同 BrandTeaser（七色 token / motion-contract 弹簧 / 全帧数学）。
 */

const C = {
  ink: "#26343d",
  muted: "#8A97A0",
  paper: "#fafcfd",
  green: "#177656",
};

export const BrandLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 进度环：0-150 帧走满一圈（线性插值保证循环均匀），150-180 保持
  const progress = interpolate(frame, [0, 150], [0, 1], {
    extrapolateRight: "clamp",
  });
  const R = 180;
  const CIRC = 2 * Math.PI * R;

  // 门杠三划：40/70/100 帧依次横扫（spring 族=批次一契约）
  const bar = (t: number) =>
    spring({
      frame: frame - t,
      fps,
      config: { stiffness: 100, damping: 20, mass: 1 },
      durationInFrames: 20,
    });
  const bars = [bar(40), bar(70), bar(100)];

  // 字标：90-140 升起，160-180 淡出（循环点回归初始）
  const word = spring({
    frame: frame - 90,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: 26,
  });
  const wordOut = interpolate(frame, [160, 179], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={440} height={440} viewBox="0 0 440 440">
        <circle cx={220} cy={220} r={R} fill="none" stroke="#33424c" strokeWidth={14} />
        <circle
          cx={220}
          cy={220}
          r={R}
          fill="none"
          stroke={C.green}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          transform="rotate(-90 220 220)"
        />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={100}
            y={206 + i * 14}
            width={240}
            height={5}
            rx={2.5}
            fill={C.paper}
            opacity={bars[i] * 0.9}
            transform={`translateX(${interpolate(bars[i], [0, 1], [-90, 0])})`}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          fontFamily: '"SF Pro Display", "Helvetica Neue", sans-serif',
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: C.paper,
          opacity: word * wordOut,
          transform: `translateY(${interpolate(word, [0, 1], [28, 0])}px)`,
        }}
      >
        UAK
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 110,
          fontSize: 22,
          color: C.muted,
          opacity: word * wordOut,
          fontFamily: '"PingFang SC", "Noto Sans SC", sans-serif',
        }}
      >
        六道门 · 评分台账 · 证据可查
      </div>
    </AbsoluteFill>
  );
};

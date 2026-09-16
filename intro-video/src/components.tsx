// 可复用动效组件——全部蒸馏自 motion-graphics 技能的 pattern 库。
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";

// 1. 高级入场：透明度 + 上移 + 缩放（三属性，禁单淡入）
export const Entrance: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(
          p,
          [0, 1],
          [0.94, 1]
        )})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 2. 中文字符逐字揭示（中文无空格，按字符切）
export const CharReveal: React.FC<{
  text: string;
  delay?: number;
  per?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, per = 2, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.14em", ...style }}>
      {text.split("").map((ch, i) => {
        const p = spring({
          frame: frame - delay - i * per,
          fps,
          config: theme.spring.snappy,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px)`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
};

// 3. 背景网格——任何场景不允许纯平底色
export const BgMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 50;
  const d2 = Math.cos(frame / 70) * 40;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          top: -450,
          left: -300 + d1,
          filter: "blur(50px)",
          background: `radial-gradient(circle, ${theme.colors.primary}33, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          bottom: -400,
          right: -250 - d2,
          filter: "blur(70px)",
          background: `radial-gradient(circle, ${theme.colors.accent}22, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// 4. 调色层（内容之上、颗粒之下）
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.primary,
        mixBlendMode: "soft-light",
        opacity: 0.18,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.10), transparent 28%, transparent 72%, rgba(0,0,0,0.2))",
      }}
    />
  </AbsoluteFill>
);

// 5. 程序化胶片颗粒（零素材文件）
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.05,
        mixBlendMode: "overlay",
      }}
    />
  );
};

// 6. 暗角（最顶层）
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 56%, rgba(0,0,0,0.22) 100%)",
    }}
  />
);

// 7. Ken Burns——每张静帧，无一例外
export const KenBurns: React.FC<{ src: string; zoomTo?: number }> = ({
  src,
  zoomTo = 1.1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1, zoomTo], {
    easing: theme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pan = interpolate(frame, [0, durationInFrames], [0, -25], {
    easing: theme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translateX(${pan}px)`,
      }}
    />
  );
};

// 8. 数字计数器（tabular-nums 防抖动）
export const Counter: React.FC<{
  target: number;
  delay?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ target, delay = 0, suffix = "", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = interpolate(
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 30, stiffness: 60 },
    }),
    [0, 1],
    [0, target],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {Math.round(value)}
      {suffix}
    </span>
  );
};

// 9. 放射状 logo 标记（错峰光线）
export const Spark: React.FC<{ size?: number; delay?: number }> = ({
  size = 150,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rays = 12;
  const pop = spring({
    frame: frame - delay,
    fps,
    config: theme.spring.bouncy,
  });
  const spin = interpolate(
    spring({ frame: frame - delay, fps, config: theme.spring.smooth }),
    [0, 1],
    [-120, 0]
  );
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${pop}) rotate(${spin}deg)`,
        filter: `drop-shadow(0 0 ${size * 0.25}px ${theme.colors.glow})`,
      }}
    >
      {Array.from({ length: rays }).map((_, i) => {
        const p = spring({
          frame: frame - delay - i * 1.2,
          fps,
          config: theme.spring.snappy,
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size * 0.085,
              height: size * 0.46 * p,
              background: theme.colors.primary,
              borderRadius: size,
              transformOrigin: "50% 0%",
              transform: `translateX(-50%) rotate(${(360 / rays) * i}deg) translateY(${
                size * 0.07
              }px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// 10. 场景退场——比入场更快（10 帧左右）
export const SceneExit: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exitY = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 2],
    [0, -42],
    { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitO = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill style={{ opacity: exitO, transform: `translateY(${exitY}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// 五层画面栈：bg → 内容 → grade → grain → vignette
export const Stack: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <BgMesh />
    {children}
    <Grade />
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

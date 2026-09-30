import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * UI Design Agent Kit 15s 产品视频（1280×720 @30fps，450 帧）。
 * 配色取自 kit 定稿 token（BrandTeaser 同源）：paper/ink/green/focus。
 * 全部动效为 useCurrentFrame 纯函数（确定性，无 wall-clock/随机）。
 */

const C = {
  paper: "#fafcfd",
  ink: "#26343d",
  muted: "#61717d",
  line: "#d9e2e7",
  surface: "#f2f5f7",
  green: "#177656",
  focus: "#2566c4",
};

const Scene: React.FC<{
  start: number;
  end: number;
  children: React.ReactNode;
}> = ({ start, end, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 12, end - 12, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = spring({ frame, fps, config: { damping: 200 } });
  const lineGrow = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(up, [0, 1], [36, 0])}px)`,
          opacity: up,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: C.ink,
            letterSpacing: "-0.02em",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          UI Design Agent Kit
        </div>
        <div
          style={{
            width: interpolate(lineGrow, [0, 1], [0, 220]),
            height: 4,
            background: C.green,
            margin: "22px auto",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 24,
            color: C.muted,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          把 UI 交付跑成有门禁的流水线
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FEATURES = [
  { title: "六道门径", desc: "设计稿→素材→原型→契约→验收→留痕", color: C.focus },
  { title: "证据链验收", desc: "每分都必须有树内证据背书", color: C.green },
  { title: "71 场景语料", desc: "行为评测覆盖全族系，不许自报满分", color: C.ink },
];

const FeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
        flexDirection: "row",
      }}
    >
      {FEATURES.map((f, i) => {
        const s = spring({ frame: frame - i * 10, fps, config: { damping: 200 } });
        return (
          <div
            key={f.title}
            style={{
              transform: `translateY(${interpolate(s, [0, 1], [48, 0])}px)`,
              opacity: s,
              width: 320,
              padding: "36px 30px",
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 6,
                borderRadius: 3,
                background: f.color,
                marginBottom: 22,
              }}
            />
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: C.ink,
                marginBottom: 12,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                color: C.muted,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {f.desc}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const NUMBERS = [
  { value: 6, label: "道门径", color: C.focus },
  { value: 71, label: "场景语料", color: C.green },
  { value: 94, label: "项测试", color: C.ink },
];

const NumbersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 120,
      }}
    >
      {NUMBERS.map((n, i) => {
        const s = spring({ frame: frame - i * 8, fps, config: { damping: 200 } });
        const shown = Math.round(interpolate(s, [0, 1], [0, n.value]));
        return (
          <div key={n.label} style={{ textAlign: "center", opacity: s }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                color: n.color === C.ink ? C.paper : n.color,
                fontFamily: "Helvetica, Arial, sans-serif",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {shown}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#9fb0ba",
                marginTop: 8,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {n.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = spring({ frame, fps, config: { damping: 200 } });
  const pulse = Math.sin((frame / fps) * Math.PI * 2 * 0.8) * 0.5 + 0.5;
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(up, [0, 1], [30, 0])}px)`,
          opacity: up,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: C.ink,
            marginBottom: 26,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          从需求到可验证的交付
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "16px 42px",
            borderRadius: 999,
            background: C.green,
            color: C.paper,
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "Helvetica, Arial, sans-serif",
            boxShadow: `0 ${8 + pulse * 6}px ${24 + pulse * 10}px rgba(23,118,86,0.35)`,
          }}
        >
          github.com/muzimu217/ui-design-agent-kit
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProductVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Scene start={0} end={90}>
        <TitleScene />
      </Scene>
      <Scene start={90} end={210}>
        <FeatureScene />
      </Scene>
      <Scene start={210} end={330}>
        <NumbersScene />
      </Scene>
      <Scene start={330} end={450}>
        <CtaScene />
      </Scene>
    </AbsoluteFill>
  );
};

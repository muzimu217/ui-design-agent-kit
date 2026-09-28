import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * UAK 品牌 teaser（评测 remotion-brand-animation 交付物）
 *
 * 品牌 token：showcase products styles.css 七色（--ink/--muted/--line/--paper/--surface/--green/--focus）
 * 动效契约：kit motion-contract「Elegant spring (stiffness 100 / damping 20 / mass 1)」——
 * 全片唯一曲线族，禁止 generic fade 堆叠；转场一律「门杠横扫」母题。
 * 确定性：所有动画仅依赖 useCurrentFrame()（帧数学），无 wall-clock、无 free-running。
 */

/** 品牌 token：见文件头注释。无 props schema（单一定时配置，无输入参数）。 */
export const brandTeaserSchema = undefined;

const C = {
  ink: "#26343d",
  muted: "#61717d",
  line: "#d9e2e7",
  paper: "#fafcfd",
  surface: "#f2f5f7",
  green: "#177656",
  focus: "#2566c4",
  // 反面样板专用（表现"AI 直出"问题，被品牌墨色划掉，非品牌色）
  raw: "#7C3AED",
  rawGray: "#9CA3AF",
};

const FONT =
  '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif';
const FONT_EN =
  '"SF Pro Display", "Helvetica Neue", "PingFang SC", "Noto Sans SC", sans-serif';

/** 门杠横扫：品牌母题转场。三态=x 求和（未进场 -110 / 停留 0 / 已退场 +110）。 */
const BarWipe: React.FC<{ enter: number; exit: number }> = ({ enter, exit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [0, 1, 2, 3, 4, 5];
  const xIn = (i: number) =>
    spring({
      frame: frame - enter - i * 2,
      fps,
      config: { stiffness: 100, damping: 20, mass: 1 },
      durationInFrames: 22,
    });
  const xOut = (i: number) =>
    spring({
      frame: frame - exit - i * 2,
      fps,
      config: { stiffness: 100, damping: 20, mass: 1 },
      durationInFrames: 22,
    });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bars.map((i) => {
        const x = interpolate(xIn(i), [0, 1], [-110, 0]) + interpolate(xOut(i), [0, 1], [0, 110]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 180 + i * 144,
              left: 0,
              width: "100%",
              height: i % 2 === 0 ? 96 : 40,
              background: i % 2 === 0 ? C.ink : C.green,
              transform: `translateX(${x * 12}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** 场景一：AI 直出（反面样板，等时堆叠的"死"节奏，f54 被品牌墨杠划掉） */
const RawScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [0, 1, 2, 3];
  const strike = spring({
    frame: frame - 54,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: 18,
  });
  const strikeW = interpolate(strike, [0, 1], [0, 118]);
  const fadeOut = interpolate(frame, [62, 70], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: "#ECEEF1",
        opacity: fadeOut,
        fontFamily: FONT,
        padding: 96,
      }}
    >
      {cards.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 120 + (i % 2) * 560,
            top: 140 + Math.floor(i / 2) * 320,
            width: 480,
            height: 260,
            background: i === 0 ? C.raw : i === 3 ? C.rawGray : "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            opacity: interpolate(frame - i * 9, [0, 8], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              margin: 24,
              height: 18,
              width: i % 2 ? 220 : 300,
              background: "rgba(255,255,255,0.75)",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              margin: "0 24px",
              height: 12,
              width: 340,
              background: "rgba(0,0,0,0.14)",
              borderRadius: 4,
            }}
          />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 88,
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 600,
          color: C.ink,
        }}
      >
        AI 直出的界面
        <div
          style={{
            position: "absolute",
            left: -8,
            top: "52%",
            height: 6,
            width: `${strikeW}%`,
            background: C.ink,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** 场景二：六道门落下（品牌=门禁。每道杠 spring 落入，节奏=门杠母题的纵向变奏） */
const GatesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gates = [
    ["门A", "需求方向"],
    ["门B", "素材基线"],
    ["门C", "原型"],
    ["门D", "实现"],
    ["门E", "验收"],
    ["门F", "证据留痕"],
  ];
  const title = spring({
    frame: frame - 4,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: 20,
  });
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        fontFamily: FONT,
        padding: "110px 140px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_EN,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: C.green,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [16, 0])}px)`,
        }}
      >
        SIX GATES
      </div>
      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: C.ink,
          marginTop: 10,
          opacity: title,
        }}
      >
        每一步都有可查的门
      </div>
      <div style={{ marginTop: 46 }}>
        {gates.map(([tag, label], i) => {
          const s = spring({
            frame: frame - 24 - i * 6,
            fps,
            config: { stiffness: 100, damping: 20, mass: 1 },
            durationInFrames: 24,
          });
          const y = interpolate(s, [0, 1], [-56, 0]);
          return (
            <div
              key={tag}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                marginBottom: 22,
                opacity: s,
                transform: `translateY(${y}px)`,
              }}
            >
              <div
                style={{
                  width: 132,
                  height: 58,
                  borderRadius: 8,
                  background: C.ink,
                  color: C.paper,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                {tag}
              </div>
              <div style={{ fontSize: 32, color: C.muted, fontWeight: 500 }}>
                {label}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: C.line,
                  transform: `scaleX(${s})`,
                  transformOrigin: "left",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 场景三：证据台账（行逐条敲入 + 勾 + 「0 违规」绿戳） */
const LedgerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    "六道门：逐门裁决与证据留痕",
    "71 个评测场景：评分台账可查",
    "线上 20 页 × 明暗：无障碍 0 违规",
  ];
  const stamp = spring({
    frame: frame - 46,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: 22,
  });
  const stampScale = interpolate(stamp, [0, 1], [1.6, 1]);
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        fontFamily: FONT,
        padding: "130px 160px",
      }}
    >
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: C.ink,
          marginBottom: 56,
        }}
      >
        分数不靠嘴说，靠台账
      </div>
      {rows.map((text, i) => {
        const s = spring({
          frame: frame - 10 - i * 12,
          fps,
          config: { stiffness: 100, damping: 20, mass: 1 },
          durationInFrames: 22,
        });
        return (
          <div
            key={text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 34,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: C.green,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 36, color: C.ink, fontWeight: 500 }}>
              {text}
            </div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 30,
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          transform: `scale(${stampScale}) rotate(${interpolate(
            stamp,
            [0, 1],
            [-8, -3],
          )}deg)`,
          opacity: stamp,
          alignSelf: "flex-start",
          border: `5px solid ${C.green}`,
          color: C.green,
          borderRadius: 14,
          padding: "10px 30px",
          fontSize: 52,
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        0 违规
      </div>
    </AbsoluteFill>
  );
};

/** 场景四：字标锁定（hold 到片尾） */
const LockupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = "UI DESIGN AGENT KIT".split("");
  const url = spring({
    frame: frame - 30,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: 24,
  });
  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", gap: 2 }}>
        {words.map((ch, i) => {
          const s = spring({
            frame: frame - i * 1.2,
            fps,
            config: { stiffness: 100, damping: 20, mass: 1 },
            durationInFrames: 26,
          });
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT_EN,
                fontSize: ch === " " ? 60 : 104,
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: ch === " " ? "transparent" : C.paper,
                width: ch === " " ? 36 : undefined,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [42, 0])}px)`,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 26,
          fontSize: 34,
          color: "#2FA77F",
          fontWeight: 600,
          opacity: url,
        }}
      >
        给 AI 代理的 UI 验收体系
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: FONT_EN,
          fontSize: 26,
          color: "#B8C4CC",
          opacity: url,
        }}
      >
        github.com/muzimu217/ui-design-agent-kit
      </div>
    </AbsoluteFill>
  );
};

const rangeOpacity = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const BrandTeaser: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {/* 每个场景 Sequence 局部时间轴：入场动画在各自可见窗口内真实发生 */}
      <Sequence from={0} durationInFrames={72}>
        <AbsoluteFill style={{ opacity: rangeOpacity(frame, -1, 0, 60, 72) }}>
          <RawScene />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={58} durationInFrames={82}>
        <AbsoluteFill style={{ opacity: rangeOpacity(frame, 58, 70, 124, 136) }}>
          <GatesScene />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={124} durationInFrames={76}>
        <AbsoluteFill style={{ opacity: rangeOpacity(frame, 124, 136, 188, 200) }}>
          <LedgerScene />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={184} durationInFrames={56}>
        <AbsoluteFill style={{ opacity: rangeOpacity(frame, 184, 196, 241, 242) }}>
          <LockupScene />
        </AbsoluteFill>
      </Sequence>
      {/* 门杠横扫：场景交替处的品牌母题（进场/退场各一次） */}
      <BarWipe enter={56} exit={86} />
      <BarWipe enter={120} exit={148} />
      <BarWipe enter={182} exit={202} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * PortraitStory（remotion-render-scope 批次十二）：竖屏可编辑视频预览。
 * 1080×1920 @30fps 120 帧；两幕 + 戏剧性斜切推入转场（45-75 帧）。
 * 帧数学契约同 BrandTeaser（spring 族/interpolate，零 setTimeout/零 CSS transition）。
 * 仅预览：Studio URL + still 帧检视，不导出不部署。
 * 媒体：授权本地媒体以品牌图形卡模拟（评测语境披露），无外部资源。
 */

const C = { ink: "#26343d", paper: "#fafcfd", green: "#177656", red: "#C8102E" };
const FONT = '"PingFang SC", "Noto Sans SC", sans-serif';

/** 戏剧性斜切转场：幕 A 被三道斜条推走，幕 B 自斜条后显现（纯帧插值） */
const DiagonalWipe: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0, 1, 2].map((i) => {
        const delay = i * 4;
        const pi = interpolate(frame, [start + delay, end + delay], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              background: i === 1 ? C.green : C.ink,
              clipPath: `polygon(${(pi - 0.35) * 130}% 0%, ${(pi - 0.05) * 130}% 0%, ${(pi - 0.45) * 130}% 100%, ${(pi - 0.75) * 130}% 100%)`,
              opacity: pi >= 1 ? 0 : 1,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ opacity: p >= 1 ? 0 : 0 }} />
    </AbsoluteFill>
  );
};

export const PortraitStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 幕 A：晨光标题（0-45 帧，spring 上浮）
  const aRise = spring({ frame, fps, config: { stiffness: 100, damping: 20, mass: 1 }, durationInFrames: 26 });
  // 幕 B：谷底照片卡（75 帧后 spring 推入）
  const bRise = spring({ frame: frame - 78, fps, config: { stiffness: 100, damping: 20, mass: 1 }, durationInFrames: 26 });

  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: FONT }}>
      {/* 幕 A：晨光（品牌图形卡：渐变+标题） */}
      <AbsoluteFill style={{ background: "linear-gradient(168deg, #F4633A 0%, #E0475B 55%, #B33757 100%)" }}>
        <div style={{ position: "absolute", top: 420, left: 64, right: 64 }}>
          <div style={{ fontSize: 30, letterSpacing: "0.3em", color: "rgba(255,255,255,0.75)", opacity: aRise }}>
            MORNING SERIES
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#fff",
              marginTop: 14,
              opacity: aRise,
              transform: `translateY(${interpolate(aRise, [0, 1], [46, 0])}px)`,
            }}
          >
            晨光
          </div>
          <div style={{ width: interpolate(aRise, [0, 1], [0, 220]), height: 6, background: "#fff", marginTop: 26 }} />
        </div>
        <div style={{ position: "absolute", bottom: 260, left: 64, fontSize: 26, color: "rgba(255,255,255,0.85)", opacity: aRise }}>
          高海拔风光 · 2025
        </div>
      </AbsoluteFill>

      {/* 幕 B：谷底（品牌图形卡：墨底+图形） */}
      <AbsoluteFill style={{ background: C.ink, opacity: interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div
          style={{
            position: "absolute",
            top: 560,
            left: 54,
            right: 54,
            height: 700,
            borderRadius: 18,
            background: "linear-gradient(180deg, #2e3f4a 0%, #1a242b 100%)",
            opacity: bRise,
            transform: `translateY(${interpolate(bRise, [0, 1], [60, 0])}px)`,
            display: "flex",
            alignItems: "flex-end",
            padding: 36,
          }}
        >
          <div>
            <div style={{ width: 64, height: 8, background: C.green, borderRadius: 4, marginBottom: 18 }} />
            <div style={{ fontSize: 44, fontWeight: 800, color: C.paper }}>谷底</div>
            <div style={{ fontSize: 24, color: C.muted, marginTop: 10 }}>峡谷系列 · 2024</div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 200, left: 54, fontSize: 30, letterSpacing: "0.3em", color: C.green, opacity: bRise }}>
          CANYON SERIES
        </div>
      </AbsoluteFill>

      {/* 戏剧性斜切转场（45-75 帧） */}
      <DiagonalWipe start={45} end={72} />
    </AbsoluteFill>
  );
};

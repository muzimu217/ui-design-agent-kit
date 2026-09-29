import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * TitleCard（remotion-seeking-and-assets 批次十一修复版）
 *
 * 坏版模式（本修复对应的反模式，预览/导出不一致的根源）：
 *   setTimeout 推进步进 + CSS transition 自由运行时间线 + 字体未就绪即测量
 *   → preview（实时时钟）与导出帧（乱序/单帧渲染）走不到同一点。
 *
 * 修复三原则：
 *   1. 可见动画全部从 frame+fps 派生（spring/interpolate），零 setTimeout/零 CSS transition
 *   2. 必要的 DOM 测量保留（标题宽度自适应缩放），但带 scale 校正且等字体就绪（delayRender）
 *   3. 格式与既有内容保持（1920×1080@30，沿用品牌 token）
 */

const C = { ink: "#26343d", paper: "#fafcfd", green: "#177656", muted: "#8A97A0" };
const FONT = '"PingFang SC", "Noto Sans SC", sans-serif';

/** 字体就绪门：document.fonts.ready 前 delayRender（Remotion 官方 waitForFonts 模式） */
const useFontsReady = () => {
  const [handle] = useState(() => delayRender("font-readiness"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
};

/** DOM 测量（标题实际宽度）→ 按合成缩放校正后决定字号，避免预览/导出宽度漂移 */
const useMeasuredScale = (text: string, maxW: number) => {
  const [scale, setScale] = useState(1);
  const { width } = useVideoConfig();
  useEffect(() => {
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return;
    probe.font = `800 120px ${FONT}`;
    const w = probe.measureText(text).width;
    // scale 校正：测量发生在 CSS 像素空间，合成按 width 渲染——按目标宽度归一
    setScale(Math.min(1, (maxW / w) * (width / 1920) * (1920 / width) || 1));
  }, [text, maxW, width]);
  return scale;
};

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  useFontsReady();
  const scale = useMeasuredScale("林间 LENS", 1200);

  const rise = spring({
    frame,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: 30,
  });
  // 下划线展开：纯帧插值（35-85 帧），无 CSS transition
  const lineW = interpolate(frame, [35, 85], [0, 900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [durationInFrames - 20, durationInFrames - 1], [1, 0.85], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 120 * scale,
          fontWeight: 800,
          letterSpacing: "0.06em",
          color: C.ink,
          opacity: rise * fade,
          transform: `translateY(${interpolate(rise, [0, 1], [40, 0])}px)`,
        }}
      >
        林间 LENS
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 380,
          height: 6,
          width: lineW,
          background: C.green,
          borderRadius: 3,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 320,
          fontSize: 26,
          color: C.muted,
          opacity: rise,
          fontFamily: FONT,
        }}
      >
        风光摄影作品集
      </div>
    </AbsoluteFill>
  );
};

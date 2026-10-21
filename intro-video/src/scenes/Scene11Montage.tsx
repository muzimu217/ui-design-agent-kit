// 参赛 S7 成果巡览：8 案例 90 帧快剪（局部 KenBurns，按切片时长插值）。
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { SceneExit, Stack } from "../components";

const CUT = 55; // 每案例帧数
const SHOTS = [
  { src: "media/brick-desktop.webp", label: "积木小工坊 · 3D 拼搭" },
  { src: "media/nodegrid.webp", label: "NODEGRID · 地球节点" },
  { src: "media/subway.webp", label: "地铁疾行 · 3D 跑酷" },
  { src: "media/ruiear.webp", label: "睿耳 RuiEar · 3D 产品页" },
  { src: "media/forma.webp", label: "FORMA One · 配置页" },
  { src: "media/tempo.webp", label: "Tempo · 专注计时" },
  { src: "media/inventory.webp", label: "库存运营台" },
  { src: "media/blog.webp", label: "一舟札记 · 内容站" },
];

export const Scene11Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(SHOTS.length - 1, Math.floor(frame / CUT));
  const local = frame - idx * CUT;
  const shot = SHOTS[idx];
  const zoom = interpolate(local, [0, CUT], [1.02, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pan = interpolate(local, [0, CUT], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipIn = interpolate(local, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill>
          <Img
            key={shot.src}
            src={staticFile(shot.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${zoom}) translateX(${pan}px)`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,15,0.55), transparent 26%, transparent 70%, rgba(10,10,15,0.82))",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 64,
              left: 90,
              fontSize: 46,
              fontWeight: 800,
              fontFamily: theme.fonts.display,
              color: theme.colors.text,
            }}
          >
            工作流产出的 <span style={{ color: theme.colors.primary }}>真实案例</span>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 64,
              left: 90,
              display: "flex",
              alignItems: "center",
              gap: 22,
              opacity: chipIn,
              transform: `translateY(${(1 - chipIn) * 18}px)`,
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 24,
                color: theme.colors.bg,
                background: theme.colors.accent,
                borderRadius: 10,
                padding: "6px 14px",
                fontWeight: 700,
              }}
            >
              {String(idx + 1).padStart(2, "0")} / {String(SHOTS.length).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                fontFamily: theme.fonts.display,
                color: theme.colors.text,
                textShadow: "0 2px 18px rgba(0,0,0,0.65)",
              }}
            >
              {shot.label}
            </span>
          </div>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

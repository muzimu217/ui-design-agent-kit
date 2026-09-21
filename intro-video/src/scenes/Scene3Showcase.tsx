// S3 成果：真实 showcase 截图 Ken Burns 卡片墙（素材拼接，不手画）。
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Entrance, KenBurns, SceneExit, Stack } from "../components";

const SHOTS = [
  { src: "media/nodegrid.webp", label: "NODEGRID" },
  { src: "media/subway.webp", label: "地铁疾行" },
  { src: "media/tempo.webp", label: "Tempo" },
  { src: "media/forma.webp", label: "FORMA One" },
];

export const Scene3Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 56,
            fontFamily: theme.fonts.display,
          }}
        >
          <Entrance delay={2}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 66,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: theme.colors.text,
                }}
              >
                工作流产出的{" "}
                <span style={{ color: theme.colors.primary }}>Showcase</span>
              </div>
            </div>
          </Entrance>

          <div style={{ display: "flex", gap: 36 }}>
            {SHOTS.map((shot, i) => {
              const p = spring({
                frame: frame - 22 - i * 5,
                fps,
                config: theme.spring.smooth,
              });
              const float = Math.sin((frame + i * 12) / 30) * 3; // 静置呼吸
              return (
                <div
                  key={shot.src}
                  style={{
                    width: 400,
                    height: 262,
                    borderRadius: 28,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)",
                    opacity: p,
                    transform: `translateY(${interpolate(p, [0, 1], [46, 0]) + float}px) scale(${interpolate(
                      p,
                      [0, 1],
                      [0.93, 1]
                    )})`,
                  }}
                >
                  <KenBurns src={shot.src} zoomTo={1.08} />
                </div>
              );
            })}
          </div>

          <Entrance delay={64}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: theme.colors.textDim,
                letterSpacing: "0.04em",
              }}
            >
              每个案例都带验证截图与门记录
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

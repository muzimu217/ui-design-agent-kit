// S2 机制：六道确认门，错峰入场 + 主色进度线。
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Entrance, SceneExit, Stack } from "../components";

const GATES = ["门A", "门B", "门C", "门D", "门E", "门F"];

export const Scene2Gates: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const lineP = spring({ frame: frame - 16, fps, config: theme.spring.smooth });
  const lineW = interpolate(lineP, [0, 1], [0, 1180]);

  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 70,
            fontFamily: theme.fonts.display,
          }}
        >
          <Entrance delay={2}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: theme.colors.text,
                }}
              >
                六道确认门
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 30,
                  fontWeight: 500,
                  color: theme.colors.textDim,
                }}
              >
                每一步都停在门上，由用户放行
              </div>
            </div>
          </Entrance>

          <div style={{ position: "relative", width: 1400, height: 190 }}>
            {/* 进度线（主色，本帧唯一主色元素） */}
            <div
              style={{
                position: "absolute",
                top: 92,
                left: 110,
                width: lineW,
                height: 4,
                background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                borderRadius: 4,
                opacity: 0.7,
              }}
            />
            {GATES.map((g, i) => {
              const p = spring({
                frame: frame - 30 - i * 6,
                fps,
                config: theme.spring.snappy,
              });
              const breathe = Math.sin((frame + i * 9) / 26) * 3;
              return (
                <div
                  key={g}
                  style={{
                    position: "absolute",
                    left: 40 + i * 220,
                    top: 40,
                    width: 160,
                    height: 108,
                    borderRadius: 24,
                    background: theme.colors.bgAlt,
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: p,
                    transform: `translateY(${interpolate(p, [0, 1], [40, 0]) + breathe}px) scale(${interpolate(
                      p,
                      [0, 1],
                      [0.9, 1]
                    )})`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      color: theme.colors.text,
                      fontFamily: theme.fonts.display,
                    }}
                  >
                    {g}
                  </span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

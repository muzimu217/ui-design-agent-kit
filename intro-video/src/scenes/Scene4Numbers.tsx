// S4 高潮：数字计数器（唯一主色给最关键的数字）。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Counter, Entrance, SceneExit, Stack } from "../components";

const STATS = [
  { target: 9, suffix: "", label: "showcase 案例" },
  { target: 58, suffix: "", label: "测试全绿", hero: true },
  { target: 6, suffix: "", label: "确认门" },
];

export const Scene4Numbers: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 74,
            fontFamily: theme.fonts.display,
          }}
        >
          <Entrance delay={2}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: theme.colors.textDim,
                letterSpacing: "0.14em",
              }}
            >
              用证据说话
            </div>
          </Entrance>

          <div style={{ display: "flex", gap: 150 }}>
            {STATS.map((s, i) => (
              <Entrance key={s.label} delay={18 + i * 8}>
                <div style={{ textAlign: "center" }}>
                  <Counter
                    target={s.target}
                    delay={22 + i * 8}
                    style={{
                      fontSize: 168,
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.05,
                      color: s.hero ? theme.colors.primary : theme.colors.text,
                      textShadow: s.hero ? `0 0 90px ${theme.colors.glow}` : undefined,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 32,
                      fontWeight: 500,
                      color: theme.colors.textDim,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </Entrance>
            ))}
          </div>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

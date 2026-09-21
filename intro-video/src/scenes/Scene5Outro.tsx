// S5 收尾 CTA：仓库地址 + 标语回收，光晕只落在 CTA 上。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CharReveal, Entrance, SceneExit, Stack } from "../components";

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.85 + Math.sin(frame / 20) * 0.15;

  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 44,
            fontFamily: theme.fonts.display,
          }}
        >
          <Entrance delay={2}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: theme.colors.textDim,
                letterSpacing: "0.2em",
              }}
            >
              开源 · GITHUB
            </div>
          </Entrance>

          <Entrance delay={10}>
            <div
              style={{
                fontSize: 62,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: theme.colors.text,
                fontFamily: theme.fonts.mono,
                textShadow: `0 0 ${70 * pulse}px ${theme.colors.glow}`,
              }}
            >
              muzimu217/ui-design-agent-kit
            </div>
          </Entrance>

          <Entrance delay={22}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 500,
                color: theme.colors.textDim,
              }}
            >
              <CharReveal
                text="先学最好的界面，再交付有证据的产品"
                delay={24}
                per={2}
              />
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

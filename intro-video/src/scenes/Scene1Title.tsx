// S1 钩子：logo 标记 + 主标题 + 中文标语逐字揭示。0-15 帧内必须有运动。
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { theme } from "../theme";
import { CharReveal, Entrance, SceneExit, Spark, Stack } from "../components";

export const Scene1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 静置呼吸（画面停留 >2s 的元素）
  const breathe = 1 + Math.sin(frame / 22) * 0.015;
  const titleP = spring({ frame: frame - 14, fps, config: theme.spring.smooth });

  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 34,
            fontFamily: theme.fonts.display,
          }}
        >
          <div
            style={{
              transform: `scale(${breathe})`,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Spark size={130} delay={0} />
          </div>

          <Entrance delay={14}>
            <div
              style={{
                fontSize: 118,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: theme.colors.text,
                textAlign: "center",
                opacity: titleP,
                textShadow: `0 0 80px ${theme.colors.glow}`,
              }}
            >
              UI Design Agent Kit
            </div>
          </Entrance>

          <Entrance delay={34}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 500,
                color: theme.colors.textDim,
                letterSpacing: "0.06em",
              }}
            >
              <CharReveal text="先学最好的界面，再交付有证据的产品" delay={38} per={2} />
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

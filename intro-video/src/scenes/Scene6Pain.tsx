// 参赛 S2 痛点三连：问卷原话卡（忠实转录，非统计样本声明）。
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Entrance, SceneExit, Stack } from "../components";

const QUOTES = [
  { tag: "01 · 越权重写", text: "“加个筛选框，它把整个列表重写成了新组件，手机端直接塌了。”" },
  { tag: "02 · 静默删改", text: "“重构样式时，它悄悄删掉了我写好的边界异常处理，生产环境报错。”" },
  { tag: "03 · 改动失控", text: "“升级组件库一口气改了 7 个文件，dayjs 被换回 moment，打包多 60KB。”" },
];

export const Scene6Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 44,
            fontFamily: theme.fonts.display,
            padding: "0 140px",
          }}
        >
          <Entrance delay={2}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.02em" }}>
              AI 写界面，<span style={{ color: theme.colors.primary }}>真实痛点</span>
            </div>
          </Entrance>
          <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 1480 }}>
            {QUOTES.map((q, i) => {
              const p = spring({ frame: frame - 26 - i * 22, fps, config: theme.spring.smooth });
              const slideX = interpolate(p, [0, 1], [i % 2 === 0 ? -60 : 60, 0]);
              return (
                <div
                  key={q.tag}
                  style={{
                    opacity: p,
                    transform: `translateX(${slideX}px)`,
                    display: "flex",
                    gap: 28,
                    alignItems: "center",
                    background: theme.colors.bgAlt,
                    border: `1px solid ${theme.colors.textDim}22`,
                    borderRadius: 22,
                    padding: "26px 36px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: 22,
                      color: theme.colors.accent,
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                    }}
                  >
                    {q.tag}
                  </div>
                  <div style={{ fontSize: 33, fontWeight: 600, lineHeight: 1.5 }}>{q.text}</div>
                </div>
              );
            })}
          </div>
          <Entrance delay={96}>
            <div
              style={{
                fontSize: 24,
                color: theme.colors.textDim,
                fontFamily: theme.fonts.mono,
                letterSpacing: "0.05em",
              }}
            >
              28 份 GitHub 开源开发者问卷 · 原话忠实转录 · 形成性证据（非统计样本）
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

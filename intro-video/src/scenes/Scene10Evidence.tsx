// 参赛 S6 证据与台账：五级证据阶梯 + 三个数字卡（Counter 实数）。
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Counter, Entrance, SceneExit, Stack } from "../components";

const LADDER = ["指令已安装", "工具已配置", "服务已连接", "调用已验证", "页面已检查"];

export const Scene10Evidence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 48,
            fontFamily: theme.fonts.display,
            padding: "0 150px",
          }}
        >
          <Entrance delay={2}>
            <div style={{ fontSize: 60, fontWeight: 800 }}>
              声称必须有<span style={{ color: theme.colors.primary }}>证据</span>
            </div>
          </Entrance>
          <div style={{ display: "flex", gap: 70, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {LADDER.map((step, i) => {
                const p = spring({ frame: frame - 24 - i * 14, fps, config: theme.spring.snappy });
                const w = 380 + i * 105;
                return (
                  <div
                    key={step}
                    style={{
                      width: w * p,
                      minWidth: 0,
                      background: i === LADDER.length - 1 ? theme.colors.primary : theme.colors.bgAlt,
                      color: "#FFFFFF",
                      border: `1px solid ${theme.colors.textDim}33`,
                      borderRadius: 14,
                      padding: "16px 26px",
                      fontSize: 26,
                      fontWeight: 700,
                      opacity: p,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {i + 1} · {step}
                  </div>
                );
              })}
              <Entrance delay={120}>
                <div style={{ fontSize: 21, color: theme.colors.textDim, fontFamily: theme.fonts.mono }}>
                  五级证据等级 —— 层层递进，不可互相替代
                </div>
              </Entrance>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { n: 131, label: "项自动化测试", suffix: "" },
                { n: 73, label: "场景评测语料", suffix: "" },
                { n: 71, label: "已真实执行入账", suffix: "" },
              ].map((s, i) => (
                <Entrance key={s.label} delay={40 + i * 20}>
                  <div
                    style={{
                      background: theme.colors.bgAlt,
                      border: `1px solid ${theme.colors.textDim}22`,
                      borderRadius: 20,
                      padding: "26px 44px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 74, fontWeight: 800, color: theme.colors.accent }}>
                      <Counter target={s.n} delay={50 + i * 20} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 24, color: theme.colors.textDim, marginTop: 4 }}>{s.label}</div>
                  </div>
                </Entrance>
              ))}
            </div>
          </div>
          <Entrance delay={140}>
            <div style={{ fontSize: 24, color: theme.colors.textDim }}>
              分数不降才合入 · 每个场景带截图、判据与证据路径，全链可复核
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

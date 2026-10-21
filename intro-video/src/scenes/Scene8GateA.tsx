// 参赛 S4 门 A：口语需求 → 方向稿 → 人工停点（AI 不越权动手）。
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Entrance, SceneExit, Stack } from "../components";

const BRIEF_POINTS = [
  "范围：采购申请集中台 · 待处理列表",
  "角色：申请人 / 审批人 双视角",
  "视觉：沿用现有设计系统 · 克制动效",
];

export const Scene8GateA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 0.6 + Math.sin(frame / 9) * 0.25;
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 34,
            fontFamily: theme.fonts.display,
            padding: "0 160px",
          }}
        >
          <Entrance delay={2}>
            <div style={{ fontSize: 60, fontWeight: 800 }}>
              先对齐方向，<span style={{ color: theme.colors.primary }}>再动手</span>
            </div>
          </Entrance>

          <Entrance delay={20} style={{ width: 1420 }}>
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: 900,
                marginLeft: "auto",
                background: theme.colors.primary,
                color: "#FFFFFF",
                borderRadius: "26px 26px 6px 26px",
                padding: "24px 34px",
                fontSize: 30,
                fontWeight: 600,
                lineHeight: 1.55,
              }}
            >
              「我想把同事提交的采购申请集中起来，能看谁还没处理。先给我整理第一版需求。」
            </div>
          </Entrance>

          <Entrance delay={90} style={{ width: 1420 }}>
            <div
              style={{
                maxWidth: 1060,
                background: theme.colors.bgAlt,
                border: `1px solid ${theme.colors.textDim}22`,
                borderRadius: "26px 26px 26px 6px",
                padding: "28px 36px",
                fontSize: 28,
                fontWeight: 500,
                lineHeight: 1.9,
                color: theme.colors.text,
              }}
            >
              <div style={{ color: theme.colors.accent, fontFamily: theme.fonts.mono, fontSize: 21, marginBottom: 8 }}>
                AGENT · 方向稿
              </div>
              {BRIEF_POINTS.map((p, i) => {
                const p2 = spring({ frame: frame - 110 - i * 16, fps, config: theme.spring.snappy });
                return (
                  <div key={p} style={{ opacity: p2, transform: `translateX(${(1 - p2) * -26}px)` }}>
                    · {p}
                  </div>
                );
              })}
            </div>
          </Entrance>

          <Entrance delay={150}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                border: `2px solid ${theme.colors.accent}`,
                borderRadius: 18,
                padding: "18px 40px",
                boxShadow: `0 0 ${34 * pulse + 10}px ${theme.colors.accent}44`,
              }}
            >
              <span style={{ fontSize: 34 }}>⛔</span>
              <span style={{ fontSize: 34, fontWeight: 800, color: theme.colors.accent }}>
                门 A · 等待用户确认
              </span>
            </div>
          </Entrance>
          <Entrance delay={185}>
            <div style={{ fontSize: 24, color: theme.colors.textDim }}>
              六道门：A 方向 · B 素材 · C 原型 · D 契约 · E 验收 · F 留痕 —— 每道门都是人工停点
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

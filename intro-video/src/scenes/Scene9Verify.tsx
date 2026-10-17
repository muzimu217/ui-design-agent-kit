// 参赛 S5 浏览器六维验收：2×3 宫格递进点亮（截图为 demand-insights 实测证据）。
import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Entrance, SceneExit, Stack } from "../components";

const CELL_W = 560;
const CELL_H = 340;

export const Scene9Verify: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cells = [
    {
      title: "桌面 1440",
      body: (
        <Img
          src={staticFile("media/verify-desktop.png")}
          style={{ width: "100%", height: 250, objectFit: "cover", borderRadius: 12 }}
        />
      ),
    },
    {
      title: "移动 390",
      body: (
        <div style={{ display: "flex", justifyContent: "center", height: 250, alignItems: "center" }}>
          <Img
            src={staticFile("media/verify-mobile.png")}
            style={{ height: 250, objectFit: "cover", borderRadius: 12 }}
          />
        </div>
      ),
    },
    { title: "键盘链路", body: <BigMono text="Tab ↹ 焦点环可见" sub="Enter 展开 · Esc 关闭 · 焦点返回" /> },
    { title: "对比度实测", body: <BigMono text="14.40 : 1" sub="正文/卡片 · WCAG AA ≥ 4.5（脚本实测）" accent /> },
    { title: "Reduced Motion", body: <BigMono text="animation: none" sub="系统减少动效 → 全部静止" /> },
    { title: "Console", body: <BigMono text="0 errors" sub="加载后全流程无报错" /> },
  ];
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", gap: 40, fontFamily: theme.fonts.display }}
        >
          <Entrance delay={2}>
            <div style={{ fontSize: 60, fontWeight: 800 }}>
              真实浏览器，<span style={{ color: theme.colors.primary }}>六维验收</span>
            </div>
          </Entrance>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(3, ${CELL_W}px)`, gap: 30 }}>
            {cells.map((c, i) => {
              const p = spring({ frame: frame - 20 - i * 34, fps, config: theme.spring.smooth });
              return (
                <div
                  key={c.title}
                  style={{
                    opacity: p,
                    transform: `scale(${0.92 + p * 0.08})`,
                    background: theme.colors.bgAlt,
                    border: `1px solid ${theme.colors.textDim}22`,
                    borderRadius: 20,
                    padding: 22,
                    height: CELL_H,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 27, fontWeight: 700 }}>{c.title}</span>
                    <span
                      style={{
                        fontFamily: theme.fonts.mono,
                        fontSize: 20,
                        color: "#34D399",
                        opacity: p,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {c.body}
                  </div>
                </div>
              );
            })}
          </div>
          <Entrance delay={220}>
            <div style={{ fontSize: 22, color: theme.colors.textDim, fontFamily: theme.fonts.mono }}>
              截图取自 demo/demand-insights 实测证据 · 对比度为脚本实测值
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

const BigMono: React.FC<{ text: string; sub: string; accent?: boolean }> = ({ text, sub, accent }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontFamily: theme.fonts.mono,
        fontSize: 46,
        fontWeight: 700,
        color: accent ? theme.colors.accent : theme.colors.text,
      }}
    >
      {text}
    </div>
    <div style={{ fontSize: 19, color: theme.colors.textDim, marginTop: 10 }}>{sub}</div>
  </div>
);

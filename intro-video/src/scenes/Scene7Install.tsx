// 参赛 S3 一键接入：终端打字机重演（文本取自真实执行记录，角标如实标注）。
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Entrance, SceneExit, Stack } from "../components";

// 2026-10-10 真实执行的命令与输出（uak-init 全局安装实测记录）
const LINES: { text: string; kind: "cmd" | "out" | "ok"; start: number }[] = [
  { text: "$ npm install -g github:muzimu217/ui-design-agent-kit", kind: "cmd", start: 8 },
  { text: "added 16 packages in 3s", kind: "out", start: 58 },
  { text: "$ cd my-project && uak-init", kind: "cmd", start: 92 },
  { text: "✓ UAK 接入完成（宿主=other）：", kind: "ok", start: 148 },
  { text: "  · .agents/uak-prompt.md  ← 六道门工作流提示词", kind: "out", start: 178 },
  { text: "  · AGENTS.md（created）  ← 宿主自动加载", kind: "out", start: 202 },
  { text: "  · .agents/uak-mcp-setup.md  ← MCP 三必配步骤", kind: "out", start: 226 },
  { text: "下一步：对本项目任一页面说「做一次只读验收」", kind: "out", start: 262 },
];

const COLOR = { cmd: theme.colors.accent, out: "#D4D4D8", ok: "#34D399" } as const;

export const Scene7Install: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", fontFamily: theme.fonts.display }}
        >
          <Entrance delay={2}>
            <div style={{ fontSize: 60, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>
              一条命令，<span style={{ color: theme.colors.primary }}>装进你的 Agent</span>
            </div>
          </Entrance>
          <Entrance delay={14}>
            <div
              style={{
                width: 1420,
                borderRadius: 22,
                overflow: "hidden",
                border: `1px solid ${theme.colors.textDim}33`,
                background: "#08080D",
                boxShadow: "0 50px 100px -30px rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "16px 22px",
                  background: theme.colors.bgAlt,
                  borderBottom: `1px solid ${theme.colors.textDim}22`,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: 99,
                      background: theme.colors.textDim,
                      opacity: 0.5 - i * 0.12,
                    }}
                  />
                ))}
                <span
                  style={{ marginLeft: 14, fontSize: 19, color: theme.colors.textDim, fontFamily: theme.fonts.mono }}
                >
                  terminal — uak-init
                </span>
              </div>
              <div style={{ padding: "30px 36px", fontFamily: theme.fonts.mono, fontSize: 27, lineHeight: 1.9 }}>
                {LINES.map((l) => {
                  const chars = Math.max(0, Math.floor((frame - l.start) / 0.9));
                  const done = chars >= l.text.length;
                  if (frame < l.start) return <div key={l.start} style={{ height: 27 * 1.9 }} />;
                  return (
                    <div key={l.start} style={{ color: COLOR[l.kind], whiteSpace: "pre" }}>
                      {l.text.slice(0, chars)}
                      {l.kind === "cmd" && !done ? (
                        <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▌</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </Entrance>
          <Entrance delay={100}>
            <div
              style={{
                marginTop: 34,
                fontSize: 22,
                color: theme.colors.textDim,
                fontFamily: theme.fonts.mono,
                letterSpacing: "0.04em",
              }}
            >
              终端演示重演 · 文本取自 2026-10-10 真实执行记录
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

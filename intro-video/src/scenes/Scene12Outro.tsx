// 参赛 S8 片尾：三端仓库 + 13 宿主官方图标带 + 开源声明。
import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Entrance, SceneExit, Spark, Stack } from "../components";

const REPOS = [
  { label: "GitHub · 主链", url: "github.com/muzimu217/ui-design-agent-kit" },
  { label: "GitCode · 备选", url: "gitcode.com/muzimu217/ui-design-agent-kit" },
  { label: "Gitee · 镜像", url: "gitee.com/muzimu217/ui-design-agent-kit" },
];

const HOSTS = [
  "openai-codex.webp",
  "claude-code.ico",
  "cursor.ico",
  "gemini-cli.png",
  "github-copilot.svg",
  "windsurf.ico",
  "cline.png",
  "opencode.png",
  "zcode.png",
  "deepseek.png",
  "openclaw.svg",
  "workbuddy.svg",
  "hermes.png",
];

export const Scene12Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneExit>
      <Stack>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", gap: 42, fontFamily: theme.fonts.display }}
        >
          <Spark size={86} delay={0} />
          <Entrance delay={8}>
            <div style={{ fontSize: 58, fontWeight: 800, textAlign: "center" }}>
              开源 · <span style={{ color: theme.colors.primary }}>多端同步</span>
            </div>
          </Entrance>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {REPOS.map((r, i) => (
              <Entrance key={r.url} delay={26 + i * 14}>
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "baseline",
                    background: theme.colors.bgAlt,
                    border: `1px solid ${theme.colors.textDim}22`,
                    borderRadius: 16,
                    padding: "18px 34px",
                  }}
                >
                  <span style={{ fontSize: 25, fontWeight: 700, color: theme.colors.accent, whiteSpace: "nowrap" }}>
                    {r.label}
                  </span>
                  <span style={{ fontFamily: theme.fonts.mono, fontSize: 24, color: theme.colors.text }}>
                    {r.url}
                  </span>
                </div>
              </Entrance>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {HOSTS.map((h, i) => {
              const p = spring({ frame: frame - 90 - i * 5, fps, config: theme.spring.snappy });
              return (
                <div
                  key={h}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 14,
                    background: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${p})`,
                  }}
                >
                  <Img src={staticFile(`media/hosts/${h}`)} style={{ width: 42, height: 42, objectFit: "contain" }} />
                </div>
              );
            })}
          </div>
          <Entrance delay={150}>
            <div style={{ fontSize: 24, color: theme.colors.textDim, fontFamily: theme.fonts.mono }}>
              13 家 Agent 宿主接入 · Apache-2.0 · UI Design Agent Kit
            </div>
          </Entrance>
        </AbsoluteFill>
      </Stack>
    </SceneExit>
  );
};

import React from "react";
import { Composition } from "remotion";
import { BrandTeaser } from "./BrandTeaser";
import { BrandLoop } from "./BrandLoop";

/**
 * remotion-brand-animation 评测交付物。
 * 结构基线：Remotion 官方 blank 模板（github.com/remotion-dev/templates/tree/main/blank，MIT）
 * 与官方 registerRoot 文档（remotion.dev/docs/register-root）——仅结构惯例，零代码复制。
 * BrandLoop 为 animation-ecosystem-routing 批次三 preview（复用同一已验证运行时，零新依赖）。
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="brand-teaser"
        component={BrandTeaser}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="brand-loop"
        component={BrandLoop}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

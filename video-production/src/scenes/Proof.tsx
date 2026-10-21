import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {CAPTURES} from '../captures';
import {ScreenFrame} from '../components/ScreenFrame';

/**
 * SCENE 2 — proof of existence: the real workbench, live-captured.
 * Technique borrowed from product-demo references (remotion-cinematic /
 * saas-product-demo): a geometry-aware push-in on one real window, plus a
 * schematic side panel that annotates what the viewer is looking at.
 * Numbers come from src/data.json (generated from the repo's own JSON).
 */

export const ProofScene: React.FC<{
  durationInFrames: number;
  data: {
    knowledgeCards: number;
    capabilitiesAdopted: number;
    capabilitiesTotal: number;
    artifacts: number;
    iterationRows: number;
  };
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();

  const titleIn = interpolate(frame, [4, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const cardIn = interpolate(frame, [10, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sideIn = interpolate(frame, [26, 44], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const stats = [
    {v: `${data.artifacts}`, l: '产物入墙', c: C.violet},
    {v: `${data.knowledgeCards}`, l: '机制知识卡', c: C.cyan},
    {v: `${data.capabilitiesAdopted}/${data.capabilitiesTotal}`, l: '能力已接入', c: C.ok},
    {v: `${data.iterationRows}`, l: '迭代记录', c: C.warn},
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* soft ambient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 68% 34%, ${C.violet}1f 0%, transparent 52%), radial-gradient(circle at 12% 82%, ${C.cyan}14 0%, transparent 46%)`,
        }}
      />

      <div style={{position: 'absolute', left: 112, top: 108, width: 640, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 16, letterSpacing: '0.3em', color: C.cyan, marginBottom: 18}}>
          不是概念图 · 现场运行
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 54,
            lineHeight: 1.24,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.025em',
          }}
        >
          这些界面
          <br />
          是项目自己的产物
        </div>
        <div style={{marginTop: 22, fontFamily: FONT, fontSize: 21, lineHeight: 1.6, color: C.dim, width: 520}}>
          画布工作台、产物墙、指标看板 ——
          <br />
          全部由仓库脚本离线生成，零依赖。
        </div>
      </div>

      <div style={{opacity: cardIn, transform: `translateY(${(1 - cardIn) * 40}px)`}}>
        <ScreenFrame
          src={CAPTURES.canvasIndex}
          url="output/canvas-index.html"
          label="画布工作台入口"
          x={806}
          y={132}
          width={1004}
          height={648}
          push={0.06}
          glow={C.violet}
        />
      </div>

      {/* side annotation panel */}
      <div
        style={{
          position: 'absolute',
          left: 806,
          top: 812,
          width: 1004,
          display: 'flex',
          gap: 14,
          opacity: sideIn,
          transform: `translateY(${(1 - sideIn) * 20}px)`,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.l}
            style={{
              flex: 1,
              padding: '16px 18px',
              borderRadius: 10,
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderTop: `2px solid ${s.c}`,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 34,
                fontWeight: 700,
                color: s.c,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.v}
            </div>
            <div style={{marginTop: 8, fontFamily: FONT, fontSize: 15, color: C.dim}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* left rule */}
      <div
        style={{
          position: 'absolute',
          left: 112,
          top: 108,
          width: 3,
          height: 92 * titleIn,
          background: C.violet,
        }}
      />
    </AbsoluteFill>
  );
};

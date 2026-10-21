import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {ScreenFrame} from '../components/ScreenFrame';
import {CAPTURES} from '../captures';

/**
 * SCENE — the requirement chain page (white-box). A vertical chain of six
 * decision nodes draws itself top-to-bottom while the real page scrolls on the
 * right; each node's connector fills as the page reaches that section. This is
 * the "how it decided" beat: the viewer sees the AI's reasoning trail.
 */
export const ChainScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const steps = [
    {n: '01', k: '原始口语', v: '「做一个深色数据看板」'},
    {n: '02', k: '解析摘要', v: '用户/场景/范围被写死'},
    {n: '03', k: '理解验证', v: 'AI 复述 → 你比对确认'},
    {n: '04', k: '决策抽屉', v: '每步的依据可展开'},
    {n: '05', k: '契约钉版', v: 'token 与动效参数'},
    {n: '06', k: '证据留痕', v: '回执 + 版本 + 路径'},
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 22% 30%, ${C.violet}16 0%, transparent 52%), radial-gradient(circle at 88% 76%, ${C.cyan}12 0%, transparent 46%)`,
        }}
      />

      <div style={{position: 'absolute', left: 104, top: 92, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.violet, marginBottom: 14}}>
          产品界面 · 03 解析链路
        </div>
        <div style={{fontFamily: FONT, fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.24}}>
          它怎么想的，
          <br />
          一步一步摊开给你
        </div>
      </div>

      {/* vertical chain */}
      <div style={{position: 'absolute', left: 104, top: 330, width: 620}}>
        {steps.map((s, i) => {
          const at = 20 + i * 22;
          const inn = interpolate(frame, [at, at + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const lineGrow = interpolate(frame, [at + 8, at + 26], [0, 1], clamp);
          const active = frame > at + 6 && frame < at + 40;
          return (
            <div key={s.n} style={{position: 'relative', paddingLeft: 46, paddingBottom: 18, opacity: inn}}>
              {/* connector */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: 30,
                    width: 2,
                    height: 46,
                    background: C.line,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{width: 2, height: `${lineGrow * 100}%`, background: C.violet}} />
                </div>
              )}
              {/* node */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 2,
                  width: 28,
                  height: 28,
                  borderRadius: 99,
                  border: `1px solid ${active ? C.violet : C.line}`,
                  background: active ? `${C.violet}22` : C.panel,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: MONO,
                  fontSize: 11,
                  color: active ? C.violet : C.dim,
                  transition: 'none',
                }}
              >
                {s.n}
              </div>
              <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, color: C.text}}>{s.k}</div>
              <div style={{fontFamily: FONT, fontSize: 16, color: C.dim, marginTop: 2}}>{s.v}</div>
            </div>
          );
        })}
      </div>

      <div style={{opacity: interpolate(frame, [26, 54], [0, 1], clamp)}}>
        <ScreenFrame
          src={CAPTURES.chain}
          label="chain-canvas-workbench.html"
          url="output/chain-canvas-workbench.html"
          width={880}
          height={820}
          x={880}
          y={132}
          push={0.05}
          glow={C.violet}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 96,
          bottom: 74,
          fontFamily: FONT,
          fontSize: 17,
          color: C.dim,
          opacity: interpolate(t, [0.5, 0.72], [0, 1], clamp),
          textAlign: 'right',
        }}
      >
        黑盒步骤自动标黄 ——
        <br />
        没解释的地方，本身就是证据
      </div>
    </AbsoluteFill>
  );
};

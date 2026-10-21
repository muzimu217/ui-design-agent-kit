import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {CAPTURES} from '../captures';
import {ScreenFrame} from '../components/ScreenFrame';

/**
 * SCENE 5 — knowledge base + capability registry, with the honesty beat.
 * Technique: the "counter + red exception card" pattern (a hard mode break at
 * ~12s cadence). Here the red card is the project's own append-only failure log.
 */

export const KnowledgeScene: React.FC<{
  durationInFrames: number;
  data: {
    knowledgeCards: number;
    capabilitiesAdopted: number;
    capabilitiesTotal: number;
    regressions: number;
    regressionsResolved: number;
    kbCards: {title: string; domain: string; layer: string}[];
  };
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();

  const head = interpolate(frame, [2, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const card = interpolate(frame, [8, 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  // Mode break at ~55% : the honesty card slides in hard.
  const breakAt = Math.round(durationInFrames * 0.52);
  const brk = interpolate(frame, [breakAt, breakAt + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const dim = interpolate(frame, [breakAt, breakAt + 12], [1, 0.35], clamp);

  const bars = data.kbCards;

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 22% 18%, ${C.cyan}14 0%, transparent 46%), radial-gradient(circle at 88% 78%, ${C.violet}18 0%, transparent 48%)`,
        }}
      />

      <div style={{opacity: dim}}>
        <div style={{position: 'absolute', left: 112, top: 92, opacity: head}}>
          <div style={{fontFamily: MONO, fontSize: 16, letterSpacing: '0.3em', color: C.cyan, marginBottom: 14}}>
            知识库 · 能力接入登记
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 50,
              fontWeight: 700,
              color: C.text,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            机制写成卡，能力登记在册
          </div>
        </div>

        {/* KB card list */}
        <div
          style={{
            position: 'absolute',
            left: 112,
            top: 268,
            width: 760,
            opacity: card,
            transform: `translateX(${(1 - card) * -24}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: MONO,
              fontSize: 14,
              color: C.dim,
              letterSpacing: '0.12em',
              paddingBottom: 10,
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <span>机制知识卡</span>
            <span style={{color: C.cyan}}>{data.knowledgeCards} 张</span>
          </div>
          {bars.map((b, i) => {
            const p = interpolate(frame, [16 + i * 3, 28 + i * 3], [0, 1], clamp);
            return (
              <div
                key={b.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '8px 0',
                  borderBottom: `1px solid ${C.line}22`,
                  opacity: p,
                  transform: `translateX(${(1 - p) * -14}px)`,
                }}
              >
                <span style={{fontFamily: MONO, fontSize: 12, color: C.violet, width: 22}}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 17,
                    color: C.text,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {b.title}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: C.dim,
                    border: `1px solid ${C.line}`,
                    borderRadius: 99,
                    padding: '2px 9px',
                  }}
                >
                  {b.layer}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{opacity: card}}>
          <ScreenFrame
            src={CAPTURES.miniDashboard}
            url="output/mini-dashboard.html"
            label="流水线指标看板"
            x={932}
            y={252}
            width={876}
            height={470}
            push={0.04}
            glow={C.cyan}
          />
        </div>

        {/* capability registry strip */}
        <div
          style={{
            position: 'absolute',
            left: 932,
            top: 762,
            width: 876,
            display: 'flex',
            gap: 14,
            opacity: interpolate(frame, [40, 56], [0, 1], clamp),
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              borderRadius: 10,
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderTop: `2px solid ${C.ok}`,
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.ok}}>
              {data.capabilitiesAdopted}
              <span style={{color: C.dim, fontSize: 20}}>/{data.capabilitiesTotal}</span>
            </div>
            <div style={{marginTop: 6, fontFamily: FONT, fontSize: 15, color: C.dim}}>能力已接入 / 已登记</div>
          </div>
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              borderRadius: 10,
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderTop: `2px solid ${C.violet}`,
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.violet}}>{data.knowledgeCards}</div>
            <div style={{marginTop: 6, fontFamily: FONT, fontSize: 15, color: C.dim}}>机制知识卡</div>
          </div>
        </div>
      </div>

      {/* honesty card — hard mode break */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div
          style={{
            position: 'absolute',
            left: 112,
            top: 330,
            width: 1696,
            padding: '38px 44px',
            borderRadius: 14,
            background: 'rgba(20,8,10,0.96)',
            border: `1px solid ${C.red}66`,
            borderLeft: `5px solid ${C.red}`,
            boxShadow: `0 30px 90px rgba(0,0,0,0.8), 0 0 80px ${C.red}22`,
            opacity: brk,
            transform: `translateY(${(1 - brk) * 40}px) scale(${0.985 + brk * 0.015})`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 13,
                letterSpacing: '0.16em',
                color: C.red,
                border: `1px solid ${C.red}66`,
                borderRadius: 4,
                padding: '4px 10px',
              }}
            >
              反例卡 · 只增不删
            </span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.dim}}>canvas/regressions.json</span>
          </div>

          <div
            style={{
              fontFamily: FONT,
              fontSize: 46,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.24,
            }}
          >
            连自己的漏计事故，也挂在墙上。
          </div>

          <div
            style={{
              marginTop: 18,
              fontFamily: FONT,
              fontSize: 22,
              color: '#d8b4b4',
              lineHeight: 1.55,
              width: 1320,
            }}
          >
            reducedMotion 漏计、导出 manifest 自我漂移、空态永不显示 ——
            三条真实缺陷全部留档，修复后标 resolved，记录不删除。
          </div>

          <div style={{display: 'flex', gap: 56, marginTop: 30}}>
            {[
              {v: `${data.regressions}`, l: '反例卡留档'},
              {v: `${data.regressionsResolved}`, l: '已修复并留痕'},
              {v: '0', l: '被删除的失败记录'},
            ].map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 42,
                    fontWeight: 700,
                    color: s.v === '0' ? C.ok : '#ffffff',
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div style={{marginTop: 8, fontFamily: FONT, fontSize: 16, color: C.dim}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

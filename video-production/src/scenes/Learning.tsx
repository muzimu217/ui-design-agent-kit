import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * SCENE — the self-learning loop (L1-L4 daily KPIs). This is the mechanism the
 * first cut never explained: how the knowledge base keeps growing. Four KPI
 * lanes fill in with real numbers from learning-log.json, then the day's tally
 * lands. Sources are named with their play counts — heat is a signal, not proof.
 */
export const LearningScene: React.FC<{
  durationInFrames: number;
  data: {
    entries: {loop: number; videos: number; minutes: number; cards: string[]; converted: string}[];
    totals: {videos: number; minutes: number; cards: number; conversions: number};
  };
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const kpis = [
    {id: 'L1', name: '视频学习', v: `${data.totals.videos} 条`, note: '≥10 万播放，按播放排序取证', c: C.cyan},
    {id: 'L2', name: '知识卡入库', v: `${data.totals.cards} 张`, note: '每条必须带可编码参数', c: C.violet},
    {id: 'L3', name: '兼容性声明', v: 'extends/supersedes/conflicts', note: '冲突以证据消解，不拍脑袋', c: C.warn},
    {id: 'L4', name: '可执行转化', v: `${data.totals.conversions} 项`, note: '卡 → 代码 / 规则 / 语料', c: C.ok},
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 26% 24%, ${C.cyan}16 0%, transparent 50%), radial-gradient(circle at 80% 78%, ${C.ok}12 0%, transparent 46%)`,
        }}
      />

      <div style={{position: 'absolute', left: 104, top: 84, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.cyan, marginBottom: 14}}>
          自学机制 · 每日 KPI
        </div>
        <div style={{fontFamily: FONT, fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: '-0.025em'}}>
          知识库不是拍出来的，是每天读出来的
        </div>
      </div>

      {/* four KPI lanes */}
      <div style={{position: 'absolute', left: 104, top: 250, width: 900}}>
        {kpis.map((k, i) => {
          const at = 20 + i * 20;
          const inn = interpolate(frame, [at, at + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div
              key={k.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '16px 0',
                borderTop: `1px solid ${C.line}`,
                opacity: inn,
                transform: `translateX(${(1 - inn) * -18}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: k.c,
                  border: `1px solid ${k.c}55`,
                  borderRadius: 5,
                  padding: '2px 9px',
                  width: 40,
                  textAlign: 'center',
                  flex: 'none',
                }}
              >
                {k.id}
              </span>
              <span style={{fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.text, width: 130}}>{k.name}</span>
              <span style={{fontFamily: MONO, fontSize: 19, color: k.c, width: 230}}>{k.v}</span>
              <span style={{fontFamily: FONT, fontSize: 14, color: C.dim}}>{k.note}</span>
            </div>
          );
        })}
      </div>

      {/* today's tally */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 250,
          width: 760,
          padding: '24px 26px',
          borderRadius: 12,
          background: C.panel,
          border: `1px solid ${C.line}`,
          borderLeft: `3px solid ${C.cyan}`,
          opacity: interpolate(frame, [56, 84], [0, 1], clamp),
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: C.dim, marginBottom: 14}}>
          LEARNING-LOG.JSON · 当日
        </div>
        <div style={{display: 'flex', gap: 30, marginBottom: 18}}>
          {[
            {v: data.totals.videos, l: '视频', c: C.cyan},
            {v: data.totals.minutes, l: '分钟', c: C.violet},
            {v: data.totals.cards, l: '卡片', c: C.warn},
            {v: data.totals.conversions, l: '转化', c: C.ok},
          ].map((m) => (
            <div key={m.l}>
              <div style={{fontFamily: MONO, fontSize: 38, fontWeight: 700, color: m.c, lineHeight: 1}}>{m.v}</div>
              <div style={{fontFamily: FONT, fontSize: 13, color: C.dim, marginTop: 4}}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{fontFamily: FONT, fontSize: 13, color: C.dim, lineHeight: 1.7}}>
          未计时的如实标 estimated · 非视频轮如实记 videos=0
          <br />
          <span style={{color: C.ok}}>KPI 判定从记录字段计算，不是硬编码</span>
        </div>
      </div>

      {/* recent conversions */}
      <div
        style={{
          position: 'absolute',
          left: 104,
          bottom: 168,
          width: 1600,
          opacity: interpolate(t, [0.6, 0.8], [0, 1], clamp),
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: C.dim, marginBottom: 10}}>
          最近转化 · 卡 → 代码
        </div>
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          {data.entries.slice(-3).map((e) => (
            <div
              key={e.loop}
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.text,
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: '7px 12px',
                maxWidth: 520,
              }}
            >
              <span style={{fontFamily: MONO, color: C.violet, marginRight: 8}}>#{e.loop}</span>
              {e.converted.length > 44 ? `${e.converted.slice(0, 44)}…` : e.converted}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

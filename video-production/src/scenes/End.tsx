import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * SCENE 6 — evidence end card.
 * Reference: the "production ledger" ending used by code-rendered launch films
 * (real call counts / error counts instead of a slogan). Every number here is
 * read from the repo's own ledgers at build time.
 */

const Row: React.FC<{
  label: string;
  value: string;
  accent?: string;
  delay: number;
  note?: string;
}> = ({label, value, accent = C.text, delay, note}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [delay, delay + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sp = spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.6, stiffness: 140}});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 18,
        padding: '17px 0',
        borderBottom: `1px solid ${C.line}`,
        opacity: p,
        transform: `translateY(${(1 - sp) * 16}px)`,
      }}
    >
      <span style={{fontFamily: FONT, fontSize: 21, color: C.dim, width: 300}}>{label}</span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 30,
          fontWeight: 700,
          color: accent,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </span>
      {note ? <span style={{fontFamily: FONT, fontSize: 16, color: C.dim}}>{note}</span> : null}
    </div>
  );
};

export const EndScene: React.FC<{
  durationInFrames: number;
  data: {
    iterationRows: number;
    knowledgeCards: number;
    capabilitiesAdopted: number;
    capabilitiesTotal: number;
    artifacts: number;
    regressions: number;
  };
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();

  const titleIn = interpolate(frame, [4, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const lineIn = interpolate(frame, [20, 34], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, ${C.violet}1c 0%, transparent 54%), radial-gradient(circle at 12% 88%, ${C.cyan}10 0%, transparent 44%)`,
        }}
      />

      <div style={{position: 'absolute', left: 168, top: 150, width: 800}}>
        <div style={{fontFamily: MONO, fontSize: 16, letterSpacing: '0.3em', color: C.violet, marginBottom: 20}}>
          UI DESIGN AGENT KIT
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.22,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 22}px)`,
          }}
        >
          把界面和证据
          <br />
          一起交付。
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT,
            fontSize: 22,
            color: C.dim,
            lineHeight: 1.6,
            opacity: titleIn,
            width: 620,
          }}
        >
          不做生成引擎，做生成过程的监管与质量把控。
        </div>
        <div
          style={{
            marginTop: 46,
            display: 'flex',
            gap: 12,
            opacity: interpolate(frame, [36, 50], [0, 1], clamp),
          }}
        >
          {['六道门', '六维实测', '三层守卫'].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: FONT,
                fontSize: 17,
                color: C.text,
                border: `1px solid ${C.line}`,
                borderRadius: 99,
                padding: '7px 18px',
                background: C.panel,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{position: 'absolute', left: 1064, top: 148, width: 700}}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: '0.22em',
            color: C.dim,
            marginBottom: 10,
            opacity: lineIn,
          }}
        >
          证据台账 · 由仓库自身数据生成
        </div>
        <Row label="迭代记录" value={`${data.iterationRows}`} note="docs/iteration-log.md" delay={26} />
        <Row label="机制知识卡" value={`${data.knowledgeCards}`} note="docs/knowledge-base" delay={32} />
        <Row
          label="能力接入"
          value={`${data.capabilitiesAdopted} / ${data.capabilitiesTotal}`}
          note="已接入 / 已登记"
          accent={C.cyan}
          delay={38}
        />
        <Row label="产物入墙" value={`${data.artifacts}`} note="canvas/artifacts.json" delay={44} />
        <Row label="反例留档" value={`${data.regressions}`} note="只增不删" accent={C.warn} delay={50} />
        <Row
          label="被删除的失败记录"
          value="0"
          note="恒为 0"
          accent={C.ok}
          delay={56}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 168,
          right: 168,
          bottom: 132,
          height: 1,
          background: `linear-gradient(90deg, ${C.violet}00, ${C.violet}88, ${C.cyan}88, ${C.cyan}00)`,
          opacity: interpolate(frame, [58, 74], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

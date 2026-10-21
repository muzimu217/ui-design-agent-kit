import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * SCENE — capability registry + knowledge base in depth (the "we don't build
 * generators" beat, long form). Left: a registry table where adopted rows light
 * up and empty slots stay visibly empty. Right: the 10 knowledge cards stacked
 * by layer. The point: gaps are shown, not hidden.
 */
export const RegistryScene: React.FC<{
  durationInFrames: number;
  data: {adopted: string[]; total: number; adoptedCount: number; kbCards: {title: string; layer: string}[]};
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const rows = [
    ...data.adopted.map((n) => ({name: n, status: 'adopted' as const})),
    {name: '图像生成能力', status: 'evaluating' as const},
    {name: '3D 建模能力', status: 'evaluating' as const},
    {name: 'Mobbin MCP', status: 'rejected' as const},
  ];

  const statusMeta = {
    adopted: {label: '已接入', c: C.ok},
    evaluating: {label: '待接入', c: C.warn},
    rejected: {label: '不接入', c: C.red},
  };

  const layerMeta: Record<string, {label: string; c: string}> = {
    composition: {label: '构成', c: C.violet},
    motion: {label: '运动', c: C.cyan},
    order: {label: '秩序', c: C.ok},
  };

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 30% 20%, ${C.ok}14 0%, transparent 50%), radial-gradient(circle at 82% 80%, ${C.violet}12 0%, transparent 46%)`,
        }}
      />

      <div style={{position: 'absolute', left: 104, top: 88, opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.ok, marginBottom: 14}}>
          产品界面 · 04 能力接入 × 知识库
        </div>
        <div style={{fontFamily: FONT, fontSize: 46, fontWeight: 700, color: C.text, letterSpacing: '-0.025em'}}>
          不造引擎，只造监管层
        </div>
      </div>

      {/* registry table */}
      <div style={{position: 'absolute', left: 104, top: 240, width: 760}}>
        <div style={{display: 'flex', gap: 12, marginBottom: 14}}>
          <span style={{fontFamily: MONO, fontSize: 13, color: C.dim, letterSpacing: '0.16em'}}>
            能力接入登记 · {data.adoptedCount}/{data.total}
          </span>
        </div>
        {rows.map((r, i) => {
          const at = 18 + i * 14;
          const inn = interpolate(frame, [at, at + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const m = statusMeta[r.status];
          return (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '13px 16px',
                marginBottom: 8,
                borderRadius: 8,
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${m.c}`,
                opacity: inn,
                transform: `translateX(${(1 - inn) * -14}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: m.c,
                  border: `1px solid ${m.c}66`,
                  borderRadius: 99,
                  padding: '1px 10px',
                  width: 66,
                  textAlign: 'center',
                  flex: 'none',
                }}
              >
                {m.label}
              </span>
              <span style={{fontFamily: FONT, fontSize: 19, color: C.text, flex: 1}}>{r.name}</span>
              <span style={{fontFamily: MONO, fontSize: 12, color: C.dim}}>
                {r.status === 'adopted' ? 'adopted' : r.status === 'rejected' ? 'rejected' : 'evaluating'}
              </span>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT,
            fontSize: 16,
            color: C.dim,
            opacity: interpolate(t, [0.45, 0.66], [0, 1], clamp),
          }}
        >
          空槽位不是待填的坑 —— 是「还没找到合格候选」的诚实状态
        </div>
      </div>

      {/* knowledge cards by layer */}
      <div style={{position: 'absolute', right: 96, top: 240, width: 820}}>
        <div style={{fontFamily: MONO, fontSize: 13, color: C.dim, letterSpacing: '0.16em', marginBottom: 14}}>
          机制知识卡 · {data.kbCards.length} 张 · 三层
        </div>
        {(['composition', 'motion', 'order'] as const).map((layer, li) => {
          const cards = data.kbCards.filter((c) => c.layer === layer);
          const meta = layerMeta[layer];
          const at = 26 + li * 20;
          const inn = interpolate(frame, [at, at + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div key={layer} style={{marginBottom: 16, opacity: inn}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6}}>
                <span style={{width: 8, height: 8, borderRadius: 99, background: meta.c}} />
                <span style={{fontFamily: FONT, fontSize: 15, fontWeight: 600, color: meta.c}}>{meta.label}</span>
                <span style={{fontFamily: MONO, fontSize: 12, color: C.dim}}>{cards.length} 卡</span>
              </div>
              {cards.map((c) => (
                <div
                  key={c.title}
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    color: C.dim,
                    padding: '5px 0 5px 18px',
                    borderLeft: `1px solid ${C.line}`,
                  }}
                >
                  {c.title.length > 34 ? `${c.title.slice(0, 34)}…` : c.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

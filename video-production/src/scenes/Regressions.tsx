import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * SCENE — the regression wall (the honesty beat). Three real defects are shown
 * as cards: what broke, the root cause, the fix, the lesson. All three are
 * marked resolved and NONE are deleted — the counter at the bottom says
 * "deleted: 0" and that number is the product's actual claim.
 *
 * This is content the first cut never had: it is the only scene that shows the
 * product failing at itself.
 */
export const RegressionsScene: React.FC<{
  durationInFrames: number;
  data: {total: number; resolved: number; deleted: number};
}> = ({durationInFrames, data}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;

  const titleIn = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  const cards = [
    {
      id: 'reg-001',
      title: 'reducedMotion 完成度漏计',
      what: '判定依赖措辞关键词，条目写"静态检查"不含关键词 → 徽章误报 5/6',
      root: '判据与文案耦合，无 drift 守卫',
      lesson: '验收判据必须与措辞解耦',
      fix: '文案修正 + dataGuard + 语料三件套',
    },
    {
      id: 'reg-002',
      title: '导出 manifest 自我漂移',
      what: 'manifest 把自身字节写进自身列表，二次写入导致对账失败（978→1178）',
      root: '自指记账：写自身即改变自身',
      lesson: '记账系统不能把自己算进被记账对象',
      fix: 'selfExcluded 声明 + 对账对称豁免',
    },
    {
      id: 'reg-003',
      title: '产物墙空态永不显示',
      what: '空态区块加入页面时未接显隐逻辑，过滤为空时用户只看到空白',
      root: '只加了展示层，没接状态层',
      lesson: '加条件显示区块必须同笔接状态层',
      fix: 'wallFilter 统计可见数并切换 hidden',
    },
  ];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 4%, ${C.red}1c 0%, transparent 56%)`,
        }}
      />

      <div style={{position: 'absolute', left: 0, right: 0, top: 76, textAlign: 'center', opacity: titleIn}}>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: C.red, marginBottom: 14}}>
          诚实模式 · 反例记录
        </div>
        <div style={{fontFamily: FONT, fontSize: 50, fontWeight: 700, color: C.text, letterSpacing: '-0.025em'}}>
          它把自己的事故，也挂在墙上
        </div>
        <div style={{marginTop: 12, fontFamily: FONT, fontSize: 18, color: C.dim}}>
          失败记录的传播力，不低于成功案例
        </div>
      </div>

      {cards.map((c, i) => {
        const at = 26 + i * 30;
        const inn = interpolate(frame, [at, at + 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: 92 + i * 596,
              top: 268,
              width: 560,
              padding: '20px 22px 18px',
              borderRadius: 10,
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderLeft: `3px solid ${C.red}`,
              boxShadow: `0 24px 70px rgba(0,0,0,0.7)`,
              opacity: inn,
              transform: `translateY(${(1 - inn) * 22}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10}}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: C.ok,
                  border: `1px solid ${C.ok}66`,
                  borderRadius: 99,
                  padding: '1px 9px',
                }}
              >
                已修复
              </span>
              <span style={{fontFamily: MONO, fontSize: 11, color: C.dim}}>{c.id}</span>
            </div>
            <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 10, lineHeight: 1.35}}>
              {c.title}
            </div>
            <div style={{fontFamily: FONT, fontSize: 14, color: C.dim, lineHeight: 1.65, marginBottom: 10}}>{c.what}</div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.warn,
                lineHeight: 1.6,
                paddingTop: 9,
                borderTop: `1px solid ${C.line}`,
              }}
            >
              根因 · {c.root}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.ok,
                lineHeight: 1.6,
                paddingTop: 7,
              }}
            >
              教训 · {c.lesson}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 176,
          textAlign: 'center',
          opacity: interpolate(t, [0.62, 0.82], [0, 1], clamp),
        }}
      >
        <div style={{display: 'inline-flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontFamily: FONT, fontSize: 22, color: C.dim}}>反例</span>
          <span style={{fontFamily: MONO, fontSize: 46, color: C.text, fontWeight: 700}}>{data.total}</span>
          <span style={{fontFamily: FONT, fontSize: 22, color: C.dim}}>条 · 已修复</span>
          <span style={{fontFamily: MONO, fontSize: 46, color: C.ok, fontWeight: 700}}>{data.resolved}</span>
          <span style={{fontFamily: FONT, fontSize: 22, color: C.dim}}>· 已删除</span>
          <span style={{fontFamily: MONO, fontSize: 46, color: C.red, fontWeight: 700}}>{data.deleted}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

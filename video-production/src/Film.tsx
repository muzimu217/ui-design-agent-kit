import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {HookScene} from './scenes/Hook';
import {ProofScene} from './scenes/Proof';
import {GatesScene} from './scenes/Gates3D';
import {GuardsScene} from './scenes/Guards';
import {KnowledgeScene} from './scenes/Knowledge';
import {EndScene} from './scenes/End';
import {WorkbenchScene} from './scenes/Workbench';
import {WallScene} from './scenes/Wall';
import {ChainScene} from './scenes/Chain';
import {RegressionsScene} from './scenes/Regressions';
import {TasteScene} from './scenes/Taste';
import {LearningScene} from './scenes/Learning';
import {MiniScene} from './scenes/Mini';
import {Caption} from './components/Caption';
import {Grain} from './components/Grain';
import {C} from './theme';
import data from './data.json';

/**
 * Timeline (30 fps, 4950 frames = 165s / 2:45).
 *
 * Second extended cut. The first extended cut padded existing beats; this one
 * replaces padding with NEW content:
 *   - the UI walkthrough beats are tightened (10s each instead of 17-18s)
 *   - the duplicated registry scene is gone (Knowledge already covers it)
 *   - three genuinely new scenes are added:
 *       REGRESSIONS  the wall of its own defects (deleted: 0)
 *       TASTE        the taste profile: signals -> traits -> adoption threshold
 *       LEARNING     the daily L1-L4 self-learning KPIs and real tallies
 *
 *  0.0 –  4.0  HOOK        conflict question
 *  4.0 – 12.0  PROOF       real workbench + counters
 * 12.0 – 22.0  WORKBENCH   UI 01: mission control (tight)
 * 22.0 – 32.0  WALL        UI 02: artifact wall + six-dim (tight)
 * 32.0 – 42.0  CHAIN       UI 03: decision chain (tight)
 * 42.0 – 60.0  REGRESSIONS NEW: the defect wall, deleted: 0
 * 60.0 – 78.0  TASTE       NEW: signals -> traits -> threshold
 * 78.0 – 96.0  LEARNING    NEW: L1-L4 daily KPIs
 * 96.0 –115.0  GATES 3D    dolly through six gate frames
 *115.0 –132.0  GUARDS      3 guards + six-dimension receipt
 *132.0 –148.0  KNOWLEDGE   cards + honesty break
 *148.0 –156.0  MINI        metrics board (tight)
 *156.0 –165.0  END         evidence ledger
 */

const T = {
  hook: {from: 0, dur: 120},
  proof: {from: 120, dur: 240},
  workbench: {from: 360, dur: 300},
  wall: {from: 660, dur: 300},
  chain: {from: 960, dur: 300},
  regressions: {from: 1260, dur: 540},
  taste: {from: 1800, dur: 540},
  learning: {from: 2340, dur: 540},
  gates: {from: 2880, dur: 570},
  guards: {from: 3450, dur: 510},
  knowledge: {from: 3960, dur: 480},
  mini: {from: 4440, dur: 240},
  end: {from: 4680, dur: 270},
};

const CAPTIONS: {from: number; to: number; text: string; accent: string}[] = [
  {from: 10, to: 112, text: 'AI 能写出整个界面 —— 但你怎么知道它做得对？', accent: C.cyan},
  {from: 132, to: 350, text: '工作台、产物墙、指标看板：都是仓库自己跑出来的真实页面', accent: C.violet},

  {from: 376, to: 470, text: '工作台：左边「走到哪」，右边「有什么可复核」', accent: C.cyan},
  {from: 476, to: 652, text: '执行态与证据态分离 —— 进度永远不能冒充验收', accent: C.violet},

  {from: 676, to: 790, text: '产物墙：每件产物都带着自己的体检报告', accent: C.violet},
  {from: 796, to: 950, text: '六维实测，和对标并排：不可观测记「—」，不计分母', accent: C.warn},

  {from: 976, to: 1100, text: '解析链路：它怎么想的，一步一步摊开给你', accent: C.cyan},
  {from: 1106, to: 1250, text: '黑盒步骤自动标黄：没解释的地方，本身就是证据', accent: C.ok},

  {from: 1278, to: 1440, text: '接下来是别处看不到的部分：它把自己的事故也挂在墙上', accent: C.red},
  {from: 1446, to: 1620, text: 'reducedMotion 漏计 · manifest 自我漂移 · 空态永不显示', accent: C.warn},
  {from: 1626, to: 1780, text: '三条反例全部已修复，一条都没删 —— 已删除：0', accent: C.ok},

  {from: 1808, to: 1960, text: '品味档案：它只记你说过的话，不做心理画像', accent: C.violet},
  {from: 1966, to: 2140, text: '每条特质都能回溯到具体原话，置信度按证据封顶', accent: C.cyan},
  {from: 2146, to: 2320, text: '采用门槛 0.8 且需 ≥2 条独立信号 —— 单信号只能「仅展示」', accent: C.warn},

  {from: 2348, to: 2500, text: '自学机制：知识库不是拍出来的，是每天读出来的', accent: C.cyan},
  {from: 2506, to: 2680, text: 'L1 视频学习 · L2 卡片入库 · L3 兼容性 · L4 可执行转化', accent: C.violet},
  {from: 2686, to: 2860, text: '未计时的如实标 estimated，非视频轮如实记 videos=0', accent: C.ok},

  {from: 2900, to: 3080, text: '六道门：每一道都要你点头，没确认就不往下走', accent: C.cyan},
  {from: 3086, to: 3260, text: '方向 · 参考 · 契约 · 修订 · 验收 · 留痕', accent: C.violet},
  {from: 3266, to: 3440, text: '真实三维：门框沿走廊排列，相机一路推进', accent: C.ok},

  {from: 3468, to: 3660, text: '三层守卫 + 六维实测：没测的维度记「—」，不虚记', accent: C.ok},
  {from: 3666, to: 3860, text: '数据 / 渲染 / 分发 —— 每层都被 fixture 证明能失败', accent: C.warn},

  {from: 3988, to: 4160, text: '知识库 10 卡，按构成 / 运动 / 秩序三层归档', accent: C.violet},
  {from: 4166, to: 4320, text: '每条机制都带可编码参数，能直接变成代码', accent: C.cyan},
  {from: 4326, to: 4430, text: '能力接入 4/10：空槽位是诚实状态，不是待填的坑', accent: C.warn},

  {from: 4460, to: 4560, text: '指标看板：密度来自排版，不是把文字调暗', accent: C.cyan},
  {from: 4566, to: 4660, text: '微循环预览：4.2 秒描边动画，静音自动循环', accent: C.ok},

  {from: 4700, to: 4830, text: '不做生成引擎，做生成过程的监管与质量把控', accent: C.cyan},
  {from: 4836, to: 4940, text: '把界面和证据，一起交付', accent: C.violet},
];

/**
 * Two-frame white flash on each scene boundary. This is the "hard cut" punctuation
 * taken from Vox-style explainers: the cut itself is felt, not dissolved.
 */
const CutFlashes: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = [
    T.proof.from,
    T.workbench.from,
    T.wall.from,
    T.chain.from,
    T.regressions.from,
    T.taste.from,
    T.learning.from,
    T.gates.from,
    T.guards.from,
    T.knowledge.from,
    T.mini.from,
    T.end.from,
  ];
  const near = cuts.find((c) => frame >= c - 1 && frame <= c + 1);
  if (near === undefined) return null;
  const d = Math.abs(frame - near);
  const o = d === 0 ? 0.16 : d === 1 ? 0.07 : 0;
  if (o === 0) return null;
  return <AbsoluteFill style={{background: '#ffffff', opacity: o, mixBlendMode: 'screen'}} />;
};

const CaptionTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const active = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (!active) return null;
  const show = interpolate(
    frame,
    [active.from, active.from + 8, active.to - 8, active.to],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  return <Caption text={active.text} show={show} accent={active.accent} />;
};

export const Film: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Sequence from={T.hook.from} durationInFrames={T.hook.dur} name="01 Hook">
        <HookScene durationInFrames={T.hook.dur} />
      </Sequence>

      <Sequence from={T.proof.from} durationInFrames={T.proof.dur} name="02 Proof">
        <ProofScene durationInFrames={T.proof.dur} data={data.counts} />
      </Sequence>

      <Sequence from={T.workbench.from} durationInFrames={T.workbench.dur} name="03 Workbench UI">
        <WorkbenchScene durationInFrames={T.workbench.dur} />
      </Sequence>

      <Sequence from={T.wall.from} durationInFrames={T.wall.dur} name="04 Wall UI">
        <WallScene durationInFrames={T.wall.dur} />
      </Sequence>

      <Sequence from={T.chain.from} durationInFrames={T.chain.dur} name="05 Chain UI">
        <ChainScene durationInFrames={T.chain.dur} />
      </Sequence>

      <Sequence from={T.regressions.from} durationInFrames={T.regressions.dur} name="06 Regressions (new)">
        <RegressionsScene
          durationInFrames={T.regressions.dur}
          data={{
            total: data.counts.regressions,
            resolved: data.counts.regressionsResolved,
            deleted: data.counts.regressionsDeleted,
          }}
        />
      </Sequence>

      <Sequence from={T.taste.from} durationInFrames={T.taste.dur} name="07 Taste profile (new)">
        <TasteScene durationInFrames={T.taste.dur} data={data.taste} />
      </Sequence>

      <Sequence from={T.learning.from} durationInFrames={T.learning.dur} name="08 Self-learning (new)">
        <LearningScene durationInFrames={T.learning.dur} data={data.learning} />
      </Sequence>

      <Sequence from={T.gates.from} durationInFrames={T.gates.dur} name="09 Gates 3D">
        <GatesScene durationInFrames={T.gates.dur} />
      </Sequence>

      <Sequence from={T.guards.from} durationInFrames={T.guards.dur} name="10 Guards">
        <GuardsScene durationInFrames={T.guards.dur} />
      </Sequence>

      <Sequence from={T.knowledge.from} durationInFrames={T.knowledge.dur} name="11 Knowledge">
        <KnowledgeScene durationInFrames={T.knowledge.dur} data={{...data.counts, kbCards: data.kbCards}} />
      </Sequence>

      <Sequence from={T.mini.from} durationInFrames={T.mini.dur} name="12 Mini Dashboard">
        <MiniScene durationInFrames={T.mini.dur} />
      </Sequence>

      <Sequence from={T.end.from} durationInFrames={T.end.dur} name="13 End">
        <EndScene durationInFrames={T.end.dur} data={data.counts} />
      </Sequence>

      <Audio src={staticFile("music.wav")} volume={0.85} />
      <CutFlashes />
      <Grain opacity={0.55} />
      <CaptionTrack />
    </AbsoluteFill>
  );
};

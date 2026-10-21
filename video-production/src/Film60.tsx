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
import {Caption} from './components/Caption';
import {Grain} from './components/Grain';
import {C} from './theme';
import data from './data.json';
import tl from './timeline-60.json';

/**
 * 60-second standard cut (UakIntro60) — the delivery-form second length from
 * knowledge card video-sixty-second-delivery-form. One narrative skeleton
 * shared with the 165s hero (Film.tsx): same scene order, three depth scenes
 * (taste/learning/mini) dropped, every kept scene trimmed to its own beats —
 * re-edited, never mechanically cropped.
 *
 * The timeline lives in timeline-60.json (checked by scripts/timeline-check.mjs);
 * this component only lays it out. No render happens until the user approves —
 * `npx remotion render UakIntro60` is the ready command.
 */

const ACCENTS = {cyan: C.cyan, violet: C.violet, warn: C.warn, ok: C.ok, red: C.red} as const;

const SCENE_COMPONENTS: Record<string, React.FC<{durationInFrames: number}>> = {
  hook: HookScene,
  proof: ({durationInFrames}) => <ProofScene durationInFrames={durationInFrames} data={data.counts} />,
  workbench: WorkbenchScene,
  wall: WallScene,
  chain: ChainScene,
  regressions: ({durationInFrames}) => (
    <RegressionsScene
      durationInFrames={durationInFrames}
      data={{
        total: data.counts.regressions,
        resolved: data.counts.regressionsResolved,
        deleted: data.counts.regressionsDeleted,
      }}
    />
  ),
  gates: GatesScene,
  guards: GuardsScene,
  knowledge: ({durationInFrames}) => (
    <KnowledgeScene durationInFrames={durationInFrames} data={{...data.counts, kbCards: data.kbCards}} />
  ),
  end: ({durationInFrames}) => <EndScene durationInFrames={durationInFrames} data={data.counts} />,
};

const CaptionTrack60: React.FC = () => {
  const frame = useCurrentFrame();
  const active = tl.captions.find((c) => frame >= c.from && frame < c.to);
  if (!active) return null;
  const show = interpolate(
    frame,
    [active.from, active.from + 8, active.to - 8, active.to],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const accent = ACCENTS[active.accent as keyof typeof ACCENTS] ?? C.cyan;
  return <Caption text={active.text} show={show} accent={accent} />;
};

/** Two-frame white flash on each scene boundary — same punctuation as the hero cut. */
const CutFlashes60: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = tl.scenes.slice(1).map((s) => s.from);
  const near = cuts.find((c) => frame >= c - 1 && frame <= c + 1);
  if (near === undefined) return null;
  const d = Math.abs(frame - near);
  const o = d === 0 ? 0.16 : d === 1 ? 0.07 : 0;
  if (o === 0) return null;
  return <AbsoluteFill style={{background: '#ffffff', opacity: o, mixBlendMode: 'screen'}} />;
};

export const Film60: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {tl.scenes.map((s, i) => {
        const Scene = SCENE_COMPONENTS[s.id];
        if (!Scene) return null;
        const name = `${String(i + 1).padStart(2, '0')} ${s.id[0].toUpperCase()}${s.id.slice(1)}`;
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={name}>
            <Scene durationInFrames={s.dur} />
          </Sequence>
        );
      })}
      <Audio src={staticFile('music.wav')} volume={tl.audio.bgmGain} />
      <CutFlashes60 />
      <Grain opacity={0.55} />
      <CaptionTrack60 />
    </AbsoluteFill>
  );
};

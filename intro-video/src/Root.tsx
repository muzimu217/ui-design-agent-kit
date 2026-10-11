// 总装：TransitionSeries 滑切串联五幕；音轨按绝对帧对位（音效先于落点 2-3 帧）。
import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { theme } from "./theme";
import { Scene1Title } from "./scenes/Scene1Title";
import { Scene2Gates } from "./scenes/Scene2Gates";
import { Scene3Showcase } from "./scenes/Scene3Showcase";
import { Scene4Numbers } from "./scenes/Scene4Numbers";
import { Scene5Outro } from "./scenes/Scene5Outro";
import { Scene6Pain } from "./scenes/Scene6Pain";
import { Scene7Install } from "./scenes/Scene7Install";
import { Scene8GateA } from "./scenes/Scene8GateA";
import { Scene9Verify } from "./scenes/Scene9Verify";
import { Scene10Evidence } from "./scenes/Scene10Evidence";
import { Scene11Montage } from "./scenes/Scene11Montage";
import { Scene12Outro } from "./scenes/Scene12Outro";

// 幕长：120+165+165+120+90=660，滑切重叠 4×14=56 → 成片 604 帧 ≈ 20.1s（对齐 20s 配乐）
const Sfx: React.FC<{ from: number; src: string; volume: number }> = ({
  from,
  src,
  volume,
}) => (
  <Sequence from={from}>
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UIAIntro"
        component={UIAIntro}
        durationInFrames={604}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CompetitionEntry"
        component={CompetitionEntry}
        durationInFrames={3162}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

// ===== 参赛片（docs/competition-submission-plan.md §3.2 分镜）=====
// v2 节奏（用户裁定提速）：270+360+480+390+660+360+440+300=3260，滑切 7×14=98
// → 3162 帧 ≈ 105.4s（1:45）
// 场景起点：0/256/602/1068/1444/2090/2436/2862
const CompetitionEntry: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    {/* 配乐床：20s 主题循环 6 遍覆盖全片（节拍不追剪点，已知限制） */}
    {[0, 604, 1208, 1812, 2416, 3020].map((from) => (
      <Sequence key={from} from={from}>
        <Audio src={staticFile("sfx/track.wav")} volume={0.2} />
      </Sequence>
    ))}
    {/* 转场音效：先于切点 2 帧 */}
    {[254, 600, 1066, 1442, 2088, 2434, 2860].map((from) => (
      <Sfx key={from} from={from} src="sfx/whoosh.wav" volume={0.5} />
    ))}
    <Sfx from={26} src="sfx/pop.wav" volume={0.55} />
    <Sfx from={1500} src="sfx/pop.wav" volume={0.5} />
    <Sfx from={2790} src="sfx/bass.wav" volume={0.7} />

    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={270}>
        <Scene1Title />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={360}>
        <Scene6Pain />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={480}>
        <Scene7Install />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={390}>
        <Scene8GateA />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={660}>
        <Scene9Verify />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={360}>
        <Scene10Evidence />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={440}>
        <Scene11Montage />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={300}>
        <Scene12Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

const UIAIntro: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    {/* 配乐床：120BPM，节拍 = 15 帧，幕长均为其倍数，剪切点落在拍上 */}
    <Audio src={staticFile("sfx/track.wav")} volume={0.22} />
    {/* 转场音效：先于切点 2 帧 */}
    <Sfx from={104} src="sfx/whoosh.wav" volume={0.5} />
    <Sfx from={255} src="sfx/whoosh.wav" volume={0.5} />
    <Sfx from={406} src="sfx/whoosh.wav" volume={0.5} />
    <Sfx from={512} src="sfx/whoosh.wav" volume={0.45} />
    {/* 落点点缀 */}
    <Sfx from={26} src="sfx/pop.wav" volume={0.55} />
    <Sfx from={448} src="sfx/bass.wav" volume={0.7} />

    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={120}>
        <Scene1Title />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={165}>
        <Scene2Gates />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={165}>
        <Scene3Showcase />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={120}>
        <Scene4Numbers />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 14 })}
      />
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene5Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

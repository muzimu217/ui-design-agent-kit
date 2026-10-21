import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {Film60} from './Film60';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UakIntro"
        component={Film}
        durationInFrames={4950}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 60s standard cut — timeline contract in timeline-60.json; render only on user approval. */}
      <Composition
        id="UakIntro60"
        component={Film60}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

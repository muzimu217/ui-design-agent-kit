import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="UakIntro"
      component={Film}
      durationInFrames={4950}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

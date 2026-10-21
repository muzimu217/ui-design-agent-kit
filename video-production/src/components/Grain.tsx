import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

/** Film grain + vignette + scanline texture. Deterministic, no randomness per frame. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.5}) => {
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'overlay',
          opacity: 0.5,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 20% 10%, ${C.violet}14 0%, transparent 45%), radial-gradient(circle at 82% 88%, ${C.cyan}10 0%, transparent 42%)`,
        }}
      />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {clamp} from '../theme';

/**
 * Shared scene entry/exit. Each scene owns its own in/out so transitions stay
 * frame-accurate and never depend on a global clock.
 */
export const SceneWrap: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  inFrames?: number;
  outFrames?: number;
  /** Direction of the entrance push. */
  from?: 'bottom' | 'left' | 'right' | 'none';
  background?: string;
}> = ({children, durationInFrames, inFrames = 14, outFrames = 12, from = 'bottom', background}) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, inFrames], [0, 1], clamp);
  const exit = interpolate(frame, [durationInFrames - outFrames, durationInFrames], [1, 0], clamp);
  const p = Math.min(enter, exit);

  const offset =
    from === 'bottom' ? (1 - enter) * 26 : from === 'left' ? -(1 - enter) * 60 : from === 'right' ? (1 - enter) * 60 : 0;

  return (
    <AbsoluteFill
      style={{
        background,
        opacity: p,
        transform: `translate3d(${from === 'bottom' || from === 'none' ? 0 : offset}px, ${
          from === 'bottom' ? offset : 0
        }px, 0) scale(${0.985 + p * 0.015})`,
        filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

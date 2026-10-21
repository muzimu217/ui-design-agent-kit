import React from 'react';
import {Img, useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';

/**
 * A real capture from the running project UI, presented in a browser chrome.
 * The push-in is deliberately small (1.0 -> 1.05) so the screenshot stays legible.
 */
export const ScreenFrame: React.FC<{
  src: string;
  label: string;
  url?: string;
  /** local frame */
  width: number;
  height: number;
  x: number;
  y: number;
  push?: number;
  rotate?: number;
  glow?: string;
  opacity?: number;
}> = ({src, label, url, width, height, x, y, push = 0.05, rotate = 0, glow = C.violet, opacity = 1}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 90], [0, 1], clamp);
  const scale = 1 + push * t;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity,
        transform: `rotate(${rotate}deg)`,
        borderRadius: 14,
        background: C.panel,
        border: `1px solid ${C.line}`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03), 0 0 90px ${glow}22`,
        overflow: 'hidden',
      }}
    >
      {/* browser chrome */}
      <div
        style={{
          height: 46,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          background: C.panel2,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {['#f87171', '#fbbf24', '#34d399'].map((c) => (
          <div key={c} style={{width: 11, height: 11, borderRadius: 99, background: c, opacity: 0.75}} />
        ))}
        <div
          style={{
            marginLeft: 12,
            fontFamily: MONO,
            fontSize: 15,
            color: C.dim,
            letterSpacing: '0.01em',
          }}
        >
          {url ?? 'output/site.html'}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            fontFamily: FONT,
            fontSize: 14,
            color: C.text,
            background: `${glow}22`,
            border: `1px solid ${glow}55`,
            borderRadius: 99,
            padding: '3px 12px',
          }}
        >
          {label}
        </div>
      </div>
      <div style={{position: 'absolute', inset: '46px 0 0 0', overflow: 'hidden'}}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            transform: `scale(${scale})`,
            transformOrigin: '50% 30%',
          }}
        />
      </div>
    </div>
  );
};

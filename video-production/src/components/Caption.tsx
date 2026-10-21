import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from '../theme';

/**
 * Subtitle band. Reserved bottom safe area so it never covers the subject:
 * visuals are composed above y=880, captions live in y=884..1004.
 */
export const Caption: React.FC<{
  text: string;
  /** 0..1 visibility */
  show?: number;
  accent?: string;
}> = ({text, show = 1, accent = C.violet}) => {
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 76,
          display: 'flex',
          justifyContent: 'center',
          opacity: show,
          transform: `translateY(${(1 - show) * 10}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '13px 26px',
            borderRadius: 6,
            background: 'rgba(7,7,10,0.82)',
            border: `1px solid ${C.line}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.55)',
          }}
        >
          <div
            style={{
              width: 3,
              height: 24,
              borderRadius: 2,
              background: accent,
              flex: 'none',
            }}
          />
          <div
            style={{
              fontFamily: FONT,
              fontSize: 33,
              lineHeight: 1.25,
              color: '#f4f4f8',
              letterSpacing: '0.01em',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

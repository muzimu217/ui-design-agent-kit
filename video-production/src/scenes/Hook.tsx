import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C, FONT, MONO, clamp} from '../theme';
import {CAPTURES} from '../captures';

/**
 * SCENE 1 — hook.
 * Reference technique (Vox / premium launch films): the first 3 seconds carry a
 * conflict, not a logo. We open on 4 hard cuts of the *real* running product
 * (evidence of "this exists"), then land the question as kinetic type.
 */

const FLASHES = [CAPTURES.site, CAPTURES.canvasIndex, CAPTURES.miniDashboard, CAPTURES.chain];

const FLASH_LEN = 9;

const FlashCuts: React.FC<{frame: number}> = ({frame}) => {
  const idx = Math.min(FLASHES.length - 1, Math.floor(frame / FLASH_LEN));
  if (frame >= FLASHES.length * FLASH_LEN) return null;
  const local = frame - idx * FLASH_LEN;
  const o = interpolate(local, [0, 1, FLASH_LEN - 1, FLASH_LEN], [0, 1, 1, 0], clamp);
  const s = interpolate(local, [0, FLASH_LEN], [1.16, 1.0], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Img
        src={FLASHES[idx]}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}}
      />
      <AbsoluteFill style={{background: 'rgba(7,7,10,0.55)'}} />
    </AbsoluteFill>
  );
};

/** A hard-edged bar wipe, borrowed from newsprint/Vox lower-third step reveals. */
const BarWipe: React.FC<{delay: number; width: number; color: string; top: number; height: number}> = ({
  delay,
  width,
  color,
  top,
  height,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div
      style={{
        position: 'absolute',
        left: 168,
        top,
        width: width * p,
        height,
        background: color,
        opacity: 0.9,
      }}
    />
  );
};

export const HookScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();

  const q1 = interpolate(frame, [36, 50], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const q2 = interpolate(frame, [50, 66], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const strike = interpolate(frame, [70, 86], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sub = interpolate(frame, [84, 98], [0, 1], clamp);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.035], clamp);

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <FlashCuts frame={frame} />
      </AbsoluteFill>

      {/* vignette so type stays readable over any cut */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 34% 50%, rgba(7,7,10,0.94) 0%, rgba(7,7,10,0.86) 34%, rgba(7,7,10,0.35) 72%, rgba(7,7,10,0.7) 100%)',
        }}
      />

      <AbsoluteFill>
        <BarWipe delay={30} width={92} color={C.violet} top={352} height={4} />

        <div style={{position: 'absolute', left: 168, top: 384, width: 1180}}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 92,
              lineHeight: 1.18,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: '#ffffff',
              opacity: q1,
              transform: `translateY(${(1 - q1) * 26}px)`,
            }}
          >
            AI 能写出整个界面。
          </div>

          <div
            style={{
              marginTop: 10,
              fontFamily: FONT,
              fontSize: 92,
              lineHeight: 1.18,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: '#ffffff',
              opacity: q2,
              transform: `translateY(${(1 - q2) * 26}px)`,
              position: 'relative',
              display: 'inline-block',
            }}
          >
            但你怎么知道它做得
            <span style={{position: 'relative', color: C.cyan}}>
              对
              <span
                style={{
                  position: 'absolute',
                  left: -6,
                  right: -6,
                  top: '54%',
                  height: 6,
                  background: C.cyan,
                  transform: `scaleX(${strike})`,
                  transformOrigin: 'left center',
                  opacity: 0.85,
                }}
              />
            </span>
            ？
          </div>

          <div
            style={{
              marginTop: 46,
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: '0.18em',
              color: C.dim,
              opacity: sub,
            }}
          >
            生成能力越强 · 监管层越值钱
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

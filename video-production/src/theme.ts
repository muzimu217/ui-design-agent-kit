export const C = {
  bg: '#07070a',
  panel: '#101017',
  panel2: '#15151f',
  line: '#23232f',
  text: '#ededf2',
  dim: '#9595a8',
  violet: '#a78bfa',
  cyan: '#22d3ee',
  ok: '#34d399',
  warn: '#fbbf24',
  red: '#f87171',
} as const;

export const FONT =
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", -apple-system, "Helvetica Neue", sans-serif';

export const MONO =
  'ui-monospace, "SF Mono", SFMono-Regular, Menlo, "PingFang SC", monospace';

/** Deterministic PRNG — never use Math.random() inside frame logic. */
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

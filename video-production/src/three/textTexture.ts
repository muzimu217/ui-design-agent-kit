import * as THREE from 'three';
import {FONT} from '../theme';

/**
 * Renders text into a CanvasTexture so Chinese glyphs work inside WebGL.
 * Deterministic: same input -> same texture. Called once per mount via useMemo.
 */
export const makeTextTexture = (
  lines: {text: string; size: number; color: string; weight?: number; mono?: boolean}[],
  opts: {width?: number; height?: number; pad?: number; align?: CanvasTextAlign} = {}
) => {
  const width = opts.width ?? 512;
  const height = opts.height ?? 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  const totalH = lines.reduce((s, l) => s + l.size * 1.32, 0);
  let y = height / 2 - totalH / 2;
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = 'top';
  const x = opts.align === 'left' ? (opts.pad ?? 24) : width / 2;

  for (const l of lines) {
    ctx.font = `${l.weight ?? 600} ${l.size}px ${l.mono ? 'ui-monospace, Menlo, monospace' : FONT}`;
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, x, y);
    y += l.size * 1.32;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
};

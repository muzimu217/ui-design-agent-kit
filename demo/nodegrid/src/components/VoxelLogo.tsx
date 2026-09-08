import { useId, useState } from 'react';

import './VoxelLogo.css';

/**
 * 3D 体素云 logo（logo-demo.html v4 移植）。
 * 点击 / 回车切换「轮转展示」双态；reduced-motion 由 CSS 降级为静态。
 * size：单格边长 px（原稿 22）。
 */

// 88 格三层（与 logo-demo.html 完全一致）
const LAYER0: [number, number, number][] = [
  // z 行 → x 范围
  ...range(4, 6, 0),
  ...range(2, 8, 1),
  ...range(1, 9, 2),
  ...range(0, 11, 3),
  ...range(1, 10, 4),
  ...range(2, 9, 5),
  ...range(4, 6, 6),
];
const LAYER1: [number, number, number][] = [
  ...range(4, 7, 1),
  ...range(3, 8, 2),
  ...range(2, 9, 3),
  ...range(3, 8, 4),
  ...range(4, 7, 5),
];
const LAYER2: [number, number, number][] = [...range(5, 6, 2), ...range(4, 7, 3), ...range(5, 6, 4)];

function range(x0: number, x1: number, z: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let x = x0; x <= x1; x++) out.push([x, 0, z]);
  return out;
}

const DROPS: { dx: number; t: string; d: string }[] = [
  { dx: -4.2, t: '3.4s', d: '.2s' },
  { dx: -2.4, t: '2.8s', d: '1.1s' },
  { dx: -0.6, t: '3.1s', d: '.6s' },
  { dx: 1.2, t: '2.6s', d: '1.6s' },
  { dx: 3.0, t: '3.6s', d: '.9s' },
  { dx: 4.6, t: '3.2s', d: '1.3s' },
];

export interface VoxelLogoProps {
  size?: number;
  showWordmark?: boolean;
  showState?: boolean;
}

export default function VoxelLogo({ size = 22, showWordmark = true, showState = false }: VoxelLogoProps) {
  const [showcase, setShowcase] = useState(false);
  const labelId = useId();

  const cells = [...LAYER0, ...LAYER1.map(([x, , z]) => [x, 1, z] as [number, number, number]), ...LAYER2.map(([x, , z]) => [x, 2, z] as [number, number, number])];

  return (
    <div
      className={`vlogo${showcase ? ' showcase' : ''}`}
      style={{ ['--s' as string]: `${size}px` }}
      role="button"
      tabIndex={0}
      aria-pressed={showcase}
      aria-label="NODEGRID 体素云 logo，点击切换 360 度轮转展示"
      onClick={() => setShowcase((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowcase((v) => !v);
        }
      }}
    >
      <div className="halo" aria-hidden="true" />
      <div className="tilt" aria-hidden="true">
        <div className="ring r3" />
        <div className="ring r2" />
        <div className="ring r1" />
        <div className="cloud">
          {cells.map(([x, y, z], i) => (
            <i key={i} className="c" style={{ ['--x' as string]: x, ['--y' as string]: y, ['--z' as string]: z }}>
              <s />
              <s />
              <s />
              <s />
              <s />
            </i>
          ))}
          <span className="drops">
            {DROPS.map((d, i) => (
              <u key={i} style={{ ['--dx' as string]: d.dx, ['--t' as string]: d.t, ['--d' as string]: d.d }} />
            ))}
          </span>
        </div>
        <span className="sweep a" />
        <span className="sweep b" />
      </div>
      {showWordmark && (
        <span className="wordmark" aria-hidden="true">
          NODE<b>GRID</b>
        </span>
      )}
      {showWordmark && (
        <span className="tagline" aria-hidden="true" id={labelId}>
          全球节点云 · CLOUD &amp; BARE METAL
        </span>
      )}
      {showState && (
        <span className="state" aria-hidden="true">
          {showcase ? '轮转展示 · 双轴环绕 + 双扫光' : '待机 · 缓慢自转'}
        </span>
      )}
    </div>
  );
}

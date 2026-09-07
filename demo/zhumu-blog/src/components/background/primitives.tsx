/**
 * 墨竹绘制基元（§9，全部代码绘制，禁位图）。
 * 艺术基准：references/prototype-ink-bamboo.png 的构图气质——
 * 左下/右上斜出、竹节、浓淡分层（焦 0.20 / 浓 0.16 / 淡 0.10 / 极淡 0.06）。
 * 墨色统一引用 var(--z-ink)（亮=墨、暗=纸色反墨），用 fill-opacity 分层。
 */
import type { ReactNode } from 'react';

export const INK = {
  zhao: 0.2, // 焦墨
  nong: 0.16, // 浓墨
  dan: 0.1, // 淡墨
  jidan: 0.06, // 极淡墨
} as const;

/** 竹叶：两端尖的透镜形，长 L 宽 W。原点在叶柄端。 */
export function leafPath(L: number, W = L * 0.16): string {
  return [
    `M 0 0`,
    `C ${L * 0.3} ${-W}, ${L * 0.72} ${-W * 0.9}, ${L} 0`,
    `C ${L * 0.72} ${W * 0.9}, ${L * 0.3} ${W}, 0 0`,
    `Z`,
  ].join(' ');
}

interface StalkProps {
  /** 基点（竹竿入画处） */
  x: number;
  y: number;
  /** 总长（沿竿方向） */
  len: number;
  /** 与竖直方向夹角（正=向右倾） */
  angle?: number;
  width: number;
  segs?: number;
  opacity?: number;
  /** 竿体分段错位（有机感） */
  jitter?: number;
}

/** 竹竿：分节、微锥、双 path 叠加模拟侧锋（浓墨主体 + 淡墨侧边），节环深一圈。 */
export function Stalk({
  x,
  y,
  len,
  angle = 6,
  width,
  segs = 5,
  opacity = INK.nong,
  jitter = 3,
}: StalkProps) {
  const segH = len / segs;
  const items: ReactNode[] = [];
  for (let i = 0; i < segs; i++) {
    const w = width * (1 - i * 0.055);
    const wNext = width * (1 - (i + 1) * 0.055);
    const yTop = -(i + 1) * segH + 1.6;
    const dx = i === 0 ? 0 : ((i % 2 === 0 ? 1 : -1) * jitter * (i / segs)).toFixed(1);
    items.push(
      <g key={`s${i}`} transform={`translate(${dx} 0)`}>
        {/* 主笔：上窄下宽的微梯形，模拟一段竹节 */}
        <path
          d={`M ${-w / 2} ${-i * segH} L ${-wNext / 2} ${yTop} Q 0 ${yTop - 2} ${wNext / 2} ${yTop} L ${w / 2} ${-i * segH} Q 0 ${-i * segH + 2} ${-w / 2} ${-i * segH} Z`}
          fill="var(--z-ink)"
          fillOpacity={opacity}
        />
        {/* 侧锋：贴边淡墨，制造干润对比 */}
        <path
          d={`M ${w / 2 - w * 0.22} ${-i * segH + 2} L ${wNext / 2 - wNext * 0.22} ${yTop - 2}`}
          stroke="var(--z-ink)"
          strokeOpacity={opacity * 0.45}
          strokeWidth={w * 0.12}
          strokeLinecap="round"
          fill="none"
        />
        {/* 节环（除顶端） */}
        {i < segs - 1 && (
          <>
            <rect
              x={-wNext / 2 - wNext * 0.08}
              y={yTop - 2.6}
              width={wNext * 1.16}
              height={3.4}
              rx={1.7}
              fill="var(--z-ink)"
              fillOpacity={Math.min(0.28, opacity * 1.5)}
            />
            {/* 节上小枝芽 */}
            <path
              d={`M ${wNext / 2} ${yTop - 1} q ${wNext * 0.7} ${-1} ${wNext * 1.15} ${-wNext * 0.5}`}
              stroke="var(--z-ink)"
              strokeOpacity={opacity * 0.6}
              strokeWidth={1.4}
              fill="none"
            />
          </>
        )}
      </g>,
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${-angle})`}>{items}</g>
  );
}

interface LeafClusterProps {
  x: number;
  y: number;
  /** 整组缩放 */
  scale?: number;
  /** 组朝向（deg，0=叶尖向右上） */
  angle?: number;
  opacity?: number;
  /** 镜像 */
  flip?: boolean;
  /** 叶数（三五成组） */
  leaves?: 3 | 4 | 5;
}

/** 竹叶组：三五成组、长短相间、聚散有致（对照参考图叶组语言）。 */
export function LeafCluster({
  x,
  y,
  scale = 1,
  angle = 0,
  opacity = INK.zhao,
  flip = false,
  leaves = 4,
}: LeafClusterProps) {
  // 叶：[叶长, 出叶角, 出叶位置比例]
  const presets: Record<number, Array<[number, number, number]>> = {
    3: [
      [46, -18, 0.1],
      [34, 8, 0.28],
      [40, 30, 0.2],
    ],
    4: [
      [48, -22, 0.08],
      [36, 2, 0.24],
      [42, 22, 0.16],
      [30, 44, 0.34],
    ],
    5: [
      [50, -24, 0.06],
      [40, -4, 0.2],
      [46, 16, 0.12],
      [34, 38, 0.3],
      [26, 56, 0.4],
    ],
  };
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle}) scale(${flip ? -scale : scale} ${scale})`}
    >
      {/* 出枝小柄 */}
      <path
        d="M 0 0 q 10 -2 18 1"
        stroke="var(--z-ink)"
        strokeOpacity={opacity * 0.8}
        strokeWidth={1.6}
        fill="none"
      />
      {presets[leaves].map(([L, a, t], i) => (
        <path
          key={i}
          d={leafPath(L)}
          transform={`translate(${18 + t * 26} ${t * 4 - 1}) rotate(${a})`}
          fill="var(--z-ink)"
          fillOpacity={opacity * (1 - i * 0.09)}
        />
      ))}
    </g>
  );
}

/** 飘落/坠地的单叶（静态落叶、底部散叶共用）。 */
export function SingleLeaf({
  x,
  y,
  len = 24,
  angle = 24,
  opacity = INK.dan,
}: {
  x: number;
  y: number;
  len?: number;
  angle?: number;
  opacity?: number;
}) {
  return (
    <path
      d={leafPath(len)}
      transform={`translate(${x} ${y}) rotate(${angle})`}
      fill="var(--z-ink)"
      fillOpacity={opacity}
    />
  );
}

/** 极淡墨底晕：径向渐变椭圆。 */
export function InkWash({
  x,
  y,
  rx,
  ry,
  opacity = INK.jidan,
  id,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  opacity?: number;
  id: string;
}) {
  return (
    <>
      <radialGradient id={id}>
        <stop offset="0%" stopColor="var(--z-ink-wash)" stopOpacity={opacity} />
        <stop offset="70%" stopColor="var(--z-ink-wash)" stopOpacity={opacity * 0.5} />
        <stop offset="100%" stopColor="var(--z-ink-wash)" stopOpacity={0} />
      </radialGradient>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
}

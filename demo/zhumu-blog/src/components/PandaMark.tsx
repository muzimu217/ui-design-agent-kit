/**
 * 原创几何熊猫吉祥物（§9.4）：
 * 圆头（宽:高 ≈1:0.9）、双圆耳、川剧脸谱式弧形眼罩（两段约 60° 弧、外旋 ±20°、不闭合）、
 * 几何点状眼鼻。亮色描边竹绿；暗色眼罩描边透科技蓝微光（.panda-glow）。
 * 禁止位图化。eyeMask 弧线造型为原创绘制，不复刻任何现有造型。
 */

export type PandaPose = 'face' | 'nap' | 'hug';

interface PandaMarkProps {
  size?: number;
  pose?: PandaPose;
  className?: string;
  /** 装饰性使用时不给 role（默认装饰，aria-hidden）。 */
  title?: string;
}

export function PandaMark({ size = 64, pose = 'face', className, title }: PandaMarkProps) {
  const labelled = Boolean(title);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={title}
    >
      {labelled && <title>{title}</title>}

      {pose === 'nap' ? (
        <NapPanda />
      ) : pose === 'hug' ? (
        <HugPanda />
      ) : (
        <FacePanda />
      )}
    </svg>
  );
}

/** 脸谱式眼罩：约 60° 弧段、左右各外旋 ±20°、不闭合。 */
function EyeMask({ cx, cy, rot }: { cx: number; cy: number; rot: number }) {
  // 半径 9 的圆弧，取约 60° 弧段（-30°→30°），沿切线方向微旋转
  return (
    <path
      d="M -4.5 -7.8 A 9 9 0 0 1 4.5 -7.8"
      transform={`translate(${cx} ${cy}) rotate(${rot})`}
      stroke="var(--panda-mask)"
      strokeWidth={3.4}
      strokeLinecap="round"
      fill="none"
      className="panda-glow"
    />
  );
}

function FacePanda() {
  return (
    <g>
      {/* 耳 */}
      <circle cx={16} cy={13} r={8} className="panda-body" />
      <circle cx={48} cy={13} r={8} className="panda-body" />
      {/* 头：宽 52 / 高 47 ≈ 1:0.9 */}
      <ellipse cx={32} cy={36} rx={26} ry={23.5} className="panda-body" />
      {/* 眼罩（脸谱弧）+ 眼 */}
      <EyeMask cx={21.5} cy={33} rot={-20} />
      <EyeMask cx={42.5} cy={33} rot={20} />
      <circle cx={21.5} cy={35} r={2.4} className="panda-dot" />
      <circle cx={42.5} cy={35} r={2.4} className="panda-dot" />
      {/* 鼻 */}
      <ellipse cx={32} cy={44} rx={2.6} ry={2} className="panda-dot" />
      {/* 嘴：安静的一笔 */}
      <path d="M 29 49 Q 32 51 35 49" className="panda-line" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/** 打盹：头枕前倾、闭眼弧线（页脚原创打盹熊猫，§7.13）。 */
function NapPanda() {
  return (
    <g>
      {/* 身体（趴伏） */}
      <ellipse cx={38} cy={48} rx={20} ry={11} className="panda-body" />
      {/* 尾巴 */}
      <circle cx={55} cy={46} r={5} className="panda-body" />
      {/* 头（侧倾贴地） */}
      <circle cx={19} cy={41} r={14} className="panda-body" />
      <circle cx={9} cy={31} r={4.5} className="panda-body" />
      {/* 闭眼：两条安静弧线 */}
      <path d="M 13 41 Q 16 44 19 41" className="panda-line" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M 22 39 Q 25 42 28 39" className="panda-line" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      {/* 鼻 */}
      <ellipse cx={10} cy={45} rx={2.2} ry={1.8} className="panda-dot" />
      {/* Zzz（极淡墨） */}
      <text x={26} y={22} fontSize={9} className="panda-zzz" fill="var(--z-text-tertiary)" fontFamily="var(--font-kai)">
        z
      </text>
      <text x={32} y={16} fontSize={7} className="panda-zzz" fill="var(--z-text-tertiary)" fontFamily="var(--font-kai)">
        z
      </text>
    </g>
  );
}

/** 抱竹节（上拉加载器，§7.9）：几何熊猫抱一根竹节。 */
function HugPanda() {
  return (
    <g>
      {/* 竹节（身后） */}
      <g className="panda-bamboo">
        <rect x={38} y={8} width={12} height={48} rx={5} className="panda-bamboo-fill" />
        <rect x={38} y={24} width={12} height={3.5} rx={1.75} className="panda-bamboo-node" />
      </g>
      {/* 耳 */}
      <circle cx={14} cy={15} r={6.5} className="panda-body" />
      <circle cx={38} cy={15} r={6.5} className="panda-body" />
      {/* 头 */}
      <ellipse cx={26} cy={33} rx={21} ry={19} className="panda-body" />
      <EyeMask cx={17.5} cy={30} rot={-20} />
      <EyeMask cx={34.5} cy={30} rot={20} />
      <circle cx={17.5} cy={32} r={2} className="panda-dot" />
      <circle cx={34.5} cy={32} r={2} className="panda-dot" />
      <ellipse cx={26} cy={40} rx={2.2} ry={1.7} className="panda-dot" />
      {/* 手臂环抱竹节 */}
      <path d="M 40 46 Q 48 44 47 36" className="panda-line" strokeWidth={3} strokeLinecap="round" fill="none" />
      {/* 肚皮上的深色抱握爪（抱住竹节的手） */}
      <circle cx={46} cy={37} r={3.2} className="panda-dot" />
    </g>
  );
}

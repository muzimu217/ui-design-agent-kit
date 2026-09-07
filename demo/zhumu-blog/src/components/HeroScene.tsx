/**
 * hero 原创几何熊猫场景（替代决策见 README）：
 * いらすとya 无「熊猫+电脑」贴合图（3 次站内搜索 0 结果），
 * 按约定改用与吉祥物同语言的原创几何 SVG 场景（熊猫 + 笔电 + 竹）。
 * 禁止位图；亮色竹绿描边、暗色眼罩科技蓝微光由 PandaMark 承担。
 */

export function HeroScene() {
  return (
    <svg
      viewBox="0 0 320 240"
      className="h-auto w-full max-w-[340px]"
      role="img"
      aria-label="原创几何插画：熊猫坐在笔记本前敲代码，旁边有竹子"
    >
      {/* 竹（右侧装饰，装饰点缀可用竹绿亮） */}
      <g opacity={0.85}>
        <rect x={282} y={20} width={14} height={200} rx={7} className="panda-bamboo-fill" />
        <rect x={282} y={72} width={14} height={4} rx={2} className="panda-bamboo-node" />
        <rect x={282} y={130} width={14} height={4} rx={2} className="panda-bamboo-node" />
        <path d="M 284 46 q -18 -4 -26 -20 q 20 2 26 20 z" className="panda-bamboo-fill" />
        <path d="M 284 96 q 18 -6 24 -24 q -20 4 -24 24 z" className="panda-bamboo-fill" />
      </g>

      {/* 笔电（几何线稿） */}
      <g>
        <rect x={96} y={158} width={128} height={70} rx={6} className="hero-laptop" />
        <rect x={108} y={170} width={104} height={46} rx={3} className="hero-laptop-screen" />
        {/* 屏幕上的代码行 */}
        <path d="M 118 182 h 30 M 118 192 h 52 M 118 202 h 40" className="hero-laptop-text" strokeLinecap="round" />
        {/* 键盘底座 */}
        <path d="M 84 232 h 152 l -8 -6 H 92 z" className="hero-laptop" />
      </g>

      {/* 熊猫：趴在笔电后（头 + 爪） */}
      <g transform="translate(34 8) scale(0.9)">
        <PandaFaceGroup />
      </g>
      {/* 前爪搭在笔电沿 */}
      <ellipse cx={124} cy={164} rx={13} ry={9} className="panda-body" />
      <ellipse cx={196} cy={164} rx={13} ry={9} className="panda-body" />
    </svg>
  );
}

/** 场景内嵌熊猫头（复用吉祥物几何，不走独立 svg 根）。 */
function PandaFaceGroup() {
  return (
    <g>
      <circle cx={82} cy={72} r={13} className="panda-body" />
      <circle cx={148} cy={72} r={13} className="panda-body" />
      <ellipse cx={115} cy={100} rx={44} ry={40} className="panda-body" />
      {/* 眼罩弧（±20° 外旋） */}
      <path d="M -4.5 -7.8 A 9 9 0 0 1 4.5 -7.8" transform="translate(97 96) rotate(-20)" stroke="var(--z-link)" strokeWidth={3.2} strokeLinecap="round" fill="none" className="panda-glow" />
      <path d="M -4.5 -7.8 A 9 9 0 0 1 4.5 -7.8" transform="translate(133 96) rotate(20)" stroke="var(--z-link)" strokeWidth={3.2} strokeLinecap="round" fill="none" className="panda-glow" />
      <circle cx={97} cy={99} r={2.2} className="panda-dot" />
      <circle cx={133} cy={99} r={2.2} className="panda-dot" />
      <ellipse cx={115} cy={112} rx={2.4} ry={1.9} className="panda-dot" />
      <path d="M 111 119 q 4 3 8 0" className="panda-line" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

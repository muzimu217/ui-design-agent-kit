/**
 * L0 静态墨竹画（§9.1）：内联 SVG 代码绘制。
 * 边缘带几何约束【HC-3】：桌面左右各 ≤160px + 底部 ≤200px；
 * 移动仅顶端 ≤120px + 底缘 ≤140px（标签栏上方）——永不进入内容列。
 * 视差漂移层（极淡墨底晕）由 BackgroundLayers 的合并 rAF 驱动。
 */
import { INK, LeafCluster, SingleLeaf, Stalk, InkWash } from './primitives';

/** 侧带宽度：永不进内容列（内容列 720px + 24px 呼吸；≥768 才显示）。 */
const SIDE_BAND_STYLE: React.CSSProperties = {
  width: 'max(0px, min(160px, (100vw - 720px) / 2 - 24px))',
};

export function InkPainting() {
  return (
    <div className="bg-layer z-0" aria-hidden="true">
      {/* —— 桌面：左缘竹丛 —— */}
      <div
        className="absolute top-0 bottom-0 left-0 hidden md:block"
        style={SIDE_BAND_STYLE}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 160 900"
          preserveAspectRatio="none"
        >
          <LeftStalks />
        </svg>
        {/* 叶组：固定纵横比小 SVG，避免拉伸变形 */}
        <svg
          className="absolute"
          style={{ left: '4%', top: '56%' }}
          width="150"
          height="150"
          viewBox="0 0 150 150"
        >
          <LeafCluster x={8} y={70} scale={1.15} angle={-8} opacity={INK.zhao} leaves={5} />
          <LeafCluster x={30} y={26} scale={0.9} angle={14} opacity={INK.dan} leaves={3} flip />
        </svg>
        <svg
          className="absolute"
          style={{ left: 0, top: '12%' }}
          width="120"
          height="110"
          viewBox="0 0 120 110"
        >
          <LeafCluster x={4} y={30} scale={0.85} angle={20} opacity={INK.dan} leaves={4} />
        </svg>
      </div>

      {/* —— 桌面：右上斜出 —— */}
      <div
        className="absolute top-0 bottom-0 right-0 hidden md:block"
        style={SIDE_BAND_STYLE}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 160 900"
          preserveAspectRatio="none"
        >
          <RightStalks />
        </svg>
        <svg
          className="absolute"
          style={{ right: '2%', top: '6%' }}
          width="150"
          height="140"
          viewBox="0 0 150 140"
        >
          <LeafCluster x={146} y={10} scale={1.2} angle={148} opacity={INK.zhao} leaves={5} flip />
          <LeafCluster x={120} y={54} scale={0.85} angle={172} opacity={INK.dan} leaves={3} />
        </svg>
        <svg
          className="absolute"
          style={{ right: '6%', top: '34%' }}
          width="110"
          height="100"
          viewBox="0 0 110 100"
        >
          <LeafCluster x={106} y={8} scale={0.8} angle={160} opacity={INK.dan} leaves={4} flip />
        </svg>
      </div>

      {/* —— 桌面：底部散墨带 ≤200px —— */}
      <div className="absolute bottom-0 left-0 right-0 hidden md:block" style={{ height: 200 }}>
        <BottomWash />
      </div>

      {/* —— 移动：顶端 ≤120px —— */}
      <div className="absolute top-0 left-0 right-0 md:hidden" style={{ height: 120 }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 390 120"
          preserveAspectRatio="none"
        >
          <MobileTopInk />
        </svg>
        <svg
          className="absolute"
          style={{ right: '4%', top: 2 }}
          width="120"
          height="110"
          viewBox="0 0 120 110"
        >
          <LeafCluster x={116} y={8} scale={0.9} angle={155} opacity={INK.zhao} leaves={4} flip />
        </svg>
      </div>

      {/* —— 移动：底缘 ≤140px（标签栏上方）—— */}
      <div
        className="absolute left-0 right-0 md:hidden"
        style={{
          height: 140,
          bottom: 'calc(64px + env(safe-area-inset-bottom))',
        }}
      >
        <MobileBottomInk />
      </div>
    </div>
  );
}

function LeftStalks() {
  return (
    <g>
      <InkWash id="wash-l1" x={30} y={760} rx={110} ry={90} opacity={INK.jidan} />
      {/* 主竿：左下入画，微右倾 */}
      <Stalk x={34} y={940} len={980} angle={5} width={30} segs={6} opacity={INK.zhao} />
      {/* 淡墨远竿 */}
      <Stalk x={92} y={960} len={640} angle={9} width={20} segs={4} opacity={INK.dan} jitter={2} />
      {/* 极淡墨新竿 */}
      <Stalk x={130} y={920} len={300} angle={3} width={11} segs={3} opacity={INK.jidan} jitter={1} />
    </g>
  );
}

function RightStalks() {
  return (
    <g>
      <InkWash id="wash-r1" x={130} y={140} rx={120} ry={110} opacity={INK.jidan} />
      {/* 主竿自右上垂入 */}
      <Stalk x={126} y={-40} len={520} angle={-7} width={26} segs={4} opacity={INK.zhao} />
      <Stalk x={70} y={-60} len={360} angle={-11} width={16} segs={3} opacity={INK.dan} jitter={2} />
    </g>
  );
}

function BottomWash() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
      <InkWash id="wash-b1" x={180} y={170} rx={200} ry={60} opacity={INK.jidan} />
      <InkWash id="wash-b2" x={1180} y={150} rx={170} ry={50} opacity={INK.jidan} />
      <SingleLeaf x={330} y={160} len={30} angle={16} opacity={INK.dan} />
      <SingleLeaf x={980} y={175} len={22} angle={-28} opacity={INK.dan} />
      {/* reduced-motion：绘死的落叶 2–3 片（§9.3，仅 reduce 时显示） */}
      <g className="reduced-static">
        <SingleLeaf x={520} y={168} len={26} angle={40} opacity={INK.dan} />
        <SingleLeaf x={760} y={172} len={20} angle={-12} opacity={INK.dan} />
      </g>
    </svg>
  );
}

function MobileTopInk() {
  return (
    <g>
      <InkWash id="wash-mt" x={340} y={20} rx={150} ry={70} opacity={INK.jidan} />
      {/* 右上角一小段垂竿 */}
      <Stalk x={352} y={-30} len={150} angle={-6} width={17} segs={2} opacity={INK.dan} jitter={1} />
      <SingleLeaf x={300} y={30} len={20} angle={30} opacity={INK.dan} />
    </g>
  );
}

function MobileBottomInk() {
  return (
    <>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 390 140"
        preserveAspectRatio="none"
      >
        <InkWash id="wash-mb" x={80} y={120} rx={170} ry={50} opacity={INK.jidan} />
        <SingleLeaf x={220} y={118} len={22} angle={-14} opacity={INK.dan} />
        <g className="reduced-static">
          <SingleLeaf x={140} y={124} len={18} angle={36} opacity={INK.dan} />
        </g>
      </svg>
      <svg
        className="absolute"
        style={{ left: '6%', bottom: 6 }}
        width="90"
        height="80"
        viewBox="0 0 90 80"
      >
        <LeafCluster x={4} y={70} scale={0.75} angle={-14} opacity={INK.dan} leaves={3} />
      </svg>
    </>
  );
}

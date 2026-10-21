// CanvasPage — 画布工作台页签：六道门流水线的可视化工作台入口。
// 数据 = canvas/canvas-workbench.state.json + chain-canvas-workbench.json + artifacts.json
// 的构建时快照（见根仓 npm run canvas:build 与 canvas/render-*.mjs）；产物 HTML 在
// /canvas/ 目录（canvas-index 入口、canvas-workbench 门径、chain-canvas-workbench 链路）。
import { Presentation, Workflow, ArrowUpRight } from "lucide-react";

const CANVAS_BASE = `${import.meta.env.BASE_URL}canvas/`;

type GateStatus = "pending" | "active" | "gated" | "passed" | "blocked";

const GATES: Array<[string, GateStatus]> = [
  ["A", "gated"],
  ["B", "passed"],
  ["C", "pending"],
  ["D", "pending"],
  ["E", "pending"],
  ["F", "pending"],
];

const GATE_LABEL: Record<GateStatus, string> = {
  pending: "未开始",
  active: "进行中",
  gated: "等待确认",
  passed: "已通过",
  blocked: "受阻",
};

const GATE_COLOR: Record<GateStatus, string> = {
  pending: "#9a9ab0",
  active: "#22d3ee",
  gated: "#f472b6",
  passed: "#34d399",
  blocked: "#f87171",
};

const STAGES: Array<{ id: string; status: GateStatus; note: string }> = [
  { id: "需求与方向", status: "gated", note: "三阶段规划+现状对账已呈交，等用户裁决" },
  { id: "参考素材", status: "passed", note: "对标已集：Onlook 画布机制/bolt 设计系统专题/v0 Agentic+DS 2.0" },
  { id: "原型与契约", status: "pending", note: "等门 A 通过后定画布语义 token 与动效参数" },
  { id: "交互实现", status: "active", note: "增量 1-7：state 接入既有画布壳+chain 契约+入口页+排序视图" },
  { id: "浏览器验证", status: "pending", note: "每增量过 cli visual 无头多视口回执+六维验收" },
  { id: "交付与迭代", status: "pending", note: "产物入画布产物墙，与对标产物六维并排（KPI4）" },
];

const ARTIFACTS = [
  { title: "门径画布（实时门径）", path: "canvas-workbench.html", desc: "六阶段四泳道流水线：门状态/证据嵌入/搜索/缩放/回放" },
  { title: "需求解析链路", path: "chain-canvas-workbench.html", desc: "原始口语 → 解析摘要 → 理解验证 → 六步决策抽屉——黑盒步骤自动标黄" },
  { title: "工作台入口", path: "canvas-index.html", desc: "三卡入口+门径 pills+六阶段状态网格+产物墙（排序视图+完成度徽章）" },
];

export function CanvasPage() {
  return (
    <section className="canvas-band" id="canvas-main" aria-labelledby="canvas-heading">
      <div className="content-width">
        <div className="section-heading">
          <div>
            <h1 id="canvas-heading">画布工作台。</h1>
            <p>六道门流水线的可视化视图：门径、链路、产物墙——离线自包含，构建时快照。</p>
          </div>
          <Presentation size={28} strokeWidth={1.5} aria-hidden="true" />
        </div>

        <div className="canvas-gates" role="list" aria-label="门径状态">
          {GATES.map(([id, st]) => (
            <span key={id} className="canvas-pill" role="listitem" style={{ borderColor: GATE_COLOR[st] }}>
              {id} · {GATE_LABEL[st]}
            </span>
          ))}
        </div>

        <div className="canvas-stages">
          {STAGES.map((s) => (
            <div key={s.id} className="canvas-stage" style={{ borderTopColor: GATE_COLOR[s.status] }}>
              <div className="canvas-stage-id">{s.id}</div>
              <div className="canvas-stage-status" style={{ color: GATE_COLOR[s.status] }}>
                {GATE_LABEL[s.status]}
              </div>
              <div className="canvas-stage-note">{s.note}</div>
            </div>
          ))}
        </div>

        <h2 className="canvas-sub">入口（离线自包含页）</h2>
        <div className="canvas-links">
          {ARTIFACTS.map((a) => (
            <a key={a.path} className="canvas-link-card" href={`${CANVAS_BASE}${a.path}`} target="_blank" rel="noreferrer">
              {a.title}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="canvas-note">
          上方入口为构建时快照（离线可开）。重建命令见 kit 仓库 <code>npm run canvas:build</code>；验收命令{" "}
          <code>npm run canvas:check</code>（对比度/键盘/console 实测回执）。
        </p>

        <h2 className="canvas-sub">产物墙（KPI4）</h2>
        <div className="canvas-wall">
          {ARTIFACTS.map((a) => (
            <div key={a.path} className="canvas-wall-row">
              <Workflow size={15} aria-hidden="true" />
              <span className="canvas-wall-title">{a.title}</span>
              <span className="canvas-wall-desc">{a.desc}</span>
              <a href={`${CANVAS_BASE}${a.path}`} target="_blank" rel="noreferrer" aria-label={`打开${a.title}`}>
                打开<ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

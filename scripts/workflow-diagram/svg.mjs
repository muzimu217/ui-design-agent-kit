// Renders the laid-out model to inline SVG. Everything is emitted as strings;
// there is no runtime dependency and no external stylesheet.
//
// Colours are emitted as CSS custom properties with light-theme fallbacks, so
// the same markup renders correctly in both themes and the page can switch
// without re-rendering. The literal values below are the light theme.

const PALETTE = {
  canvas: "#ffffff",
  ink: "#12181f",
  muted: "#5d6b7a",
  hairline: "#dfe5ec",
  laneFill: "#f7f9fb",
  laneFillGate: "#fdf6f7",
  laneFillRework: "#fbf7f4",
  stage: { fill: "#eef6f3", stroke: "#1f7a5c", text: "#12513c" },
  gate: { fill: "#fdeff2", stroke: "#b3244a", text: "#8c1c3a" },
  rework: { fill: "#fdf3e7", stroke: "#b5711b", text: "#8a5410" },
  edge: { flow: "#8b98a6", pass: "#1f7a5c", gate: "#b3244a", rework: "#b5711b", return: "#b5711b", trace: "#6b7a8c" },
  // Status is carried by both the badge glyph and the stroke weight, so it does
  // not depend on colour alone.
  status: {
    pending: { badge: "#c3ccd6", glyph: "", label: "未开始" },
    active: { badge: "#1f7a5c", glyph: "▶", label: "进行中" },
    gated: { badge: "#b3244a", glyph: "⏸", label: "等待确认" },
    passed: { badge: "#1f7a5c", glyph: "✓", label: "已通过" },
    blocked: { badge: "#c2410c", glyph: "!", label: "受阻" },
  },
};

// Theme-aware fills: a CSS variable with the light value as fallback. The page
// defines these variables per theme, so the SVG follows without re-render.
const laneVar = (name, fallback) => `var(--wf-${name}, ${fallback})`;

export function renderSvg(laid, model) {
  const GUTTER_X = 16 + 132;
  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(laid.width)} ${round(laid.height)}" ` +
      `role="img" aria-labelledby="wf-title wf-desc" class="wf-svg">`,
  );
  parts.push(`<title id="wf-title">${esc(model.title)}</title>`);
  parts.push(`<desc id="wf-desc">${esc(model.note)}</desc>`);
  parts.push(defs());
  parts.push(`<rect x="0" y="0" width="${round(laid.width)}" height="${round(laid.height)}" fill="${laneVar("canvas", PALETTE.canvas)}"/>`);

  // Lane bands + labels. The label lives in its own left gutter, so a node can
  // never cover it no matter how the columns are packed. A long label wraps
  // onto two lines rather than being clipped.
  for (const lane of laid.lanes) {
    const fill =
      lane.kind === "gate"
        ? laneVar("lane-gate", PALETTE.laneFillGate)
        : lane.kind === "rework"
          ? laneVar("lane-rework", PALETTE.laneFillRework)
          : laneVar("lane", PALETTE.laneFill);
    const lines = wrapLabel(lane.label, 8);
    const labelY = lane.top + lane.height / 2 - ((lines.length - 1) * 14) / 2;
    parts.push(
      `<g class="wf-lane" data-lane="${esc(lane.id)}">` +
        `<rect x="16" y="${round(lane.top)}" width="${round(laid.width - 32)}" height="${round(lane.height)}" rx="10" ` +
        `fill="${fill}" stroke="${laneVar("line", PALETTE.hairline)}" stroke-width="1"/>` +
        `<line x1="${GUTTER_X}" y1="${round(lane.top + 8)}" x2="${GUTTER_X}" y2="${round(lane.top + lane.height - 8)}" ` +
        `stroke="${laneVar("line", PALETTE.hairline)}" stroke-width="1"/>` +
        lines
          .map(
            (line, index) =>
              `<text x="28" y="${round(labelY + index * 14 + 4)}" class="wf-lane-label">${esc(line)}</text>`,
          )
          .join("") +
        `</g>`,
    );
  }

  // Column headers: stage name + step number, so the rail reads left to right.
  for (const column of laid.columns) {
    const cx = column.x + column.width / 2;
    parts.push(
      `<g class="wf-column" data-stage="${esc(column.id)}">` +
        `<text x="${round(cx)}" y="${round(laid.headerHeight - 44)}" class="wf-col-label" text-anchor="middle">${esc(column.name)}</text>` +
        `<text x="${round(cx)}" y="${round(laid.headerHeight - 24)}" class="wf-col-meta" text-anchor="middle">${
          column.decisionPoint ? "含确认门" : "无确认门"
        }</text>` +
        `</g>`,
    );
  }

  // Stage bands: dashed containers that group every lane cell of one column.
  // They are drawn over the lane fills but under the edges, so the grouping
  // reads without hiding the swimlanes. The chip at the top carries the step
  // number so the band and the rail stay in sync.
  laid.columns.forEach((column, index) => {
    const x = column.x - 24;
    const width = column.width + 48;
    const y = 16;
    const height = laid.height - 32;
    parts.push(
      `<g class="wf-band" data-stage="${esc(column.id)}">` +
        `<rect x="${round(x)}" y="${round(y)}" width="${round(width)}" height="${round(height)}" rx="14" fill="none" ` +
        `stroke="${laneVar("band", PALETTE.hairline)}" stroke-width="1.4" stroke-dasharray="7 5"/>` +
        `<rect x="${round(x + 10)}" y="${round(y - 1)}" width="30" height="18" rx="5" ` +
        `fill="${laneVar("band-chip", PALETTE.canvas)}" stroke="${laneVar("band", PALETTE.hairline)}" stroke-width="1"/>` +
        `<text x="${round(x + 25)}" y="${round(y + 12)}" class="wf-band-chip" text-anchor="middle">${esc(String(index + 1).padStart(2, "0"))}</text>` +
        `</g>`,
    );
  });

  // Edges first so nodes sit on top.
  for (const edge of laid.edges) {
    const color = PALETTE.edge[edge.variant] ?? PALETTE.edge.flow;
    const dashed = edge.variant === "return" || edge.variant === "rework";
    const d = edge.points.map((point, index) => `${index === 0 ? "M" : "L"}${round(point[0])} ${round(point[1])}`).join(" ");
    parts.push(
      `<g class="wf-edge" data-variant="${esc(edge.variant)}" data-from="${esc(edge.from)}" data-to="${esc(edge.to)}">` +
        `<path d="${d}" fill="none" stroke="${color}" stroke-width="${edge.variant === "flow" ? 1.6 : 2}" ` +
        `${dashed ? 'stroke-dasharray="6 4"' : ""} marker-end="url(#wf-arrow-${edge.variant})"/>` +
        (edge.label ? edgeLabel(edge) : "") +
        `</g>`,
    );
  }

  // Nodes. Status is rendered, not implied: a badge glyph plus stroke weight
  // carry it so the reading does not depend on colour alone. The --wf-i index
  // drives the viewer's entrance stagger (pure presentation, zero data effect).
  let nodeIndex = 0;
  for (const node of laid.nodes) {
    const tone = PALETTE[node.kind === "gate" ? "gate" : node.kind === "rework" ? "rework" : "stage"];
    const status = PALETTE.status[node.status] ?? PALETTE.status.pending;
    const isDone = node.status === "passed";
    const isCurrent = node.isCurrent === true;
    const strokeWidth = isCurrent ? 3 : isDone ? 2.4 : node.status === "pending" ? 1.2 : 2;
    const opacity = node.status === "pending" && !isCurrent ? 0.62 : 1;
    parts.push(
      `<g class="wf-node" data-node="${esc(node.id)}" data-kind="${esc(node.kind)}" data-stage="${esc(node.stageId)}" ` +
        `data-status="${esc(node.status)}" data-current="${isCurrent ? "true" : "false"}" ` +
        `style="--wf-i:${nodeIndex}" ` +
        `tabindex="0" role="listitem" aria-label="${esc(nodeAria(node))}">` +
        `<rect x="${round(node.x)}" y="${round(node.y)}" width="${round(node.width)}" height="${round(node.height)}" rx="10" ` +
        `fill="${laneVar(`node-${node.kind}-fill`, tone.fill)}" stroke="${laneVar(`node-${node.kind}-stroke`, tone.stroke)}" stroke-width="${strokeWidth}" opacity="${opacity}"` +
        `${isCurrent ? ` stroke-dasharray="none"` : ""}/>` +
        (node.step
          ? `<text x="${round(node.x + 10)}" y="${round(node.y + 16)}" class="wf-node-step">${esc(node.step)}</text>`
          : "") +
        statusBadge(node, status) +
        `<text x="${round(node.cx)}" y="${round(node.y + (node.kind === "stage" ? 30 : 26))}" class="wf-node-title" text-anchor="middle">${esc(node.title)}</text>` +
        `<text x="${round(node.cx)}" y="${round(node.y + (node.kind === "stage" ? 48 : 44))}" class="wf-node-sub" text-anchor="middle">${esc(truncate(node.subtitle ?? "", node.kind === "rework" ? 10 : 18))}</text>` +
        `</g>`,
    );
    nodeIndex += 1;
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

// A small filled circle with a glyph, placed at the node's top-right corner.
function statusBadge(node, status) {
  const cx = node.x + node.width - 13;
  const cy = node.y + 13;
  return (
    `<g class="wf-status" data-status="${esc(node.status)}">` +
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="8" fill="${status.badge}"/>` +
    (status.glyph
      ? `<text x="${round(cx)}" y="${round(cy + 3.5)}" class="wf-status-glyph" text-anchor="middle">${esc(status.glyph)}</text>`
      : "") +
    `</g>`
  );
}

function nodeAria(node) {
  const bits = [node.title];
  if (node.subtitle) bits.push(node.subtitle);
  const status = PALETTE.status[node.status];
  if (status) bits.push(`状态：${status.label}`);
  if (node.isCurrent) bits.push("当前阶段");
  if (node.detail) bits.push(node.detail);
  if (node.evidence) bits.push(`证据：${node.evidence}`);
  return bits.join("。");
}

function edgeLabel(edge) {
  const first = edge.points[0];
  const second = edge.points[1] ?? first;
  const x = (first[0] + second[0]) / 2;
  const y = (first[1] + second[1]) / 2;
  const anchor = Math.abs(first[0] - second[0]) > Math.abs(first[1] - second[1]) ? "middle" : "start";
  const dx = anchor === "start" ? 6 : 0;
  const dy = anchor === "start" ? 4 : -6;
  return `<text x="${round(x + dx)}" y="${round(y + dy)}" class="wf-edge-label" text-anchor="${anchor}">${esc(edge.label)}</text>`;
}

function defs() {
  const variants = ["flow", "pass", "gate", "rework", "return", "trace"];
  return (
    `<defs>` +
    variants
      .map((variant) => {
        const color = PALETTE.edge[variant] ?? PALETTE.edge.flow;
        return (
          `<marker id="wf-arrow-${variant}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">` +
          `<path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`
        );
      })
      .join("") +
    `</defs>`
  );
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function truncate(value, max) {
  const text = String(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Wrap a lane label at a character budget, preferring the arrow separator so
// "不通过 → 返工" breaks into two readable lines instead of being clipped.
function wrapLabel(label, budget) {
  const text = String(label);
  if (text.length <= budget) return [text];
  const parts = text.split(" → ");
  if (parts.length === 2) return [`${parts[0]} →`, parts[1]];
  const lines = [];
  for (let index = 0; index < text.length; index += budget) lines.push(text.slice(index, index + budget));
  return lines;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

export const COLORS = PALETTE;
export const STATUS_META = PALETTE.status;

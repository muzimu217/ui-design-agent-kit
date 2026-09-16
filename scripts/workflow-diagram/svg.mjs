// Renders the laid-out model to inline SVG. Everything is emitted as strings;
// there is no runtime dependency and no external stylesheet.

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
};

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
  parts.push(`<rect x="0" y="0" width="${round(laid.width)}" height="${round(laid.height)}" fill="${PALETTE.canvas}"/>`);

  // Lane bands + labels. The label lives in its own left gutter, so a node can
  // never cover it no matter how the columns are packed. A long label wraps
  // onto two lines rather than being clipped.
  for (const lane of laid.lanes) {
    const fill = lane.kind === "gate" ? PALETTE.laneFillGate : lane.kind === "rework" ? PALETTE.laneFillRework : PALETTE.laneFill;
    const lines = wrapLabel(lane.label, 8);
    const labelY = lane.top + lane.height / 2 - ((lines.length - 1) * 14) / 2;
    parts.push(
      `<g class="wf-lane" data-lane="${esc(lane.id)}">` +
        `<rect x="16" y="${round(lane.top)}" width="${round(laid.width - 32)}" height="${round(lane.height)}" rx="10" ` +
        `fill="${fill}" stroke="${PALETTE.hairline}" stroke-width="1"/>` +
        `<line x1="${GUTTER_X}" y1="${round(lane.top + 8)}" x2="${GUTTER_X}" y2="${round(lane.top + lane.height - 8)}" ` +
        `stroke="${PALETTE.hairline}" stroke-width="1"/>` +
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

  // Nodes
  for (const node of laid.nodes) {
    const tone = PALETTE[node.kind === "gate" ? "gate" : node.kind === "rework" ? "rework" : "stage"];
    parts.push(
      `<g class="wf-node" data-node="${esc(node.id)}" data-kind="${esc(node.kind)}" data-stage="${esc(node.stageId)}" ` +
        `data-status="pending" tabindex="0" role="listitem" aria-label="${esc(nodeAria(node))}">` +
        `<rect x="${round(node.x)}" y="${round(node.y)}" width="${round(node.width)}" height="${round(node.height)}" rx="10" ` +
        `fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="1.5"/>` +
        (node.step ? `<text x="${round(node.x + 10)}" y="${round(node.y + 16)}" class="wf-node-step">${esc(node.step)}</text>` : "") +
        `<text x="${round(node.cx)}" y="${round(node.y + (node.kind === "stage" ? 30 : 26))}" class="wf-node-title" text-anchor="middle">${esc(node.title)}</text>` +
        `<text x="${round(node.cx)}" y="${round(node.y + (node.kind === "stage" ? 48 : 44))}" class="wf-node-sub" text-anchor="middle">${esc(truncate(node.subtitle ?? "", node.kind === "rework" ? 10 : 18))}</text>` +
        `</g>`,
    );
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

function nodeAria(node) {
  const bits = [node.title];
  if (node.subtitle) bits.push(node.subtitle);
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

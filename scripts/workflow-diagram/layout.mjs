// Deterministic orthogonal layout written for this kit. There is no auto-layout
// service and no physics pass: one visual column per pipeline stage, one row per
// actor lane, and every edge is an axis-aligned polyline.
//
// A stage and its gates share a column because they sit in different lanes, so
// they never collide horizontally. Gates that land in the same lane stack
// vertically and the lane grows to fit them.

const NODE = { width: 172, height: 62, gateWidth: 148, gateHeight: 56, reworkWidth: 132, reworkHeight: 52 };
const GAP = { col: 64, lane: 36, stack: 12, margin: 40 };
// Lane labels live in their own gutter so a node can never cover them.
const HEADER = { height: 92, gutter: 148 };

export function layout(model) {
  const lanes = model.actors;
  const columns = model.stages.length;

  // 1. Column x from the widest node in each stage column.
  const colWidth = new Array(columns).fill(NODE.width);
  for (const node of model.nodes) {
    colWidth[node.col] = Math.max(colWidth[node.col], nodeWidth(node));
  }
  const colX = [];
  let cursor = GAP.margin + HEADER.gutter;
  for (let col = 0; col < columns; col += 1) {
    colX.push(cursor);
    cursor += colWidth[col] + GAP.col;
  }
  const contentWidth = cursor - GAP.col + GAP.margin;

  // 2. Stack height per (lane, column) decides how tall each lane must be.
  const stacks = new Map();
  for (const node of model.nodes) {
    const key = `${node.lane}:${node.col}`;
    stacks.set(key, (stacks.get(key) ?? 0) + 1);
  }
  const laneTops = [];
  let y = HEADER.height;
  for (const lane of lanes) {
    let maxStack = 1;
    for (let col = 0; col < columns; col += 1) {
      maxStack = Math.max(maxStack, stacks.get(`${lane.id}:${col}`) ?? 0);
    }
    const height = maxStack * NODE.height + (maxStack - 1) * GAP.stack + 28;
    laneTops.push({ id: lane.id, label: lane.label, kind: lane.kind, top: y, height, maxStack });
    y += height + 10;
  }
  const contentHeight = y - 10 + GAP.margin;

  // 3. Place nodes: column x is shared, stacking runs top-down inside a lane.
  const slotCursor = new Map();
  const placed = new Map();
  for (const node of model.nodes) {
    const lane = laneTops.find((row) => row.id === node.lane);
    if (!lane) throw new Error(`Node "${node.id}" cites unknown lane "${node.lane}"`);
    const key = `${node.lane}:${node.col}`;
    const slot = slotCursor.get(key) ?? 0;
    slotCursor.set(key, slot + 1);

    const width = nodeWidth(node);
    const height = nodeHeight(node);
    const stackHeight = lane.maxStack * NODE.height + (lane.maxStack - 1) * GAP.stack;
    const startY = lane.top + (lane.height - stackHeight) / 2;
    const nodeY = startY + slot * (NODE.height + GAP.stack);
    const x = colX[node.col] + (colWidth[node.col] - width) / 2;
    placed.set(node.id, { ...node, x, y: nodeY, width, height, cx: x + width / 2, cy: nodeY + height / 2 });
  }

  const routed = routeEdges(model.edges, placed, laneTops, colX);
  return {
    width: Math.max(contentWidth, 1000),
    height: contentHeight,
    lanes: laneTops,
    columns: model.stages.map((stage, index) => ({
      id: stage.id,
      name: stage.name,
      x: colX[index],
      width: colWidth[index],
      gates: stage.gates,
      decisionPoint: stage.decisionPoint,
    })),
    nodes: [...placed.values()],
    edges: routed,
    headerHeight: HEADER.height,
  };
}

function nodeWidth(node) {
  if (node.kind === "gate") return NODE.gateWidth;
  if (node.kind === "rework") return NODE.reworkWidth;
  return NODE.width;
}

function nodeHeight(node) {
  if (node.kind === "gate") return NODE.gateHeight;
  if (node.kind === "rework") return NODE.reworkHeight;
  return NODE.height;
}

// Orthogonal routing. Forward edges exit right and enter left; vertical edges
// leave the bottom and enter the top; return edges run out to the left gutter so
// a backward path never crosses a forward one.
function routeEdges(edges, placed, lanes, colX) {
  return edges.map((edge) => {
    const from = placed.get(edge.from);
    const to = placed.get(edge.to);
    if (!from || !to) throw new Error(`Edge "${edge.id}" references a missing node`);

    const points = [];
    const sameColumn = from.col === to.col;

    if (sameColumn) {
      const downward = to.cy > from.cy;
      const startY = downward ? from.y + from.height : from.y;
      const endY = downward ? to.y : to.y + to.height;
      points.push([from.cx, startY], [from.cx, endY]);
    } else if (edge.variant === "return") {
      const railX = colX[Math.min(from.col, to.col)] - GAP.col / 2;
      points.push([from.x, from.cy], [railX, from.cy], [railX, to.cy], [to.x, to.cy]);
    } else {
      const forward = to.x > from.x;
      const startX = forward ? from.x + from.width : from.x;
      const endX = forward ? to.x : to.x + to.width;
      const midX = startX + (forward ? 1 : -1) * Math.max(18, Math.abs(endX - startX) / 2);
      if (Math.abs(from.cy - to.cy) < 1) points.push([startX, from.cy], [endX, to.cy]);
      else points.push([startX, from.cy], [midX, from.cy], [midX, to.cy], [endX, to.cy]);
    }

    return { ...edge, points, label: edge.label, variant: edge.variant ?? "flow" };
  });
}

export const GEOMETRY = { NODE, GAP, HEADER };

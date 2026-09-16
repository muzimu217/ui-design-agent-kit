// Builds the diagram model from tooling/workflow-stages.json.
// The pipeline JSON is the only source of truth; this module never restates it.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));

export async function loadPipeline(root = ROOT) {
  const file = path.join(root, "tooling/workflow-stages.json");
  const pipeline = JSON.parse(await readFile(file, "utf8"));
  validate(pipeline);
  return pipeline;
}

function validate(pipeline) {
  const stages = pipeline.stages ?? [];
  const gates = pipeline.gates ?? [];
  const actors = pipeline.actors ?? [];
  if (!stages.length) throw new Error("workflow-stages.json has no stages");
  if (!actors.length) throw new Error("workflow-stages.json has no actors (the diagram needs lane ownership)");

  const actorIds = new Set(actors.map((a) => a.id));
  const gateIds = new Set(gates.map((g) => g.id));
  const stageIds = new Set(stages.map((s) => s.id));
  for (const stage of stages) {
    if (!stage.actor) throw new Error(`Stage "${stage.id}" has no actor; the lane cannot be derived`);
    if (!actorIds.has(stage.actor)) throw new Error(`Stage "${stage.id}" cites unknown actor "${stage.actor}"`);
    for (const gate of stage.gates ?? []) {
      if (!gateIds.has(gate)) throw new Error(`Stage "${stage.id}" cites unknown gate "${gate}"`);
    }
  }
  for (const gate of gates) {
    if (!stageIds.has(gate.stage)) throw new Error(`Gate "${gate.id}" cites unknown stage "${gate.stage}"`);
  }
  if (!pipeline.statusValues?.length) throw new Error("workflow-stages.json has no statusValues");
}

// The model is intentionally presentation-shaped: the renderer reads it and
// never reaches back into the raw pipeline document.
export function buildModel(pipeline, { title, note } = {}) {
  const stages = pipeline.stages;
  const gateByStage = new Map();
  for (const gate of pipeline.gates) {
    if (!gateByStage.has(gate.stage)) gateByStage.set(gate.stage, []);
    gateByStage.get(gate.stage).push(gate);
  }

  const nodes = [];
  stages.forEach((stage, index) => {
    nodes.push({
      id: `stage:${stage.id}`,
      kind: "stage",
      stageId: stage.id,
      col: index,
      lane: stage.actor,
      title: stage.name,
      subtitle: stage.output,
      detail: stage.summary,
      evidence: stage.evidence,
      decision: stage.decision,
      status: "pending",
      step: String(index + 1).padStart(2, "0"),
    });
    for (const gate of gateByStage.get(stage.id) ?? []) {
      // A gate whose kind is "trace" is a record-keeping requirement, not a user
      // stop: it belongs beside the work, not in the confirmation lane.
      const isTrace = gate.kind === "trace";
      nodes.push({
        id: `gate:${gate.id}`,
        kind: "gate",
        gateId: gate.id,
        gateKind: gate.kind ?? "user",
        stageId: stage.id,
        col: index,
        lane: isTrace ? stage.actor : "user",
        title: `门${gate.id} ${gate.name}`,
        subtitle: gate.mandatoryLabel ?? gate.mandatory,
        detail: gate.artifact,
        status: "pending",
        step: String(index + 1).padStart(2, "0"),
      });
    }
  });

  // Rework is a single return point per stage that has a user-facing gate.
  const gatedStages = stages.filter((stage) =>
    (gateByStage.get(stage.id) ?? []).some((gate) => (gate.kind ?? "user") !== "trace"),
  );
  for (const stage of gatedStages) {
    nodes.push({
      id: `rework:${stage.id}`,
      kind: "rework",
      stageId: stage.id,
      col: stages.findIndex((item) => item.id === stage.id),
      lane: "rework",
      title: "返工",
      subtitle: `调整「${stage.name}」`,
      status: "pending",
    });
  }

  const edges = [];
  const push = (from, to, extra = {}) => edges.push({ id: `${from}->${to}`, from, to, ...extra });
  stages.forEach((stage, index) => {
    const stageGates = gateByStage.get(stage.id) ?? [];
    const userGate = stageGates.find((gate) => (gate.kind ?? "user") !== "trace");
    const traceGate = stageGates.find((gate) => (gate.kind ?? "user") === "trace");
    const next = stages[index + 1];

    if (userGate) {
      push(`stage:${stage.id}`, `gate:${userGate.id}`, { variant: "gate", label: "呈报" });
      push(`gate:${userGate.id}`, `rework:${stage.id}`, { variant: "rework", label: "不通过" });
      push(`rework:${stage.id}`, `stage:${stage.id}`, { variant: "return", label: "调整后重走" });
      if (next) push(`gate:${userGate.id}`, `stage:${next.id}`, { variant: "pass", label: "通过" });
    } else if (next) {
      push(`stage:${stage.id}`, `stage:${next.id}`, { variant: "flow" });
    }

    // Trace gates sit beside their stage: a dotted requirement link, no stop.
    if (traceGate) {
      push(`stage:${stage.id}`, `gate:${traceGate.id}`, { variant: "trace", label: "留痕要求" });
    }
    for (const extra of stageGates.filter((gate) => gate !== userGate && gate !== traceGate)) {
      push(`stage:${stage.id}`, `gate:${extra.id}`, { variant: "gate", label: "同步确认" });
    }
  });

  return {
    title: title ?? pipeline.pipelineTitle ?? "UI 设计交付流程",
    note: note ?? "阶段与确认门来自 tooling/workflow-stages.json，改数据即改图。",
    actors: pipeline.actors,
    statusValues: pipeline.statusValues,
    stages: stages.map((stage, index) => ({
      id: stage.id,
      name: stage.name,
      col: index,
      gates: (gateByStage.get(stage.id) ?? []).map((gate) => gate.id),
      decisionPoint: stage.decisionPoint,
      summary: stage.summary,
      output: stage.output,
      evidence: stage.evidence,
    })),
    nodes,
    edges,
    tiers: pipeline.tiers ?? [],
  };
}

export function serializeModel(model) {
  return JSON.stringify(model, null, 2);
}

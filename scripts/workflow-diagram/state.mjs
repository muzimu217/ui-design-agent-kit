// Task state: the per-task record that turns the pipeline diagram from "what the
// process looks like" into "where this task actually is".
//
// Shape (JSON):
// {
//   "task": "睿耳 RuiEar 落地页",           // required, the task name
//   "revision": "P-earbuds-2",             // optional, plan revision
//   "updatedOn": "2026-09-16",             // optional
//   "note": "…",                            // optional, shown under the title
//   "stages": {
//     "brief": { "status": "passed", "evidence": "demo/x/PLAN.md", "note": "…" },
//     "reference": { "status": "passed" },
//     "contract": { "status": "gated", "note": "等用户裁决门C" },
//     "build": { "status": "pending" },
//     ...
//   },
//   "gates": { "A": "passed", "B": "passed", "C": "gated" },   // optional
//   "blockedReason": "…"                                        // optional
// }
//
// Every status must come from the pipeline's own statusValues vocabulary. An
// unknown stage, gate, or status is an error, not a silently ignored key: a
// state file that does not describe this pipeline must fail loudly.

import { readFile } from "node:fs/promises";

export async function loadState(file, pipeline) {
  const raw = JSON.parse(await readFile(file, "utf8"));
  validateState(raw, pipeline);
  return normalize(raw, pipeline);
}

export function validateState(state, pipeline) {
  if (!state || typeof state !== "object") throw new Error("State file must be a JSON object");
  if (typeof state.task !== "string" || !state.task.trim()) throw new Error("State file needs a non-empty `task` name");

  const validStatus = new Set(pipeline.statusValues.map((item) => item.id));
  const stageIds = new Set(pipeline.stages.map((stage) => stage.id));
  const gateIds = new Set(pipeline.gates.map((gate) => gate.id));

  for (const [stageId, entry] of Object.entries(state.stages ?? {})) {
    if (!stageIds.has(stageId)) throw new Error(`State file cites unknown stage "${stageId}"`);
    if (!entry || typeof entry !== "object") throw new Error(`Stage "${stageId}" entry must be an object`);
    if (!validStatus.has(entry.status)) {
      throw new Error(
        `Stage "${stageId}" has status "${entry.status}"; expected one of ${[...validStatus].join(", ")}`,
      );
    }
  }
  for (const [gateId, status] of Object.entries(state.gates ?? {})) {
    if (!gateIds.has(gateId)) throw new Error(`State file cites unknown gate "${gateId}"`);
    if (!validStatus.has(status)) {
      throw new Error(`Gate "${gateId}" has status "${status}"; expected one of ${[...validStatus].join(", ")}`);
    }
  }
  return true;
}

function normalize(state, pipeline) {
  const stageState = {};
  for (const stage of pipeline.stages) {
    const entry = state.stages?.[stage.id];
    stageState[stage.id] = {
      status: entry?.status ?? "pending",
      evidence: entry?.evidence ?? null,
      note: entry?.note ?? null,
    };
  }
  const gateState = {};
  for (const gate of pipeline.gates) {
    // A gate defaults to the status of the stage it belongs to, unless stated.
    gateState[gate.id] = state.gates?.[gate.id] ?? stageState[gate.stage]?.status ?? "pending";
  }
  return {
    task: state.task,
    revision: state.revision ?? null,
    updatedOn: state.updatedOn ?? null,
    note: state.note ?? null,
    blockedReason: state.blockedReason ?? null,
    stages: stageState,
    gates: gateState,
    timeline: Array.isArray(state.timeline) ? state.timeline : [],
  };
}

// The stage the task is currently on: the first one that is not yet passed.
export function currentStage(state, pipeline) {
  for (const stage of pipeline.stages) {
    const status = state.stages[stage.id]?.status ?? "pending";
    if (status !== "passed") return stage.id;
  }
  return pipeline.stages[pipeline.stages.length - 1]?.id ?? null;
}

// Completed count for the progress readout, counting only passed stages.
export function progress(state, pipeline) {
  const passed = pipeline.stages.filter((stage) => state.stages[stage.id]?.status === "passed").length;
  return { passed, total: pipeline.stages.length };
}

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, loadPipeline, buildModel } from "../scripts/workflow-diagram/model.mjs";
import { loadState, validateState, currentStage, progress } from "../scripts/workflow-diagram/state.mjs";
import { layout } from "../scripts/workflow-diagram/layout.mjs";
import { renderSvg } from "../scripts/workflow-diagram/svg.mjs";
import { renderHtml } from "../scripts/workflow-diagram/html.mjs";

const CLI = path.join(ROOT, "scripts/workflow-diagram/cli.mjs");
const EXAMPLE_STATE = path.join(ROOT, "scripts/workflow-diagram/examples/ruiear.task-state.json");

test("the diagram model is derived from the pipeline, never restated", async () => {
  const pipeline = await loadPipeline();
  const model = buildModel(pipeline);

  assert.deepEqual(
    model.stages.map((stage) => stage.id),
    pipeline.stages.map((stage) => stage.id),
    "stage order must follow workflow-stages.json",
  );
  assert.equal(model.nodes.filter((node) => node.kind === "stage").length, pipeline.stages.length);
  assert.equal(model.nodes.filter((node) => node.kind === "gate").length, pipeline.gates.length);

  // A trace gate is a record-keeping requirement, not a user stop: it must not
  // be drawn in the confirmation lane.
  for (const node of model.nodes.filter((item) => item.kind === "gate")) {
    const gate = pipeline.gates.find((item) => item.id === node.gateId);
    const expectedLane = gate.kind === "trace" ? pipeline.stages.find((s) => s.id === gate.stage).actor : "user";
    assert.equal(node.lane, expectedLane, `gate ${gate.id} is in the wrong lane`);
  }

  // Every stage with a user-facing gate gets exactly one rework return point.
  const userGatedStages = pipeline.gates
    .filter((gate) => gate.kind !== "trace")
    .map((gate) => gate.stage);
  assert.deepEqual(
    model.nodes.filter((node) => node.kind === "rework").map((node) => node.stageId).sort(),
    [...new Set(userGatedStages)].sort(),
  );
});

test("the layout is deterministic and every edge resolves to real geometry", async () => {
  const pipeline = await loadPipeline();
  const model = buildModel(pipeline);
  const first = layout(model);
  const second = layout(model);
  assert.deepEqual(first, second, "layout must be deterministic for the same model");

  const ids = new Set(first.nodes.map((node) => node.id));
  for (const edge of first.edges) {
    assert.ok(ids.has(edge.from) && ids.has(edge.to), `edge ${edge.id} lost an endpoint`);
    assert.ok(edge.points.length >= 2, `edge ${edge.id} has no path`);
    // Orthogonal routing: every leg is axis-aligned.
    for (let index = 1; index < edge.points.length; index += 1) {
      const [x0, y0] = edge.points[index - 1];
      const [x1, y1] = edge.points[index];
      assert.ok(
        Math.abs(x0 - x1) < 0.01 || Math.abs(y0 - y1) < 0.01,
        `edge ${edge.id} segment ${index} is diagonal`,
      );
    }
  }

  // Nothing may escape the canvas.
  for (const node of first.nodes) {
    assert.ok(node.x >= 0 && node.x + node.width <= first.width, `node ${node.id} overflows horizontally`);
    assert.ok(node.y >= 0 && node.y + node.height <= first.height, `node ${node.id} overflows vertically`);
  }
});

test("nodes in the same lane and column never overlap", async () => {
  const pipeline = await loadPipeline();
  const laid = layout(buildModel(pipeline));
  const boxes = laid.nodes.map((node) => ({ id: node.id, x0: node.x, y0: node.y, x1: node.x + node.width, y1: node.y + node.height }));
  for (let a = 0; a < boxes.length; a += 1) {
    for (let b = a + 1; b < boxes.length; b += 1) {
      const overlap =
        boxes[a].x0 < boxes[b].x1 && boxes[b].x0 < boxes[a].x1 && boxes[a].y0 < boxes[b].y1 && boxes[b].y0 < boxes[a].y1;
      assert.equal(overlap, false, `nodes ${boxes[a].id} and ${boxes[b].id} overlap`);
    }
  }
});

test("the rendered document is self-contained and exposes progress accessibly", async () => {
  const pipeline = await loadPipeline();
  const model = buildModel(pipeline);
  const laid = layout(model);
  const svg = renderSvg(laid, model);
  const html = renderHtml({ svg, model, laid, meta: { title: model.title, generated: pipeline.updatedOn } });

  assert.match(html, /^<!DOCTYPE html>/);
  assert.equal(/(src|href)=["']https?:\/\//i.test(html), false, "must not reference an external resource");
  assert.match(html, /role="progressbar"/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /role="tablist"/);
  // Every stage must be reachable both in the SVG and in the tab rail.
  for (const stage of pipeline.stages) {
    assert.ok(html.includes(`data-stage="${stage.id}"`), `stage ${stage.id} missing from the SVG`);
  }
  // The status vocabulary is described in the document, not only implied.
  assert.match(html, /尚未开始/);
});

test("the CLI builds, checks, and reports failures instead of false success", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "wf-diagram-"));
  try {
    const output = path.join(dir, "diagram.html");
    const built = JSON.parse(
      execFileSync("node", [CLI, "build", output, "--json"], { encoding: "utf8", timeout: 30000 }),
    );
    assert.equal(built.stages, 6);
    assert.equal(built.gates, 6);
    assert.equal(built.mode, "process");
    assert.ok(built.bytes > 5000);

    const checked = JSON.parse(execFileSync("node", [CLI, "check", output], { encoding: "utf8", timeout: 30000 }));
    assert.equal(checked.ok, true);
    assert.deepEqual(checked.problems, []);

    // A file that references the network is not self-contained and must fail.
    const { writeFile } = await import("node:fs/promises");
    const broken = path.join(dir, "broken.html");
    await writeFile(broken, '<!DOCTYPE html><html><body><script src="https://example.invalid/x.js"></script></body></html>');
    assert.throws(() => execFileSync("node", [CLI, "check", broken], { encoding: "utf8", timeout: 30000 }));

    assert.match(await readFile(output, "utf8"), /tooling\/workflow-stages\.json/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a task state file drives real node status, not decoration", async () => {
  const pipeline = await loadPipeline();
  const state = await loadState(EXAMPLE_STATE, pipeline);

  // The example is a real record: five stages done, delivery still gated.
  assert.equal(currentStage(state, pipeline), "deliver");
  assert.deepEqual(progress(state, pipeline), { passed: 5, total: 6 });

  const model = buildModel(pipeline, { state });
  assert.equal(model.mode, "task");
  assert.equal(model.task.name, state.task);

  const stageNodes = model.nodes.filter((node) => node.kind === "stage");
  assert.equal(stageNodes.find((node) => node.stageId === "deliver").status, "gated");
  assert.equal(stageNodes.find((node) => node.stageId === "brief").status, "passed");
  // Exactly one node is marked current, and it is the stage the task is on.
  const currentNodes = model.nodes.filter((node) => node.isCurrent);
  assert.equal(currentNodes.length, 1);
  assert.equal(currentNodes[0].stageId, "deliver");
  // Recorded evidence replaces the expected-evidence placeholder.
  const brief = stageNodes.find((node) => node.stageId === "brief");
  assert.equal(brief.evidence, "demo/ruiear/PLAN.md");
  assert.ok(brief.evidenceExpected, "the expected evidence text must still be available");

  // Without a state file nothing may claim to be current or non-pending.
  const plain = buildModel(pipeline);
  assert.equal(plain.mode, "process");
  assert.equal(plain.task, null);
  assert.equal(plain.nodes.some((node) => node.isCurrent), false);
  assert.equal(plain.nodes.every((node) => node.status === "pending"), true);
});

test("a state file that does not describe this pipeline fails loudly", async () => {
  const pipeline = await loadPipeline();
  assert.throws(() => validateState({ task: "x", stages: { nope: { status: "passed" } } }, pipeline), /unknown stage/);
  assert.throws(() => validateState({ task: "x", stages: { brief: { status: "done" } } }, pipeline), /expected one of/);
  assert.throws(() => validateState({ task: "x", gates: { Z: "passed" } }, pipeline), /unknown gate/);
  assert.throws(() => validateState({ stages: {} }, pipeline), /task/);
  assert.equal(validateState({ task: "x" }, pipeline), true);
});

test("the rendered task diagram exposes status and stays self-contained", async () => {
  const pipeline = await loadPipeline();
  const state = await loadState(EXAMPLE_STATE, pipeline);
  const model = buildModel(pipeline, { state });
  const laid = layout(model);
  const html = renderHtml({ svg: renderSvg(laid, model), model, laid, meta: { title: model.title } });

  assert.match(html, /已完成 <strong>5<\/strong> \/ 6 个阶段/);
  assert.match(html, /data-status="gated"/);
  assert.match(html, /data-status="passed"/);
  assert.match(html, /data-current="true"/);
  assert.match(html, /任务状态/);
  assert.equal(/(src|href)=["']https?:\/\//i.test(html), false);
  // The status vocabulary must be explained, not only drawn.
  for (const label of ["已通过", "等待确认", "未开始"]) assert.ok(html.includes(label), `legend missing ${label}`);
});

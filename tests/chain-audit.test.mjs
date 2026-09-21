import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { auditWorkspace, parseGatesRecord } from "../scripts/chain-audit.mjs";

async function makeWorkspace(t, files) {
  const dir = await mkdtemp(path.join(tmpdir(), "chain-audit-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(dir, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  return dir;
}

const PASSED_RECORD = "# Gates\n\n## 门A · 方向稿\n裁决: passed\n";

test("implementation artifacts without a gate record violate the chain", async (t) => {
  const dir = await makeWorkspace(t, { "src/App.tsx": "export default () => null;\n" });
  const report = await auditWorkspace(dir);
  assert.equal(report.ok, false);
  assert.deepEqual(report.violations.map((item) => item.id), ["missing-gates-record"]);
});

test("a compliant workspace passes with gate A passed and artifacts inventoried", async (t) => {
  const dir = await makeWorkspace(t, {
    "src/App.tsx": "export default () => null;\n",
    "index.html": "<!doctype html>\n",
    "GATES.md": PASSED_RECORD,
  });
  const report = await auditWorkspace(dir);
  assert.equal(report.ok, true, JSON.stringify(report.violations));
  assert.deepEqual(report.violations, []);
  assert.equal(report.gates.A.verdict, "passed");
  assert.ok(report.artifacts.includes("src/App.tsx"));
  assert.ok(report.artifacts.includes("index.html"));
});

test("a pending or missing 门A verdict is not a pass", async (t) => {
  const pending = await makeWorkspace(t, {
    "src/main.tsx": "void 0;\n",
    "GATES.md": "## 门A · 方向稿\n裁决: pending\n",
  });
  const pendingReport = await auditWorkspace(pending);
  assert.deepEqual(pendingReport.violations.map((item) => item.id), ["gate-a-not-passed"]);

  const silent = await makeWorkspace(t, {
    "src/main.tsx": "void 0;\n",
    "GATES.md": "# Gates\n\n TODO\n",
  });
  const silentReport = await auditWorkspace(silent);
  assert.deepEqual(silentReport.violations.map((item) => item.id), ["missing-gate-a"]);
});

test("S-tier repairs skip gates A-D but still need a passed 门E record", async (t) => {
  const compliant = await makeWorkspace(t, {
    "src/fix.css": ".button { color: red }\n",
    "GATES.md": "分级: S\n\n## 门E · 验收\n裁决: passed\n",
  });
  assert.equal((await auditWorkspace(compliant)).ok, true);

  const unaccepted = await makeWorkspace(t, {
    "src/fix.css": ".button { color: red }\n",
    "GATES.md": "分级: S\n",
  });
  const report = await auditWorkspace(unaccepted);
  assert.deepEqual(report.violations.map((item) => item.id), ["s-tier-missing-acceptance"]);
});

test("design-phase workspaces without implementation artifacts pass", async (t) => {
  const dir = await makeWorkspace(t, { "README.md": "# direction draft\n" });
  const report = await auditWorkspace(dir);
  assert.equal(report.ok, true);
  assert.deepEqual(report.artifacts, []);
});

test("ignored directories do not count as implementation", async (t) => {
  const dir = await makeWorkspace(t, {
    "node_modules/pkg/dist/App.tsx": "void 0;\n",
    "dist/index.html": "<!doctype html>\n",
  });
  const report = await auditWorkspace(dir);
  assert.equal(report.ok, true);
  assert.deepEqual(report.artifacts, []);
});

test("package.json with dependencies counts as implementation", async (t) => {
  const scaffolded = await makeWorkspace(t, {
    "package.json": JSON.stringify({ dependencies: { react: "^19" } }),
  });
  const scaffoldedReport = await auditWorkspace(scaffolded);
  assert.deepEqual(scaffoldedReport.violations.map((item) => item.id), ["missing-gates-record"]);

  const tooling = await makeWorkspace(t, {
    "package.json": JSON.stringify({ private: true }),
  });
  assert.equal((await auditWorkspace(tooling)).ok, true);
});

test("English headings and verdicts parse bilingually", async (t) => {
  const record = parseGatesRecord("## Gate A · Direction\nverdict: approved\n## 门E · 验收\n裁决: 通过\n");
  assert.equal(record.gates.A.verdict, "approved");
  assert.equal(record.gates.E.verdict, "通过");

  const dir = await makeWorkspace(t, {
    "src/app.tsx": "void 0;\n",
    "GATES.md": "## Gate A · Direction\nverdict: approved\n",
  });
  assert.equal((await auditWorkspace(dir)).ok, true);
});

test("the kit ledger table format in docs/gates.md is discovered and parsed", async (t) => {
  const dir = await makeWorkspace(t, {
    "index.html": "<!doctype html>\n",
    "docs/gates.md": [
      "| 日期 | 门 | 阶段 | 状态 | 呈交物 / 事件 | 裁决 |",
      "| --- | --- | --- | --- | --- | --- |",
      "| 2026-09-20 | A | brief | passed | 首稿方向 | 用户：改后过 |",
      "| 2026-09-20 | E | verify | gated | 第一轮清单 | 待裁决 |",
    ].join("\n"),
  });
  const report = await auditWorkspace(dir);
  assert.equal(report.ok, true, JSON.stringify(report.violations));
  assert.equal(report.gates.A.verdict, "passed");
  assert.equal(report.gates.E.verdict, "gated");
});

test("missing or non-directory workspaces are errors, not violations", async (t) => {
  const missing = await auditWorkspace(path.join(tmpdir(), "chain-audit-does-not-exist"));
  assert.equal(missing.ok, false);
  assert.match(missing.errors[0], /does not exist/);

  const dir = await makeWorkspace(t, { "README.md": "hi\n" });
  const fileReport = await auditWorkspace(path.join(dir, "README.md"));
  assert.equal(fileReport.ok, false);
  assert.match(fileReport.errors[0], /not a directory/);
});

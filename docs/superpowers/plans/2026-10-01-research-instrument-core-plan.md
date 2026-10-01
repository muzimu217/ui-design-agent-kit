# Research Instrument Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free Node.js research-instrument core that validates study packages, generates deterministic assignments, enforces human-only gate decisions, records tamper-evident event chains, freezes evidence manifests, replays runs, and executes C0/C1 dry-runs before recruitment.

**Architecture:** Add a pure ESM runtime under `research/runtime/` as the research adaptation layer. Keep the existing UAK workflow and `docs/chain-flow.md` untouched; the runtime owns only experimental condition control and evidence integrity. Expose it through `scripts/research-instrument.mjs` and fixed local fixtures; all generated runs stay under an explicit output directory.

**Tech Stack:** Node.js ESM, `node:fs/promises`, `node:path`, `node:crypto`, `node:test`; no new runtime dependencies.

## Global Constraints

- Preserve the existing UAK main architecture and gate A-F; research runtime is an adapter, not a replacement.
- Keep P1/P2 research documents read-only during runtime execution; dry-runs never count as participant evidence.
- Use deterministic canonical JSON for hashes and assignment reproducibility.
- Reject path traversal, malformed packages, illegal transitions, unauthorized gate approvals, broken event chains, and post-freeze mutation.
- Do not call network services or model APIs from the runtime or fixtures.
- Generated outputs must be explicitly placed under a caller-provided run directory and must not modify `docs/`, `evals/`, or parallel WIP files.

---

### Task 1: Shared canonical primitives and Study Package validation

**Files:**
- Create: `research/runtime/package-schema.mjs`
- Create: `research/runtime/errors.mjs`
- Create: `research/runtime/fixtures/study-package.json`
- Test: `tests/research-runtime.test.mjs`

**Interfaces:**
- `stableStringify(value): string`
- `sha256Hex(input): string`
- `canonicalHash(value): string`
- `validateStudyPackage(input): {ok:boolean, errors:Array<{code,path,message}>, hash?:string}`
- `assertStudyPackage(input): {package: object, hash: string}`
- `STATES`, `CONDITIONS`, `GATES`, `TRANSITIONS`
- `ResearchRuntimeError(code, message, details)`

- [ ] **Step 1: Write failing tests for canonical hashing and package validation.**

```js
test("study fixture validates and has a stable canonical hash", async () => {
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const first = assertStudyPackage(fixture);
  const second = assertStudyPackage(JSON.parse(JSON.stringify(fixture)));
  assert.equal(first.hash, second.hash);
});

test("package validation rejects duplicate tasks and unfrozen packages", () => {
  const result = validateStudyPackage({...minimalPackage, frozen: false, tasks: [{taskId: "T1", level: "M", title: "a"}, {taskId: "T1", level: "M", title: "b"}]});
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map(error => error.code), ["ERR_PACKAGE_NOT_FROZEN", "ERR_DUPLICATE_ID"]);
});
```

- [ ] **Step 2: Run the focused test and verify it fails because runtime modules do not exist.**

Run: `node --test tests/research-runtime.test.mjs`
Expected: FAIL with module-not-found errors.

- [ ] **Step 3: Implement canonical JSON, SHA-256 helpers, stable error type, and package validation.**

Validation must require `schemaVersion: 1`, non-empty `studyId`/`studyVersion`, `frozen: true`, both `C0` and `C1`, unique tasks with levels `S|M|L`, the declared state list, gates `GATE1|GATE2|GATE3`, and non-empty event types. Return all errors in deterministic path order.

- [ ] **Step 4: Add a minimal frozen fixture with two tasks and the complete event type set.**

- [ ] **Step 5: Run the focused tests and verify Task 1 passes.**

Run: `node --test tests/research-runtime.test.mjs --test-name-pattern='package|canonical'`
Expected: PASS.

---

### Task 2: R1 assignment and R2 state machine

**Files:**
- Create: `research/runtime/assignment.mjs`
- Create: `research/runtime/state-machine.mjs`
- Modify: `tests/research-runtime.test.mjs`

**Interfaces:**
- `createAssignment({study, studyHash, participantIds, taskIds, seed, createdAt=null}): object`
- `assignmentHash(assignment): string`
- `assertAssignmentBalanced(assignment): void`
- `createSessionState({runId, condition, participantId, taskId}): object`
- `transition(current, event): {state: object, event: object}`
- `isTerminalState(state): boolean`

- [ ] **Step 1: Add failing tests for deterministic Latin-square assignment.**

```js
test("assignment is deterministic and balances C0/C1 across paired tasks", () => {
  const one = createAssignment({study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo"});
  const two = createAssignment({study: fixture, studyHash, participantIds: ["p01", "p02"], taskIds: ["T1", "T2"], seed: "demo"});
  assert.deepEqual(one.rows, two.rows);
  assert.equal(one.rows.filter(row => row.condition === "C0").length, 2);
  assert.equal(one.rows.filter(row => row.condition === "C1").length, 2);
});
```

- [ ] **Step 2: Add failing tests for legal transitions and actor restrictions.**

```js
test("agent cannot approve a gate and user can complete C1", () => {
  let current = createSessionState({runId: "r1", condition: "C1", participantId: "p01", taskId: "T1"});
  ({state: current} = transition(current, {actor: "runner", type: "session_started", payload: {}}));
  ({state: current} = transition(current, {actor: "agent", type: "gate_request", payload: {gate: "GATE1"}}));
  assert.throws(() => transition(current, {actor: "agent", type: "gate_decision", payload: {gate: "GATE1", decision: "approve"}}), /ERR_ACTOR_NOT_ALLOWED/);
  ({state: current} = transition(current, {actor: "user", type: "gate_decision", payload: {gate: "GATE1", decision: "approve"}}));
  assert.equal(current.status, "material_search");
});
```

- [ ] **Step 3: Run focused tests and verify the new tests fail.**

Run: `node --test tests/research-runtime.test.mjs --test-name-pattern='assignment|transition|gate'`
Expected: FAIL with missing exports or assertions.

- [ ] **Step 4: Implement deterministic assignment.**

Sort IDs for canonical ordering, derive `condition = conditions[(participantIndex + taskIndex) % 2]`, include a stable `assignmentId`, `studyHash`, `seed`, `createdAt`, rows, and a canonical `assignmentHash`. Reject unknown IDs, duplicate IDs, missing tasks/participants, and odd balance requests when strict balance is requested.

- [ ] **Step 5: Implement the state machine.**

Support C1 flow `idle → intent_drafting → GATE1_PENDING → material_search → GATE2_PENDING → plan_frozen → executing → evidence_collect → GATE3_PENDING → done`. Support C0 flow `idle → executing → evidence_collect → done` with no gate decisions. Only `user` may approve/reject gates; rejects require a non-empty reason; `agent` may request gates; `runner` may start sessions, advance phases, and end sessions. Throw stable `ResearchRuntimeError` codes for illegal transition, actor, gate, reason, and terminal-state violations.

- [ ] **Step 6: Run focused tests and verify Task 2 passes.**

Run: `node --test tests/research-runtime.test.mjs --test-name-pattern='assignment|transition|gate'`
Expected: PASS.

---

### Task 3: Event chain, evidence freeze, and read-only replay

**Files:**
- Create: `research/runtime/event-log.mjs`
- Create: `research/runtime/evidence-store.mjs`
- Create: `research/runtime/replay.mjs`
- Modify: `tests/research-runtime.test.mjs`

**Interfaces:**
- `EventLog({filePath, runId, clock}): {append(event), read(), verify()}`
- `verifyEventChain(filePath, expectedRunId): {ok:boolean, events:Array, error?: object}`
- `writeArtifact(runDir, relativePath, data): Promise<string>`
- `freezeRun(runDir, metadata): Promise<object>`
- `verifyRun(runDir): Promise<{ok:boolean, errors:Array, manifest?:object}>`
- `replayRun(runDir): Promise<{finalState:string, eventCount:number, gateDecisions:Array, errors:Array}>`

- [ ] **Step 1: Add failing tests for event hash chaining and tamper detection.**

```js
test("event log chains hashes and detects a modified line", async () => {
  const log = new EventLog({filePath, runId: "r1", clock: () => "2026-10-01T00:00:00.000Z"});
  await log.append({actor: "runner", type: "session_started", payload: {}});
  await log.append({actor: "runner", type: "execution_started", payload: {}});
  assert.equal((await log.verify()).ok, true);
  const lines = (await readFile(filePath, "utf8")).trim().split("\\n");
  lines[1] = lines[1].replace("execution_started", "tampered");
  await writeFile(filePath, `${lines.join("\\n")}\\n`);
  assert.equal((await verifyEventChain(filePath, "r1")).ok, false);
});
```

- [ ] **Step 2: Add failing tests for frozen manifests, traversal rejection, and read-only replay.**

```js
test("freeze verifies files, blocks mutation, and replay does not alter the run", async () => {
  await writeArtifact(runDir, "input/task-card.md", "T1");
  const manifest = await freezeRun(runDir, {studyHash, assignmentHash, eventLogHash});
  assert.equal((await verifyRun(runDir)).ok, true);
  await assert.rejects(() => writeArtifact(runDir, "new.txt", "x"), /ERR_RUN_FROZEN/);
  const before = await readFile(manifestPath, "utf8");
  const replay = await replayRun(runDir);
  assert.equal(replay.finalState, "done");
  assert.equal(await readFile(manifestPath, "utf8"), before);
});
```

- [ ] **Step 3: Run focused tests and verify they fail.**

Run: `node --test tests/research-runtime.test.mjs --test-name-pattern='event|freeze|replay|traversal'`
Expected: FAIL with missing modules.

- [ ] **Step 4: Implement canonical JSONL event append and verification.**

Each line must contain schema version, ISO timestamp, fixed run ID, increasing seq, actor, type, payload, `prevSha`, and `sha`. Appending re-verifies the full existing file; damaged or externally modified logs reject further writes. The verifier returns the first failing line and stable error code.

- [ ] **Step 5: Implement safe artifact writes, sorted SHA-256 manifest freeze, and verification.**

Reject absolute paths and any `..` escape. Exclude manifest and temporary files from the file list. Once `MANIFEST.sha256` exists, all artifact writes fail until a future revision mechanism is explicitly added. Verify manifest entries, study/assignment/event hashes, and event-chain integrity.

- [ ] **Step 6: Implement read-only replay.**

Read and verify the event log, fold only known state-changing events, collect gate decisions and errors, and never write to the run directory.

- [ ] **Step 7: Run focused tests and verify Task 3 passes.**

Run: `node --test tests/research-runtime.test.mjs --test-name-pattern='event|freeze|replay|traversal'`
Expected: PASS.

---

### Task 4: CLI, fixtures, dry-run, documentation, and full verification

**Files:**
- Create: `research/runtime/dry-run.mjs`
- Create: `research/runtime/fixtures/dry-run-scenarios.json`
- Create: `scripts/research-instrument.mjs`
- Modify: `tests/research-runtime.test.mjs`
- Modify: `package.json`
- Modify: `research/README.md`
- Modify: `research/tool-and-document-inventory.md`

**Interfaces:**
- `runDryRun({studyPackage, studyHash, outDir, clock}): Promise<{conditions:Array, runs:Array}>`
- CLI commands: `validate-package`, `assign`, `dry-run`, `replay`, `verify`

- [ ] **Step 1: Add failing end-to-end tests for C0/C1 dry-run.**

```js
test("dry-run produces distinct C0/C1 frozen runs that replay correctly", async () => {
  const report = await runDryRun({studyPackage: fixture, studyHash, outDir, clock: fixedClock});
  assert.deepEqual(report.conditions.sort(), ["C0", "C1"]);
  assert.equal(report.runs.every(run => run.finalState === "done"), true);
  const c0 = await readJson(path.join(outDir, "C0", "MANIFEST.sha256"));
  const c1 = await readJson(path.join(outDir, "C1", "MANIFEST.sha256"));
  assert.notEqual(c0.eventLogHash, c1.eventLogHash);
  assert.equal((await replayRun(path.join(outDir, "C0"))).gateDecisions.length, 0);
  assert.equal((await replayRun(path.join(outDir, "C1"))).gateDecisions.length, 3);
});
```

- [ ] **Step 2: Run the focused test and verify it fails.**

Run: `node --test tests/research-runtime.test.mjs --test-name-pattern='dry-run'`
Expected: FAIL because dry-run and CLI are not implemented.

- [ ] **Step 3: Implement fixed C0/C1 dry-run scenarios.**

Write only to the requested output directory, create input/task card, timing, session metadata, JSONL log, evidence summary, and manifest for each condition. Use fixed timestamps in tests; no network, model, or participant data. C0 must have zero gate decisions; C1 must have exactly three user gate approvals.

- [ ] **Step 4: Implement CLI with stable JSON output and non-zero failures.**

Resolve all input paths safely, parse JSON, call runtime functions, print one JSON result, and set `process.exitCode = 1` on runtime errors. `dry-run` must refuse a non-empty output directory rather than delete it.

- [ ] **Step 5: Add package scripts and document the commands.**

Add `research:validate`, `research:dry-run`, and `research:test` scripts. Update `research/README.md` and `research/tool-and-document-inventory.md` to link the runtime, CLI, fixtures, and dry-run boundary.

- [ ] **Step 6: Run focused and full verification.**

Run: `node --test tests/research-runtime.test.mjs`
Expected: all research runtime tests pass.

Run: `npm test`
Expected: all repository tests pass.

Run: `npm run verify`
Expected: `ok: true`; existing warnings may remain but no new errors.

Run: `node scripts/research-instrument.mjs dry-run research/runtime/fixtures/study-package.json --out /tmp/uak-research-dry-run`
Expected: JSON reports C0 and C1 complete and frozen.

Run: `node scripts/research-instrument.mjs verify /tmp/uak-research-dry-run/C0` and the same for C1.
Expected: both report `ok: true`.

- [ ] **Step 7: Commit the implementation.**

```bash
git add research/runtime scripts/research-instrument.mjs tests/research-runtime.test.mjs package.json research/README.md research/tool-and-document-inventory.md docs/superpowers/specs/2026-10-01-research-instrument-core-design.md docs/superpowers/plans/2026-10-01-research-instrument-core-plan.md
git commit -m "feat(research): add tamper-evident instrument core and dry-run"
```

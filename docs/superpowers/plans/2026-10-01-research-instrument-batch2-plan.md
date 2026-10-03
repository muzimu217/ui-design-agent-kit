# Research Instrument Batch 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the research instrument from fixed-fixture dry-runs to real-session capability: a human-gated session runner, persisted assignment store, read-only researcher console, and all batch-1 hardening closures.

**Architecture:** Extend `research/runtime/` (pure Node ESM, zero deps). Gate decisions enter only through an injected human-decision callback; C0 exposes no gate API at all. verifyRun gains a legality section (chain integrity vs actor legality are separate verdicts). Shared constants move to a leaf `constants.mjs` to break the event-log↔evidence-store cycle.

**Tech Stack:** Node.js ESM, `node:fs/promises`, `node:path`, `node:crypto`, `node:test`; no new runtime dependencies.

## Global Constraints

- Same file set discipline as batch 1: only `research/runtime/**`, `scripts/research-instrument.mjs`, `tests/research-runtime.test.mjs`, `package.json` scripts, `research/README.md`, `research/tool-and-document-inventory.md`, and the design/plan docs under `docs/superpowers/`. No touches to `docs/` product docs, `evals/`, `.agents/`, or parallel WIP (docs/eval-report-2026-09.md, evals/results.json, .agents/skills/**, docs/gates.md, docs/iteration-log.md, f00-*.png).
- No network, no model calls, no real participant data. Session artifacts derive only from the frozen study package; task-card body carries an explicit "正文待 P2-1 冻结" marker.
- All run outputs go only into caller-provided directories; existing empty-dir refusals stay.
- Stable error codes on every rejection path; single-JSON CLI output; exit code 1 on failure.
- Do not push to remote (user decision); commit locally on the current branch.

---

### Task 1: Hardening closures, shared constants, assignment store

**Files:**
- Create: `research/runtime/constants.mjs`
- Create: `research/runtime/assignment-store.mjs`
- Modify: `research/runtime/event-log.mjs` (runDirIsFrozen tolerates only ENOENT; MANIFEST_FILENAME from constants)
- Modify: `research/runtime/evidence-store.mjs` (MANIFEST_FILENAME from constants; import cycle must stay broken — evidence-store may import constants but not event-log)
- Modify: `research/runtime/replay.mjs` (export STATE_CHANGING_EVENT_TYPES)
- Modify: `research/runtime/dry-run.mjs` (consume replay's exported constant)
- Modify: `tests/research-runtime.test.mjs`

**Interfaces:**
- `MANIFEST_FILENAME` from `constants.mjs`
- `STATE_CHANGING_EVENT_TYPES` exported from `replay.mjs`
- `saveAssignment(storeDir, assignment): Promise<{path, assignmentId}>` — duplicate assignmentId → `ERR_ASSIGNMENT_EXISTS` even if byte-identical
- `loadAssignment(storeDir, assignmentId): Promise<object>` — missing → `ERR_ASSIGNMENT_MISSING`; hash mismatch → `ERR_ASSIGNMENT_CORRUPT`
- `listAssignments(storeDir): Promise<Array<{assignmentId, studyId, seed, rowCount}>>` sorted by assignmentId

- [ ] **Step 1: Write failing tests** — ENOENT-only freeze tolerance (unit-testable via fake stat is not required; at minimum regression: append to frozen run still throws ERR_RUN_FROZEN), constant exports exist and equal current literals, save/duplicate/missing/corrupt/load/list store behaviors.
- [ ] **Step 2: Confirm red** (`node --test tests/research-runtime.test.mjs` — new tests fail).
- [ ] **Step 3: Implement** constants leaf module; rewire both importers; narrow the stat catch; export replay's set and rewire dry-run; implement the store (canonical JSON, recompute assignmentHash on load).
- [ ] **Step 4: Green** — full research test file passes; prior tests unchanged.
- [ ] **Step 5: Commit** locally.

### Task 2: Session runner + CLI session command

**Files:**
- Create: `research/runtime/session-runner.mjs`
- Modify: `scripts/research-instrument.mjs` (`session` command; `assign --save <storeDir>`)
- Modify: `tests/research-runtime.test.mjs`

**Interfaces:**
- `startSession({studyPackage, studyHash, assignment, participantId, taskId, condition, runDir, clock, decisions}): Promise<{runId, runDir, finalState, eventCount, gateDecisions, frozen, verifyOk, replayOk}>`
- decisions callback: `async ({gate, phase}) => ({decision: "approve"|"reject", reason})`; reject requires non-empty reason; C0 with decisions → `ERR_C0_DECISIONS_PROVIDED`; unassigned row → `ERR_SESSION_UNASSIGNED`
- CLI: `session <pkg> --assignment <id> --store <dir> --participant <id> --task <id> --out <dir> [--decisions approve,approve,approve]`; decisions count mismatch → `ERR_DECISIONS_MISMATCH`

- [ ] **Step 1: Failing tests** — C1 happy path end-to-end (3 approvals → freeze → replay done/3 gates → verify ok), C1 reject-then-re-approve multi-round on GATE1 (state returns to intent_drafting then proceeds), C0 runs with no gate events and rejects provided decisions, unassigned pair rejected, artifact set exists (input/task-card.md with P2-1 marker, intent/, material/, plan/, evidence/).
- [ ] **Step 2: Confirm red.**
- [ ] **Step 3: Implement runner** (event vocabulary per design §3.2; all events through EventLog chain; artifacts via writeArtifact; end-of-run freeze + replay/verify self-check, failure keeps artifacts for inspection). CLI: scripted `--decisions`; interactive TTY prompt fallback (approve/reject + reason per gate).
- [ ] **Step 4: Green** — full file passes.
- [ ] **Step 5: Commit** locally.

### Task 3: Researcher console, verifyRun legality, docs, full verification

**Files:**
- Create: `research/runtime/researcher-console.mjs`
- Modify: `research/runtime/evidence-store.mjs` (verifyRun adds `legality: {ok, errors}` — fold via transition(), report seq+code for illegal transitions/actors; integrity semantics unchanged)
- Modify: `scripts/research-instrument.mjs` (`console <runsRoot>` command)
- Modify: `tests/research-runtime.test.mjs`
- Modify: `research/README.md`, `research/tool-and-document-inventory.md` (batch-2 rows; verify≠legality boundary sentence)
- Verify: `package.json` (add `research:console` only if zero-arg viable; otherwise document CLI)

**Interfaces:**
- `scanRuns(runsRoot): Promise<{runs: Array<{runDir, condition?, finalState, eventCount, gateDecisionCount, integrityOk, legalityOk, replayOk, errors}>>}` — read-only; skips symlinked dirs
- verifyRun output gains `legality` key (breaking change acceptable; update existing verifyRun tests)

- [ ] **Step 1: Failing tests** — verifyRun flags a crafted valid-chain agent `gate_decision` (integrity ok, legality ok:false with seq); legality ok:true on clean C0/C1; console scans a dry-run output dir (C0+both C1 gates counted), reports integrity/legality/replay ok, and writes nothing (assert mtimes/hashes unchanged).
- [ ] **Step 2: Confirm red.**
- [ ] **Step 3: Implement** legality folding (reuse transition()) and console scanner.
- [ ] **Step 4: Docs** — README: session/console/assign --save usage + verify≠legality boundary; inventory: batch-2 rows, update "尚未实现" list (remove assignment persistence + session runner once landed).
- [ ] **Step 5: Full verification** — full research file green; `npm test` (≥140, count will grow; update docs/quality-monitor.md test-count row in the same commit if the doc-drift guard requires it — that row machine-locks the `tests/` count and mandates same-change updates); `npm run verify` ok; live CLI end-to-end into temp dirs: `assign --save` → `session` (scripted decisions) → `console` → include outputs in report.
- [ ] **Step 6: Commit** locally.

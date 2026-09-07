# Test Artifact and Workspace Boundary Design

**Date:** 2026-09-07
**Project:** `ui-design-agent-kit`
**Status:** approved for implementation by the user

## Decision

The repository remains the UI Design Agent Kit, not a home for generated
products. Its durable content is the instruction, routing, configuration,
tests, behavior scenarios, evaluation records, and deliberately retained
fixtures. The root `package.json` name remains `ui-design-agent-kit`.

A generated product or an end-to-end trial belongs in a sibling workspace such
as `../ui-kit-trial/`, with its own package manager state, build output,
assets, screenshots, product documentation, and dev server. It is never added
to the kit package graph or root scripts.

## Directory Contract

```text
ai/                                      # ui-design-agent-kit source
  .agents/ .codex/ docs/ scripts/ tests/ # durable kit source and evidence rules
  demo/                                  # tracked fixture source and curated evidence only
  evals/runs/                            # replayable evaluation evidence and records
  test-artifacts/                        # ignored, disposable root-local test output
    browser/                             # temporary screenshots and browser snapshots
    generated/                           # generated prompt exports and temporary mockups
    logs/                                # browser and tool logs

../ui-kit-trial/                         # external generated product / full-flow trial
```

## Retention and Cleanup

- Keep tracked fixture source, design records, acceptance records, reference
  images, and evaluation evidence.
- Delete ignored `node_modules/` and `dist/` below `demo/` and `showcase/`;
  they are reproducible from each fixture's lockfile and build command.
- Move root-local disposable outputs from `output/`, `.playwright-cli/`,
  `.playwright-mcp/`, and `.impeccable/` into `test-artifacts/`; remove the
  old root folders after the move.
- Do not move or delete `evals/runs/` evidence: it backs the scoring ledger and
  replay records.
- Add paths for the new ignored directory and preserve backward-compatible
  ignore rules for old generated locations so stale tools cannot pollute git.

## Producer Rules

- Prompt export defaults to `test-artifacts/generated/`.
- Browser-test evidence that is not explicitly part of an evaluation or retained
  fixture defaults to `test-artifacts/browser/`; temporary logs default to
  `test-artifacts/logs/`.
- A task that needs a runnable product creates a sibling workspace first and
  writes all product-specific code and evidence there.
- A fixture is admitted under `demo/` only by explicit user request and must
  remain isolated from the root package graph.

## Acceptance

1. No root-level `output/`, `.playwright-cli/`, `.playwright-mcp/`, or
   `.impeccable/` remains after migration.
2. No ignored `node_modules/` or `dist/` remains under `demo/` or `showcase/`.
3. `test-artifacts/` is ignored and organized by producer category.
4. Architecture and usage documents name `ui-design-agent-kit`, the test output
   boundary, and the external `ui-kit-trial` pattern.
5. Kit verification, tests, and prompt build still pass.

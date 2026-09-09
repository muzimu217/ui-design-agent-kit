# Agent Kit Architecture

## Purpose

This repository is the product: a project-scoped UI design agent kit. Its
durable outputs are instructions, routing rules, verified integrations,
diagnostics, and behavior evaluations. It is not the runtime home for every
product UI that the agent generates.

## Boundaries

```text
kit source of truth
  .agents/skills/   entrypoints, references, supporting skills
  .codex/           project-scoped MCP configuration
  scripts/          prompt export, verification, diagnostics
  tests/ evals/     structural checks and behavior contracts

in-repository showcase (safe demonstration only)
  showcase/         illustrates the kit; never imported by the agent runtime

external task workspace (default for generated products)
  ../<product-name>/  runnable UI, assets, screenshots, product-specific docs
                       independent package.json and dev server

disposable generated artifacts
  output/           generated prompt export; gitignored and reproducible
  .playwright-*/    browser evidence; gitignored and non-authoritative
```

Generated product work must not add routes, dependencies, assets, runtime
imports, or product claims to the kit. When a product demo is explicitly kept
inside this repository, it belongs under an isolated showcase or fixture
directory and must not be referenced by root scripts, skill instructions, MCP
configuration, or package workspaces. The safer default is an external sibling
workspace, as used by `forma-phone-ui`.

## Execution Contract

1. Read the kit instructions and target project's instructions.
2. Resolve the target surface and workspace boundary before editing.
3. Inspect the existing target and search a bounded, inspectable reference.
4. Select the relevant skill route and record the design or video contract.
5. Use only discovered MCP tools and report configured, connected, and called
   as separate evidence levels.
6. Keep agent dispatch bounded: one main agent and at most one active subagent
   per task; queue dependent phases and stop/review a worker before dispatching
   the next. S tasks default to zero subagents; M tasks delegate sequentially as
   needed; L tasks use the standard A/B/C phases sequentially.
7. Delegate implementation only inside the target workspace.
8. Verify the target with build, browser, accessibility, responsive, and reduced
   motion checks appropriate to the task.
9. Hand off the target path and evidence without copying generated product code
   back into the kit.

## Evidence Levels

| Level | Meaning | Example |
| --- | --- | --- |
| Installed | Local skill/config exists and passes structural validation | `npm run verify` |
| Configured | Server entry is present but not contacted | `npm run doctor` |
| Connected | MCP handshake and tool listing succeeded | `npm run doctor:mcp` server status |
| Called | A specific tool returned expected evidence | Motion docs resource read |
| Visually verified | The target app was rendered and behavior inspected | Playwright screenshot + interaction check |

No higher level is inferred from a lower one. A passing kit test does not prove
that a generated product is visually correct, and a successful MCP connection
does not prove that an agent used the tool correctly.

## Current Trial

### Explicitly Retained Product Showcase

On 2026-09-07, the user explicitly requested retaining the brick-building
experiment in this repository for product demonstration. `demo/brick-workshop/`
contains isolated source, tests, lockfile and curated screenshots;
`showcase/products/` is the Agent workflow's public-facing exhibition entry,
with a multi-project outcome portfolio; the brick workshop is one example,
not the primary product or home-page identity. Neither enters the
root package graph or the agent runtime. This exception does not admit unrelated
generated products. Only the two compiled applications are assembled for Pages;
the original external workspace and old showcase sources are preserved.
See [product-showcase.md](product-showcase.md) for build and publication boundaries.

`demo/forma-phone-ui` (the fictional FORMA One product demo, moved here from an
external sibling workspace by explicit user request on 2026-09-08) and
`demo/tempo-day` (a time/calendar demo app, admitted the same way) follow the
same fixture rules as `demo/brick-workshop`: isolated source with their own
package state, never part of the root package graph, scripts, skills, MCP
config, or evaluation corpus. Their build outputs and raw verification
artifacts are gitignored.

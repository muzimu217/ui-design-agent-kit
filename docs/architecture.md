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
6. Delegate implementation only inside the target workspace.
7. Verify the target with build, browser, accessibility, responsive, and reduced
   motion checks appropriate to the task.
8. Hand off the target path and evidence without copying generated product code
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

`/Users/blackevil/Documents/ChatGPT/forma-phone-ui` is an external sibling
workspace containing the fictional FORMA One product demo. It is intentionally
not part of this repository's package graph, scripts, skills, MCP config, or
evaluation corpus. Its own build, screenshots, and product documents remain
with that workspace.

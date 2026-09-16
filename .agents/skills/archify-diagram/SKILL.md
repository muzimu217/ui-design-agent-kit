---
name: archify-diagram
description: "Author a system or process description into one self-contained interactive HTML architecture diagram with inline SVG, using the Archify tool. Use when the user asks to visualize system architecture, infrastructure, cloud or network or security topology, technical workflows and runbooks, CI/CD, API call sequences, request lifecycles, data pipelines, ETL/ELT, data lineage, or state machines. Covers picking among Archify's five diagram types, the minimal valid typed JSON IR for each, validating before delivery, and Archify's honest limits. Not a general drawing editor, not a Mermaid renderer, and not an automatic layout engine."
license: MIT
metadata:
  version: "1.0"
  upstream: tt-a1i/archify
  upstream-revision: 64b1ba0c1ee40c3da4d1d11d03ed353cccffdf2e
---

# Archify Diagram

Archify compiles a small typed JSON IR into a standalone interactive HTML diagram
(inline SVG, dark/light themes, pan/zoom/search, exports). It supports exactly five
diagram types and rejects unknown fields rather than guessing.

## This skill is a usage guide, not the runtime

This repository does **not** install Archify. There is no `archify` binary, schema,
or renderer here, and this skill cannot render anything by itself. To actually
produce a diagram, the runtime must be installed separately from upstream:

```bash
npx skills add tt-a1i/archify -g
```

Then confirm the tool is present before promising output:

```bash
node bin/archify.mjs doctor
node bin/archify.mjs demo /tmp/archify-demo
```

If Archify is unavailable, say so once. You may still help the user pick a type and
draft the IR by hand from [references/ir-minimal.md](references/ir-minimal.md); the
draft is unverified until a real `validate` run accepts it. Do not claim a diagram
was generated, validated, or visually checked when it was not. Fall back to Mermaid
or hand-authored SVG only if the user agrees.

## When this skill applies

Use it when the user wants a durable, inspectable system or process diagram:
architecture, infrastructure/topology, workflows and runbooks, API call chains,
request lifecycles, data pipelines and lineage, or state machines. It also fits
converting a pasted Mermaid `flowchart`, `sequenceDiagram`, or `stateDiagram`.

It does not fit: freeform illustration, charts or plots, UML class/ER modeling,
UI mockups, or diagrams that must be edited by a non-technical user in a GUI.

## Pick the type first

Choose exactly one of the five types before writing any IR. See
[references/type-selection.md](references/type-selection.md) for the decision table,
the questions each type answers, and the 11 upstream scenario recipes.

| Type | Use for |
| --- | --- |
| `architecture` | Components, services, cloud/security boundaries, infrastructure |
| `workflow` | Processes, approval gates, tool calls, runbooks, CI/CD |
| `sequence` | API call chains, request lifecycles, async traces, returns |
| `dataflow` | Pipelines, ETL/ELT, lineage, governance, consumers |
| `lifecycle` | State/status transitions, retries, waiting and terminal states |

When the choice is genuinely ambiguous, ask upstream instead of guessing:

```bash
node bin/archify.mjs guide "<scenario>" --json
```

## Author the IR

Start from the validated minimal example for the chosen type in
[references/ir-minimal.md](references/ir-minimal.md). Each example there is a
complete document that passes `validate --quality showcase` with 9/9 checks, so it
is a safe structural starting point. Replace the facts; keep the field shapes.

Authoring rules that actually change the result:

- Author fresh stable IDs, real domain wording, and real facts. Use examples for
  field shape, never for content.
- One obvious main path, short side branches, sparse labels, at most ~12 primary
  nodes. Remove a low-value relationship before adding a routing control.
- Use the shared enums: component `type` is one of `frontend`, `backend`,
  `database`, `cloud`, `security`, `messagebus`, `external`; `variant` is one of
  `default`, `emphasis`, `security`, `dashed`.
- Omit optional `meta` fields by default (`subtitle`, `visual_preset`, `legend`,
  `animation`). Set `visual_preset` only when the user explicitly requests a style.
- Set `meta.quality_profile` to `"showcase"` unless the user wants a dense
  `"standard"` map. A misspelled or missing quality profile is a real defect.
- New `workflow` documents use `schema_version: 2`. The other four types pin
  `schema_version: 1`.
- Relationship labels are semantic data. Fix collisions by moving the label or the
  route, then shortening the wording; deleting a meaningful label is not a repair.
- Do not add `via`, `channelX`, `channelY`, or `labelAt` speculatively. Add at most
  one diagnosed geometry control per repair.

Exact field lists, enums, and the geometry repair order live in
[references/ir-minimal.md](references/ir-minimal.md) and the upstream
`schemas/README.md` at the pinned revision.

## Validate, then deliver

Never present an unvalidated candidate as finished. Run the loop in
[references/cli-and-validation.md](references/cli-and-validation.md):

```bash
node bin/archify.mjs validate <type> candidate.json --quality showcase --json
node bin/archify.mjs deliver <type> candidate.json output.html --quality showcase --json
```

- `validate` after every edit. `deliver` once for final acceptance.
- A showcase pass reports all **9** artifact checks with 0 composition errors and
  0 warnings. A receipt with only 4 checks is basic validation, not showcase.
- Read `diagnostics[]` by `code`, `subject`, `evidence`, and `supportedFixes`.
  Apply only the supported fix for the named subject.
- Two consecutive rounds without a new minimum error count means stop and report
  the unresolved diagnostics honestly.
- A non-zero exit is never success. Keep the three claims separate: `deliver`
  proves deterministic artifact checks, `visual-check` proves bounded browser
  behavior, and perceptual polish needs a real human or image-capable reviewer.

## Honest limits

State these plainly instead of overclaiming:

- Archify does **not** parse Mermaid automatically. Read Mermaid for topology and
  meaning, then author fresh Archify JSON. It is not a Mermaid theme.
- There is **no** general-purpose auto-layout. The author chooses hierarchy,
  spacing, routes, and emphasis; the renderer only spreads shared ports.
- There is **no** WYSIWYG editing, hosted sharing, or GUI. Output is a file.
- Validation proves schema and geometry correctness, not that the diagram is true.
  Only assert relationships you actually verified. Do not infer runtime causality
  from file proximity or naming.
- Upstream repository evidence (`meta.repository` + `components[].sources`) is
  opt-in, architecture-only, and requires a matching local Git origin at a pinned
  40-character revision.

## References

- [references/type-selection.md](references/type-selection.md) — type decision table,
  scenario recipes, and when each type is the wrong answer.
- [references/ir-minimal.md](references/ir-minimal.md) — a validated minimal IR for
  each of the five types, plus required fields, enums, and repair order.
- [references/cli-and-validation.md](references/cli-and-validation.md) — commands,
  quality profiles, the receipt shape, the repair loop, and the handoff format.
- [references/boundaries-and-evidence.md](references/boundaries-and-evidence.md) —
  scope exclusions, install/fallback paths, and evidence and ownership profiles.

Upstream project: <https://github.com/tt-a1i/archify> (MIT, revision pinned in
`tooling/sources.lock.json`). The upstream `LICENSE` is preserved beside this file.

# Workflow Visualization

Every stage of the delivery chain can produce one self-contained HTML diagram that
shows the user where their task actually is: which stage is running, which gate is
waiting on them, what each finished stage produced, and where a rejection sent the
work back. It is a status artifact, not decoration.

## When to produce one

- **At every gate presentation** (A, B, C, D, E). The user is being asked to
  decide; the diagram is the cheapest way to show them the position they are
  deciding from, including what has already been approved.
- **When the user asks where the work stands.** Answer with the diagram, not with
  a paragraph. It carries the same facts with less reading.
- **On a blocked stage.** A blocked stage is exactly when the shape of the
  process matters: which gate stopped it, what the return path is.
- **At delivery**, as part of the handoff record.

Do not produce one for a narrow repair (tier S) that touches no gate, and do not
produce one speculatively before any stage has run — an all-pending diagram tells
the user nothing they did not already know.

## How to produce one

Two steps, both local, no network, no dependency install.

**1. Record the task state.** Write a JSON file describing this task's real
position. Start from the template so the shape is right:

```bash
npm run diagram:state -- /tmp/<task>-state.json
```

Fill in `task`, then each stage's `status` and the evidence that stage actually
produced:

```json
{
  "task": "睿耳 RuiEar 落地页",
  "revision": "P-earbuds-2",
  "updatedOn": "2026-09-16",
  "stages": {
    "brief": { "status": "passed", "evidence": "demo/x/PLAN.md" },
    "reference": { "status": "passed", "evidence": "demo/x/research/" },
    "contract": { "status": "gated", "note": "等用户裁决门C" },
    "build": { "status": "pending" },
    "verify": { "status": "pending" },
    "deliver": { "status": "pending" }
  }
}
```

Rules that matter:

- Status values come from the pipeline's own vocabulary — `pending`, `active`,
  `gated`, `passed`, `blocked`. Nothing else is accepted; an unknown value fails
  the build rather than rendering as a plausible-looking diagram.
- **Report the record, not the intention.** A stage is `passed` only when the
  user actually confirmed its gate. A gate artifact sitting with the user is
  `gated`, not `active`. If a stage produced nothing, leave it `pending` and say
  so; do not fill the diagram with optimistic states.
- `evidence` is the real path to what the stage produced (a plan file, a
  screenshot directory, a contract). If a stage has no artifact, omit the field —
  the diagram will show the expected evidence marked as an expectation rather
  than pretending it exists.
- `blockedReason` is for a genuine blocker: an unresolved P0, a missing
  capability, a failed check.

**2. Render it.**

```bash
npm run diagram -- <output>.html --state <task>-state.json
```

Put the output somewhere the user can open directly (their project directory, or
a path you report). Then verify it before handing it over:

```bash
npm run diagram:check -- <output>.html
```

`check` fails a file that references the network, is missing a stage, or renders
no per-node status. A diagram that fails it must not be presented as finished.

## What the diagram shows

| Element | Meaning |
| --- | --- |
| Four lanes | Who acts: main agent, subagents, the user's confirmation gates, rework |
| Columns | The delivery stages, left to right |
| Red blocks | Confirmation gates; the chain stops here until the user decides |
| Dotted link | A trace requirement (gate F) — a record to keep, not a user stop |
| Dashed edges | The return path taken when a gate is rejected |
| Node badge | That stage's real status, carried by glyph and stroke weight, not colour alone |
| Emphasised node | The stage the task is on right now |

## Honest limits

- This is a **status artifact for one task**, not a live dashboard. It shows the
  state at the moment it was rendered; re-render after a stage changes. Do not
  describe it as real-time monitoring.
- The diagram proves nothing about the work itself. It reports the states you
  recorded. Recording `passed` for a gate the user never confirmed makes the
  diagram lie, which is worse than having no diagram.
- Do not ship the state file or the HTML as a product deliverable unless the user
  asks. It is a communication aid during the task.
- A rendered diagram is not evidence that a stage was verified. Browser
  evidence, acceptance records, and MCP call traces remain the evidence; the
  diagram only reports where the chain is.

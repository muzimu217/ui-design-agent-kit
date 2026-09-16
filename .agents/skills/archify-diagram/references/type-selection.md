# Type selection

Read this when the diagram type is not obvious, or to check that a chosen type is
the right answer. Source: upstream `archify/SKILL.md` (type router, Mermaid input),
`recipes/scenarios.mjs` (11 recipes), and `schemas/README.md`.

## The five types

| Type | Answers | Use for |
| --- | --- | --- |
| `architecture` | What exists, who owns it, how is it connected? | Components, services, cloud/security boundaries, infrastructure |
| `workflow` | What steps happen, in what order, with which gates? | Processes, approval gates, tool calls, runbooks, CI/CD |
| `sequence` | Who calls whom, in what order, and what returns? | API call chains, request lifecycles, async traces, returns |
| `dataflow` | Where does data come from, how does it change, who consumes it? | Pipelines, ETL/ELT, lineage, governance, consumers |
| `lifecycle` | Which states exist, what moves between them, how does it end? | State/status transitions, retries, waiting and terminal states |

Ambiguous? Ask upstream:

```bash
node bin/archify.mjs guide "<scenario>" --json
```

## Decision shortcuts

- "Show me the system" → `architecture`. "Show me the steps" → `workflow`.
- "Show me the call order" → `sequence`. "Show me where data goes" → `dataflow`.
- "Show me what can happen to this object" → `lifecycle`.
- Order does not matter and the audience needs stable topology → not `sequence`.
- The object has no durable state and the question is interaction over time → not
  `lifecycle`.
- The audience needs request timing rather than data assets → not `dataflow`.

## The 11 upstream scenario recipes

From `node bin/archify.mjs guide --json` at the pinned revision. Each carries a
`useWhen` and an `avoidWhen`; use them as a routing aid, not as content to copy.

| id | type | Question |
| --- | --- | --- |
| `system-overview` | architecture | What exists, who owns it, and how is it connected? |
| `deployment-ownership` | architecture | Where does each workload run, and what crosses a boundary? |
| `agent-tool-call` | workflow | How does an agent plan, get permission, act, recover, and report? |
| `delivery-workflow` | workflow | How does a change move safely from commit to production? |
| `incident-runbook` | workflow | How do responders detect, triage, mitigate, verify, and escalate? |
| `api-request` | sequence | Who calls whom, in what order, and what returns? |
| `async-roundtrip` | sequence | What happens after the initial request returns? |
| `data-lineage` | dataflow | Where does data come from, how does it change, and who consumes it? |
| `event-stream` | dataflow | Which events move through which topics, processors, groups, and failure paths? |
| `object-lifecycle` | lifecycle | Which states exist, what events move between them, and how does it end? |
| `deployment-lifecycle` | lifecycle | What state is a release in, and what can happen next? |

Notable `avoidWhen` guidance worth honoring:

- `system-overview`: avoid when the audience needs exact call order, state
  transitions, or row-level data lineage.
- `deployment-ownership`: avoid when deployment facts are unknown; never invent
  them. If a fail-closed review is wanted, ask before enabling
  `meta.engineering_profile`.
- `event-stream`: avoid when topic names, consumer groups, and delivery semantics
  are unknown — use a generic `workflow` instead.
- `object-lifecycle`: avoid when the object has no durable state.
- `deployment-lifecycle`: avoid when the question is the human/CI sequence of
  delivery actions rather than the deployment object's state.

## Mermaid input

Archify does not parse Mermaid. Read the Mermaid source for topology and meaning,
then author fresh Archify JSON. Do not mechanically reproduce Mermaid styling.

| Mermaid | Archify type |
| --- | --- |
| `flowchart` / `graph` | `workflow`, or `architecture` for a component map |
| `sequenceDiagram` | `sequence` — participants become semantic participants, arrows become messages |
| `stateDiagram` | `lifecycle` — states and transitions keep their meaning, not Mermaid style |

`classDiagram` and `erDiagram` have no mapping listed upstream. Say so rather
than forcing them into a type that does not fit.

# Minimal typed IR

Read this when writing or repairing an Archify document. Every JSON example below
was validated at the pinned revision with
`node bin/archify.mjs validate <type> <file> --quality showcase --json` and passed
all 9 artifact checks with 0 composition errors and 0 warnings. They are minimal
but real; replace the facts, keep the shapes.

Field names and enums come from upstream `schemas/*.schema.json` and
`schemas/README.md`. Unknown fields are rejected (`additionalProperties: false` at
every level), so do not invent keys.

## Shared rules

Every document requires `schema_version`, `diagram_type`, `meta` (with `title`),
and its structural arrays. ID pattern: `^[a-zA-Z][a-zA-Z0-9_-]*$`.

Shared enums (`common.schema.json`):

- `componentType`: `frontend`, `backend`, `database`, `cloud`, `security`,
  `messagebus`, `external`
- `variant`: `default`, `emphasis`, `security`, `dashed` (sequence messages add
  `return`)
- `side`: `left`, `right`, `top`, `bottom`
- `visualPreset`: `classic`, `signal-flow`, `blueprint`, `editorial`
- `qualityProfile`: `standard`, `showcase`

Optional `meta` keys accepted by every type: `locale` (`en` | `zh-CN`),
`subtitle`, `output`, `animation` (`trace` | `none`), `visual_preset`,
`quality_profile`, `views` (max 5), `legend`, `viewBox`.

Required structural arrays per type:

| Type | `schema_version` | Required arrays | Optional arrays |
| --- | --- | --- | --- |
| `architecture` | `1` | `components` | `boundaries`, `connections`, `cards`, `layout` |
| `workflow` | `1` or `2` | `lanes`, `nodes`, `edges` | `phases`, `groups`, `mainPath`, `semanticChecks`, `cards` |
| `sequence` | `1` | `participants` (min 2), `messages` (min 1) | `segments`, `activations`, `cards` |
| `dataflow` | `1` | `stages` (2–5), `nodes` (min 2), `flows` | `cards` |
| `lifecycle` | `1` | `lanes` (1–4), `states` (min 2), `transitions` | `cards` |

Use `schema_version: 2` for new workflows; it opts into the readable compiler.
Keep `1` only to preserve an existing document's fixed geometry. Do not change
only `schema_version` when absolute coordinates exist — migrate properly:

```bash
node bin/archify.mjs migrate workflow old.json new.json --to-schema 2 --json
```

## architecture

Left-to-right spine with short vertical branches. Prefer 6–12 primary components.
Components may use free `pos`/`size`, or `row`/`col` (a `layout` grid is
preferred when it fits). Boundaries group real ownership, trust, or deployment
regions; they do not replace relationships.

```json
{
  "schema_version": 1,
  "diagram_type": "architecture",
  "meta": { "title": "Minimal Request Path", "quality_profile": "showcase" },
  "components": [
    { "id": "client", "type": "external", "label": "Client", "pos": [40, 160], "size": [120, 60] },
    { "id": "api", "type": "backend", "label": "API", "pos": [240, 160], "size": [120, 60] },
    { "id": "db", "type": "database", "label": "Database", "pos": [440, 160], "size": [120, 60] }
  ],
  "connections": [
    { "id": "client-api", "from": "client", "to": "api", "label": "HTTPS" },
    { "id": "api-db", "from": "api", "to": "db", "label": "SQL" }
  ]
}
```

## workflow

Lanes express responsibility or phase. `col` is `0..5` and expresses logical
progression. Keep the happy path monotonic; route retries and exception returns
outside the main corridor. `mainPath` lists the ordered happy-path node IDs.

```json
{
  "schema_version": 2,
  "diagram_type": "workflow",
  "meta": { "title": "Minimal Approval Flow", "quality_profile": "showcase" },
  "lanes": [ { "id": "requester", "label": "Requester" }, { "id": "system", "label": "System" } ],
  "nodes": [
    { "id": "submit", "lane": "requester", "col": 0, "type": "external", "label": "Submit" },
    { "id": "check", "lane": "system", "col": 1, "type": "backend", "label": "Validate" },
    { "id": "approve", "lane": "requester", "col": 2, "type": "security", "label": "Approve" },
    { "id": "apply", "lane": "system", "col": 3, "type": "backend", "label": "Apply" }
  ],
  "edges": [
    { "from": "submit", "to": "check" },
    { "from": "check", "to": "approve", "label": "valid" },
    { "from": "approve", "to": "apply", "label": "approved" }
  ]
}
```

## sequence

Participants are ordered by conversation role. Each message owns its vertical
order via `y` (minimum 160) and must name `from`, `to`, and `label`. Use
`return`, `emphasis`, `security`, and `dashed` for meaning, not decoration.
Sequence does not use automatic port spread. `meta.column_fit` defaults to
`fixed`; use `spread` when a wide viewBox would otherwise leave unused space or
labels do not fit the fixed boxes.

```json
{
  "schema_version": 1,
  "diagram_type": "sequence",
  "meta": { "title": "Minimal Request Sequence", "quality_profile": "showcase" },
  "participants": [
    { "id": "client", "type": "external", "label": "Client" },
    { "id": "api", "type": "backend", "label": "API" },
    { "id": "db", "type": "database", "label": "Database" }
  ],
  "messages": [
    { "from": "client", "to": "api", "y": 160, "label": "GET /items", "variant": "emphasis" },
    { "from": "api", "to": "db", "y": 200, "label": "SELECT items" },
    { "from": "db", "to": "api", "y": 240, "label": "rows", "variant": "return" },
    { "from": "api", "to": "client", "y": 280, "label": "200 JSON", "variant": "return" }
  ]
}
```

## dataflow

Stages express transformation or custody; `row` separates parallel streams.
Label data contracts, classifications, or non-obvious cross-boundary movement.
Use `classification` for a data classification, not for a restated label.

```json
{
  "schema_version": 1,
  "diagram_type": "dataflow",
  "meta": { "title": "Minimal Event Pipeline", "quality_profile": "showcase" },
  "stages": [ { "label": "Source" }, { "label": "Process" }, { "label": "Store" } ],
  "nodes": [
    { "id": "app", "type": "frontend", "label": "App", "stage": 0, "row": 0 },
    { "id": "stream", "type": "messagebus", "label": "Stream", "stage": 1, "row": 0 },
    { "id": "warehouse", "type": "database", "label": "Warehouse", "stage": 2, "row": 0 }
  ],
  "flows": [
    { "from": "app", "to": "stream", "label": "events" },
    { "from": "stream", "to": "warehouse", "label": "load" }
  ]
}
```

## lifecycle

Main phases use `col` `0..4` on the main rail; event and terminal states use
`col` `0..2`, and event/terminal column `N` aligns beneath main column `N + 2`.
Main-rail states are chained automatically by column order, so `transitions`
carry the off-rail edges. A recoverable failure must have a real transition back
to an active state; a card or guided view saying "retry" is not topology.

```json
{
  "schema_version": 1,
  "diagram_type": "lifecycle",
  "meta": { "title": "Minimal Job Lifecycle", "quality_profile": "showcase" },
  "lanes": [
    { "id": "main", "label": "Job phases" },
    { "id": "exceptions", "label": "Recovery" }
  ],
  "states": [
    { "id": "queued", "type": "start", "label": "Queued", "lane": "main", "col": 0 },
    { "id": "planning", "type": "active", "label": "Planning", "lane": "main", "col": 1 },
    { "id": "running", "type": "active", "label": "Running", "lane": "main", "col": 2 },
    { "id": "done", "type": "success", "label": "Done", "lane": "main", "col": 4 },
    { "id": "failed", "type": "failure", "label": "Failed", "lane": "exceptions", "col": 0, "yOffset": 78 }
  ],
  "transitions": [
    { "from": "running", "to": "failed", "variant": "security", "fromSide": "left", "toSide": "left", "via": [[320, 157], [320, 385]] },
    { "from": "failed", "to": "running", "variant": "emphasis", "fromSide": "left", "toSide": "top", "via": [[20, 385], [20, 80], [402, 80]] }
  ]
}
```

Note: `meta.viewBox` has per-type minimums — architecture `[320, 240]`,
workflow `[700, 240]`, sequence `[480, 480]`, dataflow `[360, 360]`,
lifecycle `[420, 566]`. Omit it to let the renderer derive one, except when the
composition needs an authored height.

## Repair order

When `validate` reports problems, fix them in this order and re-run after each
edit. Apply at most one diagnosed geometry control per repair.

1. Missing or invalid `meta.quality_profile` and schema errors.
2. Node overlap or out-of-range placement.
3. Edge-through-node and endpoint-direction errors.
4. Crossings, ambiguous corridors, border runs, and route rhythm.
5. Label-to-node, label-to-label, then label-to-route clearance.

Consume `diagnostics[]` by stable `code`, exact `subject`, measured `evidence`,
and `supportedFixes`. If a diagnostic provides `labelAt`, use that point instead
of estimating another offset.

## Geometry invariants worth knowing

- A side is a direction contract: the first and final route segment must leave or
  enter perpendicular to the named side.
- Showcase route rhythm: every nonzero segment is at least 8px, every interior
  segment at least 16px.
- Spacing means clear gap, not center distance. A relationship label needs
  `clear gap > label mask width + 8px`; mask width is roughly
  `6.5px × ASCII units + 13px`, and CJK characters count as two units.
- An edge crossing an unrelated opaque node is a hard failure in every profile.
- Relationship labels are semantic data. Move the label, adjust the route or
  spacing, then shorten the wording — never delete a meaningful label as a repair.

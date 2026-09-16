# CLI and validation

Read this when running Archify commands or reporting a result. Source: upstream
`archify/SKILL.md`, `references/delivery-contract.md`, `schemas/README.md`, and
`bin/archify.mjs --help` at the pinned revision.

## Commands

Run these from the installed skill directory (the one containing `bin/archify.mjs`).

```bash
archify render <type> <input.json> [output.html] [--quality standard|showcase] [--repo-root path (architecture only)]
archify validate <type> <input.json> [--json] [--layout-json] [--quality standard|showcase] [--repo-root path]
archify deliver <type> <input.json> [output.html] [--json] [--open] [--quality standard|showcase] [--repo-root path]
archify preview <type> <input.json> [output.html] [--no-open] [--quality standard|showcase]
archify compare architecture <base.json> <head.json> [output.html] [--receipt path] [--json]
archify inspect <type> <input.json>          # architecture only
archify check <output.html>
archify visual-check <output.html> [--json]
archify guide [scenario or question] [--json] [--lang en|zh]
archify brands [name, alias, domain, or category] [--json]
archify brands capture <url> [--json]
archify migrate workflow <old.json> <new.json> --to-schema 2 [--json]
archify examples
archify doctor
archify demo [output-directory]
```

Types: `architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`.

## The authoring loop

1. **Choose the type** and read one matching schema plus one example upstream.
2. **Write the candidate first.** The next action after choosing should write a
   JSON file. Do not plan exact coordinates in prose.
3. **Validate after every edit**, and immediately before handoff:

   ```bash
   node bin/archify.mjs validate <type> candidate.json --quality showcase --json
   ```

4. **Deliver once** for final acceptance:

   ```bash
   node bin/archify.mjs deliver <type> candidate.json output.html --quality showcase --json
   ```

5. **Optionally collect browser evidence** from the exact delivered file:

   ```bash
   node bin/archify.mjs visual-check output.html --json
   ```

Never start `preview` by default; it is an explicit desktop authoring loop, not a
CI or unattended step.

## What the receipt means

A `validate --json` result carries `schemaVersion`, `ok`, `command`, `type`,
`input`, `checks[]`, and `composition`. A showcase pass reports all **9** artifact
checks with `composition.summary.errors === 0` and `warnings === 0`. The nine
checks are `single_svg`, `finite_svg`, `orthogonal_arrows`,
`label_route_clearance`, `relationship_crossings`, `relationship_corridors`,
`container_border_runs`, `route_rhythm`, and `legend_clearance`.

A receipt with only 4 artifact checks is basic validation, never showcase
acceptance. If the candidate omits or misspells `meta.quality_profile`, fix that
before touching geometry.

`deliver` freezes the exact specification bytes into a private same-directory
snapshot, renders and checks that snapshot, and only then atomically commits the
HTML. Its JSON receipt includes SHA-256 and byte counts for both `specification`
and `artifact`. Renderer, checker, receipt, or commit failure exits non-zero,
removes private state, and preserves the previous trusted artifact.

## Handling failures

- A non-zero exit can never be described as success.
- On failure, `validate --json` and `deliver --json` emit `diagnostics[]`. Each
  entry has a stable `code`, a `subject`, measured `evidence`, and
  `supportedFixes`. Change only the diagnosed `subject`, then rerun.
- Keep correcting while the error count reaches a new minimum. If two consecutive
  rounds do not improve the best count, stop and report the unresolved diagnostics
  truthfully.
- A failed delivery preserves the previous output. Do **not** run `visual-check`
  on that path — it would inspect the stale last-good artifact, not the rejected
  candidate.

## Three separate claims

Keep these distinct in every report. Passing one never implies another.

| Command | Proves |
| --- | --- |
| `deliver` | Deterministic artifact checks and byte identity |
| `visual-check` | Bounded behavior in a real browser (Chrome/Chromium via DevTools pipe) |
| Human or image-capable review | Perceptual polish |

`visual-check` measures light-theme containment at 1440×900, 1600×1000,
1920×1080, and 2048×1320, captures light/dark screenshots at the two endpoints,
and always reports `visualReview: "pending"`. Its exit codes map to
`browser_evidence`: `0` → `passed`, `1` → `failed`, `2` → `skipped` (no
Chrome/Chromium). Runtime or capture failures are incomplete evidence and must not
be normalized to `skipped`.

Report exactly one truthful visual status: `passed` only after inspecting the
rendered artifact; `skipped (image reader unavailable)` when no capable visual
surface exists; `failed` with the concrete visible defect. Never claim a visual
inspection you did not perform.

## Handoff format

```text
diagram_type: architecture|workflow|sequence|dataflow|lifecycle
output: /absolute/path/to/file.html
specification_sha256: <receipt value>
artifact_sha256: <receipt value>
validation: 9/9 showcase, 0 errors, 0 warnings
browser_evidence: passed|failed|skipped
visual_review: passed|skipped (image reader unavailable)|failed
correction_rounds: 0|1|2
```

`correction_rounds` must not exceed 2. If visual review changes the candidate,
validation and delivery must run again, because the prior frozen specification
receipt is no longer current.

## Offline and no-shell fallback

When the renderer cannot run, upstream documents a hand-placed fallback: start
from the upstream `assets/template.html`, keep semantic CSS classes rather than
inline colors, preserve the inline SVG and accessibility structure, and run the
delivery visual checklist. That template is **not** vendored in this repository,
so this fallback requires the upstream package. Report it as an unverified
fallback, not as a validated Archify result.

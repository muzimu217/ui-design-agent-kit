# Data-Dense Surfaces

Construction-side standards for tables, ledgers, and consoles — the
operational surface type where the user's task is scanning many rows and
acting on a few. This band is deliberately uncovered by external taste
references ("not dashboards, not data tables"); these rules come from
ui-ux-pro-max plus this kit's own delivered operations tools. Detection and
triage stay in [detail-critique.md](detail-critique.md).

Precedence: the governing design contract wins; recorded
[user-taste-profile.md](user-taste-profile.md) entries may override for their
scope. Absent an override, the rules below hold.

## Table mechanics

1. **Row height is compact by intent**: 32–40px rows (comfortable) so a
   screen shows tens of records, not a landing page of five.
   Counter-example: 56px padded rows with hidden whitespace doing nothing.
2. **Headers stick** (`position: sticky` within the scroll container): the
   column meaning survives any scroll. Counter-example: scrolling a ledger
   into numbers with no headers in sight.
3. **Numbers right-align with tabular-nums** (detail-constants); columns get
   fixed or content-informed widths so rows don't reflow as values update.
   Counter-example: a "total" column whose digits shift left/right as data
   refreshes.
4. **Row separation picks one system and commits**: zebra stripes or hover
   highlight — not both fighting, not neither at density. Counter-example:
   striped rows that also highlight, doubling into a grid illusion.

## States and density

5. **Row status uses three channels**: color + shape/icon + text (per
   detail-constants rule 9) — a red dot alone is not a status. Health,
   warnings, and stale data each carry a named label. Counter-example:
   green/yellow/red dots the user must decode from memory.
6. **Two density modes, one switch**: comfortable/compact toggling changes
   spacing, never font size. Counter-example: "compact" mode shrinking text
   below legibility instead of trimming padding.
7. **Empty and loading follow the interface contracts**: an empty table
   offers the first-record action (copy-contract.md); loading uses skeleton
   rows matching the real column layout, not a centered spinner.
   Counter-example: "暂无数据" plus a circular loader covering the headers.

## Toolbars and bulk actions

8. **Toolbars stay quiet and scannable**: filter/search/action bars are
   flat, token-colored, and label-first — no glassmorphism, no decorative
   gradients; operational surfaces don't perform brand mood. Counter-
   example: a frosted-glass filter bar over the table it filters.
9. **Bulk actions keep their ledger honest**: selection state is visible per
   row and in the header count, select-all states are tri-state
   (none/some/all), and after a bulk operation the result is reported per
   record (succeeded/failed counts), not a single silent "done".
   Counter-example: "已处理" with no way to see which rows failed.

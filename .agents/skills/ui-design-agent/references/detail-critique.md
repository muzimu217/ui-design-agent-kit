# Detail Critique

Detail-level self-critique for UI work. The unit of critique is the component
or interaction detail, not the page: one control's state coverage, one measured
contrast pair, one stagger timing, one label's reflow under long content. The
confirmation gates in the chain flow let the user judge direction; this pass is
where the agent judges its own craft before anyone else sees it. Defects you
could have found yourself must not wait for the user, a requested impeccable
run, or the final verification phase.

## When it runs

- Before presenting any gate artifact: direction draft, prototype image or
  generation prompt, design contract, and every acceptance-round issue list.
- During implementation, per component before moving to the next.
- During verification, as the finding generator behind the acceptance checks.

Scale the pass to the artifact: critique a draft as a draft (structure,
hierarchy, tone, motion intent), not against implementation-only dimensions.
State a skipped dimension as skipped; it is not silently passed.

## Dimensions

Evaluate each detail against the dimensions it touches. The governing contract
supplies the threshold; never invent one here.

| Dimension | Check |
| --- | --- |
| Layout and spacing | 4px/8px rhythm unless the system says otherwise; alignment to real grid tracks; no unintended overlap, clipping, or body-level horizontal scroll |
| Typography | Token scale adherence; legible in its container; long names, multiline errors, and larger text reflow without overlap |
| Color and contrast | Semantic tokens, not one accent hue everywhere; contrast measured when colors are chosen or changed |
| State coverage | Per interactive element, the states its workflow needs: default, hover/press, focus-visible, disabled, selected, loading, error, empty |
| Motion conformance | Preset chosen by role; hover onset within 150ms; stagger 0.04-0.08s on bounded groups; interruption keeps semantic state; reduced-motion result defined |
| Affordance and semantics | Links navigate, buttons act; labels and accessible names present; icon-only controls named; a keyboard path exists |
| Robustness | Long content, empty data, no network, zoom or text scaling, touch parity for hover-only feedback |
| Consistency | The same problem is solved the same way as the established system; deviations are named decisions, not drift |

A finding without an evidence anchor — screenshot, measured value, code
location, or contract rule — is a suspicion. Label it as one or verify it.

## Severity triage

| Level | Meaning | Handling |
| --- | --- | --- |
| P0 blocking | Breaks the primary task, loses input, blocks an essential keyboard or assistive path, corrupts layout, or fails a contractual accessibility target | Fix before presenting the artifact as done; an unfixed P0 blocks any completion claim |
| P1 should-fix | A real quality defect a user would notice: a missing state, measured contrast below target, motion off-preset, accidental token drift | Fix in the current round when feasible; otherwise a named leftover with a reason |
| P2 polish | Discretionary improvement with no functional or contractual failure | Never blocks; needs user selection or an explicit leftover note |

Severity follows the defect's effect, not the cost of fixing it or attachment
to the current treatment. A measured accessibility failure is never polish; a
taste preference is never P1.

## The pass

1. Evaluate: walk the artifact detail by detail against the dimensions. For
   implemented UI use rendered evidence; reading the source is not a rendered
   check.
2. Triage: assign each finding a severity and its evidence anchor.
3. Repair what you caught: fix self-fixable P0 and P1 findings before
   presenting, then re-check each fix once with evidence. A fix asserted
   without a re-check is not fixed.
4. Present leftovers: show remaining findings with severity and reason
   alongside the artifact. The user sees known issues, not a clean facade, and
   their gate decision is made on the real state.
5. Record: findings persist in the acceptance record across rounds. An issue
   leaves the record by being fixed and re-checked or declined by the user,
   not by repetition fatigue.

## Record format

```text
Detail: submit button, disabled state, 375px viewport
Dimension: state coverage
Severity: P1
Evidence: screenshot path / measured 3.1:1 on secondary label / file:line / contract rule
Status: fixed (re-check evidence) | open (reason) | declined by user
```

The record feeds acceptance-round lists and the handoff record in
acceptance.md. It is not a scorecard: no invented numeric grade, percentage,
or letter rank. Judgments use the contract's terms; measurements come from
real tools.

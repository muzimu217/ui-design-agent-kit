# UI Acceptance

Scale verification to the affected workflow. Do not add unrelated views, states,
or infrastructure to make a checklist longer. A test that was not run is unverified.

## Functional evidence

Exercise the primary journey from entry to completion and back. For changed
controls, check relevant pending, empty, error, success, disabled, and selected
states. Verify actual effects, persistence claims, cancellation, and recovery.
Use fixtures deliberately; do not silently pretend a mock endpoint is live.

Run the repository's relevant automated tests, typecheck, and production build.
Record failures accurately. A passing build is not evidence of working navigation,
correct assets, accessibility, or visual quality.

## Rendered evidence

Inspect the actual page, not only its source or accessibility tree. Use at least
a phone and desktop viewport for a responsive change. A useful initial matrix is
375 x 812, 768 x 1024, and 1440 x 900, adapted to the product's real target devices.
Include a narrower supported width and long-content cases when layout is at risk.

Check:

- No incoherent overlaps, clipped labels, accidental body-level horizontal scroll,
  hidden primary actions, blank areas, or broken images. Intentional table scrollers
  are acceptable when operable and do not hide essential row actions.
- Long names, identifiers, translated labels, multiline errors, larger text, and
  zoom do not break the task. Test actual browser zoom or text scaling when claiming
  zoom support; merely changing viewport width is not equivalent evidence.
- Real assets and fonts load and have fallback behavior. The subject remains
  inspectable. Screenshots cover overlay/menu states when their layering changed.
- Loading, content, and hover states do not resize fixed-format tools or counters
  unexpectedly. Sticky/fixed regions do not cover focused elements or dialogs.
- Both themes are checked if both are supported and affected. Do not add dark mode
  solely to satisfy this item.

For animation work, inspect normal motion and emulated `prefers-reduced-motion`,
then rapidly repeat or reverse the action. Check the final semantic state and
focus. For 3D/canvas, use screenshots and pixel checks across target viewports;
verify framing, real movement, interaction, and successful asset loading.

For image-to-code work, capture the implementation at the same viewport and
state as the supplied source. Compare named regions such as navigation, hero,
media, controls, typography, and footer. Record whether each observation is
measured, supplied, observed, or inferred. Run one bounded repair pass based on
the highest-impact differences, then capture a confirmation render. Do not
claim pixel parity or a percentage without a defined metric and comparison
artifact.

## Accessibility and quality

Use the keyboard for the primary task. Inspect focus visibility, tab order,
dialog focus containment and return, labels, error associations, and accessible
names of icon buttons. Ensure essential meaning is not color-only or hover-only.
Use native semantics first and the applicable WAI-ARIA Authoring Practices for
custom widgets; ARIA attributes alone do not implement keyboard behavior. Run
available automated accessibility checks and report their actual coverage.
Measure contrast when colors change and use the applicable current standard.
Automated accessibility tools complement, but do not replace, these checks.

Review the visual result against its design contract: task clarity, hierarchy,
useful density, coherent typography and color, domain fit, and motion restraint.
Triage every finding as P0, P1, or P2 per detail-critique.md before reporting
it; an unfixed P0 blocks implementation acceptance, not completion of a read-only
review. In a review, report the blocker without repairing it. Do not mark an arbitrary
aesthetic score as an objective pass. Any claimed visual
parity must be based on the actual supplied reference and rendered implementation.

## Handoff record

Use the target project's existing reporting convention. A concise record can be:

```text
Target: route/component and tested revision
Implemented: primary flow and affected states
Automated: command -> result
Browser: viewport -> actions exercised -> observed result
Motion: normal / reduced / interrupted -> observed result
Evidence: screenshot or trace paths, if saved
Unverified: exact gap and reason
Try it: actual dev-server URL or artifact path
```

Keep two loops distinct. The self-driven craft loop is bounded: one batched
inspection, one authorized evidence-driven repair batch, then confirm the repairs; stop
self-initiated aesthetic iteration there unless a new user requirement or
concrete defect justifies more work. The user-driven acceptance loop is not
bounded: each round presents the severity-triaged issue list per
detail-critique.md, the user selects items, one repair pass runs, and
re-verification follows until the user confirms. In both loops, do not stop on
an unresolved correctness defect while calling the task complete; report the
defect if it cannot be fixed.

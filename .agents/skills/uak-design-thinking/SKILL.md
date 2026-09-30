---
name: uak-design-thinking
description: >-
  Design-thinking doctrine for this kit: the animation decision framework
  (frequency, purpose, easing, duration), component micro-interaction
  rules (press feedback, origin-aware popovers, interruptible transitions),
  a reverse-lookup motion glossary ("the bouncy thing when a popover opens"
  means Pop in), and a curated library-picks table (toasts, charts, drag and
  drop, virtualization, state, styling). Use for design-engineering polish
  judgment calls, naming a motion effect the user can only describe, or
  picking a library for a concrete component task.
license: MIT
metadata:
  source: "Adapted and re-authored for this kit from emilkowalski/skills (MIT), revision d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7, merging the upstream emil-design-eng, animation-vocabulary, and pick-ui-library skills. Personal branding, course promotion, and vendor anecdotes removed; decision frameworks, glossary entries, tables, and code recipes preserved."
---

# Design Thinking（打磨判断 · 动效词汇 · 库选型）

One skill, three narrow jobs. Route by the question being asked, read only
the part you need, and record which part informed the decision in the
acceptance notes:

| Question | Read | Not for |
| --- | --- | --- |
| Should this animate, how fast, which easing? Component detail calls | Part A below | Replacing a requested critique; broad redesign |
| "What is this effect called?" (user describes a motion vaguely) | [references/motion-glossary.md](references/motion-glossary.md) | Designing or building an effect |
| "Which library for X?" (toasts, charts, drag and drop, …) | [references/library-picks.md](references/library-picks.md) | Replacing an already-working installed dependency |

This skill serves the polish layer of the gate chain: it informs gate C/D
artifacts (prototype and contract decisions) and the detail-critique inner
loop. It never replaces a user gate: frequency/duration/easing values still
go into DESIGN.md and the motion contract for the user to confirm.

## Part A · Polish decision framework

### A1. Should this animate at all?

Ask how often users will see it:

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |
| Tens of times/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, celebrations) | May add delight |

Never animate keyboard-initiated actions; repetition makes any delay feel
like lag.

### A2. What is the purpose?

Every animation needs a one-line answer to "why does this animate": spatial
consistency (enter/exit from the same direction), state indication,
explanation, feedback (press scale-down), or preventing jarring changes.
"It looks cool" fails when frequency is high.

### A3. Which easing?

- Entering or exiting → ease-out (starts fast, feels responsive).
- Moving/morphing on screen → ease-in-out.
- Hover/color change → ease.
- Constant motion (marquee, progress) → linear.
- Default → ease-out.

Never ease-in for UI entrances: it delays the movement the user is watching.
Use custom curves; built-in keywords are too weak:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

### A4. How fast?

| Element | Duration |
| --- | --- |
| Button press feedback | 100-160ms |
| Tooltips, small popovers | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modals, drawers | 200-500ms |
| Marketing/explanatory | May be longer |

Keep UI animation under 300ms. Perceived speed is real speed: a
fast-spinning spinner reads as faster loading; instant sibling tooltips
after the first one make a whole toolbar feel faster. Make exits faster than
entrances, and presses deliberate only when the action itself is deliberate
(hold-to-confirm), with release always snappy.

### A5. Springs

Use springs for drag with momentum, interruptible gestures, and elements
that should feel alive. Recommended parameterization:
`{ type: "spring", duration: 0.5, bounce: 0.2 }` (bounce 0.1-0.3, mostly
avoid bounce outside playful/drag contexts). Springs carry velocity through
interruption — CSS animations restart from zero — which is why
rapidly-retargeted UI uses transitions or springs, never keyframes.

### A6. Component rules

- Press feedback: `transform: scale(0.97)` on `:active` (range 0.95-0.98)
  with a ~160ms ease-out transition on transform.
- Never enter from `scale(0)`; start at `scale(0.95)` or higher combined
  with `opacity: 0`.
- Origin-aware popovers: scale from the trigger
  (`transform-origin: var(--transform-origin)`); modals are the exception
  and stay centered.
- Tooltips delay on first hover, then open instantly (zero-duration
  transition) while moving between siblings.
- CSS transitions over keyframes for anything rapidly triggered
  (toasts, state toggles): transitions retarget mid-flight.
- `@starting-style` animates entry without JavaScript where supported;
  fall back to a mounted-attribute pattern.
- A subtle `filter: blur(2px)` during crossfades blends two overlapping
  states into one perceived morph; keep blur under 20px (expensive in
  Safari).
- Stagger list entrances 30-80ms per item, never block interaction on the
  stagger, and keep it decorative.
- `clip-path: inset(...)` drives reveals, tab color wipes, hold-to-delete,
  image reveals, and comparison sliders with a single hardware-accelerated
  property.
- Gestures: dismiss on velocity (|distance|/time > ~0.11) not just
  threshold; damp past boundaries instead of hard stops; capture the
  pointer on drag start; ignore extra touch points mid-drag.

### A7. Performance and accessibility

- Animate only `transform` and `opacity`; layout properties cause jank.
- Avoid per-frame CSS variable writes on a shared parent (style recalc on
  all children); write `transform` on the element.
- Library shorthand (`x`, `y`, `scale` props) runs on the main thread; the
  full `transform` string stays hardware-accelerated. Under load, CSS
  animations (off-main-thread) beat JS-driven ones; use WAAPI for
  programmatic control.
- `prefers-reduced-motion` means fewer/gentler, not zero: keep opacity and
  color comprehension cues, remove movement.
- Gate hover animation behind `@media (hover: hover) and (pointer: fine)`
  so touch devices do not get stuck hover states.

### A8. Review checklist

| Issue | Fix |
| --- | --- |
| `transition: all` | Specify exact properties |
| `scale(0)` entry | `scale(0.95)` + `opacity: 0` |
| `ease-in` on UI element | ease-out or custom curve |
| `transform-origin: center` on popover | Trigger origin (modals exempt) |
| Animation on keyboard action | Remove entirely |
| Duration > 300ms on UI element | Reduce to 150-250ms |
| Hover animation without media query | Add hover+pointer gate |
| Keyframes on rapidly-triggered element | CSS transitions |
| Same enter/exit speed | Exit faster than enter |
| Elements appear at once | Stagger 30-80ms |

Review output uses a single markdown table with Before / After / Why
columns, one row per issue.

### A9. Cohesion

Match motion personality to the product: playful surfaces may bounce, dense
operational dashboards stay crisp and fast. Easing, duration, naming, and
visual design should read as one voice — this kit anchors that voice in
`motion-contract.md` presets and the user taste profile; when this part and
the contract disagree, the contract and the user's confirmed taste win.

---
name: jiejoe-design
description: >-
  JIEJOE-style interaction-motion design: magnetic pointer and repulsion
  feedback, SVG stroke and wave effects, ScrollTrigger scroll-driven motion,
  and personality-loaded loading and transition screens. Use when the user
  wants distinctive web motion, cursor-magnetic interactions, scroll
  choreography, or branded loading/transition effects. GSAP-first, with
  physical intuition (elasticity, damping, easing) over decorative loops.
license: MIT
metadata:
  source: "Design philosophy distilled from JIEJOE-WEB-Tutorial (https://github.com/JIEJOE-WEB-Tutorial), MIT-licensed tutorial repositories; patterns are re-authored for this kit, not copied code."
---

# JIEJOE Design（蒸馏）

Interaction-motion design distilled from JIEJOE's web tutorial work:
magnetic pointer physics, SVG stroke and wave effects, scroll-driven
choreography, and personality-loaded loading and transition screens. Use it
together with the installed GSAP skills (`gsap-core`, `gsap-timeline`,
`gsap-scrolltrigger`, `gsap-plugins`) and `motion-contract.md` for presets.

## Motion pattern library

### Magnetic interactions
- Magnetic cursor: on hover, the pointer box-selects and sticks to a control
  within its range; moving inside the control keeps the cursor locked to it.
- Magnetic repulsion: elements around the pointer repel or orbit it, bounded
  to a constrained travel range (for example a grid of dots tethered by a line).
- Keyboard and touch equivalence: a magnetic hover effect is decorative for
  pointer users only; keyboard and touch users still get visible focus and
  active states.

### SVG effects
- Stroke animation: draw a path or button outline with `stroke-dasharray` /
  `stroke-dashoffset` over a short, stated duration.
- Wave and interference: pointer-driven displacement of vertical SVG paths,
  with elasticity, damping, and easing so lines feel physical, not scripted.

### Scroll-driven motion (ScrollTrigger)
- Horizontal scroll: `position: sticky` plus ScrollTrigger converts vertical
  scroll into pinned horizontal progression; this is more stable than
  transform-only approaches and adapts to responsive sizes.
- Slide-follow and infinite scrolling variants; keep keyboard access and
  reduced-motion static final states.

### Loading and transitions
- Loading animations with personality: snake, slash-sweep, or window-blinds
  reveals; they replace a spinner without delaying content.
- Page-jump transition: a continuous transition between views (for example
  refresh-free SPA navigation) rather than a disconnected reload animation.

## Technical rules

- GSAP first: use `gsap-timeline` and `gsap-scrolltrigger` for sequencing and
  scroll choreography. CSS `transition` is acceptable only for simple feedback;
  note when GSAP would give better performance and control.
- Physical parameters: state elasticity, damping, and easing explicitly for
  any simulated-physics effect; do not claim physics without named parameters.
- Reference-first: find a proven CodePen or live-site effect, simplify it, and
  land the adaptation with the target stack; record the source and adaptation
  boundary instead of copying restricted code.
- Performance: animate `transform` and `opacity`; never animate layout
  properties; keep interruptions and rapid reversals correct; reduced-motion
  renders the complete static final state.

## Style principles

- Physical intuition: interactions feel magnetic, inertial, or elastic — real
  feedback, not decoration.
- Surprise and guidance: entry motion (loading, transition) has personality but
  never hides or delays the content.
- Restraint: motion serves the interaction intent; one memorable effect beats a
  stack of loops.
- Consistency: honor `motion-contract.md` — feedback within 150ms, no
  `transition: all`, `prefers-reduced-motion` as a static snapshot.

## Self-check

- Is this effect "physical intuition" or a "decorative loop"?
- Does the pointer-driven effect have a keyboard or touch equivalent?
- Under reduced motion, is the page still a complete static snapshot?
- Is a mature reference named, and its adaptation and license boundary recorded?

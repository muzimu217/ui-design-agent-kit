# Detail Constants

Numeric standards for detail-level critique: what good values look like when a
dimension in [detail-critique.md](detail-critique.md) needs more than "check
it". Each rule = the constant + the failure it prevents. Sources: community-
verified practice (make-interfaces-feel-better 19 rules, read in full during
the 2026-09 master armament) plus this kit's motion contract. Where the
governing design contract states different values, the contract wins.

## Surfaces and structure

1. **Concentric radii**: outer radius = inner radius + padding. Nested radii
   that don't nest are the most common "something is off but I can't say why".
2. **Optical over geometric alignment**: icon+label buttons and play triangles
   get hand-tuned until they look centered; pure math centering reads off.
3. **Shadows manage depth, borders manage structure**: a border that exists
   only for depth becomes layered translucent box-shadow; keep borders for
   dividers, selected and focus states. Counter-example: a 1px gray ring plus
   a shadow on the same card reads as mud.

## Motion

4. **CSS `transition` for interactive state changes** (interruptible);
   `keyframes` only for one-shot sequences. Counter-example: an exit animation
   on `animation` cannot be interrupted mid-flight.
5. **Low-frequency entrances stagger ~100ms per batch**; high-frequency
   interactions never stagger. Counter-example: hover items cascading.
6. **Exits are softer than entrances**: small `translateY` + ease-out, shorter
   distance. Counter-example: elements flying out harder than they came in.
7. **Icon swap animation**: opacity 0→1, scale 0.25→1, blur 4px→0;
   motion/react `{ type: "spring", duration: 0.3, bounce: 0 }` — bounce is
   always 0 for icon swaps. Counter-example: icons boinging on toggle.
8. **First load gets no entrance animations** (`AnimatePresence
   initial={false}`); animate responses, not the initial paint.
9. **High-frequency interactions get no custom animation**; motion is never
   the only feedback channel — pair it with a static cue (color, shape, copy).
10. **No `transition: all`**: declare properties individually.
    Counter-example: `all` animates layout properties you never intended.
11. **`will-change` only for transform/opacity/filter**, and only once first-
    frame jank is measured. Counter-example: sprinkled on every card.

## Typography and numerals

12. **`-webkit-font-smoothing: antialiased` on the root** (macOS). Light-on-
    dark text renders too bold without it.
13. **Dynamic numbers use `font-variant-numeric: tabular-nums`** — counters,
    timers, prices. Proportional digits jitter while counting.
14. **Headings `text-wrap: balance`; body copy `text-wrap: pretty`**.
    Counter-example: a two-word orphan on the last heading line.

## Color and icons

15. **Image strokes are pure black/white with alpha**: `oklch(0 0 0 / .1)` on
    light, `oklch(1 0 0 / .1)` on dark. Tinted neutrals read as dirty edges
    against photography.
16. **Icon stroke weight pairs with font weight** (1.5px ↔ 400, 2px ↔ 600);
    one weight per icon set. Counter-example: mixing 1.5px and 2px icons in
    one toolbar.
17. **One SVG, `currentColor` for all states**; `outline` default, `fill`
    active. Counter-example: two files per icon drifting apart.

## Interaction mechanics

18. **Press feedback is `scale(0.96)`**, never below 0.95 (it reads as
    breakage); hit areas ≥44×44 touch / ≥40×40 dense desktop, expandable via
    pseudo-element, never overlapping.

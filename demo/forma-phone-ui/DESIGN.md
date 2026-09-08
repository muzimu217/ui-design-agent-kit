# FORMA One Design Contract

## World

FORMA One is a kiln-shelf commerce surface. The product is a fictional premium smartphone presented as a glazed ceramic object: chalk kiln shelf, cobalt glaze runs, and dark batch-ink labels. The ceramic world is carried into the UI grammar rather than used as decoration: configuration choices are recipes, selected states are fired, and the summary is the shelf label.

## Composition

- First viewport: compact navigation, one clear product promise, inspectable CSS phone render, and an adjacent configuration rail on desktop.
- Mobile: product render first, sticky purchase summary after choices, then highlights and specs.
- Desktop: two-column hero with the phone on a kiln shelf plane and a compact order panel; below it, a horizontal highlights band and an openable spec table.
- No decorative card stack. Framed surfaces are reserved for configuration, highlights, and the spec disclosure.

## Typography

Use a self-contained system stack with a compact sans display voice and readable sans body fallback: `Gill Sans`, `Trebuchet MS`, `Avenir Next`, `Helvetica Neue`, sans-serif. Display labels are uppercase with modest tracking; body remains 16px minimum. Numeric prices use tabular figures.

## Tokens

- `--ink`: #17211f, kiln-ink text.
- `--shelf`: #f3f0e8, chalk shelf background.
- `--clay`: #ded8cc, warm ceramic neutral.
- `--cobalt`: #1557d6, active glaze and primary action.
- `--sapphire`: #0b3185, deep glaze and strong text on light surfaces.
- `--lemon`: #f1ce63, kiln-light accent for stock/status notes.
- `--rust`: #b94d31, restrained warning/heat state.
- Borders are 1px solid `color-mix(in srgb, var(--ink) 16%, transparent)`; elevation uses offset soft shadows with no hard block shadow.
- Radius: 14px for framed surfaces, 8px for controls, 999px only for small status pills.
- Spacing follows a 4/8px rhythm.

## Components & States

- Product render: semantic figure with CSS phone geometry, active glaze swatch, and `aria-label` describing the selected finish.
- Choice controls: native buttons in a radiogroup-like fieldset, each with text and selected indicator.
- Order summary: live region for capacity, finish, and price; add-to-bag switches to a success state with a reversible reset action.
- Specs: native details/summary disclosure, open by default on desktop and closed on mobile.

## Motion

- The interactive layer uses `motion/react` with three named springs: Snappy
  (`stiffness: 400, damping: 30, mass: 0.8`), Playful (`280, 18, 1.2`) and
  Elegant (`100, 20, 1`).
- Finish and capacity controls use `LayoutGroup` + `layoutId` so the selected
  glaze marker travels between choices. The phone uses an Elegant spring for
  finish changes and a restrained hover lift for fine pointers.
- Price and bag states use `AnimatePresence` so the old state exits before the
  new summary enters. Highlights use one-time `whileInView` reveals.
- `public/assets/forma-kiln-loop.mp4` is a local 6-second material loop behind
  the phone. It is paused in reduced-motion mode; the CSS phone remains the
  inspectable fallback.
- The full trigger/state/timing contract lives in `docs/motion-plan.md`.

## Acceptance

The first screen communicates what FORMA One is and exposes the configuration controls without scrolling on desktop. All controls are keyboard reachable with visible focus. Color and capacity changes update the phone render and price. Add-to-bag confirms success and can be reset. At 375, 768, 1024, and 1440px there is no accidental horizontal scroll or clipped primary action.

## Reference Baseline & Adaptation Boundary

Visual research baseline: Impeccable concept-seed direction `clay-ceramics-fracture-glaze-river-shelf` (source ID from the local approved catalog; board/hero URLs were provided as quality-bar references). Adapted system disciplines: chalk shelf ground, cobalt glaze as active state, recipe-card labels, and stage-based reveal. No remote assets or source code were copied; the product rendering and layout are authored for this project.

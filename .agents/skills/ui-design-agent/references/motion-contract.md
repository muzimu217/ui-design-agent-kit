# Web Motion Contract

Apply these defaults to interactive web UI. User intent, an established motion
system, accessibility, and measured constraints take precedence over ornamental
effects. Remotion videos use a frame clock and the separate video-agent contract.

## Canonical presets

Choose a preset by the interaction's role, not randomly per component:

| Preset | Typical role | Stiffness | Damping | Mass |
| --- | --- | ---: | ---: | ---: |
| Snappy / Crisp | Frequent controls, buttons, switches | 400 | 30 | 0.8 |
| Playful / Bouncy | Expressive card expansion, toast, modal | 280 | 18 | 1.2 |
| Elegant / Smooth | Large media, accordion, route continuity | 100 | 20 | 1 |

For an operational toast or critical dialog, prefer Snappy or Elegant if bounce
would distract or impair text readability. Explain any substantial deviation.

In a React Motion project, the token shape is:

```ts
import type { Transition } from 'motion/react';

export const uiSprings = {
  snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
  playful: { type: 'spring', stiffness: 280, damping: 18, mass: 1.2 },
  elegant: { type: 'spring', stiffness: 100, damping: 20, mass: 1 },
} satisfies Record<string, Transition>;
```

This is a token example, not a reason to change an existing import path. New
React Motion work uses `motion/react`; retain `framer-motion` in an existing
project unless migration is requested or justified. Vue needs its documented
Vue-compatible API; do not paste React components into Vue.

## Timing and implementation

- Use springs for stateful translation, scale, and layout continuity. Let the
  preset settle naturally; do not add `duration` to the same physical spring
  and then claim the result is both duration-controlled and physics-controlled.
- The approved non-spring easing is `cubic-bezier(0.16, 1, 0.3, 1)`, useful for
  Elegant reveals and non-spatial properties. Specify only the affected CSS
  properties and choose timing for the distance and role, not one fixed duration
  for the entire interface.
- Prohibit `transition: all`, generic `ease` presets, and linear UI movement.
  Infinite loading rotation is the linear exception. Immediate semantic state
  changes, continuous direct manipulation, and reduced-motion fallbacks are not
  animated transitions and must not be delayed to satisfy a style rule.
- Motion's generated CSS `linear(...)` spring curve is a sampled nonlinear
  spring, not constant-speed CSS `linear`. It is allowed as a physical easing;
  fetch and inspect the generated curve rather than inventing one.
- Use existing GSAP for coordinated timelines when appropriate. Do not claim
  that an easing such as `elastic` reproduces the named physical parameters.
  Verify spring support or use the approved Elegant curve through documented
  APIs. Do not add Motion, GSAP, and Lenis to every project.
- Lenis is optional for expressly intended smooth-scrolling experiences, not
  a prerequisite for quality. Preserve native navigation, anchor/focus behavior,
  scrolling inside dialogs, touch input, and reduced-motion behavior. Clean up
  its frame loop and listeners.

## Micro-choreography

- For an entering list or related element group, stagger children by 0.04-0.08
  seconds; use 0.06 seconds as a starting point. Apply this to a bounded visible
  group. Virtualize or group long lists rather than making every row wait through
  all preceding rows. Do not replay entrance choreography on every keystroke,
  filter change, or routine rerender.
- Coordinate an entrance with a local `blur(4px)` to `blur(0px)` and subtle
  perspective/tilt where the content and surface support it. Do not blur large
  reading surfaces, stack blur over expensive backdrops, or tilt dense tables.
  Remove these effects if they obscure the subject or fail performance checks.
- Hover feedback begins within 150ms, with no artificial delay: typically
  scale 1.01-1.03 and translateY -2px using Snappy. This requirement concerns
  visible response onset, not a guarantee that the spring finishes in 150ms.
- Pressable controls use a subtle spring press near scale 0.98, including an
  equivalent keyboard active state. Do not shrink the hit target, move neighboring
  layout, animate disabled controls, or turn drag handles into click animations.
- Hover-only tilt runs only for an appropriate fine pointer. Keyboard and touch
  users get equivalent state feedback without requiring hover or pointer tracking.

## Spatial and semantic invariants

Name the trigger, initial/final state, animated properties, spring preset,
interruption behavior, and reduced-motion result for a substantial animation.

- Preserve spatial continuity and allow rapid reversals. A repeated toggle,
  cancellation, navigation, or unmount must leave the semantic state correct.
  Never hold input until an animation ends.
- Keep hit areas, grid tracks, toolbar dimensions, counters, and reserved image
  space stable. Avoid two animation systems writing to the same transform.
- Focus and accessible state follow the UI, not delayed animation completion.
  Keep dialog focus containment/return and remove exiting hidden content from
  keyboard navigation. Preserve the component library's behavior.
- Menus and tooltips remain within the viewport and outside unintended clipping
  or stacking contexts. Use correct portals; perspective must not break overlays.
- Essential drag actions have a keyboard or non-drag alternative. Scroll effects
  never leave essential content invisible when scripts or observers fail.
- Use transform and opacity where they preserve the correct result. Layout
  animation can be appropriate; bound and profile it instead of claiming every
  effect is GPU-accelerated or 60fps. Release listeners, subscriptions, animations,
  and requestAnimationFrame callbacks when their component unmounts.

## Reduced motion and evidence

Respect `prefers-reduced-motion`. Remove spatial movement, tilt, blur, stagger,
parallax, and nonessential loops. Show the semantic final state immediately or
with restrained opacity feedback. A progress label can replace spinning feedback.
Check CSS and custom loops too: MotionConfig alone does not govern them all.

Inspect a normal transition midpoint or time-separated states, rapidly reverse
the action, then repeat with reduced motion. Check focus, actual behavior, layout,
and responsiveness on mobile and desktop. A screenshot of the settled state does
not prove that animation or interruption handling works.

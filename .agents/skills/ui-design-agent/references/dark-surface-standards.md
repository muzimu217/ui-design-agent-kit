# Dark Surface Standards

Construction-side rules for dark-mode surfaces: what makes dark UI feel
deliberate instead of "a light theme with the lights off". The first signal
of dark mode done wrong is a muffled, low-contrast page nobody can name.
Sources: taste-skill v2 §8 dark-mode protocol (read in full, 2026-09 master
armament); detection side stays in
[detail-critique.md](detail-critique.md) (cluster 2), numeric interaction
constants in [detail-constants.md](detail-constants.md).

Precedence: the governing design contract wins, and a recorded
[user-taste-profile.md](user-taste-profile.md) entry may override for its
scope. Absent an override, the rules below hold.

## Surfaces and elevation

1. **Dark is not inversion**: hierarchy comes from a **surface-lightness
   ladder** — elevated surfaces step *lighter* than the base, one step per
   elevation level. Shadows are nearly invisible on dark backgrounds and
   never carry elevation alone. Counter-example: pure-inverted light tokens
   plus the same soft shadows, reading as a grey smear.
2. **Edges do the separating**: low-opacity white borders
   (`oklch(1 0 0 / 0.08-0.14)`) plus the surface ladder express structure;
   hairlines at this opacity replace dark-on-dark shadows.
   Counter-example: structure held only by 1px borders at full black.
3. **No pure-black surfaces**: base surfaces use a tinted near-black
   (e.g. `oklch(0.14-0.18 …)` carrying a hint of the brand hue), never
   `#000` masquerading as a surface; reserve true black for OLED-true-black
   themes that explicitly declare it. This is the construction side of
   detail-critique's "tinted near-black standing in for black" cluster.
   Counter-example: `#0B0B0B` everywhere with no brand tint.

## Content and accent

4. **Body text is never pure white**: use a near-white ladder (primary ≈
   oklch 0.93-0.96, secondary ≈ 0.75-0.85, placeholder/disabled ≈ 0.55-0.65)
   so hierarchy survives and large areas stop glaring. Counter-example:
   `#FFF` paragraphs on a dark base at length.
5. **Accents are recalibrated, not reused**: a light-theme accent usually
   needs one step up in lightness and saturation on dark surfaces; brand
   accent token values are re-tuned for the dark set, never copied.
   Counter-example: the light theme's `#D97757` sitting muddy on a dark
   base.
6. **Image and media hairlines switch to pure white** at low opacity
   (`oklch(1 0 0 / 0.1)`), complementing detail-constants rule 15's
   light-theme border pairing. Counter-example: light-theme grey borders
   vanishing around screenshots on dark cards.
7. **Semantic tokens are two-valued by design**: every color token carries a
   light and a dark value; components reference tokens only, never hardcode
   hex values. Theme switching swaps tokens, not components.
   Counter-example: a component with `#1a1a1a` hard-coded that breaks the
   moment the theme flips.
8. **Glassmorphism must degrade**: any backdrop-blur/transparency treatment
   defines its `prefers-reduced-transparency` (and reduced-motion-adjacent)
   fallback — opaque surfaces, same hierarchy. Counter-example: frosted
   panels whose text becomes unreadable when transparency is disabled.

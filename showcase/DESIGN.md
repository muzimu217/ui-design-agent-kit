# Flux UI Showcase Design Contract

- Primary task: make the UI agent's visual system, physical motion, and verification boundary inspectable in one runnable page.
- Composition: sticky black topbar, split hero with a code-native faux-3D field, capability strip, dense system panels, motion lab, Remotion frame, evidence table, and coral closing action.
- Typography: Syne for display, Manrope for reading, DM Mono for instrumentation labels and code.
- Semantic colors: ink `#111313`, paper `#f2f0e9`, lime `#d4ff3f`, coral `#ff795d`, blue `#74a9ff`, amber `#ffbf69`.
- Motion: Snappy for controls, Playful for expanded specimen, Elegant for continuity. Reduced motion removes spatial movement and looping previews.
- Acceptance: all controls are real buttons/links; desktop and narrow layouts remain legible; focus states are visible; build passes; browser screenshots show a non-blank, interactive surface.

Reference baseline: Motion transition physics from https://motion.dev/docs/react-transitions and the floating-object relationship from the public pmndrs/drei repository (MIT), adapted as CSS faux-3D to keep the showcase dependency-light.

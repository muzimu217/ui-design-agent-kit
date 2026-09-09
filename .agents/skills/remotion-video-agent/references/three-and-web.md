# 3D Video and Web Delivery

Read this for a 3D composition, a scene shared with an interactive website, or
embedded Remotion playback. Follow the main video contract and `remotion-docs`
for installed-version APIs. Asset authoring, Blender MCP, physics selection and
web scene acceptance belong to `ui-design-agent` and its `spatial-media.md`.

## Choose the deliverable

- Live object inspection, camera orbit, picking, and physical manipulation:
  Three.js/R3F web scene. A video or Player is not a substitute for these actions.
- Editable, frame-based React playback: `@remotion/player`, with explicit
  composition, input props, dimensions, fps, duration, controls, and errors.
- An encoded MP4/WebM for broad website compatibility: render the requested
  composition, then integrate a normal video element with a poster. Do not
  migrate a Vue/vanilla site to React merely to embed a film. An isolated React
  Player island is a separate option only when dynamic props justify it and the
  host integration is approved.

For mixed requests, share licensed models, variant data, camera/art direction,
and pure scene components where compatible. Keep renderer lifecycles, controls,
and clocks separate. Exporting a film does not make the website interactive;
mounting a Player does not produce a downloadable film.

## Frame-driven 3D

Read the official [ThreeCanvas documentation](https://www.remotion.dev/docs/three-canvas)
before implementation. Use `@remotion/three`'s `ThreeCanvas` with explicit width
and height and compatible React/R3F versions. Align exact Remotion package
versions in the target video project, not the agent-kit root.

Drive scene transforms, camera, lights, and model animation clips from
`useCurrentFrame()` and fps. Do not use R3F `useFrame`, elapsed delta, free-running
RAF, wall-clock timers, or live OrbitControls to determine rendered output.
Evaluate animation clips at absolute frame-derived time instead of incrementally
advancing a mixer. Inside ThreeCanvas, use non-DOM scene nodes; a Remotion
`Sequence` there needs the documented `layout="none"` behavior.

Physics that depends on prior evaluation order will break random-access and
parallel frame rendering. Bake/cache a versioned, seeded fixed-step simulation,
or reconstruct a frame from a known initial state using a tested deterministic
procedure. Share the resulting trajectories, not a running browser physics
world. Do not claim an arbitrary physics engine is deterministic across every
device/version. Asset/font readiness must resolve before frame capture, with
bounded failure; verify async texture updates using the current renderer docs.

If Blender is used to pre-render shots, treat them as authorized media inputs
with explicit frame rate, duration, color/alpha handling and provenance. Do not
claim those pixels came from a live browser 3D scene.

## Website integration

Read [Player](https://www.remotion.dev/docs/player) and its current API if dynamic
React playback is required. Keep aspect ratio and dimensions stable, lazy-load
heavy media appropriately, and show a useful poster while loading or on failure.
Provide operable play/pause/replay and seek/volume controls when relevant; keep
essential content available without autoplay or hover.

Browser autoplay may be blocked. Do not assume audio starts without a user
gesture; handle the rejected play attempt and preserve manual playback. Use
inline playback for mobile video where supported. Pause decorative/offscreen
playback and prefer the poster/manual play under reduced motion. An exported
file cannot change itself in response to the viewer's media query; its web host
owns that behavior. Add captions or a text alternative when meaning depends on
speech. Validate media/decoder requests and CSP/CORS at the actual deployment path.

## Evidence

- Preview: inspect opening frame, readable holds, transition midpoints and end.
  For 3D, also inspect model/material loading and camera framing.
- Reproducibility: request frames out of order and repeat a frame, for example
  0, 60, 15, 60 within the composition's range. Compare the repeated frame under
  the same renderer/settings; explain tolerances or nondeterministic findings.
- Player: exercise pause, seek, replay, prop changes, errors and reduced motion
  at desktop/mobile sizes; inspect the actual host page, not just Studio.
- Encoded output, when requested: verify file existence, decode/playback,
  dimensions, fps, duration, audio if applicable, and sampled output frames.
  A Studio URL, composition listing or successful CLI exit alone is insufficient.

Keep these evidence levels separate in the handoff. Do not claim a rendered file
for a preview-only request or verified playback for an uninspected embed.

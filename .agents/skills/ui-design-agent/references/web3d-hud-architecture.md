# Web 3D HUD Architecture

Read this when the brief calls for a dense tech/instrument HUD over a live 3D
subject: data labels tracking model parts, rulers, grids, radar overlays,
multi-station camera tours, and focus/overview transitions — the sci-fi lab
control-room genre. Medium routing, the scene contract, physics, and Blender
MCP policy stay in `spatial-media.md`; this file is the implementation
blueprint that fits inside that contract.

## Keep the two layers separate

- 3D canvas layer: subject, materials, lighting, atmosphere — immersion and
  spatial relations only.
- 2D DOM/SVG layer: every text, numeral, ruler, grid, dial, warning, and
  control — information density and interaction precision.
- Do not set interface text as 3D geometry or a baked texture. DOM text stays
  crisp at any DPR and zoom, remains selectable and translatable, works with
  assistive tech, and reflows without re-exporting a model. A 3D-text
  exception needs a recorded reason.
- The layers meet at two seams only: projection (HUD anchors to world points)
  and picking (raycast selects stable object IDs). Everything else
  communicates through shared application state, never through pixels.
- HUD chrome — grid underlay, ruler ticks, corner brackets, scan lines — is
  ordinary DOM/SVG styled with the project's tokens. Keep measured contrast;
  decoration must not be the only carrier of essential information.

## Anchor labels by projection

- Each frame, project each anchor's world position to screen space
  (`vector.project(camera)` → NDC → CSS pixels) and move the DOM element with
  `transform: translate3d` and `will-change: transform` so the compositor
  owns the motion.
- Hide an anchor when it is behind the camera (camera-space z or clip-space w
  sign) or outside the frustum; fade or clamp labels near screen edges instead
  of letting a panel detach from its subject.
- Projection drives position only. Occlusion against the mesh costs a raycast
  per anchor per frame; an instrument HUD defaults to always-visible labels —
  record the choice when the brief genuinely needs occlusion.
- Reach for the assembled implementation before hand-rolling the loop: three.js
  `CSS2DRenderer`/`CSS3DRenderer` or Drei `<Html>` implement the projection
  loop, keep native hit-testing and text behavior, and are the default
  baseline. Hand-rolled projection is for custom needs (leader lines, edge
  clamping, custom fades) using the same math.

## Orchestrate viewports with a state machine

- Name the modes first (for example OVERVIEW, FOCUS_<PART>, SETTINGS). Each
  state declares its camera waypoint (position plus look-at target), the model
  clips to play, and which HUD panels show.
- A transition is one state change with three synchronized outputs — camera
  tween, clip playback, HUD swap — driven by a single owner. Independent
  timers per layer are how tours drift out of sync.
- Tween position and the look-at target as a pair. Tweening position while
  snapping the target is the classic cause of swingy, disorienting camera
  moves. Retarget from current values so an interrupted transition continues
  instead of snapping back to its start.
- Author waypoints as versioned data, not inline coordinates. When a Blender
  source exists, export camera-anchor empties (position + quaternion) and
  address them by name; when only a GLB exists, keep the same naming
  convention in a config file so retuning stays out of code.
- Automatic tours stop while the user manipulates the model and are removed
  under reduced motion — an immediate cut with an explicit HUD cue is the
  reduced-motion equivalent — per the interaction rules in `spatial-media.md`.

## Sign the asset contract in Blender

- Name objects for consumption: `getObjectByName()` is the addressing scheme.
  Agree the prefix convention (for example `Interactive_`, `Anchor_`,
  `Camera_`) before modeling and keep the outliner legible.
- Put each animated part's origin on its true rotation axis — hinges, doors,
  panels — so a local rotation never orbits off its pivot.
- Export clips with stable names: the state machine plays them by name
  (`AnimationAction`), so clip names are frontend vocabulary, not file-manager
  metadata.
- Deliver GLB; compress geometry (Draco/Meshopt) and textures (power-of-two,
  KTX2/Basis) and wire the matching decoder/transcoder workers so decode stays
  off the main thread; bake AO for static contact shadows when real-time
  shadow cost would break the frame budget. Compression and export rules are
  in `spatial-media.md`.

## Spend the frame budget deliberately

- Bind scene motion to the render loop's delta time, never frame count or wall
  clock, so 60/120/144 Hz displays feel identical.
- Stop or throttle rendering when the scene is idle; a ticking HUD number must
  not force a full scene re-render by itself.
- The cold-lab look is staged, not simulated: ACES filmic tone mapping, one
  soft-shadow key light, ambient fill, and an environment map for metal
  response cost less than stacked real-time lights. Keep post-processing to
  subtle bloom plus SMAA/FXAA and re-measure frame time after enabling it.
- On teardown or scene swap, dispose owned geometries, materials, textures,
  renderers, and listeners; shared caches survive. Context-loss and
  return-from-hidden behavior are verified per `spatial-media.md`.

## Read a shipped example at its seams

When analyzing a reference HUD site, locate the load-bearing seams before
judging visuals: search its source for `PerspectiveCamera`, `GLTFLoader`,
`requestAnimationFrame`, and `.project(` or `CSS2DRenderer` — that reveals the
real dual-layer wiring. For a `.blend` source, the outliner naming and the
NLA/Action list show how the frontend addresses objects and clips. Record what
source inspection verified versus what pixels merely suggest, per the
reference rules in `spatial-media.md`.

## Evidence

- Anchor test: orbit and resize — every HUD label stays glued to its anchor,
  hides behind the camera, and no panel detaches at any tested viewport.
- State test: every named transition moves camera, clip, and HUD together;
  interrupting mid-flight continues from current values; reduced-motion mode
  swaps tours for cuts and keeps all information reachable.
- Budget: frame time recorded with post-processing on and off on named
  devices; asset transfer and decode stay within the scene contract's budget.
  Canvas mounting or animated background pixels are not evidence.

# Workflow Exhibition Design Contract

## Scope and Baseline

Workflow-first public-facing exhibition for UI Design Agent Kit. The user's
correction explicitly replaces the brick-product marketing composition. The
workflow is the primary product; outcomes show what it can produce. Source kind:
approved existing outcome screenshots plus one runnable React/Three.js demo,
not a pixel-exact page reference or a blanket verification record.

The existing cool-white site chrome remains the neutral exhibition baseline.
`media/SOURCES.md` names the inventory, phone, and blog capture sources. The brick
case uses its original scene, domain recipes, and five canonical screenshots.
Game mechanics, storage, and editing controls remain owned by the workshop.

## Composition

The literal kit name and workflow descriptor lead the hero. Main actions browse
outcomes or inspect the workflow; a wide four-case screenshot strip shows the
range immediately. Six interactive stages expose outputs and human confirmation
nodes. The outcome grid contains four equal peer cases with functional type
filters. Case detail displays historical evidence or, only for the brick case,
the live scene and screenshot gallery. Evidence definitions and a workflow
repository action close the page. No brick-specific action dominates the home.

## System

- Cool white `#F2F5F7`, paper `#FAFCFD`, ink `#26343D`, muted `#61717D`.
- Command green `#177656`; the actual cases supply distinct dark product,
  reading, operational, and multicolor 3D worlds. No ornamental orbs.
- Preserve the approved platform/CJK font stack. Font sizes are stable across
  explicit 640, 1024, and 1440px breakpoints, never viewport-scaled.
- 4px/8px spacing, stable media aspect ratios, 44px minimum controls, maximum
  8px corners. Bands are not nested cards.

## Motion and Scene

- The existing Scene owns Three.js geometry and placement transforms. A
  presentation-only React clock reveals sorted challenge bricks every 280ms
  after a bounded opening delay. The existing Playful spring owns placement.
- The presentation opts into subject framing in the shared Scene. Bounds cover
  the real and upcoming bricks, including rotated dimensions and placement lift.
  The game retains default board framing. Reset uses the existing camera API.
- Snappy springs (400/30/0.8) drive stage, type-filter, and gallery selection.
  Elegant springs (100/20/1) drive title, outcome reveals, and project reflow.
  Stages are selectable documentation, never simulated running jobs.
- Hidden/offscreen presentation playback pauses. Same-origin messages validate
  both origin and source. Reduced motion renders completed models immediately,
  without autoplay, spatial reveals, smooth anchor scrolling, or looping effects.
- The presentation lazy entry does not import `App` or its storage code. It uses
  the same challenge recipes, layer height, geometry, lighting, and material.

## Controls and Failure States

Six stage tabs and five type filters support arrow keys, Home, and End. All four
cases open real detail views with native modal focus and return; three are
explicit historical captures, one offers a playable route. The brick case adds
model choice, pause/resume, replay, view reset, five image tabs, zoom, previous/next,
and Escape. Its live scene mounts only while that case is open. Failed loading
or WebGL offers a real screenshot and retry. The app file menu returns to this site.

## Implementation Evidence

Motion MCP `search_motion_docs(useInView)` returned documentation; both
`motion://docs/react/react-use-in-view` and `react-use-page-in-view` were read.
The implementation uses free visibility/state APIs, not Motion+ example source.
The main agent owns assembled nested-base browser verification, canvas pixel
inspection, desktop/mobile captures, and the final acceptance record. A source
or build check alone is not a visual acceptance claim.

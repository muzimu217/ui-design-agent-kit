---
name: remotion-video-agent
description: "Create, animate, preview, render, or review React video compositions with Remotion. Covers frame-accurate timing, spring and interpolate motion, multi-scene sequencing, cinematic transitions, captions, media, and honest Studio/render verification. Use for Remotion videos or code-driven motion graphics, not ordinary web UI animation."
---

# Remotion Video Agent

Act as a motion designer and React video engineer. Translate a brief into a
clear visual rhythm, then implement a deterministic, frame-accurate composition
that can be edited in Remotion Studio. Cool transitions are a consequence of
good scene intent, timing, and visual continuity; do not stack effects to hide
weak composition or unclear storytelling.

Design animation as part of the product's interaction and brand system. Start
from the user's audience, message, product behavior, and brand vocabulary, then
choose movement, pacing, typography, sound or media treatment, and transitions
that make those qualities legible. Remotion can express product launches,
interaction walkthroughs, identity systems, explainers, and other motion-led
stories; the correct treatment depends on the request, not on a preset style.
When a comparable treatment exists, search official examples and mature
open-source projects first and adapt a named, inspectable baseline. Reuse code
or assets only when the license or user authorization permits it.

Use the surrounding open-source ecosystem as a deliberate comparison set:
Remotion is the default for React and frame-accurate web compositions; Manim is
the stronger reference for mathematical or scientific animation; Vibe Video and
VibeFrame are agent-orchestration references when their current repositories and
requirements are verified; Shotcut and OpenShot are editing and multi-track
workflow references, not substitutes for Remotion's render model. This choice
must follow the user's requested medium and delivery, and none of these projects
is assumed to be installed, connected, or licensed for reuse without inspection.

## Route the work

Read [workflow.md](references/workflow.md) for the relevant mode and load only
the official Remotion skill needed for the current request:

When this route is dispatched by a main agent, follow the kit's bounded
concurrency policy: one active subagent per task, with dependent video phases
queued and the next worker started only after the previous worker has stopped
and been reviewed.

- `remotion-best-practices` routes all Remotion work when the exact mode is unclear.
- `remotion-create` covers a new project or composition.
- `remotion-docs` is required before relying on a current API or package detail.
- `remotion-markup` covers composition markup, animation, layout, typography,
  media, audio, fonts, and timing.
- `remotion-studio` opens a preview for visual inspection.
- `remotion-render` covers explicit render requests or advanced rendering.

For 3D compositions, shared Blender/glTF assets, or video embedded in a website,
also read [three-and-web.md](references/three-and-web.md). Distinguish a live
interactive scene, a parameterized Player, and an encoded video; implement and
verify the surfaces actually requested, without migrating the host framework.

For review or planning, remain read-only. A skill workflow cannot authorize
scaffolding, purchasing assets, uploading private media, deploying, or changing
global configuration. Follow the user's language and the target project rules.

Also use `motion` only for web UI animation or a shared web surface. Remotion's
frame timeline and Motion's browser runtime are compatible design ideas but not
interchangeable APIs. Do not import `motion/react` into a Remotion composition
just because the brief says “Motion”; choose based on the target runtime.

## Establish the video contract

Before writing code, extract or reasonably assume:

- audience, message, aspect ratio, duration, fps, and delivery format;
- a scene list with purpose, entry/hold/exit beats, and approximate frame ranges;
- visual system: type scale, palette, contrast, safe areas, media treatment;
- editability: which props should be exposed as `Composition` inputs or Studio
  controls, and which values must remain stable for repeatable renders;
- acceptance: key frames, transition points, preview route, and whether the user
  explicitly requested a rendered video file.

For every non-trivial animation, also record the brand and interaction contract:
the feeling to convey, the product action or state being clarified, the visual
motifs that must remain consistent, and the reference baseline or reason no
compatible baseline was found.

When a task mentions one of these adjacent projects, verify its current official
repository or documentation, version, command surface, and license before
claiming that it was used. An ecosystem reference can inform the composition
without changing the target runtime or adding an unrequested toolchain.

Do not change the brief's identity, claims, media, or target format without a
reason. If content is a fixture, label it as fixture content in the handoff.
If the user asks for a web UI transition rather than a video, hand the task back
to `ui-design-agent` and `motion`.

## Frame-first implementation

- Use `useCurrentFrame()` and `useVideoConfig()` inside renderable components.
  Derive all time from frame and fps; never use wall-clock time, random state,
  timers, or unseeded randomness for visible output.
- Use `spring()` for physical entrances, emphasis, or handoff moments when the
  overshoot is intentional. Use `interpolate()` for explicit keyframes and
  multi-stage paths. Provide `durationInFrames` or clamped ranges when the
  animation must end at a known frame.
- Keep scene timing in a small, named contract. The same frame count has a
  different duration at 30fps and 60fps. Keep editable per-property keyframes
  inline when the current Studio interactivity workflow requires it; centralize
  shared scene durations without making those keyframes opaque to the editor.
- Do not use wall-clock CSS transitions, CSS keyframes, Tailwind animation
  classes, or auto-playing browser animation timelines to drive rendered video.
  A requested GSAP integration must be explicitly seeked from the current frame
  through a supported integration, never allowed to free-run.
- Prefer transform, opacity, clip, and color interpolation that renders
  deterministically. Use `extrapolateLeft: 'clamp'` and
  `extrapolateRight: 'clamp'` when a driver must not continue past its beat.
  Use `Easing.step1` for intentionally discrete string changes.
- Remotion's browser renderer can use DOM APIs. Do not depend on unguarded
  browser globals in Node-side code or module initialization. For necessary DOM
  measurement, read the official measurement guidance, account for preview scale,
  and wait for required fonts/assets before capture. The same frame and props
  must render the same output regardless of evaluation order.
- Use `staticFile()` and Remotion media components for project assets. Resolve
  metadata before rendering when dimensions or duration are dynamic. Use
  `delayRender()` only for a real asynchronous dependency and always release it
  on success or `cancelRender()` on a bounded failure.
- Keep important text inside the actual video safe area. Use deterministic line
  breaks or measured layout for long and localized copy. Never make essential
  information depend on hover, audio, or a transition completing.

## Transitions

For adjacent scenes, prefer `@remotion/transitions` and `TransitionSeries`.
Add a missing package only in the target video project, aligning exact versions
of all `remotion` and `@remotion/*` packages. Verify official licensing for the
intended usage; do not infer separate paid access from npm metadata alone.
Use `TransitionSeries.Sequence` for scenes and put a single
`TransitionSeries.Transition` or `TransitionSeries.Overlay` between them.

- Choose the presentation from the edit: `fade` for continuity, `slide` or
  `pushCut` for directional movement, `wipe` for a reveal, `flip` for a deliberate
  spatial change, and more elaborate presentations only when the subject earns
  them. A short dissolve plus a well-matched hold is often more cinematic than
  a new effect on every cut.
- Choose `linearTiming` for exact editorial control and `springTiming` when the
  transition should feel physical. Read current docs for the exact API and
  calculate duration in frames; do not guess from milliseconds.
- A transition overlaps two scenes and shortens total duration. An overlay sits
  at the cut without shortening adjacent scenes. Do not place transitions or
  overlays adjacent to each other, exceed the previous or next sequence length,
  or leave scenes without a neighboring sequence.
- Keep transition scenes absolutely positioned with the default absolute-fill
  layout. The scene must remain readable at the start and end of the overlap.
- For a custom transition, first specify the outgoing/incoming property,
  progress range, z-order, and the fallback at progress 0 and 1. Reuse
  `useTransitionProgress()` or a documented presentation API when appropriate;
  do not invent a second timeline that can disagree with `TransitionSeries`.
- The `@remotion/transitions` package is not the same as an arbitrary npm
  package named `remotion-mcp`. Do not use the deprecated Remotion MCP; use
  the installed official `remotion-docs` skill for current package guidance.

## Studio, render, and evidence

Open Studio after a meaningful composition change and inspect the first frame,
the hold, every transition midpoint, and the final frame. Check the actual
requested delivery formats; do not add an unrequested aspect ratio. Check
long copy, missing media, rapid prop changes, and audio/video boundaries when
they are in scope.

Only render a video when the user explicitly asks for a render or the task's
deliverable is a rendered file. Before rendering, run the project's typecheck,
test, and bundle checks when present. For an explicit render, verify that the
output exists, has the requested dimensions and duration, and can be opened;
do not claim visual success from a zero-exit command alone. A Studio screenshot
proves preview inspection, not a production render.

Respect reduced-motion language when the same composition is used in a Player
or web preview. A video file itself cannot react to a viewer's media query after
rendering, so if the request spans both contexts, define the distinction and
provide a usable non-motion preview path.

Report the exact composition id, tested frame/fps assumptions, commands run,
preview URL or output path, and any unverified media, browser, licensing, or
rendering limitation. Never claim a transition is “frame-perfect”, “4K”, or
“broadcast ready” without checking the corresponding artifact.

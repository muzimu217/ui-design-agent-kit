# Spatial Media

Read this when the request involves interactive 3D, physical objects, Blender
assets, an embedded video, or a website reference combining these media. This
extends the UI workflow; it does not authorize a demo, new installation, or
implementation during a research-only request. Video-specific timing belongs
to `remotion-video-agent`, not a second policy here.

## Route by the user's intended result

The user describes the experience; the agent selects the machinery. Inspect
the target stack and assets, explain the consequential choice in plain language,
and ask only when a missing choice changes the deliverable.

| User intent | Implementation route | Tool route and boundary |
| --- | --- | --- |
| Responsive controls, expanding panels, spatial transitions | Existing CSS/Motion or incumbent web runtime | Motion skill and discovered Motion docs MCP; no 3D or video dependency for ordinary UI motion |
| Rotate, inspect, recolor, or explore a real 3D object/space | Three.js; R3F/Drei when the app already uses React | Context7 or official examples, then browser verification; preserve Vue/vanilla projects instead of migrating to R3F |
| Collisions, gravity, stacking, joints, physically draggable objects | Rapier or a compatible existing physics engine, rendered by Three.js | Engine docs via Context7/official source; `@react-three/rapier` only for a compatible React stack; no assumed "physics MCP" |
| A stylized geometric scene | Licensed model or a small procedural Three.js model after baseline research | Code and browser tools; Blender is optional, not a prerequisite for every mesh |
| Sculpted/rigged assets, UVs, material baking, editable 3D source | Blender authoring, then glTF/GLB for the browser | An available, authorized Blender MCP or installed Blender CLI/Python; do not call an image generator a mesh exporter |
| A directed, seekable short film or downloadable MP4/WebM | Remotion composition and explicit render when a file is requested | `remotion-video-agent`, official skills/docs, local Studio/render commands; do not add the deprecated Remotion MCP |
| Embedded playback with editable scene parameters | Remotion Player for React; rendered video for simple/non-React playback | Load the video's `three-and-web.md`; Player playback does not create an MP4 or provide free camera/physics interaction |

"Make it alive" is not permission to install every row. For an expressive site,
propose a subject-led scene or media treatment with one useful interaction,
clear hierarchy, and a static/loading fallback. Keep ordinary work-focused
screens quiet. If requested 3D cannot run, disclose the degradation; a screenshot,
CSS tilt, empty canvas, or generic rotating cube is not the requested model.

## Learn from a reference without guessing its stack

Inspect the URL's current content, desktop/mobile screenshots, an interaction,
DOM/media elements, and public source or loaded-resource evidence when available.
Distinguish live observations, inspected source, author claims, and inference.
If the URL is a different product than described, state that discrepancy and
continue within the supplied reference's scope; do not invent the missing site.

A 3D-looking scene might be WebGL, a video, sprites, or CSS transforms. Appearance
does not establish Blender, Remotion, a physics engine, or the author's MCP/AI
workflow. Even a public repository is not proof that its latest revision matches
the deployed build. Record the inspected revision and attribution boundary.

Extract reusable relationships: recognizable subject, silhouette, lighting,
camera distance, depth cues, input feedback, interruption, state transitions,
and asset reuse. Do not copy every panel treatment or a reference's defects.
The researched example for this kit is `docs/archive/tihuqiche-spatial-study.md`; it is
an optional case study, not required material for unrelated product tasks.

## Add a scene contract to the existing design contract

Keep this compact and specific to the assigned surface:

- Purpose and medium: what the user can inspect/do; live scene, video, or both.
- Assets: source/license, authoring file, exported path, variant/material names,
  dimensions/units, origin/pivot, orientation, animation clips, collision shapes.
- Art direction: subject silhouette, camera/projection, lighting/material style,
  background, grounded shadows, and the clear area reserved for real DOM UI.
- Interaction: input -> state change -> visible response; rotate/select/reset,
  draft/apply/cancel, and pointer/touch/keyboard equivalents as relevant.
- Clock ownership: live renderer, fixed simulation steps, or video frame; which
  system owns each transform and how paused/hidden states behave.
- Device budget: supported viewports/devices, asset transfer/decode budget,
  triangle/draw-call/texture budget, DPR cap, and a measured frame-time target.
  Choose values from the real brief/baseline; do not assert universal budgets.
- Readiness and fallback: model/texture/font failure, first usable frame,
  WebGL/context-loss response, reduced motion, poster and retry behavior.
- Evidence: which viewport, input, frame/pixel comparison, failure mode, and
  artifact will establish each claimed result.

## Model authoring and Blender MCP

Blender normally runs outside the website. The handoff is an asset, not a
requirement for every visitor to install Blender or connect to its MCP socket.

The third-party candidate is
[ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp), not an official
Blender service. It is not installed or configured by this kit. Before use:

1. Discover the actual tool catalog and schema, the Blender application/add-on
   connection, version compatibility, permissions, and current telemetry/data
   handling. Some tool versions request the user's prompt and capture screenshots
   or code. Do not forward private prompts/media to an unapproved destination.
2. If already available and authorized, start with a read-only scene/object query
   and viewport capture. Candidate tool names include `get_scene_info`,
   `get_object_info`, and `get_viewport_screenshot`; names in this file are not
   proof that those tools are callable in the current session.
3. Work on a task-owned collection or a new copy of the provided scene. Inspect
   existing objects before modifications; preserve unrelated work and do not
   clear the whole scene or overwrite the user's source file. A code-execution
   tool such as `execute_blender_code` is arbitrary local Python execution,
   not a harmless drawing API. Inspect scripts and exact file targets first.
4. Save editable source and export only the intended objects. Verify both the
   Blender viewport and the actual exported GLB in the target browser. A Blender
   screenshot or successful save does not prove the export survived correctly.

If the MCP is absent, an already installed Blender CLI with a reviewed `bpy`
script is a valid authoring route inside the authorized target project. If no
authoring runtime exists, use a selected licensed GLB or an appropriate procedural
model for web-only work. If editable `.blend` is required, report that exact
blocker and request setup or an asset; never silently replace the deliverable.

Only when setup is requested, inspect/pin the selected server and add-on revision,
review its license, loopback binding and telemetry choices, and use project-scoped
configuration. Do not silently install/enable add-ons, open a public control
socket, disable safety checks, change global preferences, authenticate model
providers, upload private assets, or incur generation charges. A server's presence
does not authorize its optional asset marketplaces or image-to-3D services.

## Export and integrate assets

Keep editable source separate from optimized delivery files. Prefer glTF/GLB
for a Three.js model; inspect the exporter documentation for the installed
Blender version and required glTF extensions. Validate units, transforms,
normals, UVs, material slots, clip names, pivots, and full-rotation bounds.
Unsupported procedural materials/constraints/simulation need a deliberate bake
or equivalent runtime implementation; they do not automatically survive export.

Use supported PBR materials and texture color spaces; verify base color,
roughness, metalness, normal maps, transparency, and lighting in the actual web
renderer. Budget geometry/textures before adding post-processing. Compression
is optional: Draco/Meshopt and KTX2/Basis assets require the corresponding loader,
decoder/transcoder, correct URLs and CSP/CORS support. Test the production path,
not only the dev server. A GLB can still reference external resources; inspect
dependencies instead of assuming the extension guarantees an offline asset.

Use the same asset/variant source for the live model, thumbnails, poster, and
video when appropriate. That keeps a selectable swatch or thumbnail faithful to
the resulting object. Preserve provenance and license notices with the assets.

## Live interaction and physics

- Separate semantic state and DOM controls from the scene. Picking/raycasting
  should select stable object IDs, not make all UI dependent on canvas hit tests.
- For a HUD-dense instrument experience — DOM labels projected onto the
  subject, named camera-tour states, asset naming conventions — follow
  `web3d-hud-architecture.md`.
- Use camera bounds, sensible orbit limits, focus/reset, pointer capture and
  cancel cleanup. Refit the complete subject for narrow screens and variants;
  moving overlays is not sufficient if the model is still clipped.
- Pause automatic camera rotation while the user manipulates the model. Choose
  explicit resume or an idle policy suited to the task; remove automatic spatial
  motion under reduced motion. Offer equivalent non-drag controls.
- Distinguish spring/damping feedback from rigid-body simulation. A product
  turntable does not need gravity. Use a proven engine for actual collisions,
  stacking or joints unless a from-scratch implementation was explicitly asked
  for; do not hand-roll general collision response after seeing a simple demo.
- For simulation, set units, gravity, collider types, collision groups, and
  stable steps explicitly. Use simple/convex colliders for moving bodies where
  appropriate; evaluate CCD for fast motion. Cap catch-up work on resume and
  test reset, sleeping/waking, constraints, and low-frame-rate behavior.
- Give each transform one owner. Avoid a UI spring, physics body, and camera
  controller writing the same property. Use the engine's documented kinematic
  or joint-based drag path instead of fighting dynamic bodies with teleportation.
- Bound GPU cost: reuse geometry/materials, instance repeated objects, cap DPR,
  limit real-time shadows, pause hidden/offscreen work, and dispose owned GPU
  resources/listeners on teardown without disposing shared caches still in use.

## Verify the actual output

Apply `acceptance.md` with scene-specific evidence. Capture desktop/mobile home,
an interaction state and a changed variant/camera state; inspect both composition
and subject framing. Use nonblank pixel/region checks plus visible or state-backed
changes. Pixel variation alone can be a background animation, not working input.
Capture the subject region and associate the change with a specific input.

WebGL buffers may be cleared after a frame, and cross-origin media can taint
readback. If direct canvas sampling fails, inspect browser screenshot pixels
after a rendered frame; do not call it blank solely from unsupported readback,
or alter production rendering just to make a weak test pass.

Exercise pointer/touch/keyboard, interruption, reset, and applicable draft/cancel
flows. Test reduced motion, blocked model/texture requests, no-WebGL/context-loss
fallback, and return from a hidden tab when relevant. Record frame-time and
asset-cost measurements on named devices or emulation; headless desktop results
are not evidence of mobile GPU performance. Simulation needs physics assertions
in addition to screenshots. Video render and Player checks follow the video skill.

## Official implementation references

- [Three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [Drei](https://drei.docs.pmnd.rs/)
- [Rapier JavaScript](https://rapier.rs/docs/user_guides/javascript/getting_started_js/)
- [React Three Rapier](https://github.com/pmndrs/react-three-rapier)
- [Blender glTF exporter](https://github.com/KhronosGroup/glTF-Blender-IO)

Resolve current docs against the target's installed versions. These are reference
routes, not installed dependencies, blanket asset permissions, or tool-call traces.

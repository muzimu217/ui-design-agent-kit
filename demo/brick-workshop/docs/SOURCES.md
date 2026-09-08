# Sources And Adaptation Boundaries

## Runtime Libraries

Exact installed versions are recorded in `package.json` and `package-lock.json`. Runtime source licenses are distributed with their packages.

- React / React DOM: https://github.com/facebook/react/blob/main/LICENSE (MIT).
- Three.js: https://github.com/mrdoob/three.js/blob/master/LICENSE (MIT).
- React Three Fiber: https://github.com/pmndrs/react-three-fiber/blob/master/LICENSE (MIT).
- Drei: https://github.com/pmndrs/drei/blob/master/LICENSE (MIT).
- Motion: https://github.com/motiondivision/motion/blob/main/LICENSE.md (MIT).
- Lucide: https://github.com/lucide-icons/lucide/blob/main/LICENSE (ISC; icons retain the package's notices).

## Approved References

- Three.js Voxel Painter: https://threejs.org/examples/webgl_interactive_voxelpainter.html
  Inspected source revision: https://github.com/mrdoob/three.js/blob/bae834d3558321fd3b38200735eebfb6acb5e149/examples/webgl_interactive_voxelpainter.html
  Adapted relationship: engine raycasting, discrete grid coordinates, translucent candidate and explicit placement. The app's multi-size rules, support validation, UI and state are project-authored. No reference texture is shipped.
- Drei Bounds and makeDefault: https://pmndrs.github.io/examples/bounds-and-makedefault/
  Source: https://github.com/pmndrs/examples/blob/main/examples/bounds-and-makedefault/src/App.tsx
  Reference for framing and camera reset only. No example GLB model or screenshot is shipped. This app uses installed library APIs rather than copying that demo's asset bundle.
- Three.js LDraw Loader: https://threejs.org/examples/webgl_loader_ldraw.html
  Reference only for stud readability, plastic materials and construction steps. No LDraw model, vehicle, branding, logo, texture or screenshot is shipped. Its mobile clipping was an observed limitation, not a pattern to copy.

## Project-Owned Visuals

Brick geometry, same-geometry thumbnails, build recipes and challenge structures are generated locally from the project's declared brick catalog. No external 3D asset, reference screenshot, stock texture or branded model is part of the runtime.

## API Evidence, 2026-09-07

- Context7 resolved React and inspected `/react/react/v19.2.7` for state updaters, effect cleanup and native dialog wiring. The installed version is 19.2.8; the nearest documented 19.2 patch was used and local types/build verify compatibility.
- Motion MCP `search_motion_docs` returned `motion://docs/react/react-accessibility`, which was read. Applied `MotionConfig reducedMotion="user"` and `useReducedMotion`; imports use `motion/react` despite legacy import examples in the returned text.
- npm registry verified Vitest 4.1.0 engines `^20.0.0 || ^22.0.0 || >=24.0.0`, compatible with the local Node 25.9.0 runtime. No Vitest 5 installation was made.

Prototype, implementation, source inspection, API lookup and actual browser verification are distinct evidence categories. See the separate acceptance record for browser checks.

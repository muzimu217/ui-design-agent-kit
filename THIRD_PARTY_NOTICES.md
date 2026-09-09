# Third-Party Notices

This kit vendors project-scoped agent instructions from the following public
repositories. The source revisions are recorded in
`tooling/sources.lock.json`; this file is a provenance and license summary, not
a substitute for each upstream repository's license text.

- Motion AI Kit, `motiondivision/ai-kit`, revision
  `1140efe9ad5e03c689ea6bb19d9d3850a4dae5f7`: MIT, as declared by the
  `motion-ai` package. The exact upstream manifest is preserved in
  `.agents/skills/motion/UPSTREAM_PACKAGE.json`; no standalone LICENSE was found
  at this revision. Source: https://github.com/motiondivision/ai-kit
- Impeccable, `pbakaus/impeccable`, tag `skill-v4.2.0`, revision
  `e74a311e40770dc458d631e146b4ea1f0b53804f`: Apache-2.0. Source:
  https://github.com/pbakaus/impeccable/blob/skill-v4.2.0/LICENSE
  The original LICENSE and NOTICE.md are preserved in `.agents/skills/impeccable/`.
- UI UX Pro Max, `nextlevelbuilder/ui-ux-pro-max-skill`, revision
  `f3ac195224eac1eb0dfe1a3059c2a6add78ffbe3`: MIT. Source:
  https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
  The original LICENSE is preserved in `.agents/skills/ui-ux-pro-max/`.
- Remotion Agent Skills, `remotion-dev/skills`, revision
  `54e9b19a612897171e0b3b242e01c2badba4a272`: source repository does not
  publish a license field in its GitHub metadata; review its current repository
  terms before redistributing beyond this local project. Source:
  https://github.com/remotion-dev/skills
- Emil Kowalski Skills, `emilkowalski/skills`, revision
  `d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7`: MIT. Source:
  https://github.com/emilkowalski/skills
  Vendored entries: `emil-design-eng`, `animation-vocabulary`,
  `pick-ui-library`. The original LICENSE is preserved in each installed skill
  directory.
- Baoyu Design, `JimLiu/baoyu-design`, revision
  `026d4ea012bdd5cada72ac8cc13f21ba4edf2245`: MIT. Source:
  https://github.com/JimLiu/baoyu-design
  Only the `SKILL.md` instruction is vendored; the upstream `agents/` helper
  scripts and `gen-pptx` package are excluded. The original LICENSE is
  preserved in `.agents/skills/baoyu-design/`.
- GSAP AI Skills, `greensock/gsap-skills`, revision
  `aed9cfd3277740755f6bfc1155c7aa645403b760`: MIT. Source:
  https://github.com/greensock/gsap-skills
  Vendored entries: `gsap-core`, `gsap-frameworks`, `gsap-performance`,
  `gsap-plugins`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`,
  `gsap-utils`. The original LICENSE is preserved in each installed skill
  directory. Per the upstream README, GSAP and all its plugins are free
  including commercial use.
- JIEJOE Design (distilled), `jiejoe-design`: design philosophy distilled from
  the `JIEJOE-WEB-Tutorial` repositories (MIT), Bilibili UI-motion tutorials.
  The skill is re-authored for this kit and does not copy upstream code; the
  distillation source and license are recorded in the skill's metadata.

## Local adaptations

- UI UX Pro Max: replace the Claude-specific script root with the loaded skill's
  absolute directory. The search implementation and datasets are unchanged.
- Motion: move the top-level `argument-hint` to `metadata.argument-hint` for this
  kit's skill validator. The hint text and instruction body are unchanged.
- The six official Remotion entrypoints: move upstream `version: 4.0.520` to
  `metadata.version` rather than discarding the version. References are unchanged.
- Impeccable: install the skill without its automatic hooks. The upstream engine
  launcher is retained; its native engine is a separate first-use download.
- Pick UI Library: remove the upstream `disable-model-invocation` frontmatter
  key for this kit's skill validator; invocation is governed by the kit's
  routing. The instruction body is unchanged.
- The three Emil Kowalski skills are vendored verbatim at a pinned revision;
  no instruction text was modified.
- Baoyu Design: only `SKILL.md` is vendored. The upstream `agents/` execution
  helpers (`build-preview.mjs`, `check-design-system.mjs`,
  `compile-design-system.mjs`, design-system checker, fork verifier) and the
  `gen-pptx` package are excluded to keep this kit's maintenance scope; the
  vendored instruction text is unchanged.

The custom `ui-design-agent` and `remotion-video-agent` files in this repository
are authored for this project. Remotion package usage remains subject to the
license and commercial terms of the target Remotion project; this kit does not
install or redistribute Remotion runtime packages.

## Research-only references

- The tihuqiche study inspects `Licoy/tihuqiche` at revision
  `51815d8be6c4f2720610a3ee94f067b02e6be899` and its public website. Its repository
  LICENSE declares MIT. The study records observations and design relationships;
  no upstream code, models, branding, or production assets are vendored here.
  Browser screenshots are local ignored research evidence, not shipping assets.
- `ahujasid/blender-mcp`, Three.js/R3F/Drei, Rapier, and the Blender glTF exporter
  are linked as implementation research routes. No new server, runtime, or
  upstream skill is installed by this extension, so existing source pins and
  upstream notices remain unchanged. Future adoption needs its own version,
  license, asset-provenance, and permission review.

## Demo assets (demo/subway-runner)

- Kenney "Animated Characters Protagonists" (1.1): CC0 1.0
  (https://creativecommons.org/publicdomain/zero/1.0/). Used files:
  `Model/characterMedium.fbx`, `Animations/{idle,run,jump}.fbx`,
  `Skins/{skaterMaleA,criminalMaleA}.png`. Source:
  https://kenney.nl/assets/animated-characters-protagonists (downloaded
  2026-09-07; the pack's License.txt is preserved at
  `demo/subway-runner/assets-src/kenney-protagonists/License.txt`).
- Kenney "Cube Pets" (2.0): CC0 1.0. Used files:
  `Models/GLB format/animal-dog.glb` and its external
  `Models/GLB format/Textures/colormap.png` (kept at the loader-relative path
  `public/models/Textures/colormap.png`). Source:
  https://kenney.nl/assets/cube-pets (downloaded 2026-09-07; License.txt at
  `demo/subway-runner/assets-src/kenney-cube-pets/License.txt`).
- Both packs were selected by the user at the P-subway-2 material gate.
  Crediting Kenney (kenney.nl) is appreciated by the author but not required
  by CC0; this notice serves as the provenance record.
- npm runtime dependency `three` (MIT) and devDependency `@types/three`
  (MIT, DefinitelyTyped) are installed only inside the demo subproject;
  the kit root package.json is unchanged.

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

## Local adaptations

- UI UX Pro Max: replace the Claude-specific script root with the loaded skill's
  absolute directory. The search implementation and datasets are unchanged.
- Motion: move the top-level `argument-hint` to `metadata.argument-hint` for this
  kit's skill validator. The hint text and instruction body are unchanged.
- The six official Remotion entrypoints: move upstream `version: 4.0.520` to
  `metadata.version` rather than discarding the version. References are unchanged.
- Impeccable: install the skill without its automatic hooks. The upstream engine
  launcher is retained; its native engine is a separate first-use download.

The custom `ui-design-agent` and `remotion-video-agent` files in this repository
are authored for this project. Remotion package usage remains subject to the
license and commercial terms of the target Remotion project; this kit does not
install or redistribute Remotion runtime packages.

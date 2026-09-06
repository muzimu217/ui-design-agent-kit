# Usage

This repository is a project-scoped agent kit. Start a UI task naturally or
invoke the orchestrator explicitly:

```text
$ui-design-agent Build an accessible analytics dashboard from this brief.
```

For the requested physical-motion design direction:

```text
$ui-design-agent 请为这个产品实现高质感界面。新项目优先 React 19 / Vue 3、TypeScript、Tailwind 和 Lucide；沿用已有技术栈。使用 Snappy / Playful / Elegant 弹簧和小组级联，真实探测 MCP，完成键盘、移动端与减少动效验收。
```

For a portable system prompt, run `npm run prompt:build`. It produces
`output/ui-design-agent.system.md` by combining the maintained entrypoint and
its motion, routing, design-contract, and acceptance references. The export is
generated, not a second source to edit. The target host still needs its own
skills and MCP setup.

For web interaction motion:

```text
$ui-design-agent Add an interruptible modal transition. Use the project's existing stack, consult Motion docs for the non-trivial animation, and verify keyboard focus, reduced motion, and mobile/desktop output.
```

For screenshot or Figma to code:

```text
$ui-design-agent Rebuild this supplied UI reference. First classify what is known from the image/Figma/spec, write a fidelity brief, inspect the same viewport in the browser, compare by named regions, run one bounded repair pass, and report all inferred values and remaining unverified details. Keep generated code in the target workspace.
```

For Remotion video:

```text
$remotion-video-agent Create a 30fps 16:9 product teaser from these scenes. Use one signature wipe transition and restrained spring entrances. Keep all timing frame-accurate, make the composition editable in Studio, preview it, and render only if I ask for the video file.
```

For a transition-focused request:

```text
$remotion-video-agent Make the transition between the title and feature scenes feel cinematic. Inspect the current Remotion version and official transition docs first, calculate the overlap in frames, preserve the scene content, then verify the midpoint and endpoints in Studio.
```

For a brand-led animation or an adjacent open-source reference:

```text
$remotion-video-agent Create a product motion preview for this brand brief. Search Remotion's official examples first, compare Manim or the verified open-source animation references only if the medium requires them, keep the target runtime explicit, and report the source, license boundary, frame contract, and preview evidence.
```

The installed official Remotion skills are the source for current API details;
the local `remotion-video-agent` adds product judgment, routing, and verification
contracts. The Motion AI Kit is the source for web Motion docs and CSS easing.
The deprecated Remotion MCP is intentionally not configured.
The animation ecosystem references are candidates for research and routing; they
are not automatically installed, connected, or licensed for code and media reuse.

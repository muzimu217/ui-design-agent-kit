# Usage

This repository is a project-scoped agent kit. Start a UI task naturally or
invoke the orchestrator explicitly:

```text
$ui-design-agent Build an accessible analytics dashboard from this brief.
```

For an everyday-language request without a technical brief:

```text
$ui-design-agent 我想把同事提交的采购申请集中起来，能看谁还没处理。先帮我整理第一版需求，参考和素材由你联网查，最后给我完整开发提示词，先不要写代码。
```

For a fillable starter, use the [initial request template](../.agents/skills/ui-design-agent/references/plan-execute.md#initial-request-template).
The same reference contains the development prompt output template; both are
included in `npm run prompt:build`. They are built into this project-scoped kit,
not a global setting for unrelated workspaces.

Agent dispatch is deliberately bounded. S-level repairs use 0 subagents by
default and are handled by the main agent. M-level work uses sequential
subagents when needed, and the standard L-level A/B/C chain is also
sequential: only one subagent may be active for a task at a time, and the next
one is dispatched only after the previous one has stopped and its declared
scope has been reviewed. Parallel dispatch is an explicit exception that
requires user authorization and a recorded reason, non-overlapping scopes,
and token tradeoff.


For the requested physical-motion design direction:

```text
$ui-design-agent 请为这个产品实现高质感界面。新项目优先 React 19 / Vue 3、TypeScript、Tailwind 和 Lucide；沿用已有技术栈。使用 Snappy / Playful / Elegant 弹簧和小组级联，真实探测 MCP，完成键盘、移动端与减少动效验收。
```

For a portable system prompt, run `npm run prompt:build`. It produces
`output/ui-design-agent.system.md` by combining the maintained entrypoint and
its motion, routing, design-contract, and acceptance references. The export is
generated, not a second source to edit. The target host still needs its own
skills and MCP setup.

For product documentation and identity presentation:

```text
$ui-design-agent 按内置产品 README 标准整理这个项目。保留产品名，用真实界面截图说明产品，核对运行命令、功能边界、验证记录和许可；不要修改应用或发布仓库。
```

The [product README standard](../.agents/skills/ui-design-agent/references/product-readme.md)
also travels with the exported prompt.

## Using the kit from Codex in an external product workspace

Inside this repository, Codex loads `AGENTS.md` automatically, and `AGENTS.md`
routes UI work to `ui-design-agent/SKILL.md` and its tool routing. A sibling
product workspace (for example `../<product-name>`) inherits none of that: an
agent running there will not read this repository's files on its own.

For UI work in an external workspace, inject the export instead of relying on
discovery:

1. Run `npm run prompt:build` here, then copy `output/ui-design-agent.system.md`
   into the target workspace (or reference it by absolute path).
2. Point the target workspace's own `AGENTS.md` — the file Codex auto-loads
   there — at the export, or pass the export as the developer/system prompt
   for that session.
3. The export embeds the entrypoint and every registered reference in one
   file, so the agent does not need to re-read kit sources: the gates,
   material-confirmation rules, MCP call-trace requirements, and acceptance
   conventions travel with the prompt. The host still supplies its own MCP
   servers and supporting skills.

Evidence and acceptance records stay in the target workspace, per the boundary
rules in `docs/architecture.md`.

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

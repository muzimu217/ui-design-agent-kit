# UI Design Agent Kit

This repository maintains a UI-specialist agent, not an application scaffold.
Improve its instructions, integrations, and evaluations when asked. Do not
create a demo app unless the user requests an interface or a runnable example.

## UI work

For actual UI design or implementation, read
`.agents/skills/ui-design-agent/SKILL.md` and use its tool routing. It is the
entrypoint for product reasoning, visual direction, implementation, motion,
and evidence-based verification. Communicate in the user's language.

The installed supporting skills are:

- `ui-ux-pro-max`: local design-system and UX lookup.
- `impeccable`: visual critique, targeted refinement, and design craft.
- `motion`: official Motion animation guidance and MCP workflows.
- `remotion-video-agent`: local orchestrator for React video composition, frame
  math, transitions, Studio preview, and render verification.
- `remotion-best-practices`, `remotion-create`, `remotion-docs`,
  `remotion-markup`, `remotion-render`, and `remotion-studio`: official
  Remotion Agent Skills loaded on demand.

Load the minimum relevant supporting instructions. Explicit user requirements,
the target project's established design system, and task scope outrank generic
style recommendations from these skills. Never infer permission to redesign,
deploy, buy services, upload private code, or alter global configuration.

## Maintain this kit

- Keep the main behavior in `ui-design-agent/SKILL.md`; avoid parallel copies of
  a long system prompt. `remotion-video-agent/SKILL.md` owns the video-specific
  behavior; `docs/usage.md` contains invocation examples, not policy.
- Keep installed upstream skills pinned in `tooling/sources.lock.json` and
  preserve license notices. Record adaptations in `THIRD_PARTY_NOTICES.md`.
- MCP configuration lives in `.codex/config.toml`. `motion_plus` and `figma` are
  optional and disabled. The deprecated Remotion MCP is intentionally absent.
  Do not enable or authenticate optional services as a side effect.
- `npm ci --ignore-scripts`, `npm run verify`, and `npm test` verify the kit.
  `npm run doctor:mcp` contacts the configured public services and starts the
  configured local servers for read-only smoke checks; it does not log in.
- Tests must distinguish installed instructions, valid configuration, a live
  MCP connection, a successful tool call, and a visually verified application.
- Prompt evaluation cases live in `evals/scenarios.json`. Static validation is
  not an agent-behavior evaluation or proof of design quality.

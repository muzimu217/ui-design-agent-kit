# Design Contract

The design contract is the agent-side equivalent of a DESIGN.md: a compact,
testable record of the visual direction for a substantial new UI. It needs no
MCP server, CLI, or template service. Author it from the brief, the target
project's existing system, and the selected reference baseline. A small edit
does not need one.

The structure follows the public DESIGN.md convention popularized by TypeUI,
adapted to this kit's honesty and verification standards. Keep every field
concrete enough to falsify: a token value, a named component, a state, or a
measurable rule. Do not record intentions such as "polish" or "modern" as
facts. A direction without a named reference baseline is incomplete unless the
search was performed and no compatible example was found.

## Structure

| Section | What it must capture |
| --- | --- |
| Mission | The one sentence the interface exists to do, in product terms |
| Brand | Product or domain context, audience, primary job, target surface, content reality |
| Style foundations | Semantic tokens: color, typography, spacing rhythm, depth, radius, motion presets |
| Accessibility | Contrast target, keyboard path, focus behavior, reduced-motion result, language constraints |
| Writing tone | Voice and language for interface copy and labels |
| Rules: Do | Required implementation practices for this direction |
| Rules: Don't | Anti-patterns and prohibited treatments for this direction |
| Output structure | Required sections, components, and media of the deliverable |
| Component expectations | Interaction and state details per core component |
| Quality gates | Testable checks the finished UI must pass |

## Authoring workflow

1. Inspect the target repository's current UI, routes, tokens, assets, and
   states. If the project already ships an interface, extract its observable
   design system into the contract before choosing a new direction.
2. Record the selected reference baseline: URL or local path, the parts being
   adapted, and the license or permission status.
3. Write the contract in the project's existing design document, or in a
   task-local note if none exists.
4. Implement against the contract. Amend it only when a requirement or a
   verified constraint changes, then state the amendment.

## Template

```markdown
# <Surface> Design Contract

- Mission: ...
- Brand: audience | primary job | surface | content reality
- Style foundations:
  - Color: semantic tokens, not a single accent hue
  - Type: display / reading / instrumentation faces and sizes
  - Spacing: rhythm, default 4px/8px unless the system says otherwise
  - Depth: elevation model; when glass or borders are acceptable
  - Motion: preset per role per motion-contract.md
- Accessibility: contrast target, keyboard path, focus, reduced motion
- Writing tone: ...
- Rules: Do / Don't: ...
- Output structure: ...
- Component expectations: per core component, its states
- Quality gates: measurable checks, mapped to acceptance.md
```

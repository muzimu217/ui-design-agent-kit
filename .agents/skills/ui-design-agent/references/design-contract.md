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
| Writing tone | Voice and language for interface copy and labels; benefit-led CTA framing (attention -> interest -> desire -> action) |
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

## Anti-pattern quick reference

Distinctive work fails in predictable ways. Check the contract's Rules: Don't
against this list before confirming a direction:

| Dimension | Don't (typical AI-slop signals) | Prefer |
| --- | --- | --- |
| Type | Inter/Roboto/Arial/Open Sans everywhere; monospace used as a "tech" signal; big icon above a heading plus rounded corners | A distinctive display face with a refined reading face; modular scale; clamp() fluid sizes |
| Color | Pure black `#000` or pure white `#fff`; AI palettes (cyan-on-dark, purple-blue gradients, neon accents); default dark + glow | oklch/color-mix where supported; neutrals tinted toward the brand; semantic tokens |
| Space | Cards everywhere, cards nested in cards; hero-metric template; centering everything | Varied spacing for rhythm; clamp() fluid spacing; useful density |
| Motion | Animating layout properties; bounce/elastic easings everywhere | State-change transitions; exponential easing (ease-out-quart/expo); presets per motion-contract |
| Interaction | Repetitive information; every button styled as primary | Progressive disclosure; instructive empty states; one primary action |
| Responsive | Hiding critical features on mobile | Container queries; mobile-first breakpoints |

## Delivery hardening

The contract's Component expectations and Quality gates should cover:

- Touch targets at least 44px; keyboard-visible focus; the full state set per
  interactive element (default, hover/pressed, disabled, loading, focused,
  selected, plus empty and error states where relevant).
- Text scaling: the layout survives browser text scaling up to 200%.
- Breakpoints: a stated strategy, for example base 320px, 640px, 1024px,
  1280px, with component behavior per range.
- QA protocol: a same-viewport parity comparison against the reference or
  contract, plus the acceptance record from acceptance.md.

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

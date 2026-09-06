# UI Designer Thinking Model

Six design stages from problem to verified product, adapted for agent
execution. Think in stages, not one silent pass: consult the user at each
stage's decision point. The stages are the thinking kernel; the confirmation
gates in `chain-flow.md` are the process gateways.

## The six stages

| # | Stage | Core question | Agent actions | Stage output | Related gate |
| --- | --- | --- | --- | --- | --- |
| 1 | Problem and goal definition | Why & What | Split the requirement: which user pain point; new feature or redesign; map the business goal to a UI strategy; list constraints (timeline, framework, platform norms) | Goal statement + constraints | Gate A (direction draft) |
| 2 | User scenarios and journey | Who, When, Where | Identify user mindset (impatient, exploring, focused); trace entry -> core task -> exit; design abnormal states (offline, empty, loading, error) | Journey notes + state list | Gate A |
| 3 | Information architecture and hierarchy | Structure & Hierarchy | Prioritize information: CTA first, key support second, secondary third; group by gestalt (proximity, similarity, closure); whitespace rhythm; low-fi wireframe before color and type | Structure sketch / wireframe | Gate A + contract |
| 4 | Visual exploration and system rules | Visuality & Consistency | Establish tone from the product position; color system (brand, auxiliary, status, neutral) with WCAG contrast; type scale; 8pt/4pt grid; reuse the design system and UI kit (atoms -> molecules -> organisms) | Style foundations in the contract | Gate B (materials) + Gate D (contract) |
| 5 | Interaction details and handoff | Interaction & Handoff | Full states per interactive element: default, hover/pressed, disabled, loading, focused; micro-interactions and transitions with physical intuition; responsive behavior; design QA parity check | Implemented page with state coverage | Gate E (per round) |
| 6 | Data verification and iteration | Data & Iteration | Watch metrics (CTR, conversion, dwell time, bounce); usability feedback and friction points; A/B or controlled variations. Without live product data, use the user's confirmation rounds as the iteration signal | Verification record + iteration rounds | Gate E (until confirmed) |

## Self-questioning checklist

Before each substantial page, ask:

1. Is the first thing the user sees the most critical information? (visual focus)
2. Does this button or entry look clickable? (affordance)
3. Does the UI collapse under extremes such as very long text or no network? (robustness)
4. Does this visual match the established design system? (consistency)
5. What does it cost to implement, and is there a more economical equivalent? (engineering mindset)

## Operating rules

- Advance stage by stage; present each stage's decision point to the user and
  consult before proceeding. Do not complete a substantial UI in one silent pass.
- A stage's output feeds the next: do not jump to stage 5 implementation while
  stages 1-4 are unconfirmed by the user.
- Stage 6 without live data means the user's confirmation rounds: per-page
  issue lists, replacement proposals from proven market implementations, and
  user-selected repair rounds until confirmation.
- This model complements, not replaces, the design contract and acceptance
  records: stages shape the thinking, gates shape the process.

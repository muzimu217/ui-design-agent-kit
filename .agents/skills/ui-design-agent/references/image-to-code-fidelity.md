# Image-to-Code Fidelity Loop

Use this workflow when the user supplies a screenshot, generated UI image,
Figma handoff, design specification, or asks to improve visual fidelity. The
goal is a repeatable design-to-code loop, not a claim that an image alone
contains all implementation truth.

## Source-of-truth hierarchy

Resolve inputs in this order and record what is missing:

1. **Structured handoff**: Figma nodes/variables, measured viewport, design
   tokens, font files, spacing rules, component states, and approved assets.
2. **Inspectable reference**: a permitted live page or component source whose
   layout and behavior can be examined.
3. **Screenshot or generated image**: visible composition, relative hierarchy,
   apparent color, typography shape, and visible states only.
4. **Agent inference**: implementation assumptions required to make the page
   runnable. Label these as inferred and keep them reversible.

Never upgrade a lower-level observation into a higher-level fact. A screenshot
does not prove CSS values, breakpoints, font family, interaction behavior,
asset licensing, or responsive intent. A Figma frame does not prove production
copy, backend behavior, or accessibility unless those are handed off too.

## Input classification

Before writing UI code, classify the handoff:

| Input | Extract first | Must disclose |
| --- | --- | --- |
| Screenshot-only | image dimensions, viewport clues, regions, visible states, approximate relationships | unknown font, exact values, hidden states, asset provenance |
| Screenshot + spec | viewport, color tokens, type scale, spacing, radii, breakpoints, states | any conflict between pixels and spec |
| Figma connector | node tree, Auto Layout, variables, text styles, assets, exported reference image | connector availability, auth boundary, missing production behavior |
| Live reference | permitted DOM, computed layout, CSS variables, interaction states | source license and what is research vs reused code |

If the input is screenshot-only, request missing details only when they
materially affect the result: target viewport, font source, responsive states,
interactive states, and whether supplied images may be reused. Otherwise infer
conservatively and mark the inference in the fidelity brief.

## Fidelity brief

Create a task-local `fidelity-brief.md` (or the target project's equivalent)
before implementation. Keep it short and measurable:

```markdown
# Fidelity Brief

Source: [path or URL] | kind: screenshot / spec / Figma / live reference
Target: [route or artifact] | viewport: [width x height]
Known: [measured facts and supplied tokens]
Inferred: [estimated values that remain reversible]
Regions: [hero, navigation, media, controls, content, footer]
Typography: [family source, size, weight, line-height, confidence]
Components: [states and interaction contracts]
Assets: [path, license/permission, alt text, fallback]
Responsive: [375/768/1024/1440 or product-specific matrix]
Acceptance: [observable visual and behavioral checks]
```

For a supplied image, preserve the original file and record its dimensions.
Do not crop the source and call the crop a shipping asset. If a source cannot
be stored or licensed, use it for visual research only and implement with
project-owned code/assets.

## Implementation loop

1. **Inventory** the target repository, route, tokens, fonts, assets,
   dependencies, and current states. Confirm the target workspace boundary.
2. **Inspect** the supplied source at its native dimensions. Name salient
   regions and visible states; use a permitted DOM/Figma source when available.
3. **Extract constraints** into the fidelity brief: container geometry, grid,
   spacing rhythm, type roles, colors, media boxes, controls, breakpoints, and
   state transitions. Separate measured, supplied, observed, and inferred data.
4. **Write the design prompt/contract** that states what must remain invariant,
   what can be adapted, the reference baseline, and the acceptance conditions.
5. **Build a complete first pass** in the existing stack. Reserve media space,
   implement semantic controls and visible states, and keep unknown values
   easy to revise.
6. **Render at the reference viewport** using the real browser. Capture the
   same route and state as the supplied reference. Compare by region: geometry,
   hierarchy, type, color, media crop, controls, and whitespace. Use overlays or
   image diffs when an authorized tool exists; otherwise use measured DOM boxes
   plus side-by-side screenshots. Do not invent a pixel score.
7. **Repair once as a batch**: fix the highest-impact mismatches together,
   then capture a confirmation render. Repeat only when a concrete defect or
   new user requirement justifies it. Do not endlessly polish from memory.
8. **Verify behavior and resilience**: keyboard path, focus, loading/error/
   success states, mobile/desktop matrix, text scaling, reduced motion, asset
   loading, and console errors. Preserve the source/implementation comparison
   in the handoff.

## Fidelity claims

Community reports such as “80% with Codex + Figma” or “95% with a constrained
Figma workflow” are anecdotal context, not benchmarks for this kit. Do not
repeat them as product promises. Only report a percentage when the task defines
the reference image set, viewport, metric, tolerance, and comparison artifact.
Otherwise use evidence-based language such as “same viewport inspected” or
“spacing and type remain unverified.”

## Routing and boundaries

- An authenticated Figma connector may provide structure and exported images;
  it is optional and must remain disabled when unavailable.
- OpenDesign, product-design plugins, and named community tools are candidate
  references until their publisher, schema, license, and connection are
  verified. Never invent a command or claim that a plugin ran.
- Browser screenshot comparison is a verification step, not proof of source
  code reuse. Adapt observable relationships with the target project's own
  implementation and licensed assets.
- Generated products, comparison images, and fidelity briefs belong in the
  target product workspace. Do not copy them into the agent-kit root or change
  the kit's package graph to host a one-off demo.

## Handoff minimum

Report the source kind, known/inferred boundary, target viewport, implemented
regions, comparison method, repair count, actual screenshots, interaction
checks, and remaining unverified facts. Separate visual evidence from tool
connection evidence and from subjective quality judgment.

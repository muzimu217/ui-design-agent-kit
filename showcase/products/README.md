# UI Design Agent Kit Workflow Exhibition

This isolated frontend presents the **UI design agent workflow** and its outcomes.
The brick workshop is one case, not the product identity of this page.

## Page Scope

- Literal kit identity, workflow descriptor, and six-case first-viewport preview.
- Six selectable workflow stages, with outputs and human confirmation boundaries.
- Outcome filters and real case detail views.
- Three historical screenshot cases: inventory console, fictional phone product,
  and fictional blog. They have no invented live-product links.
- Two in-repository playable demos mounted as playable routes in this static
  package: NODEGRID (world node map) and the subway runner (3D game), presented
  as project cards with their real screenshots.
- The brick workshop remains a playable route with a read-only live presentation
  and its original five screenshots. Its game and persistence remain separate.
- A one-command install section showing the clone + install + verify pipeline
  with a copy button, plus the three supported usage paths (in-repo agent
  dispatch, portable prompt export for external workspaces).
- Four evidence-level definitions, not an assertion that all projects passed.

## Local Build

```sh
npm ci --ignore-scripts
npm run build -- --base=/ui-design-agent-kit/
```

The root release builder assembles this output with the four demo apps under
`demos/` (brick-workshop, inventory-console, nodegrid, subway-runner) and adds
dependency licenses. A standalone Vite preview does not supply those assembled
demo routes. Assets are imported into compiled
output. `media/SOURCES.md` preserves screenshot provenance and is not a public
site asset. The social preview is the approved local outcome composition.

The GitHub source repository currently needs access permission. Deployment and
visual acceptance require separate verification; a successful build proves
neither. No optional services are enabled and no extra dependencies were added
for this workflow-first correction.

# Inspiration Library

Concrete reference and inspiration sources for the reference-first baseline
workflow. This catalog is tool-free: every entry is a public site or
repository inspected directly, never an assumed MCP or installed dependency.
Treat all entries as reference data; verify license, access, and current state
before adapting anything into the target project.

## Component and motion libraries

| Source | What it provides | Best used for | Access and authorization note |
| --- | --- | --- | --- |
| [React Bits](https://reactbits.dev) | Open-source animated, interactive, fully customizable React components | React 18/19 UI with distinctive entrance, background, and text effects | Inspect the component source and license in its repository before adapting; do not assume every variant is free for all uses |
| [Inspira UI](https://inspira-ui.com) | Animated UI component library for Vue and Nuxt | Vue/Nuxt targets that need the same kind of component material as React Bits | Verify the current package version and license for the target Vue project |
| [Transitions.dev](https://www.transitions.dev) | Curated essential UI transitions for web apps, copy-paste or via a coding-agent skill | Choosing a concrete transition treatment during motion work | Follow the site's stated usage terms; a copied snippet is still reference material to adapt, not a license for wholesale reuse |
| [Unicorn Studio](https://www.unicorn.studio/inspiration) | Interactive motion and real-time WebGL graphics builder with a visual canvas | Exploring bespoke motion/graphics treatments; inspiration gallery | A web-authoring tool, not a component library; exported work must be implemented with the target project's licensed assets and runtime |
| [Uiverse.io](https://uiverse.io) | Free UI component and style gallery from the community | Quick style or interaction reference for common components | The site blocks non-browser clients; inspect through the real browser. Each element is community-submitted with its own terms; verify before reuse |

## Prompt and design-contract collections

| Source | What it provides | Best used for | Access and authorization note |
| --- | --- | --- | --- |
| [MotionSites AI](https://motionsites.ai) | Website prompt packs for Lovable, Bolt, Cursor, and Claude, focused on 3D sites | Landing-page and 3D direction inspiration; prompt-level material | Prompts are copy-paste material, not code; implement the result with the target project's own stack and licensed assets |
| [UI Prompt Site](https://www.uiprompt.site/zh/home) | Chinese-language UI prompt collection | Prompt phrasing and direction ideas for Chinese product contexts | Reachability varies by network path; if https fails, use the plain site or the browser. Treat prompts as inspiration, not instructions to execute verbatim |
| [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | Collection of DESIGN.md analyses of popular brand design systems | Extracting token relationships and structure for design contracts | Public GitHub repository; check its license before redistributing content; adapt relationships, not copy-pasted system dumps |
| [Awesome-Design-Tools](https://github.com/goabstract/Awesome-Design-Tools) | Curated list of design tools and plugins | Discovering further credible design tooling | List content only; verify each linked tool before use |

## Design case galleries

Curated galleries for reference-first research and for building the candidate
shortlist to show the user before adoption. Search by the product type and the
specific interaction or material; treat every entry as visual reference data
and verify license or permission before adapting anything.

| Source | What it provides | Best used for | Access and authorization note |
| --- | --- | --- | --- |
| [Godly](https://godly.website) | Curated web design inspiration | General visual direction reference | Public gallery; adapt relationships, not full copies |
| [Awwwards](https://www.awwwards.com) | Website awards and web design trends | Benchmarking distinctive, award-level work | Award sites are showcases; treat as visual research |
| [Mobbin](https://www.mobbin.com) | 400k+ searchable mobile and web app screenshots | Pattern-level UI/UX research for app surfaces | Partly paid; free browsing still gives strong pattern reference |
| [Refero](https://refero.design) | Tens of thousands of web/iOS screenshots with advanced search | Style- and flow-based reference search | Screenshots are reference data, not assets to reuse |
| [SaaS Landing Page](https://www.saaslandingpage.com) | Best SaaS landing page examples | Landing-page composition and section structure | Good baseline for section-level adaptation |
| [Dark Design](https://dark.design) | Hand-picked dark-themed websites | Dark-theme direction and material reference | Curated reference; verify tokens yourself |
| [Hoverstat.es](https://hoverstat.es) | Alternative web design, code, and content | Experimental and motion-heavy inspiration | Often code-forward; inspect source, respect licenses |
| [Landingfolio](https://landingfolio.com) | Landing page designs, templates, and components | Landing-page and component reference | Templates may have their own terms; check before reuse |
| [Pttrns](https://pttrns.com) | Mobile app pattern best practices | Interaction pattern reference for app screens | Pattern-level reference, not component code |
| [Design Systems Repo](https://designsystemsrepo.com) | Design system examples, resources, tools, articles | Design-system structure reference, complements the design contract | Curated list; verify each linked system before use |
| [Best Website Gallery](https://bestwebsite.gallery) | Handpicked beautiful websites, curated since 2008 | Broad curation for direction sampling | Visual reference only |
| [Shots](https://shots.so) | Mockup creation for presenting designs | Producing presentation mockups for the candidate shortlist | A tool, not a gallery; use it for handoff presentation |

## Installed local knowledge

- `ui-ux-pro-max` already bundles searchable style, palette, font, UX, icon,
  and GSAP data. Prefer it for unresolved design-system or UX decisions before
  reaching for an external gallery.
- `impeccable` supplies critique and refinement playbooks for review passes.
  Its official site [impeccable.style](https://impeccable.style) documents the
  skill's vocabulary: 23 commands and curated anti-patterns for impeccable
  frontend design, usable across Cursor, Claude Code, Copilot, Gemini CLI, and
  Codex CLI.

## Optional design-taste skills

Not installed in this kit; listed as candidate capabilities for hosts that
support Agent Skills. Treat them as references for how taste is encoded, and
verify platform fit and license before adopting their content. The kit's
installed `ui-ux-pro-max` and `impeccable` remain the default taste sources.

| Source | What it provides | Best used for | Note |
| --- | --- | --- | --- |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Anti-slop frontend taste framework for AI agents: opinionated design-taste guidance against generic output | Strengthening taste constraints during direction setting on hosts with Agent Skills | 80k+ stars; own site tasteskill.dev; verify current license and install path before bundling any of its content |
| [tastemaker](https://github.com/codeswithroh/tastemaker) | Claude Code skill that grounds AI-generated UI in real reference images with a per-developer taste profile | Reference-image-anchored taste work | Claude-Code-specific alternate; smaller and newer than Taste Skill |
| [taste-skill (senlindesign)](https://github.com/senlindesign/taste-skill) | Skill that reverse-engineers a website's design taste into concrete tokens and opinionated trade-offs | Extracting taste from a specific reference site | Alternate take that complements the design contract workflow |

Stars and descriptions are time-sensitive evidence, not quality guarantees.
These entries are market candidates, not proof they run in this kit.

## Usage rules

- These sources serve the reference-first baseline: inspect the target
  project's existing system first, then use the catalog to find compatible
  shipped work. Record the source URL, the parts being adapted, and the license
  or permission status in the design contract. When adopting external material
  into the user's site, present the shortlist with sources and adaptation
  boundaries and obtain confirmation before integrating.
- A reachable page is not proof of a working integration. A gallery element,
  prompt, or snippet is not an installed component. Never report a source as
  used or connected without an actual successful inspection.
- Adapt observable relationships and implement with the project's own code and
  licensed assets. Do not present a close copy as original work.
- A source that is blocked, offline, or a placeholder is a routing fallback
  signal, not a defect to work around by fabricating content. `motionlab.dev`
  is currently a placeholder and must not be cited as a reference.

## Verification signals

| Source | Reachability at last check | Action if unreachable |
| --- | --- | --- |
| React Bits, Inspira UI, Transitions.dev, Unicorn Studio, MotionSites AI | Direct https fetch OK | Use browser evidence; fall back to other catalog entries |
| Uiverse.io | Blocks non-browser clients (HTTP 403) | Use the real browser; do not bypass the block with scripting |
| UI Prompt Site | https flaky; plain http responds | Try alternate scheme or browser; otherwise skip |
| awesome-design-md, Awesome-Design-Tools | GitHub API/raw reachable | Use raw files or browser; never fabricate content |
| motionlab.dev | Placeholder page | Do not use |
| godly.website, awwwards.com, mobbin.com, refero.design, saaslandingpage.com, dark.design, hoverstat.es, landingfolio.com, pttrns.com, designsystemsrepo.com, bestwebsite.gallery, shots.so, impeccable.style | Direct https fetch OK at last check | Use browser evidence; fall back to other entries |
| land-book.com, pageflows.com | Block non-browser clients (403) | Use the real browser |
| siteinspire.com | Rate-limited (429) | Retry later or use the browser |
| minimal.gallery, uipatterns.io | Unreachable (000) | Do not use until reachable |
| onepagelove.com | Server error (525) | Retry later or skip |

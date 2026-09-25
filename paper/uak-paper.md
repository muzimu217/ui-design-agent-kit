---
title: "UAK: A Gated, Evidence-Driven UI Design Agent Workflow"
author:
  - name: "Cheng Li"
    affiliation: "University of Electronic Science and Technology of China, Chengdu College"
    city: "Chengdu"
    country: "China"
    email: "1278844978@qq.com"
abstract: |
  Large language models can now generate plausible user-interface code, but the
  surrounding practice remains ad hoc: requirements, design decisions, tool
  claims, and acceptance evidence are interleaved in a single conversation, and
  an agent's textual self-report is routinely accepted as proof of success. We
  present the UI Design Agent Kit (UAK), a project-scoped agent kit that treats
  UI generation as a gated, evidence-driven workflow rather than a single
  prompt. UAK separates Plan and Execute modes around six gates — five
  human-adjudicated (direction, materials, prototype, contract, per-round
  acceptance) and one agent-side (MCP call evidence) — wraps every gate
  presentation in a detail-critique
  inner loop, and replaces self-reported success with a five-level evidence
  ladder that only ends at a visually verified rendered page. A gate ledger
  records every decision the user still owes, with decay rules for stale items
  and batch adjudication. Behavior is pinned by a 60-scenario evaluation
  corpus at the release snapshot (67 scenarios, 16 executed as of
  2026-09-23); five scenarios had been executed over ten recorded rounds
  under a
  deterministic 0--2 rubric with fail-zeroing, and a separate eight-dimension
  style review shows that a functionally perfect dashboard initially scored
  63/100 on style, exposing a failure mode that functional rubrics do not see.
  We describe the architecture, the workflow, the ledger mechanics, and three
  case studies, and we state explicitly what the current evidence does and does
  not show: all scores were recorded inside the same co-design loop by a single
  maintainer, and we report no head-to-head comparison against other UI
  generation systems.
keywords: "design agents, human-in-the-loop, LLM workflows, UI generation, evidence-based verification"
thanks: "Preprint. DOI: 10.5281/zenodo.22804947. The kit, evaluation data, and gate records are public: https://github.com/muzimu217/ui-design-agent-kit"
doi: 10.5281/zenodo.22804947
numbersections: true
header-includes: |
  \settopmatter{printacmref=false, printfolios=true}
  \renewcommand\footnotetextcopyrightpermission[1]{}
  \pagestyle{plain}
  \AtBeginDocument{\pagestyle{plain}}
---

# Introduction

Ask a coding assistant for a user interface and something plausible arrives in
seconds. Ask instead *what was decided, on what evidence, and who approved it*,
and the answer usually dissolves: the requirement, ten design decisions, three
tool calls, and a screenshot chosen by the model itself are interleaved in one
conversation. Two failure modes follow. First, direction errors are discovered
late — the agent built the wrong thing fluently, and the fastest path to the
right thing is a rewrite. Second, success is claimed in the same channel that
performed the work: "the page now works responsively" is a textual self-report
about a rendered artifact, and language models have no reliable access to their
own outsides.

The UI Design Agent Kit (UAK)[^repo] is an attempt to fix the *workflow* rather
than the model. UAK is a project-scoped kit of agent instructions, tool
routing, MCP configuration, diagnostics, and behavior evaluations. It is not an
application scaffold and not a runtime: the repository's durable outputs are
instructions and contracts, and every UI product it generates lives outside the
kit (or in strictly isolated showcase fixtures). The agent that operates under
UAK's instructions does what ordinary agents do — retrieve, plan, generate
code, and verify — but it may not move between phases without passing gates,
and it may not claim success below a defined evidence level.

[^repo]: https://github.com/muzimu217/ui-design-agent-kit — the kit described
in this paper; the repository also contains all evaluation data, gate records,
and case-study artifacts referenced below.

Three design positions, each traceable to a concrete mechanism, summarize the
kit:

1. **Decisions are gated, not streamed.** A substantive UI task passes six
   gates (A: direction draft; B: material selection; C: no-code prototype; D:
   design contract; F: MCP call evidence; E: per-round acceptance) — five
   present a bounded artifact to the user and stop; one (F) is agent-side and
   demands call traces. Plan mode and
   Execute mode are separated by an explicit plan lock: code is written last,
   and only against a frozen plan revision.

2. **Claims carry evidence levels, not adjectives.** Five levels — Installed,
   Configured, Connected, Called, Visually verified — are reported separately,
   and no level is inferred from a lower one. A passing unit test does not
   prove a screen is visually correct; a successful MCP handshake does not
   prove the agent used the tool correctly. The top of the ladder is always a
   rendered page inspected in a real browser.

3. **Debt is written down.** Anything that stops at a gate waiting for the
   user is recorded in a gate ledger with its evidence location and a
   round-counter, so that unresolved decisions are visible in one place, stale
   P2 items decay by rule, and accumulated items surface as a batch-adjudication
   package.

This paper documents UAK as an artifact: its architecture (§3), the gated
workflow (§4), the gate ledger (§5), the evaluation apparatus and executed
runs (§6), and three case studies (§7). §8 discusses limitations — including
the honest one that all quantitative evidence in this paper was recorded inside
the same single-maintainer co-design loop that produced the system, and that we
make no baseline comparison against other UI generation systems.

# Related Work

**LLM-based UI and front-end code generation.** A growing body of work applies
multimodal LLMs and VLMs directly to front-end artifacts. Design2Code
[@si2025design2code] formalizes screenshot-to-code generation over 484
real-world webpages and shows that even frontier VLMs leave a measurable gap to
human-authored pages. Web2Code [@yun2024web2code] contributes a large-scale
webpage-to-code instruction dataset plus an evaluation framework for multimodal
LLMs, and Sketch2Code [@li2025sketch2code] extends the setting to low-fidelity
hand-drawn sketches for interactive design prototyping. UICoder
[@wu2024uicoder] fine-tunes LLMs for SwiftUI generation using compiler- and
VLM-driven automated feedback instead of human annotation. These efforts
advance the generators, datasets, and fidelity benchmarks. UAK is complementary
rather than competitive: it introduces no new model or benchmark and reports no
head-to-head comparison with these systems. Instead it treats any such
generator as a pluggable executor and contributes the surrounding workflow —
staged Plan and Execute modes, human-adjudicated gates, and explicit evidence
requirements — under which generation is proposed, inspected, and accepted.

**Agentic verification, self-critique, and oversight.** Reflexion
[@shinn2023reflexion] converts environment failures into verbal
self-reflections held in episodic memory, and Self-Refine [@madaan2023selfrefine]
runs generate–feedback–revise loops in which the model critiques its own
output; in both, the generator's judgment is the acceptance criterion.
Constitutional AI [@bai2022constitutional] supervises model behavior with an
explicit, written set of principles applied through AI feedback — an early
template for encoding policy as an inspectable artifact, akin to UAK's gate
rules. GuardAgent [@xiang2025guardagent] instantiates a dedicated guard agent
that checks another agent's actions against knowledge-enabled rules before
they execute, anticipating gate-based control but with automated rather than
human adjudication. SWE-agent [@yang2024sweagent] demonstrates that
agent–computer interface design — compact file viewers, guarded editing,
executable tests — materially changes what agents can accomplish and verify,
supporting UAK's insistence that claims be checked through executable
affordances such as build tools and a rendered browser. UAK differs by making
acceptance an explicit human decision at gates A–F, recorded in a gate ledger
with batch adjudication, and by discounting unverified textual self-reports
entirely.

**Evaluating generative UI and design quality.** LLM-as-a-judge research
establishes that strong models approximate human preferences at scale:
MT-Bench [@zheng2023judging] reports high agreement between GPT-4 judges and
humans while documenting position, verbosity, and self-enhancement biases —
findings that motivate UAK's deterministic, criterion-local rubric over
free-form model judgment. For UI quality specifically, UIClip [@wu2024uiclip]
learns a model that scores screenshots for design defects and preference; it
shows design quality is partially measurable automatically, but an opaque
learned score offers no criterion-level accountability or provenance.
Functional benchmarks move evaluation toward rendered behavior: WebGen-Bench
[@lu2025webgenbench] assesses LLM agents that build multi-file websites by
executing and inspecting the results, including visual design. UAK adopts the
same functional stance — claims must survive contact with a rendered page — but
pairs it with a transparent rubric: each criterion is scored 0–2 by a human
adjudicator, a failing criterion zeroes the total, and screenshots at defined
evidence levels form the audit trail. These are presented as design choices,
not as validated replacements for instrumented benchmarks.

**Foundations.** UAK's agent substrate builds on the standard
reasoning-and-acting paradigm: chain-of-thought prompting [@wei2022chainofthought]
elicits intermediate reasoning, and ReAct [@yao2023react] interleaves reasoning
traces with tool actions, which is the execution model of UAK's Execute mode.
Our contribution is orthogonal to these foundations: rather than improving the
policy that proposes actions, UAK adds a control plane around such loops —
plan/execute separation, gates A–F with human adjudication, the evidence
ladder, and the gate ledger — that constrains when an agent may proceed and
what counts as proof of success.

# Architecture

UAK is maintained as a repository whose *product is the agent kit itself*:
instructions, routing rules, verified tool integrations, diagnostics, and
behavior evaluations. The boundaries are strict:

- **Kit source of truth** — `.agents/skills/` (entrypoints, references,
  supporting skills), `.codex/config.toml` (project-scoped MCP configuration),
  `scripts/` (prompt export, verification, diagnostics), and `tests/` +
  `evals/` (structural checks and behavior contracts).
- **In-repository showcase** — `showcase/` and isolated `demo/` fixtures that
  illustrate the kit. They are never imported by the agent runtime: no root
  script, skill instruction, MCP configuration, or package workspace may
  reference them.
- **External task workspace** — the default home of a generated product is a
  sibling directory with its own package state and dev server, so that
  generated product work cannot add routes, dependencies, or claims to the kit.
- **Disposable artifacts** — generated prompt exports and raw browser evidence
  are gitignored and reproducible.

**Skill routing.** A single main instruction (`SKILL.md`) owns product
reasoning, tool routing, and delivery standards; a dozen supporting skills are
loaded on demand (design-system lookup, visual critique, motion guidance,
Remotion video composition). The instruction set distinguishes what must always
hold (gates, evidence, isolation) from what is looked up when needed, keeping
the always-present prompt small enough to be followed.

**Tool configuration and MCP.** Tool access is declared in one project-scoped
configuration file. Capabilities present in the configuration are reported as
*Configured*; a live handshake as *Connected*; a specific tool returning
expected output as *Called*. Optional, higher-risk services (image generation,
design-tool MCPs) ship disabled by default and are never authenticated as a
side effect of installation.

**Evidence levels.** Table 1 defines the five levels that every claim in the
workflow must be tagged with. The governing rule is non-inference: no higher
level may be inferred from a lower one. The levels deliberately make
*visually verified* — a rendered page inspected in a real browser, with
screenshots and interaction checks retained as artifacts — the only level at
which a UI claim may be called done.

| Level | Meaning | Example |
|:------|:--------|:--------|
| Installed | Local skill/config exists and passes structural validation | kit test suite passes |
| Configured | Server entry present but not contacted | configuration check |
| Connected | MCP handshake and tool listing succeeded | doctor reports server up |
| Called | A specific tool returned expected evidence | motion doc resource read |
| Visually verified | Target rendered and behavior inspected in a real browser | screenshot + interaction check |

: The five evidence levels. No level is inferred from a lower one; a UI claim
is "done" only at the last.

**Governance as code.** The workflow itself — stages, gates, task grading,
status vocabulary — has a machine-readable single source of truth
(`tooling/workflow-stages.json`), and drift tests fail the kit's own test run
if the prose documentation and the showcase's stage track diverge from it. The
kit is thus partially self-describing: this paper's Figure 1 is redrawn from
the same specification that its tests enforce.

# The Gated Workflow

Figure 1 shows the full chain for a substantive new UI. Its two halves — Plan
mode and Execute mode — are separated by an explicit authorization step, and
its connective tissue is a detail-critique inner loop that runs before every
gate presentation.

![The UAK gated workflow. Plan mode (stages 0–2) ends in a plan lock; Execute mode (stages 3–7) runs gates C–F and multi-round acceptance. Filled gates are user adjudication points; outlined gates (D, F) are conditional or agent-side. The inner-loop rail applies to every gate presentation, and the S/M/L grading scales the chain to task size. (Redrawn from the machine-readable stage specification in the repository; canvas source: paper/assets/fig-workflow.html.)](paper/assets/fig-workflow.png){.wide width=92%}

**Plan mode.** Plan mode covers requirement intake, the direction draft, and
material scouting, and it writes no implementation code. The direction draft
(visual baseline, structure sketch, motion intent) is presented at **Gate A**
before any material search or code; material candidates arrive with source,
screenshot, and license boundary, and **Gate B** makes selection binding —
unselected material may not enter the prototype or the implementation. Plan
mode ends in a **plan lock**: the user explicitly approves a frozen plan
revision, and "one-click execute" merely triggers that approval; it never
auto-passes a gate. If brand, scope, selected materials, or the prototype brief
change later, the plan is marked stale and the affected earliest decision is
revisited; a mere implementation defect keeps the plan locked and takes a
local repair.

**Execute mode.** Execution produces a *no-code* prototype first (a generated
image, a paste-ready image-generation prompt the user can run in an external
tool, or a reference screenshot board assembled from real browser captures of
selected materials — all three are equivalent Gate C artifacts). Only after
**Gate C** passes is a design contract written (semantic tokens, do/don't
rules, motion spec, responsive constraints) — **Gate D** confirms it for large
or motion-heavy tasks — and only then is code written, by a dispatch-limited
subagent. **Gate F** is agent-side but hard: design and implementation must
make real MCP tool calls, and the acceptance record must list the call traces
(server, tool, result) per stage; *no call traces means no completion claim*,
and unreachable servers must be recorded as tried-and-degraded, never
silently skipped.

**The detail-critique inner loop.** Every artifact is self-critiqued before it
reaches a gate: components and interactions are reviewed along eight dimensions
(layout rhythm, typography, measured contrast, state coverage, motion
compliance, affordance, robustness, consistency), findings are triaged P0/P1/P2,
fixable items are fixed and re-checked, and unfixed items are disclosed with
severity and reason. The division of labor is explicit: gates are where the
user adjudicates *direction*; the inner loop is where the agent adjudicates its
own *craft* — what it can discover itself, it must not leave for the user to
discover at the gate.

**Multi-round acceptance.** After implementation, acceptance is not a single
screenshot. Each round is a real-browser walkthrough (keyboard journeys, click
paths, motion under normal and reduced-motion settings, interruption behavior)
that produces per-page issue lists — every item with P0/P1/P2 severity and an
evidence anchor — plus replacement suggestions drawn from a curated library of
strong market references. The user selects what to fix; one evidence-backed
repair round executes; the walkthrough repeats until the user confirms or
stops the loop. Unfixed P0 issues forbid any claim of completion.

**Task grading.** The full chain is proportionate to task size: **S** (narrow
fix: single component or defect, no direction or material gates, one
evidence-backed acceptance round), **M** (page-level: new page or component
group, lite gates), and **L** (substantive new UI: the full chain). Grading is
itself gated — each page's level is confirmed by the user before any
shortcut is taken, and a narrow fix may not masquerade as a redesign or vice
versa. Subagent dispatch is bounded by the same philosophy: one main agent,
at most one active subagent, roles queued A → B → C; concurrency beyond that
requires explicit user authorization with recorded reasons.

# Human-in-the-Loop: the Gate Ledger

Gates create decision debt. Every artifact that stops at a gate waits for a
human, and in an iterative project those waiters accumulate and scatter across
chat logs. UAK's gate ledger is a single authoritative registry for all of it:
one row per pending decision, with the gate it stopped at, a one-line
statement, the evidence location, the date first raised, a round-counter, and
a status (`open` → `approved` / `declined`, or `auto-declined` with date and
reason). Adjudicated rows are never deleted; they are backfilled.

Two rules keep the ledger honest without automating the human out of the loop.
*P2 decay*: low-severity (P2) acceptance items that go unclaimed for two
consecutive adjudication windows are auto-declined with a trace — but
direction-class items at gates A/B/C never decay automatically, because an
automatic round must not be able to pass a direction gate in place of the
user. *Batch adjudication*: when open items reach eight (or when the user
asks), the main agent compiles a one-page package — item, evidence pointer,
one-line recommendation — for per-item ruling; the package aggregates the
*asking*, not the *deciding*. At the time of writing the ledger holds 13 open
items (four at Gate A, four at Gate B, two at Gate C, three at Gate E),
migrated from pre-ledger sprints, with four policy decisions (D1–D3, D5:
the decay windows, the batch threshold, per-page grading confirmation, and
batch-package semantics) already adjudicated and one (D4, a component
library's per-case adoption procedure) explicitly parked pending user ruling.

The ledger is the mechanism that lets the rest of the workflow be aggressive
about stopping: because nothing pending can be forgotten, the workflow can
afford to halt early and often.

# Evaluation

UAK's evaluation has two layers that must not be conflated: a *behavior
contract corpus*, which specifies what the agent should do, and *executed
runs*, which record what it actually did under a deterministic rubric.

**Corpus.** `evals/scenarios.json` holds 60 scenarios at the release snapshot
(65 as of 2026-09-23), each a natural-language
request with context, pass criteria, and fail conditions — covering product
types (dashboard, 3D scene, marketing page, blog), motion-parameter
compliance, degraded and unavailable tools, reduced-motion behavior, long-list
handling, and video transitions. Static checks only validate structure;
running a scenario is a separate, recorded act. The kit's own documentation is
not allowed to blur this line.

**Rubric and executed runs.** Each pass criterion is scored 0 (not done),
1 (done without full evidence), or 2 (done with evidence); hitting any fail
condition zeroes the scenario; the scenario score is
$100 \times \mathrm{earned} / (2 \times \mathrm{criteria})$, rounded. At the release snapshot, five
scenarios had been executed, over ten recorded rounds, on the inventory
operations console (an internal dashboard demo) and on four workflow-behavior
probes (16 scenarios across 23 recorded rounds as of 2026-09-23);
Table 2 summarizes. All executed rounds scored 100 on their functional
criteria — unsurprising for scenarios designed alongside the system — and the
informative signal is elsewhere.

| Scenario | Focus | Crit. | Rnds | Func. | Style |
|:----------------|:------------------------------|:------:|:------:|:---------:|:---------:|
| inventory console | operations dashboard build | 5 | 6 | 100 (all) | 63 → 94 → 100 |
| reference-first | reuse and adaptation discipline | 6 | 1 | 100 | n/a |
| direction draft | Gate A behavior | 4 | 1 | 100 | n/a |
| material confirmation | Gate B behavior | 4 | 1 | 100 | n/a |
| prototype before code | Gate C behavior | 4 | 1 | 100 | n/a |

: Executed evaluation runs. "Rnds" counts recorded rubric applications;
"Crit." the pass criteria per scenario; "Func." the functional score. The
inventory-console style trajectory is from the eight-dimension style review
described below. Every run is logged with an evidence file list.

**Functionality is not style.** Alongside the functional rubric, an
eight-dimension *style review* (the inner loop's dimensions, scored 0–2 each)
was applied retrospectively to the inventory console. The result motivates the
entire detail layer of the workflow: a dashboard that scored 100/100 on
functional criteria — search filters working, details opening and closing,
demo data properly labeled — scored **63/100** on style at its first accepted
version: no type scale, no grouping hierarchy, text-only pills, no token
system. Two workflow-driven rebuild rounds raised it to 94 and then 100, the
last step closed by *measured* contrast: a scripted contrast check over 20
color pairs caught a badge color failing at 3.74:1 (light) and 4.17:1 (dark)
against its AA target; after switching to solid fills the suite passed, and it
later grew to 22 pairs (including hover states, darkest pair 6.08:1), all
passing on the minified production bundle as well, which was separately
regression-tested — ten checks plus the seven prior fixes re-verified on the
built artifact, 63.8 kB gzipped.

**What the numbers do not show.** The runs are self-graded inside the same
co-design loop that built the system, by a single human adjudicator; scenarios
were authored with the system's behavior in view; and five executed scenarios
is a small sample of the 60-scenario corpus (release snapshot; 62 scenarios,
15 executed as of 2026-09-20). We therefore present the rubric
and the evidence trail — every score links to its screenshots, contrast logs,
and regression records — as the primary artifact, and the scores as
instruments of iteration, not as benchmark results.

# Case Studies

Three generation efforts shipped through the workflow illustrate different
points of the design space (Figure 2). All three are demos; where a product is
fictional, the page says so.

![Case studies rendered through the workflow: RuiEar (licensed 3D model, motion-heavy concept page), Brick Workshop (3D physics sandbox kept as an in-repo fixture), and FORMA One (explicitly fictional phone product). Screenshots are the committed acceptance evidence of each demo. (Source: screenshots under demo/ in the repository; canvas source: paper/assets/fig-cases.html.)](paper/assets/fig-cases.png){.wide width=100%}

**RuiEar — motion-heavy 3D concept page.** An AI-earbuds concept page built
around a licensed community 3D model (Sketchfab "AirPods Pro" by Jed Falcone,
CC BY 4.0, attributed in the page footer; recolored and re-animated under the
same license), a lid-opening animation, and a configuration flow with live
state. Its acceptance record demonstrates the evidence ladder in practice:
browser-side assertions for each signature interaction, motion checks under
reduced-motion settings, and honest boundaries — the page states that it has
no backend, that purchase buttons are demos, and that specifications are
illustrative.

**Brick Workshop — 3D physics sandbox as a fixture.** A brick-building
sandbox with physics-based scattering, admitted into the repository by explicit
user decision as an isolated showcase fixture: own package state, curated
screenshots, a rule-level regression suite, and no connection to the root
package graph. It exercises the isolation rule — the kit demonstrates a
product it generated without becoming that product's runtime — and the
material rules: third-party asset packs are excluded from the tree, with only
license references retained.

**FORMA One — labeled fiction, external-then-internal.** A phone
configuration-and-purchase path for a fictional product, developed in an
external sibling workspace and moved into the repository by user request. The
page is explicitly labeled fictional; the demo's value here is procedural: it
shows the external-workspace default, the fixture rules for later in-repo
admission, and disclosure as a first-class acceptance item rather than a
footnote.

The inventory operations console (§6) is the fourth, instrumented case: it is
the one demo with a full rubric trail, and its 63 → 100 style trajectory is
the clearest single demonstration that the kit's detail layer finds real
defects that a functional pass does not.

# Discussion and Limitations

**No baseline comparison.** UAK is a workflow and evidence discipline layered
over commodity LLM agents; it does not introduce a new generation model. We
report no head-to-head comparison against other UI generation systems, and we
do not claim the workflow produces better pixels than a bare prompt — we claim
it makes decisions, evidence, and debts inspectable, and we show one measured
case (contrast, §6) where the discipline caught a concrete defect.

**Small, self-graded sample.** Five executed scenarios and ten recorded
rounds are a small fraction of the 60-scenario corpus (release snapshot;
15 scenarios across 22 recorded rounds as of 2026-09-20), and all scores were
recorded by the system's single maintainer inside the co-design loop. There is
no inter-annotator agreement study; the rubric is deterministic per criterion,
but criterion selection and adjudication are not. The numbers should be read
as iteration instrumentation, not as benchmark results.

**The user pays for gates.** Six gates, per-page grading confirmations, and a
ledger shift real attention costs onto the human. The ledger's decay and batch
rules exist precisely because unbounded gating would exhaust the user; the
S/M/L grading exists because a narrow fix must not pay the full-chain price.
Whether the current calibration is right — two decay windows, a batch
threshold of eight — is an open empirical question, currently settled by
policy rather than data.

**Single co-designer.** The author is the kit's maintainer and its only
adjudicator. Direction gates in particular encode one person's taste; the
curated reference library and the design contracts make that taste inspectable
and transferable, but the system has not been run by a second team.

**Judge bias motivated determinism, but human gates are still subjective.** We
distrust free-form model judgment partly because documented judge biases
[@zheng2023judging] are unaccountable at criterion level; yet gates A–C are
exactly free-form human judgment with a bounded artifact. The ledger makes the
judgment recorded and revisable; it does not make it reproducible.

**Future work.** Three directions follow directly from the kit's goal
documents: a *replay protocol* that re-executes recorded evaluation scenarios
against fresh kit revisions (turning the corpus from contracts into regression
suites); *scheduled iteration*, where the ledger and quality monitor drive
periodic re-adjudication rather than waiting for a sprint; and execution of a
larger, stratified sample of the scenario corpus with a second adjudicator, to
measure what the current single-loop numbers cannot.

# Conclusion

UAK treats LLM-driven UI generation as a workflow-governance problem. Its
contribution is not a better generator but a control plane around generators:
six human-adjudicated gates with an agent-side critique inner loop, a
five-level evidence ladder that ends only at a visually verified page, a gate
ledger that turns decision debt into a visible, decaying, batch-adjudicable
queue, and an evaluation apparatus that separates what is specified, what is
executed, and what is merely claimed. The instrumented case study — a
functionally perfect dashboard that nevertheless scored 63/100 on style until
the detail layer closed the gap — is the argument in miniature: the failure
modes that matter in UI work are visible only to a process that looks for
them, at the right granularity, with the evidence attached.

# Acknowledgment {.unnumbered}

This manuscript was drafted with AI coding agents operating under the gated,
human-adjudicated workflow the paper itself describes: the author reviewed and
adjudicated all content, every claim is backed by evidence artifacts in the
public repository, and all references were verified against their primary
sources.

# References {.unnumbered}

::: {#refs}
:::

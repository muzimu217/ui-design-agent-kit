---
title: "UAK: A Gated, Evidence-Driven UI Design Agent Workflow (Workshop Version)"
author:
  - name: "Cheng Li"
    affiliation: "University of Electronic Science and Technology of China, Chengdu College"
    city: "Chengdu"
    country: "China"
    email: "1278844978@qq.com"
abstract: |
  LLM agents can generate plausible UI code, but requirements, design
  decisions, and acceptance evidence end up interleaved in one conversation,
  and an agent's textual self-report is routinely accepted as proof of
  success. The UI Design Agent Kit (UAK) treats UI generation as a gated,
  evidence-driven workflow: Plan and Execute modes separated by a plan lock,
  six gates — five human-adjudicated (direction, materials, prototype,
  contract, per-round acceptance) and one agent-side (MCP call evidence) — a
  detail-critique inner loop before every gate
  presentation, and a five-level evidence ladder that ends only at a visually
  verified rendered page. A gate ledger records every decision the user still
  owes. This short paper summarizes the workflow and reports its evaluation
  to date: five executed scenarios over ten recorded rounds, and one
  instrumented case study in which a dashboard scoring 100/100 on functional
  criteria scored 63/100 on style — the failure mode that motivates the kit's
  entire detail layer. We state plainly what the evidence does not show: no
  baseline comparison, self-graded runs inside a single-maintainer loop.
keywords: "design agents, human-in-the-loop, LLM workflows, UI generation"
numbersections: true
header-includes: |
  \settopmatter{printacmref=false, printfolios=true}
  \renewcommand\footnotetextcopyrightpermission[1]{}
  \pagestyle{plain}
  \AtBeginDocument{\pagestyle{plain}}
---

# Introduction

Ask a coding assistant for a user interface and something plausible arrives
in seconds; ask *what was decided, on what evidence, and who approved it*,
and the answer dissolves. Two failure modes follow: direction errors are
discovered late (the agent built the wrong thing fluently), and success is
claimed in the same channel that performed the work — "the page now works
responsively" is a self-report about a rendered artifact, and language models
have no reliable access to their own outsides.

The UI Design Agent Kit (UAK)[^repo] fixes the *workflow* rather than the
model. UAK is a project-scoped kit of agent instructions, tool routing, MCP
configuration, diagnostics, and behavior evaluations — not a runtime, and not
an application scaffold. It is complementary to work that advances the
generators themselves — screenshot- and sketch-to-code benchmarks
[@si2025design2code; @li2025sketch2code] and feedback-driven UI code
generation [@wu2024uicoder]. Where self-critique loops
[@madaan2023selfrefine; @shinn2023reflexion] let the model judge its own
output, UAK's gates put a human at every acceptance point; where LLM judges
approximate human preference at scale [@zheng2023judging], UAK uses a
deterministic, criterion-local rubric with an evidence trail; and where
agent–computer interface design shapes what agents can verify
[@yang2024sweagent], UAK makes a visually inspected rendered page the only
accepted proof. Under its instructions an agent does what ordinary
agents do, but it may not move between phases without passing gates, and it
may not claim success below a defined evidence level. Three positions
summarize the design:

1. **Decisions are gated, not streamed.** Direction draft, material
   selection, no-code prototype, design contract, MCP call evidence, and
   per-round acceptance are six gates, each presenting a bounded artifact and
   stopping. Code is written last, only against a frozen plan revision.
2. **Claims carry evidence levels, not adjectives.** Installed, Configured,
   Connected, Called, Visually verified — reported separately, no level
   inferred from a lower one. A UI claim is "done" only at a rendered page
   inspected in a real browser.
3. **Debt is written down.** Anything waiting on the user at a gate is
   recorded in a gate ledger with evidence location and a round-counter.

[^repo]: https://github.com/muzimu217/ui-design-agent-kit

# The Gated Workflow in One Page

Figure 1 shows the chain. Plan mode (requirement intake, direction draft,
material scouting) writes no implementation code and ends in a **plan lock**:
the user explicitly approves a frozen plan revision, and "one-click execute"
merely triggers that approval — it never auto-passes a gate. Materials enter
only if the user selects them at Gate B, with source and license boundary
recorded.

![The UAK gated workflow. Filled gates are user adjudication points; outlined gates (D, F) are conditional or agent-side. The inner-loop rail applies to every gate presentation, and S/M/L grading scales the chain to task size.](paper/assets/fig-workflow.png){.wide width=92%}

Execute mode starts with a *no-code* prototype — a generated image, a
paste-ready generation prompt, or a reference screenshot board; all three are
equivalent Gate C artifacts, and no code exists before Gate C passes. The
design contract (semantic tokens, do/don't rules, motion spec) follows, then
implementation by a dispatch-limited subagent (one main agent, at most one
active subagent, roles queued). **Gate F** is agent-side but hard: design and
implementation must make real MCP tool calls, recorded per stage — *no call
traces means no completion claim*, and unreachable servers are recorded as
degraded, never silently skipped.

**The detail-critique inner loop** runs before every gate presentation:
components and interactions are reviewed along eight dimensions (layout
rhythm, typography, measured contrast, state coverage, motion compliance,
affordance, robustness, consistency), findings are triaged P0/P1/P2, fixable
items are fixed, and unfixed items are disclosed with severity. Gates are
where the user adjudicates *direction*; the inner loop is where the agent
adjudicates its own *craft*.

**Multi-round acceptance** replaces the single acceptance screenshot: each
round is a real-browser walkthrough producing per-page issue lists (every
item with severity and an evidence anchor) plus replacement suggestions from
a curated library of market references; the user selects what to fix, one
evidence-backed repair round executes, and the loop repeats until the user
confirms. Unfixed P0 issues forbid any completion claim. Task grading (S
narrow fix / M page-level / L substantive new UI) scales the chain, and the
grade itself is confirmed by the user per page.

**The gate ledger** registers everything that stops at a gate: gate, item,
evidence location, date raised, rounds open, status. Two rules keep it honest
without automating the human out of the loop: P2 acceptance items unclaimed
for two adjudication windows auto-decline (direction items at gates A/B/C
never do), and at eight open items the agent compiles a one-page batch
package for per-item ruling — the package aggregates the *asking*, not the
*deciding*.

# Evaluation

UAK's evaluation separates what is *specified* from what was *executed*.
The specification layer is a 60-scenario behavior contract corpus (request,
context, pass criteria, fail conditions) covering product types,
motion-parameter compliance, unavailable tools, reduced motion, long lists,
and video transitions; static checks validate only structure. The execution
layer is recorded runs under a deterministic rubric: each criterion scored
0–2 (evidence-backed "done" required for full credit), any fail condition
zeroes the scenario.

Five scenarios have been executed over ten recorded rounds (Table 1). All
scored 100 on functional criteria — unsurprising for scenarios authored
alongside the system. The informative signal is elsewhere.

| Scenario | Focus | Crit. | Rnds | Func. | Style |
|:----------------|:------------------------------|:------:|:------:|:---------:|:---------:|
| inventory console | operations dashboard build | 5 | 6 | 100 (all) | 63 → 94 → 100 |
| reference-first | reuse and adaptation discipline | 6 | 1 | 100 | n/a |
| direction draft | Gate A behavior | 4 | 1 | 100 | n/a |
| material confirmation | Gate B behavior | 4 | 1 | 100 | n/a |
| prototype before code | Gate C behavior | 4 | 1 | 100 | n/a |

: Executed runs. "Rnds" counts recorded rubric applications; "Crit." the
pass criteria per scenario; "Func." the functional score. Every run links to
screenshots, contrast logs, and regression records in the repository.

# Case Study: Functionality Is Not Style

The inventory operations console is the one demo with a full rubric trail,
and its history is the argument for UAK's detail layer. Its first accepted
version scored 100/100 on functional criteria — search filters working,
details opening and closing, demo data properly labeled — yet scored
**63/100** on the eight-dimension style review: no type scale, no grouping
hierarchy, text-only pills, no token system. Two workflow-driven rebuild
rounds raised the style score to 94 and then 100. The last step was closed
by *measurement*: a scripted contrast check over 20 color pairs caught a
badge color failing at 3.74:1 (light) and 4.17:1 (dark) against its AA
target; after switching to solid fills the suite passed, later growing to 22
pairs (including hover states, darkest pair 6.08:1), all passing on the
minified production bundle, which was separately regression-tested — ten
checks plus seven prior fixes re-verified on the built artifact (63.8 kB
gzipped).

A functional rubric alone had declared this dashboard done. Only a
per-dimension, evidence-anchored style review — the same instrument the inner
loop applies before every gate — saw what was missing.

# Limitations and Conclusion

The honest boundaries: five executed scenarios is a small fraction of the
corpus; all scores were recorded by the system's single maintainer inside the
co-design loop, with no inter-annotator study; and we report no head-to-head
comparison against other UI generation systems — UAK contributes a control
plane around generators, not a generator. Whether the ledger's calibration
(two decay windows, batch threshold of eight) is right is settled by policy,
not data. Future work: a replay protocol that re-executes recorded scenarios
against fresh kit revisions, scheduled re-adjudication, and a larger
sample with a second adjudicator.

UAK's claim is narrow but load-bearing: the failure modes that matter in UI
work are visible only to a process that looks for them at the right
granularity, with the evidence attached — gates for direction, an inner loop
for craft, and a ledger for everything still owed to the human.

# References {.unnumbered}

::: {#refs}
:::

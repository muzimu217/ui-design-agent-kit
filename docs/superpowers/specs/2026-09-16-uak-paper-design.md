# UAK Paper: Design Spec (2026-09-16)

Status: pending user review
Path: architectural (new `paper/` subsystem)
Decisions fixed by user: targets = arXiv preprint + workshop short; language = English;
depth = systems paper on existing evidence (no new baseline experiments);
system short name = **UAK** (full: UI Design Agent Kit); typesetting = pandoc + LaTeX acmart.

## 1. Goal and non-goals

Goal: produce an English systems paper on the UI Design Agent Kit (UAK) as a
gated, human-in-the-loop, evidence-based LLM design workflow, with a repeatable
build pipeline that emits a conference-style PDF and an editable DOCX from one
Markdown source. Deliverables:

1. `paper/uak-paper.md` — full arXiv manuscript (~9–11 pages, acmart two-column).
2. `paper/workshop/uak-workshop.md` — 4-page workshop cut derived from it.
3. Build pipeline: `npm run paper:build` → `paper/out/*.pdf` + `paper/out/*.docx`.
4. Figures generated from repo evidence (gated workflow diagram, evaluation
   table, case-study screenshot collages).

Non-goals: no new generation runs for baselines; no statistical comparison
against other UI generators (stated as limitation); no submission act itself
(arXiv upload is a user action, this work stops at a submission-ready file).

## 2. Authorship and naming

- Author block: **Cheng Li**, University of Electronic Science and Technology
  of China, Chengdu College; 1278844978@qq.com. (Pinyin form on the paper;
  the Chinese characters 李枨 are not needed in the English PDF.)
- System name: "UI Design Agent Kit" on first mention, **UAK** thereafter.
- Repository is cited in a footnote with the GitHub URL; demos are credited
  as fictional/demo products where applicable (honesty rule from the kit's
  own T-004: no fabricated capability claims).

## 3. Paper structure (approved)

| § | Title | Evidence source |
| --- | --- | --- |
| 1 | Introduction | README pain point; 3 contributions |
| 2 | Related Work | web research (LLM UI generation, design agents, generative UI evaluation) |
| 3 | Architecture | `docs/architecture.md`: kit boundary, skill routing, MCP evidence levels, isolation rule |
| 4 | The Gated Workflow (method core) | `docs/chain-flow.md` v7.2: Plan/Execute modes, six-stage cognitive core, gates A–F, gate-F MCP gate, detail-critique inner loop, S/M/L task grading |
| 5 | Human-in-the-Loop: the Gate Ledger | `docs/gates.md`: 13 pending adjudications, P2 decay (2 windows), batch-adjudication threshold ≥8 |
| 6 | Evaluation | `evals/scenarios.json` (60 scenarios) + `evals/results.json` (5 executed runs, 0–2 rubric; inventory-console 100/100 with screenshot evidence) |
| 7 | Case Studies | demo/ruiear (3D + motion), demo/brick-workshop (3D physics), demo/forma-phone-ui (fictional product, labeled) |
| 8 | Discussion & Limitations | no baseline comparison; n=5 executed runs; single co-designer (author = maintainer); future work: replay protocol (G2), scheduled iteration (G3) |
| 9 | Conclusion | — |

Workshop cut: §1 + condensed §4 + §6 + one case study (inventory-console, the
only one with a real score run), 4 pages, same acmart class.

## 4. Toolchain (pipeline B: pandoc + LaTeX)

Install (one-time, user-visible cost ~150–400 MB, disclosed to user):

```
brew install pandoc
brew install --cask basictex          # minimal TeX, installs to /Library/TeX/texbin
sudo tlmgr install acmart newtxtext newtxmath microtype float xcolor hyperref \
                   booktabs caption natbib amsmath amsfonts helvet
```

Compile-time missing packages: add on demand from the compiler log, never by
removing content. PATH note: `/Library/TeX/texbin` must be on PATH for `npm run
paper:build` (the script checks and prints an actionable error if absent).

Build commands (wrapped as root `package.json` script `paper:build`):

```
pandoc paper/uak-paper.md -f markdown -t latex \
  -o paper/out/uak-paper.pdf --pdf-engine=pdflatex \
  -V documentclass=acmart -V class=sigconf -V linenumbers \
  -V papersize=letter -V geometry:margin=1in \
  --citeproc --bibliography=paper/references.bib \
  -V author="Cheng Li" -V title="UAK: A Gated, Evidence-Driven UI Design Agent Workflow"
pandoc paper/uak-paper.md -f markdown -t docx \
  -o paper/out/uak-paper.docx --reference-doc=paper/style/uak-reference.docx
```

- `acmart` with `sigconf` class = ACM two-column, the de-facto arXiv/venue look.
- DOCX uses pandoc's default reference doc, regenerated into
  `paper/style/uak-reference.docx` and lightly customized (fonts, heading
  sizes) only if the first render looks off.
- Math: pandoc Markdown `$...$` passes through to LaTeX; no math in the
  current planned content, but the pipeline keeps it free.
- `paper/out/` is gitignored (regenerable), like `output/`.

## 5. Figures

Pipeline: hand-built HTML/CSS canvases rendered to PNG @2x with the local
Chrome headless `--screenshot` path (already verified on this machine, zero
new installs). Three figures:

1. `fig-workflow.png` — the gated workflow: Plan/Execute split, gates A–F,
   inner loop, S/M/L branch. Redrawn from `docs/chain-flow.md` (cleaner than
   the README mermaid; the mermaid is the source of truth, this is a paper figure).
2. `fig-evidence.png` or table — the five evidence levels
   (Installed → Configured → Connected → Called → Visually verified) as a
   table, plus the evaluation rubric summary (0–2 per criterion, fail
   condition zeroes the scenario).
3. `fig-cases.png` — three-up screenshot collage (RuiEar / brick-workshop /
   FORMA One) from existing demo screenshots, no new runs.

All figures cite their evidence path in the caption (kit's evidence culture).

## 6. Directory layout

```
paper/
  uak-paper.md            # full manuscript (single source of truth)
  workshop/uak-workshop.md
  assets/fig-*.html       # figure canvases (sources, checked in)
  assets/fig-*.png        # rendered figures (checked in: they are content)
  references.bib
  style/uak-reference.docx
  out/                    # build output, gitignored
```

Root `package.json` gains one script: `paper:build`. Nothing else in the root
package graph changes; `npm run verify` and `npm test` must keep passing
unchanged.

## 7. Gate workflow for the paper itself (dogfooding)

The paper project runs the kit's own gate culture:

- **Gate P1 (content freeze)**: full manuscript draft presented to the user;
  content (claims, numbers, figures) is frozen before formatting work.
- **P2 (build + inner loop)**: render both artifacts; run a self-critique
  pass (impeccable-style) on the rendered text — claims vs evidence, honest
  limitations, no over-claiming, format nits; fix P0/P1, log P2.
- **Gate P3 (user adjudication)**: user reviews PDF + DOCX; approval commits
  `paper/` to the repo. Without approval, items stay open in the gate ledger
  (`docs/gates.md` gets a "paper" section — the paper is a first-class gate
  citizen of the repo it documents).

## 8. Phases

1. Phase 0 — toolchain: install pandoc/basictex/acmart, smoke test a 2-page
   md → pdf + docx, wire `npm run paper:build`.
2. Phase 1 — figures: build the 3 figure canvases + render.
3. Phase 2 — full manuscript (9 sections) + `references.bib`.
4. Phase 3 — workshop cut (4 pages).
5. Phase 4 — gates P1→P3, commit, hand off arXiv-ready files (upload is the
   user's step).

## 9. Risks / open items

- basictex + tlmgr network installs may need proxy/interactive sudo — Phase 0
  surfaces this early; if TeX install is impossible, fallback is pipeline A
  (HTML/CSS → Chrome PDF + python-docx DOCX), which needs zero installs.
- Related work needs web research (section 2) — done during Phase 2 with
  citations into `references.bib`.
- arXiv category choice (cs.HC vs cs.SE) is a P3 user decision, flagged in the
  final handoff note.

# README and release structure that converts

A README has one job: let a stranger decide in under two minutes whether the tool
solves their problem, and make the first successful use cheap. Everything below
serves that.

## The opening block

Order matters. Readers leave early; the top of the file does the work.

1. **Language switch** (if the project has more than one) — prevents immediate
   bounce from readers who cannot use the primary language.
2. **Social-proof badge** — one is enough. A trending or award badge carries more
   signal than a star badge, which reads as soliciting.
3. **Hero image** — a real screenshot of the tool doing its job. Not a logo, not
   an abstract gradient.
4. **One-line value statement** — what it does, for whom, with what result. No
   adjectives that cannot be verified.
5. **Four bullets, each "verb + situation + result".** Replace a feature list with
   outcomes a reader can picture. "Review the change before merge" beats
   "comprehensive review support".
6. **Copy-pasteable first command.** One line. No prerequisites paragraph before
   it.
7. **Links to a live demo and a gallery** — the fastest way to let a skeptical
   reader verify the claim themselves.

Do not put a "please star this" ask in the README. It converts a technical
document into a request and lowers perceived quality.

## The body sections that earn trust

- **A motion proof.** One GIF or short video showing real interaction. Static
  screenshots under-sell anything interactive.
- **A real example from a real repository**, with a link to the generated output.
  "Here is what it produced on an actual project" beats any feature description.
- **Quick start in three steps**, with an explicit note about the cheapest path
  (for example, that no existing repository is required to try it).
- **A differentiation section.** State plainly how this differs from the obvious
  alternative the reader is already using. Compare against the incumbent by name;
  vagueness reads as having no answer.
- **A scope section listing what the tool deliberately does not do.** This is
  counter-intuitive but effective: it signals judgment, and it prevents the
  low-quality issues that come from mismatched expectations.
- **Limits and known gaps.** Stating them costs nothing and buys credibility for
  everything else.

## Release notes

Releases are the legitimate, repeatable reason to appear in front of people
again. Make each one worth reading:

- Lead with what changed for the user, not the internal refactor.
- Name every external contributor whose work shipped, with a link. This is the
  cheapest retention mechanism available and it measurably increases repeat
  contributions.
- Keep a visible roadmap, including a section for things deliberately not
  planned, with the reason. It pre-empts the same request arriving repeatedly.

## What to avoid in copy

- Unverifiable superlatives: "blazing fast", "best-in-class", "seamless".
- Invented numbers. If adoption, speed, or quality was not measured, do not state
  a figure.
- A comparison you did not run. If you claim to be better than a named
  alternative, run the comparison and show the method.
- Feature lists standing in for outcomes.

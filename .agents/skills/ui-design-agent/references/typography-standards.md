# Typography Standards

Construction-side standards for typographic identity and hierarchy: what to
reach for when setting type, and the failure each rule prevents. Detection of
AI-default typography signatures lives in [detail-critique.md](detail-critique.md)
(cluster 5); numeric interaction constants live in
[detail-constants.md](detail-constants.md). Sources: Anthropic
frontend-design typography chapter (read in full, 2026-09 master armament),
cross-checked against the same conclusions in practitioner write-ups.

Precedence: the governing design contract wins, and a recorded
[user-taste-profile.md](user-taste-profile.md) entry can override these
defaults for its scope (e.g. T-008 quiet personal tools may decline a loud
identity face). Absent an override, the rules below hold.

## Identity and pairing

1. **A default font is not an identity font**: Inter, Roboto, Open Sans, and
   bare `system-ui` never carry the page's identity (fine as body fallbacks).
   Pick a face with a voice — Space Grotesk / Bricolage Grotesque for
   contemporary product, a true serif for editorial, a mono for technical.
   Counter-example: swapping the logo and palette while the type still reads
   "untouched template".
2. **One family or two**: a single family is a valid identity. With two, the
   roles must genuinely contrast (serif display + sans body, or mono accents
   + humanist body). Counter-example: the same family at two weights
   pretending to be a "font pairing".
3. **Headline type is a visual element, not a neutral container**: size,
   weight, tracking, and line breaks of the display line are composition —
   compose them, don't just fill them in. Counter-example: a hero that is
   "an h1 at default weight, centered".

## Hierarchy and measure

4. **Hierarchy is expressed at the extremes**: pair a light display weight
   (≈200–300) against a strong body weight (≈500–700) — or the reverse
   emphasis — instead of five adjacent mid-weights. Counter-example: 400 vs
   500 vs 600 "levels" nobody can tell apart.
5. **Adjacent ranks need a readable jump**: the display-to-body size ratio
   should be dramatic (≈3× for a hero); 1.2× tweaks between neighbors do not
   register as hierarchy — merge or exaggerate the step. Counter-example:
   16px, 18px, 20px body/lead/heading all reading as one rank.
6. **Body measure stays under ~80 characters**; serif body may run slightly
   longer, and serif line-height sits slightly higher than sans at equal
   size. Counter-example: full-bleed paragraphs stretching past the reader's
   comfortable return sweep.
7. **Chinese text sets looser than Latin**: CJK line-height ≥ 1.7; Latin
   numerals in tables and counters use tabular-nums (see
   [detail-constants.md](detail-constants.md)). Counter-example: translated
   Chinese copy inheriting a 1.4 sans rhythm and turning into a dense block.

## Banned constructions (the building side of the critique list)

8. **No isolated emphasized word in a headline**: one italic or accent-colored
   word inside an otherwise plain headline is a decoration, not a message.
   Counter-example: "Design that *feels* inevitable" with only "feels"
   styled.
9. **No all-caps as a substitute for hierarchy**: caps may be part of a
   composed lockup, not a generic way to make labels look important.
   Counter-example: every section label in letter-spaced caps because
   hierarchy was never designed.
10. **No uninformative eyebrow**: a decorative micro-label above content must
    carry information (category, index, status) or be removed. Counter-
    example: "OUR STORY" floating above a paragraph that is not a story
    section.

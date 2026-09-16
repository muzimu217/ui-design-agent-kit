# Channel playbook

Ordering below comes from a measured developer-tool launch (a Chinese-authored
agent skill that reached roughly 64k stars in five months). Percentages and
orderings are observations from that case, not universal constants — re-measure
for your own project. The *shape* of the finding has held up across similar
projects.

## Measured channel ranking

| Rank | Channel | Observed role |
| --- | --- | --- |
| 1 | One high-reach account relaying the work | The single largest driver. One relay from a ~220k-follower account moved daily stars from ~180 to ~950 the same day |
| 2 | Chinese long-form platforms (Zhihu, Juejin) | Steady long-tail discovery; individual posts do not spike but accumulate |
| 3 | Chinese developer communities (Linux.do, V2EX) | Highest single-thread engagement when the post respects the community's rules |
| 4 | Large YouTube/tutorial channels | ~200k combined views from two channels, at zero cost to the author |
| 5 | Media coverage | Follows a trending position; rarely creates one |
| 6 | Package registries and ecosystem listings | Weak for stars, strongest for *real usage* signals |
| — | Hacker News, Reddit | Near-zero measured reach for a Chinese-dominant project |

## The spike is not the strategy

In the measured case, the first 76 days produced about 2% of total stars. One
seven-day window produced about 51%. That window began with a single relay and
was amplified by the author's own post the following day.

The lesson is not "find a viral moment". It is:

- The long tail built the credibility that made the relay land. Without a
  repository that survived inspection, the relay would have produced nothing.
- The spike decayed to a much lower but permanently elevated baseline. The
  baseline, not the peak, is what the long-tail work bought.

Plan for the baseline. Treat the spike as a bonus you can only cash once.

## Per-channel tactics

**High-reach relay.** You cannot manufacture this, but you can be ready for it:
the artifact must be inspectable in under two minutes, the hero asset must be
self-explanatory, and the repository must be correct (license, install command,
working demo). When a relay happens, do not post again the same day; let it run.

**Chinese long-form platforms.** Titles that state the outcome and the number
perform better than descriptive titles. One article per milestone, not one per
week. Cross-post the same body across platforms rather than writing separately
for each.

**Chinese developer communities.** Follow the community's own promotion rules
exactly — several require an explicit declaration and a specific tag. Post in the
correct node/category; posting a project announcement in a general discussion
node draws moderation action. One substantive post per milestone, maximum.

**Tutorial channels.** Prepare a long-form technical article plus assets and make
them easy to find. Large channels discover material; they rarely respond to
outreach. The cost to you is the writing, which you can reuse everywhere else.

**Ecosystem listings.** Submit to curated lists and, more valuably, get embedded
in other tools. An integration inside someone else's shipped product is a
stronger adoption signal than any star count.

## Reading the numbers honestly

Track these together, and distrust any single one:

- **Stars** — attention. Easily inflated by a single relay; says little about use.
- **Package downloads** — closer to real use. The most trustworthy public metric.
- **Forks carrying commits** — genuine adaptation.
- **Watch/subscribers** — deep interest. A large gap between stars and watchers
  means people bookmarked without engaging.
- **Issue and PR traffic from non-authors** — whether anyone actually tried it.

A repository with many stars and almost no watchers, no discussions, and no
first-time-contributor activity has been seen, not adopted. Report that
distinction plainly rather than quoting the star count alone.

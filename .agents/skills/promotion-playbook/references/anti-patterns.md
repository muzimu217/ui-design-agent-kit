# Anti-patterns

Each entry below is an observed failure with a real cost, drawn from studying a
developer-tool launch that reached high visibility and damaged its own standing
in technical communities along the way. The patterns generalize; the specifics
have been anonymized deliberately. Read this before drafting any announcement.

## Announcing the same milestone twice

**What happened.** The first reflective post about reaching a milestone drew
~10,000 views and over 100 replies, mostly positive. A later post announcing a
follow-up milestone in the same community drew ~1,100 views and drew moderation
complaints; a third drew ~1,100 and explicit reports to moderators for repeated
promotional posting.

**Why it fails.** Technical communities tolerate one introduction. Subsequent
posts about your own success are read as taking space from other people's work.
The audience is the same, so there is no new reach — only new irritation.

**What to do instead.** One substantive post per *distinct milestone*, spaced far
apart, each carrying new technical content rather than a progress report. Announce
in the community's designated category, never in a general discussion node.

## Inviting people into a chat group as part of promotion

**What happened.** A chat-group invitation attached to a promotion post became
the top-voted criticism of the entire thread, including from readers who were
otherwise positive about the tool. It was cited in later threads as evidence of
marketing intent.

**Why it fails.** A chat group reads as a funnel, regardless of whether anything
is sold inside it. It converts a technical post into a growth tactic in the
reader's mind, and that judgment then attaches to the tool.

**What to do instead.** Keep the README and posts free of community-invite links.
If a community genuinely forms, it forms around issues and discussions on the
platform where the work lives.

## Reusing a personal hardship narrative

**What happened.** An origin story about educational and career disadvantage
produced a large, genuinely warm response the first time. On the second use, the
same narrative drew comments identifying it as a repeated script, and the
author's credibility on unrelated technical points was questioned in the same
threads.

**Why it fails.** The story is only true once. Repetition is legible to regular
readers of the same communities, and it retroactively casts the first, sincere
telling as a tactic.

**What to do instead.** Let the work carry the post. If personal context is
genuinely relevant to *why the tool exists*, state it once, briefly, in the
README, and do not lead with it.

## Treating English link aggregators as a default channel

**What happened.** A project with strong Chinese-community traction received
near-zero engagement on major English link aggregators: a single submission
scored one point, and discussion-forum posts received single-digit upvotes and no
comments. The author never posted a formal launch there.

**Why it fails.** Audience-language mismatch. The people who would adopt a tool
documented primarily in Chinese are not primarily on those platforms, and the
submissions that do appear are competing with a much larger volume.

**What to do instead.** Measure one submission before investing in a channel.
Spend the effort on tutorial channels and long-form platforms where the audience
overlaps, and let English reach arrive through relays if it arrives at all.

## Reading stars as adoption

**What happened.** A repository with very high stars showed a subscriber count
under 0.5% of stars, fewer than a dozen discussion threads, and no use of its
beginner-friendly issue label.

**Why it fails as a signal.** Stars are a bookmark. A large gap between stars and
every other engagement metric means people saw the project and moved on. Reporting
the star count as success — internally or externally — hides that.

**What to do instead.** Report downloads, forks with real commits, and third-party
integrations alongside stars. If those are weak, say so and fix the first-use
experience rather than chasing more visibility.

## Name collision with an established project

**What happened.** A product sharing a name with an unrelated, earlier product in
the same broad space lost search traffic to it and could not claim the obvious
listing on a major launch platform.

**What to do instead.** Check for name collisions in package registries, launch
platforms, and search results *before* publishing. A distinctive name is worth
more than a descriptive one.

## Unanswered integrity questions

**What happened.** A public accusation of copying sat unanswered in the project's
discussions.

**Why it matters.** Silence is read as concession by everyone who sees the thread.
Even a short, factual, non-defensive response — what was and was not shared, and
what the license says — costs minutes and settles the matter for future readers.

**What to do instead.** Respond once, factually, on the record. Then leave it.

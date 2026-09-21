---
name: promotion-playbook
description: >-
  Evidence-based promotion playbook for open-source developer tools and agent
  skills: channel selection, README conversion structure, launch sequencing, and
  the reputation mistakes that cost more than they gain. Use when the user asks
  how to promote, launch, announce, or grow adoption of a repository, skill, CLI,
  or developer tool — including drafting release posts, README restructuring, and
  community posting. Grounds every recommendation in observed channel performance
  rather than generic marketing advice.
license: MIT
metadata:
  version: "1.0"
  scope: "Promotion strategy for this kit and similar developer tools"
---

# Promotion Playbook

Promotion for a developer tool is not advertising. Engineers adopt tools they can
inspect, trust, and try in under a minute. The work is making the tool legible,
making the first success cheap, and then putting it where the right readers
already are.

Use this skill when asked to promote, launch, announce, or grow a repository,
skill, CLI, or developer tool — or when writing release copy, README structure,
and community posts for one.

## The two rules that govern everything else

**1. Promote the work, not the person.** Repositories grow because the artifact
solves a real problem and proves it. Personal narrative can produce one burst of
attention; it cannot produce sustained adoption, and repeat attempts are read as
manipulation. Lead with what the tool does and the evidence that it does it.

**2. Spend effort where readers actually are, not where promotion feels
virtuous.** For a Chinese-language or Chinese-authored project, the honest
channel ranking is stark and counter-intuitive to most engineers' instincts.
See [references/channel-playbook.md](references/channel-playbook.md) for the
measured ordering before planning any campaign.

## Sequence a launch

1. **Make the repository trustworthy before announcing it.** License present and
   correct. README that states what the tool does in one line, shows it working,
   and gives a copy-pasteable first command. If a reader cannot verify the claim
   in two minutes, promotion multiplies distrust rather than adoption.
2. **Fix the discovery surface.** Repository topics are free reach: fill them
   with the vocabulary a searching engineer would use, including the term for the
   incumbent tool a reader would compare you against. Language classification must
   be correct or trending surfaces never see the project.
3. **Prepare the assets once.** A hero image, one motion proof (GIF or short
   video), a live demo link, and a pre-written long-form article you can hand to
   any channel. Assembling these at announcement time is the usual reason launches
   slip.
4. **Seed the long tail before the spike.** Community posts and long-form content
   create the baseline that makes a later spike compound. A spike with no
   foundation decays to nothing within days.
5. **Aim the spike at one high-leverage relay.** A single trusted account with a
   large relevant following outperforms dozens of manual posts. Earn it with a
   genuinely inspectable artifact, not with an ask.
6. **Sustain with versioned releases.** Each release is a legitimate reason to
   appear again, and release notes that name contributors are the cheapest
   retention tool available.

Details, including the README structure that converts and the exact sequencing
mistakes to avoid, are in
[references/readme-conversion.md](references/readme-conversion.md).

## What not to do

Read [references/anti-patterns.md](references/anti-patterns.md) before drafting
any announcement. These are documented failure modes with observed costs, not
hypothetical risks:

- Reposting your own success to the same community reads as spam and gets
  reported. The second announcement of the same milestone reached 10% of the
  first one's audience and drew moderation complaints.
- Inviting people into a chat group as part of promotion reads as marketing and
  destroys technical credibility, even when the group is genuinely useful.
- Reusing a personal hardship narrative across channels gets identified and
  publicly called out.
- Treating English-language link aggregators as a default channel for a
  Chinese-dominant project wastes the effort: measured reach there was near zero.

## Honest limits

- This playbook describes promotion *mechanics*. It cannot manufacture a reason
  for people to care: if the artifact is not distinctive or not verifiable, no
  channel choice fixes that.
- Star counts measure attention, not adoption. Prefer signals that are harder to
  fake — package downloads, forks that carry real commits, tools that embed you.
- Do not fabricate metrics, testimonials, adoption numbers, or user quotes in
  any promotional copy. If a number is not measured, do not print it.
- Do not claim a comparison you have not tested. A blind comparison you actually
  ran is persuasive; an asserted one is a liability.

## References

- [references/channel-playbook.md](references/channel-playbook.md) — measured
  channel performance, ordering, and per-channel tactics.
- [references/readme-conversion.md](references/readme-conversion.md) — README and
  release-note structure that turns a visit into a trial.
- [references/anti-patterns.md](references/anti-patterns.md) — documented
  reputation failures and the reasoning behind each.

# Product README Standard

Use this reference when creating or updating a product README, or handing off a
new runnable product. The README is the product's front door, not a transcript
of the agent's work. Preserve the product's established name and language.
Renaming, redesigning the application, publishing, and changing licenses are
separate actions that require their own scope and authorization.

## Reader-first order

1. Product name as one text H1, one plain-language sentence explaining what it
   is, and a short status label such as concept, demo, preview, or released.
2. A small set of real navigation links: quick start, screenshots, documentation
   or feedback. Include a live/download link only when its target is verified.
3. One legible product screenshot close to the top. Show the actual primary
   task or product, with meaningful alt text and a caption identifying demo data.
4. Three to six concrete capabilities or user journeys. Explain what controls
   actually do; distinguish demonstrations, fixtures, and real persistence.
5. Quick start: prerequisites, exact working directory, lockfile-compatible
   installation, a real run command, and how to find the local address.
6. Scope and limitations: absent backend, accounts, payments or integrations;
   where data lives; browser/hardware needs; known functional or testing gaps.
7. Verification commands and links to dated evidence. A passing build is not
   a visual, accessibility, production-readiness, or agent-quality certificate.
8. Maintainer-oriented documentation, feedback route, and precise licensing
   and asset attribution. Move long implementation diaries to a linked document
   without deleting history. Omit irrelevant sections rather than fill them
   with invented features or generic promises.

Names, section labels, and tone follow the product; the information contract is
shared. A small demo can fit on one screen of prose plus its image. Do not add
decorative badge walls, star graphs, unverified download counts, fake CI badges,
customer logos, or placeholder links to make a project look more established.

## Product identity and media

- Keep the name as real text even if a logo or wordmark image is included.
  Respect existing marks and assets; propose a new visual identity for approval
  when the user requests one rather than silently renaming products.
- Prefer real browser captures to invented UI. Show a representative state,
  readable text, and an unobscured primary workflow. Add mobile/detail views
  only when they reveal something useful beyond the lead image.
- Record source route/build, viewport, capture date, and image path in a media
  note. Retain images under the product's own tracked documentation/media
  directory. A file present only in ignored evidence/output folders is not a
  durable README asset. Do not expose internal business data or user sessions.
- Use raster image generation for a requested original brand illustration when
  the capability is actually available. Label concept art and compositions;
  never call them app screenshots. If generation is unavailable, disclose it
  and use the user's permitted screenshot alternative, or offer the appropriate
  fallback without silently invoking paid APIs.
- If no trustworthy screenshot exists for a historical or broken project, say so
  next to the lead-media position and link the evidence record. Do not borrow a
  screenshot from another product or quietly use a stale build with a different
  identity.
- Use relative links in repository Markdown so branches, clones, and repository
  moves work. Check rendered light/dark appearance and narrow widths; keep
  screenshots within the column and offer their full-size image link.

## Verification before handoff

Inspect package scripts and project facts before writing commands or claims.
Check local links and images against tracked or newly added deliverables, not
just files that happen to exist on this machine. Render the changed README and
inspect its lead image and text at desktop/mobile widths. Report which commands
and browser checks actually ran; keep old evidence dated and separate.

For every product in an explicitly requested collection, maintain an inventory
so missing READMEs are visible. Screenshots, licenses, release instructions and
third-party READMEs are supporting documents, not additional products. Do not
rewrite vendored documentation or publish the collection as a side effect.

## Reference baseline

The user's reference is [PI-Desktop's README](https://github.com/vastsa/PI-Desktop/blob/main/README.zh-CN.md),
inspected on 2026-09-08. Its useful pattern is a clear identity and entry links,
an honest preview notice, task-oriented capability groups, interface evidence,
and separate setup/development information. Adapt that information hierarchy,
not its prose, brand assets, platform claims, or license. This standard adds
durable local media, project-specific limitations, and checkable commands.

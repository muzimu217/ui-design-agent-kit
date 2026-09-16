# Boundaries, install, and evidence

Read this when the request touches Archify's scope limits, when the runtime is
missing, or when the diagram must reflect real repository code. Source: upstream
`README.md` (scope and installation sections), `archify/SKILL.md`,
`references/authoring-contract.md`, and `schemas/README.md` at the pinned
revision.

## What Archify is not

Upstream states plainly: "Archify is not a general-purpose drawing editor or a
Mermaid theme. It turns technical intent into a communication artifact."

Intentionally outside the current scope, per the upstream README:

- Automatic Mermaid parsing.
- General-purpose auto-layout.
- Hosted sharing.
- WYSIWYG editing.

Also not supported: UML class and ER modeling, charts and plots, UI mockups, and
any workflow that requires a non-technical user to edit the result in a GUI. The
deliverable is a file, not an editor session.

What it does offer instead of auto-layout: "Layout judgment over generic
auto-layout — the agent chooses hierarchy, spacing, routes, and emphasis." The
renderer only spreads shared automatic endpoints deterministically. Do not
promise a layout engine.

## Installation (this repository does not install Archify)

Archify is a Node tool that ships as a skill package. This kit vendors the usage
knowledge only. Install the runtime separately:

```bash
npx skills add tt-a1i/archify -g
```

Non-interactive Cursor install, per upstream:

```bash
npx -y skills add tt-a1i/archify --skill archify --agent cursor --global --copy --yes
```

Try without installing:

```bash
npx skills use tt-a1i/archify@archify --agent codex
```

Per-surface locations documented upstream: Claude Code `~/.claude/skills/` or
`.claude/skills/`; Codex CLI `~/.agents/skills/` or `.agents/skills/`; opencode
`~/.config/opencode/skills/`, `.opencode/skills/`, or `.agents/skills/`; Raven
manual ZIP into `~/.raven/workspace/skills`.

After install, verify before promising output:

```bash
node bin/archify.mjs doctor
node bin/archify.mjs demo /tmp/archify-demo
```

Archify may contact a fixed stable manifest to show an optional update reminder.
It never downloads or installs updates. Set `ARCHIFY_UPDATE_CHECK_DISABLED=1` to
disable networking and reminder-state writes. If the check cannot run, continue
without mentioning it.

## Brand marks

Brand identity is optional and explicit. Query the bundled catalogue:

```bash
node bin/archify.mjs brands "<name>" --json
```

Put a canonical returned ID in a node's `brand` field. If no preset matches and
the user supplied the official HTTP(S) URL, capture it first and author the
returned digest-pinned object:

```bash
node bin/archify.mjs brands capture "<url>" --json
```

Render and validate never perform an unpinned capture. Otherwise omit `brand`.
Never infer a brand from a vague role such as "database", and never let a badge
replace the semantic `type`, label, or relationship facts.

## Repository evidence (architecture only)

Use this only when the diagram must reflect real code. Inspect entrypoints,
runtime boundaries, storage, transports, and deployment configuration before
authoring, and record only evidence you actually verified.

Declare `meta.repository` with a public URL and one full 40-character
`revision`, then attach `components[].sources` with repo-relative POSIX `path`
plus optional `line`, `end_line`, and `label` (max 3 sources per component):

```json
{
  "url": "https://github.com/org/repo",
  "revision": "0123456789abcdef0123456789abcdef01234567"
}
```

`--repo-root <path>` is architecture-only and is accepted by architecture
`render`, `validate`, `deliver`, `preview`, and `compare`. The other four types
reject it. Verification requires the local Git origin to match and Git to prove
the commit, blobs, and requested line ranges. It is local and makes no remote
requests, so it establishes neither public availability nor the current reader's
access rights. Never infer runtime causality from file proximity or naming alone.

`link_mode` defaults to `web` (GitHub and Gitee generate revision-pinned links).
For an internal or unsupported forge, use `link_mode: "local-only"` to keep
searchable paths and revision labels without hyperlinks. GitLab/Gitea/Forgejo/
Bitbucket web links are not implemented at this revision; unknown web providers
fail rather than emitting a guessed link.

## Quality and engineering profiles

`meta.quality_profile` (`standard` | `showcase`) is available in all five modes
and controls how strictly composition is judged. Default to `showcase` unless the
user explicitly wants a dense standard map.

`meta.engineering_profile` is an optional **architecture-only** semantic
contract. The only value is `deployment-ownership`. Omit it by default; region,
cluster, and security-boundary wording does not enable it. Enable it only when
the user explicitly asks for a production deployment topology, ownership handoff,
or fail-closed deployment review **and** the source facts are known. Once
enabled, never remove it merely to pass validation — repair the facts or report
the diagnostics truthfully.

When enabled it requires every non-external component to name an owner in `tag`
and belong to exactly one `region`; the document must contain both `region` and
`security-group` boundaries; every `database` must be inside a `security-group`;
each security group must contain members from one shared region; and every
connection whose region or security-group membership changes must name the real
crossing mechanism in `label`.

The profile validates only authored IR. It does not discover infrastructure,
infer owners, or prove the diagram matches a live environment. If a fact is
unknown, leave the profile unset or obtain the fact — never invent it.

## Language

Choose one primary authored language: an explicit user choice wins, otherwise
follow the request or the conversation's dominant language. `meta.locale` accepts
only `en` or `zh-CN` and controls renderer-owned surfaces only — document title
suffix, `<html lang>`, default legend labels, fixed Viewer controls, statuses, and
accessibility copy. It never translates authored content.

For any other language, omit `meta.locale`, keep authored copy in the requested
language, and explicitly disclose that the fixed Viewer UI and `<html lang>` fall
back to English. Do not silently substitute `zh-CN`. Preserve exact product
names, code identifiers, commands, protocols, API paths, and environment names;
they may stay English inside localized prose.

# Stitch MCP Call Logic（实测）

> 来源：项目团队 2026-09 实测调用经验整理（非虚构）。与本机环境接入前提
> （`STITCH_API_KEY` + `enabled=true` + 网络可达）配合使用。桥接脚本的完整
> 实现保留在 `~/.workbuddy/plugins/marketplaces/experts/plugins/ui-designer`
> 的 `scripts-templates/`，本文件只记录逻辑与要点。

## One-line version

Generation may drop the connection — ignore it. The result is never in
`list_screens`; it is in `get_project`.

## Four-step flow

```text
generate_screen_from_text ──(60s disconnect: normal, do NOT retry)──┐
                                                                     │
get_project(projectId) ─→ screenInstances ───────────────────────────┤
                                                                     ↓
                        get_screen(sourceScreen) ─→ downloadUrl ─→ curl -L
```

1. **generate_screen_from_text** — emit generation. Pass `projectId` without a
   `projects/` prefix, plus `prompt`, `deviceType`, and `modelId`. A 60-second
   disconnect is normal behavior; retrying once produces one extra draft
   (the project once accumulated 40 screens this way).
2. **get_project(projectId)** — read the index from `screenInstances`, whose
   elements are `{id, sourceScreen, width, height}`. `list_screens` returns
   empty here; trusting it is a misjudgment. Pick the largest screen by
   `width × height` as the primary page.
3. **get_screen** — pass `name=projects/<pid>/screens/<sid>`; read
   `screenshot.downloadUrl` and `htmlCode.downloadUrl`.
4. **curl -sSL** — the download URL redirects with a 302; `-L` is mandatory.

## Parameter essentials

| Parameter | Rule |
| --- | --- |
| `projectId` (generate/get_project) | bare id, **no** `projects/` prefix |
| `name` (get_screen) | `projects/<pid>/screens/<sid>` — prefix IS required |
| `deviceType`, `modelId` | choose by the target surface per the design contract |

## Anti-pattern table

| Anti-pattern | Consequence | Correct move |
| --- | --- | --- |
| Retrying after the 60s disconnect | One extra draft per retry (40 screens accumulated) | Treat as normal; do not retry |
| Trusting empty `list_screens` | False "generation failed" verdict | Read `screenInstances` via `get_project` |
| `curl` without `-L` | 302 download fails | Always use `-L` |
| `projectId` with `projects/` prefix | Parameter error | Bare project id |

## Prompt quality checklist

The tutorial references a prompt-quality checklist; keep it aligned with the
design contract's Mission and Style foundations:

- State the interface type, target surface (deviceType), and viewport once.
- Name the visual tone (palette direction, type feel) in contract terms, not
  mood adjectives.
- Enumerate the required sections in order and the primary CTA.
- State copy language and the demo-data labeling rule.
- Describe motion intent briefly; the prototype is a visual candidate, not a
  shipped implementation.

## Local access prerequisites

- `STITCH_API_KEY` environment variable set before the host starts; the key is
  referenced from the environment, never stored inline.
- `[mcp_servers.stitch] enabled = true` in `.codex/config.toml`.
- Network reachability to `stitch.googleapis.com`. This sandbox runs
  `no_proxy`, so a local proxy/VPN does not reach the endpoint from here; run
  the real call from a reachable environment.
- Authentication is the `X-Goog-Api-Key` header — an API key, not an OAuth
  login.

## Troubleshooting quick reference

The tutorial mentions six error cases; verify against the bridge script's
actual output in the workbuddy copy. Category-level mapping:

| Symptom | Likely cause | Check |
| --- | --- | --- |
| HTTP 000 / connect timeout | Network isolation or proxy gap | Reachability from a proxy-enabled environment; `enabled=true` |
| Auth error on any call | Key missing or rotated | `STITCH_API_KEY` set; key still valid |
| Parameter error | `projects/` prefix misuse | Bare id for generate/get_project; prefixed name for get_screen |
| Empty list after generate | Wrong index source | Read `get_project.screenInstances`, not `list_screens` |
| Download failure | 302 without `-L` | `curl -sSL` |
| Duplicate drafts | Retried a 60s disconnect | Never retry generation |

## Bridge script notes

`scripts/stitch-bridge.js` (kept in the workbuddy package) uses `curl` instead
of undici to bypass proxy defects, and repairs dangling `$ref` before use.
When vendoring the bridge into a target project, keep those two fixes and
preserve the source revision and license notice.

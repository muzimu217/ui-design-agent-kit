# Workflow Outcome Screenshots

These are existing, locally generated workflow outcome screenshots selected for
the Agent workflow portfolio. They are evidence previews, not claims that the
historic products are deployed or fully accepted.

## Agent host logos (media/hosts/, added 2026-10-10)

Host logos indicate integration compatibility and belong to their respective
owners; trademark rights are not claimed. Each file was fetched from the
owner's official domain or official GitHub organization avatar:

| File | Host | Official source |
| --- | --- | --- |
| openai-codex.webp | OpenAI（Codex CLI） | cdn.oaistatic.com（OpenAI 官方静态 CDN，apple-touch-icon，180×180） |
| claude-code.ico | Anthropic（Claude Code） | anthropic.com/favicon.ico |
| cursor.ico | Cursor（Anysphere） | cursor.com/favicon.ico |
| gemini-cli.png | Gemini CLI（Google） | gemini.google.com 官网内嵌的 Gemini 四色星形标志（www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt，512×512）——曾误取 Google 组织头像"G"，用户复核指正后更换 |
| windsurf.ico | Windsurf | windsurf.com/favicon.ico |
| github-copilot.svg | GitHub Copilot | Primer Octicons 官方图标集 copilot-24（unpkg.com/@primer/octicons）——曾误取 GitHub favicon"章鱼猫"，用户复核指正后更换 |
| cline.png | Cline | GitHub 官方组织头像（cline org, avatars.githubusercontent.com/u/184127137）——曾按猜测 ID 误取他组织头像，用户复核指正后更换 |
| opencode.png | OpenCode | opencode.ai/favicon.ico |
| zcode.png | ZCode 桌面版（Z.ai 智谱） | z.ai/favicon.png（320×262） |
| deepseek.png | DeepSeek（深度求索） | cdn.deepseek.com/favicon.png（蓝鲸标志） |
| openclaw.svg | OpenClaw | openclaw.ai/favicon.svg（官方矢量） |

WorkBuddy 与 Hermes 暂无已核实的官方图标（EigenFlux 官方宿主名单在列），工作台 tab 使用文字加号占位——待其官方素材可用时补图。

The 2026-10-09 self-drawn SVG host icons in docs/onboarding-console.html were
rejected in user review ("find real assets online, don't draw them"); the
official assets above supersede that approach on the published site.

| File | Original evidence | Presentation label |
| --- | --- | --- |
| inventory.webp | evals/runs/operations-not-marketing/evidence/v23-build-dashboard.png | 库存运营台，运营工具，历史截图 |
| obsidian.webp | evals/runs/reference-first-adaptation/evidence/v5-desktop.png | 曜石 X1，虚构产品展示，历史截图 |
| blog.webp | demo/blog-demo/evidence/desktop-1440.png | 一舟札记，虚构个人博客，历史截图 |
| nodegrid.webp | demo/nodegrid/evidence/gate-e-r2-s0-hero.png | NODEGRID，世界地图节点可视化，完整源码已入库 |
| subway.webp | demo/subway-runner/evidence/game3d-running-1280.png | 地铁疾行，3D 跑酷游戏，完整源码已入库 |
| forma.webp | demo/forma-phone-ui/screenshots/desktop-1440.png | FORMA One，虚构手机产品配置页，可试玩 demo |
| tempo.webp | demo/tempo-day/screenshots/desktop-1440.png | Tempo 今日节奏，当日任务与专注计时，可试玩 demo |
| intro.mp4 | Remotion render from `intro-video/` (uses the first-party webp screenshots above) | 20 秒产品介绍视频，h264+AAC |

Converted locally to WebP at quality 86 (nodegrid/subway/forma/tempo 缩放到宽
1280px；forma/tempo 截图取自 2026-09-08 本地 vite preview 于 1440x900 视口的
真实渲染，经检查后入库). No
external model, private user work or real business/customer data was
introduced. Original evidence records remain in their original directories. Do
not copy whole private documents into the public site or infer complete
verification from the screenshots.

The brick case separately imports its five curated screenshots from
`demo/brick-workshop/screenshots/`. The inventory, brick, NODEGRID, and subway
cases have assembled playable routes in this publication package. NODEGRID and
subway remain separate demo apps in the Agent repository and are mounted under
their own `demos/` paths here.

`workflow-cover.webp` is a 1200x630 local montage of these three screenshots
and the brick desktop screenshot, with the literal Agent workflow brand and
case names. It was composed with `showcase/scripts/create-social-cover.py`
using local fonts and Pillow, then inspected. It is the social-sharing image,
not a fabricated screenshot of a live application or a new product claim.

`intro.mp4` is a 1920x1080 20-second product introduction video rendered
locally by the Remotion pipeline in `intro-video/` (React/TypeScript
frame-by-frame render, h264 + AAC). Its showcase frames reuse the first-party
webp screenshots listed above; the gate labels refer to this repository's gate
ledger, and the numbers (8 showcase cases, 29 tests, 6 gates) are repository
facts. Music and sound effects are procedurally synthesized WAVs — no external
audio assets, no voiceover. It is a produced introduction artifact, not a
screenshot claim of a live application and not new verification evidence.

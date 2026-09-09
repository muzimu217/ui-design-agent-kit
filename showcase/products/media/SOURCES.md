# Workflow Outcome Screenshots

These are existing, locally generated workflow outcome screenshots selected for
the Agent workflow portfolio. They are evidence previews, not claims that the
historic products are deployed or fully accepted.

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

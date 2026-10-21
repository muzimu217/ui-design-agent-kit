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
| codex.svg | Codex CLI（OpenAI） | devicons.io/devicons/icons/codex-icon.svg（用户指定渠道；devicons 元数据标注品牌来源 openai.com/codex 与 OpenAI brand guidelines）——蓝紫渐变云朵+终端提示符的 Codex CLI 专属标志；曾误用 cdn.oaistatic OpenAI 通用 apple-touch-icon，用户复核指正"两个 CLI 的图标错了"后更换 |
| claude.svg | Claude / Claude Code（Anthropic） | devicons.io/devicons/icons/claude-icon.svg（用户指定渠道；#D97757 珊瑚色星芒为 Claude 官方产品标志，devicons 元数据标注许可来源 anthropic.com）——曾误用 anthropic.com 公司 favicon，同轮指正后更换 |
| cursor.ico | Cursor（Anysphere） | cursor.com/favicon.ico |
| gemini-cli.png | Gemini CLI（Google） | gemini.google.com 官网内嵌的 Gemini 四色星形标志（www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt，512×512）——曾误取 Google 组织头像"G"，用户复核指正后更换 |
| windsurf.ico | Windsurf | windsurf.com/favicon.ico |
| github-copilot.svg | GitHub Copilot | Primer Octicons 官方图标集 copilot-24（unpkg.com/@primer/octicons）——曾误取 GitHub favicon"章鱼猫"，用户复核指正后更换 |
| cline.png | Cline | GitHub 官方组织头像（cline org, avatars.githubusercontent.com/u/184127137）——曾按猜测 ID 误取他组织头像，用户复核指正后更换 |
| opencode.png | OpenCode | opencode.ai/favicon.ico |
| zcode.png | ZCode（Z.ai 智谱） | z.ai/favicon.png（320×262） |
| deepseek-harness.svg | DeepSeek Harness（深度求索） | deepseek.com/harness/favicon.svg（官方 Harness 专属黑色鲸鱼标志，viewBox 50×50 矢量）——曾临时复用 DeepSeek 蓝鲸 favicon，用户复核指正"官方 CLI 是黑鲸不是蓝鲸"后更换为 Harness 官网 head 声明的专属图标 |
| openclaw.svg | OpenClaw | openclaw.ai/favicon.svg（官方矢量） |
| workbuddy.svg | WorkBuddy（腾讯） | workbuddy.ai 官网 head 声明的官方 logo.svg（download.codebuddy.ai CDN，viewBox 40×40 矢量）——与 EigenFlux 官网宿主名单（www.eigenflux.ai 首页"支持任何 Agent"栏）所用 agent-icons/workbuddy.svg 字节一致（md5 核验），2026-10-11 补图 |
| hermes.png | Hermes（Nous Research） | hermes-agent.nousresearch.com 官网 head 声明的 /assets/hermes-agent/icon.png（48×48 PNG，官方最大尺寸）——其 favicon.ico 与 EigenFlux 官网宿主名单所用 agent-icons/hermes.ico 均为同图缩放版（md5 核验），2026-10-11 补图 |

两家的图标最初缺口（2026-10-10 记录"待其官方素材可用时补图"）经 EigenFlux 官网宿主名单定位到官方域名后核验补齐：EigenFlux 官网 marquee 直接展示两家宿主图标并链接其官方域名（workbuddy.ai / hermes-agent.nousresearch.com），最终取各宿主自己域名 head 声明的图标文件入库。

2026-10-11 新增 DeepSeek Harness 宿主条目（DeepSeek 官方开源 Agent Harness，github.com/deepseek-ai/deepseek-harness，开发者预览版），同日删除原 DeepSeek 纯模型条目：工作台主题是"接入你的 Agent 宿主"，纯模型不属于宿主，用户裁定移除。注意 Hermes Agent 是 Nous Research 的产品，与 DeepSeek 无关（DeepSeek 官方 API 文档亦如此标注）；DeepSeek 自家的宿主级产品是 DeepSeek Harness。原 cdn.deepseek.com 蓝鲸 favicon.png 随模型条目删除一并移出 hosts 目录。

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

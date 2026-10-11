# 参赛演示视频 · 派发提示词（生成 + 展示）

> 用途：复制 §2 的提示词块，发给 `remotion-video-agent` 执行——**生成**参赛演示视频成片，并**展示**（Studio 预览 + 抽帧 QC + 交付报告）。
> 本文件是独立提示词文档，不改任何源文件。原始规划见 `docs/competition-submission-plan.md`（§3 分镜 / §7.1 旧提示词）。
> 派发后代理产出**停在交付门前**；上传平台与发送邮箱是用户本人操作，代理不碰。

## 一、为什么是这份新提示词（现状对账，派发前先知道）

旧 §7.1 提示词已与代码脱节，直接派发会误导代理。真实现状以 `intro-video/src/Root.tsx` 为准：

- 成片是**第二个合成** `CompetitionEntry`（与 20s 的 `UIAIntro` 并存），**已搭好、已渲染过** `out/competition-entry.mp4`。
- 时长 **3162 帧 ≈ 1:45**（v2 提速节奏），非旧稿的 2:50。
- 实际 8 场景：`Scene1Title` → `Scene6Pain` → `Scene7Install` → `Scene8GateA` → `Scene9Verify` → `Scene10Evidence` → `Scene11Montage` → `Scene12Outro`（旧稿的 Scene8Verify/Scene9Evidence 命名已不存在）。
- `npm run render` 只渲染 `UIAIntro`，**渲染参赛片必须显式指定 `CompetitionEntry` 合成**（见提示词内命令）。

因此任务重心不是从零搭建，而是：**校验现有管线 → 预览 → 仅修 QC 暴露的问题（守 theme.ts 纪律）→ 渲染 → 抽帧 QC → 交付报告**。

## 二、派发提示词（直接复制整块发出）

```text
$remotion-video-agent 为 OSChina 开源创新大赛「生成 + 展示」参赛演示视频。管线已搭好，你的任务是校验、预览、按需微修、渲染、QC、出交付报告——不是重搭。全程中文沟通，产出停在交付门前等我确认，不上传、不发邮件、不改全局配置。

【动工前必读】
1) .agents/skills/ui-design-agent/SKILL.md 的工具路由，以及本技能族的 remotion-video-agent/SKILL.md；需要确认 Remotion 当前 API 时读 remotion-docs。
2) intro-video/src/Root.tsx —— 以此为唯一事实源确认合成结构（CompetitionEntry 合成、3162 帧、8 场景顺序、音轨/音效帧位），不要照搬 docs/competition-submission-plan.md 旧稿的时长与场景命名。
3) docs/competition-submission-plan.md §3 仅作叙事意图参考；凡与 Root.tsx 冲突，以代码为准。

【硬规格】
- 合成 id：CompetitionEntry（不是 UIAIntro）。1920×1080@30fps，h264 crf16。
- 时长：3162 帧 ≈ 1:45，以 Root.tsx 当前值为准，不要擅自改长度。
- 输出：intro-video/out/competition-entry.mp4（覆盖重渲）。

【生成（render）】
- 工作目录 intro-video/。先 `npm ci --ignore-scripts`（如未装依赖）。
- 音频是渲染前置：`public/sfx/` 被 gitignore、可重建，缺文件会 404 渲染失败。务必先 `npm run gen-audio`（或用自动跑它的脚本），不要跳过。
- 渲染命令（npm run render 只渲 UIAIntro，不可用）：
  `npm run gen-audio && npx remotion render src/index.ts CompetitionEntry out/competition-entry.mp4 --codec h264 --crf 16`

【展示（showcase / 预览）】
- Studio 预览定位问题：`npm run studio`（即 remotion studio src/index.ts），在 CompetitionEntry 合成上逐场景目检。
- 不要靠记忆判断效果：对每个场景起点附近抽帧截图（场景起点帧：0/256/602/1068/1444/2090/2436/2862），作为“已真实目检”的证据贴进交付报告。
- 展示产物是：成片 mp4 + 关键帧截图 + QC 报告。是否把成片嵌入 showcase/README 需先问我，默认不动展厅。

【风格纪律（守，不新增体系）】
- 单一事实源 intro-video/src/theme.ts：暗夜紫黑底 #0A0A0F、紫 #7C3AED 为唯一主角色（每帧至多一个元素用它）、青 #22D3EE 辅、PingFang SC/SF Mono、easeOutExpo + snappy/smooth spring、禁线性缓动。
- 禁止在组件里内联颜色/缓动/弹簧配置；若需微调一律改 theme.ts 或走既有 token。
- 只在 QC 暴露实际问题时才改场景组件，改动最小化、不扩散、不顺手重构其它场景。

【素材与数据纪律】
- 全片仅第一方素材：S3 安装（Scene7Install）文本取自 2026-10-10 真实执行记录、S5 验收（Scene9Verify）嵌入 demand-insights 实测截图、S7 巡览（Scene11Montage）复用 public/media 既有 webp、片尾（Scene12Outro）用官方宿主图标。禁摆拍、禁伪造输出。
- 片中数字必须与仓库当前口径一致：131 项自动化测试 / 73 场景评测语料 / 71 已真实执行入账 / 13 宿主 / 三端（GitHub 主链 github.com/muzimu217/ui-design-agent-kit、GitCode 备选 gitcode.com/...、Gitee 镜像 gitee.com/...）/ Apache-2.0。渲染前用仓库实测复核这些数字；若仓库口径已变，先告诉我、不要擅自改片中数字。

【渲染后 QC（逐项核对，写进报告）】
- ffprobe 核对：时长 ≈105.4s、分辨率 1920×1080、帧率 30、编码 h264。
- 抽帧核对：8 场景字幕无错别字、无溢出；主色每帧至多一元素；无线性缓动残留。
- 音频：有配乐床、转场 whoosh 对位、无爆音/截幅。
- 数字核对：片中 131/73/71/13 与三端地址同仓库当前口径一致。
- reduced-motion 语义：Scene9Verify 的“animation: none”为设计表达，确认未被误当成真实系统探测。

【交付】输出：渲染命令与退出码、ffprobe 摘要、8 张场景抽帧截图、QC 逐项结论、仍存疑项清单。停在交付门前等我审定，不要自行上传 B 站/官方平台、不发组委会邮箱、不动 main 分支。
```

## 三、边界与分工（与 AGENTS.md、§六 一致）

- 代理：校验 / 预览 / 微修 / 渲染 / QC / 出报告，**成稿呈用户审定后定版**。
- 用户本人：B 站等平台上传、`bjoscc@oschina.cn` 发送、main 分支合并。
- 禁止副作用：不启用/认证可选 MCP（motion_plus/figma）、不部署、不购买服务、不上传私有代码、不改全局配置。

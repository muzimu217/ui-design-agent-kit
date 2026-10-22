# Remotion Agent Skill 生态深访（学习循环第八十五轮）

- 日期：2026-10-21 ｜ 点档：12（开发线）｜ 检视级别：**verified-partial**（官方文档页实看 2 页 + B 站视频页实看 + 搜索结果实读；未安装未实跑第三方 skill）
- 对象：①B 站 jeffzhengye《AI视频导演级Skill：Codex装上它5分钟出电影感产品宣传片》（BV1uNgS6JErK，1960 播放）②Remotion 官方 Agent Skills 页（remotion.dev/docs/ai/skills）③官方 Codex plugin 页
- 截图：video-page.png / remotion-official-skills.png / remotion-codex-plugin.png（本地留存，ADR-0002）

## 机制观察

1. **官方化事实（本轮最重要）**：Remotion 官方维护 **13 个 Agent Skills**（best-practices/create/markup/studio/render/maps/captions/saas/interactivity/docs/upgrade/multimedia + 路由）与 **5 个宿主官方插件**（Claude Code/Codex/Cursor/Kimi Code/GitHub Copilot），安装一条命令 `npx skills add remotion-dev/skills`。受控编码路径**已被上游官方产品化**，不再只是社区实践。
2. **我们的钉版差集**：库内钉版 10 个 Remotion skill（含自研 remotion-video-agent），官方 12 具名中**缺 3 个场景性技能**——remotion-maps（地理动画）/remotion-saas（产品架构）/remotion-upgrade（升级维护）。核心创作族（create/markup/render/studio/docs/captions/interactivity/multimedia/best-practices）**全数在钉**。
3. **jeffzhengye 视频重估**：1960 播放但**收藏 220 > 点赞 69**（收藏比 3 倍=工具参考型内容，观众存的是"以后要用"）；无公开 skill 仓库链接——他是**官方生态的使用者与传播者**，不是我们的竞争者。B 站相关视频区暴露整个「Codex+视频 Skill」内容簇（≥7 条，含《用 Remotion 如何 Vibe Coding 出 Vox 风格动效视频》——与本仓 75 轮 Vox preset 立卡直接同源）。
4. **链条信号**：tenten.co（9-16）记录 Codex 串联 10 个 GitHub skill（HyperFrames/Remotion/FFmpeg）做 URL→40 秒视频流水线——**多技能编排**是下一步生态方向。

## 判读

1. **能力裁决推进**：`remotion-agent-skill`（evaluating）的真实价值不是"接入他的 skill"，而是**确认本仓 adopted 条目 remotion-video 站在官方产品化的主线上**——方向正确性从"社区验证"升级为"上游官方背书"。
2. **钉版差集处置**：缺的 3 个都是场景性技能（本仓暂无地图/SaaS 化/升级场景需求），**记录差集、不自动安装**——装不装应由需求触发，不由"官方有"触发。
3. **不抄什么**：不搬运"5 分钟出片"话术（无验收口径的快是营销）；不因收藏比高就追做教程型内容（本仓是工作流产品，不是内容号）。

## 借鉴→落地

- K2：capabilities.json 两条更新——remotion-video adopted 条目 note 补官方 5 插件事实；remotion-agent-skill 证据升级+判读重写（生态位确认）；钉版差集记录（3 个候选，待需求触发）。
- KPI4 第十七条：本仓能力登记区（canvas-index）vs 官方 skills 页——同为"能力注册面"的对照。
- evals +2：upstream-officialization-check / capability-verdict-from-ecosystem-position。

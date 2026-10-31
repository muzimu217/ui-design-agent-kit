# expo/skills 首检（学习循环第一百三十四轮）——框架原生 skills：基础设施层第三形态

- 日期：2026-10-28 ｜ 点档：16（开发线）｜ 检视级别：**verified-partial**（GitHub API+README 一手全文实读；未安装）
- 对象：expo/skills（124 轮 #12 基础设施层新成员深看——Expo 官方 AI agent skills 仓库）
- 截图：expo-skills-readme.png（本地留存，ADR-0002）

## 机制观察

1. **框架原生 skills（基础设施层第三形态）**："Official AI agent skills **from the Expo team**"——非第三方合集（hallmark 形态）、非安全扫描（NVIDIA 形态）、非 IDE（JetBrains 形态），而是**框架官方自己写的 skills**：skill 从社区实践升级为**框架官方交付物**。
2. **分发三通道+12 agent 覆盖**：Claude Code plugin marketplace / Codex plugin marketplace（OpenAI-curated）/ **skills CLI**（`npx skills@latest add`，覆盖 Cursor/OpenCode/Copilot/Windsurf/Gemini/Cline/AMP/Factory Droid/Antigravity/Kiro）——**skill 分发基础设施已成熟到多 marketplace+通用 CLI**。
3. **"Start Here"入口 skill 路由模式**：expo-overview 为入口（"the entry point when a request is vague or the user hasn't named a specific Expo tool"），路由到具体 skill——**与 kit SKILL.md 的路由模式同构**（入口→分发到专项）。
4. **免费/付费边界描述层显式标注**："Skills come in two groups so the free vs paid boundary is clear. Each skill's description carries the same label, and every services skill opens with a costs/plan-limits note"——**边界透明化设计**（与 kit 能力边界声明同思想）。
5. **source of truth 归属声明**："Expo documentation, Expo CLI, and EAS CLI remain the source of truth; these skills help agents apply them correctly"——**skill 定位=文档的应用层**（与 kit references"路由不是副本"同思想）。
6. **expo-design-system**：token theme（color/spacing/typography/radius/shadow/motion）+ reusable conventions + **design-system drift audits**——与 kit design-system 域重叠的同域 skill（带 drift audit 概念）。

## 判读

1. **基础设施层三形态定型**：安全扫描（NVIDIA）/IDE 集成（JetBrains）/框架原生内容（Expo）——**平台入场不是"支持 skills"而是"官方自己写 skills"**——skill 从社区实践升级为框架交付物的转变已有首个完整案例。kit 的 .agents/skills 是自研形态的先行者（10-07 起），但 expo 的"框架原生+分发三通道"是规模化形态（kit 无分发通道，单仓形态）。
2. **入口路由模式跨团队同构再+1**：expo-overview 入口 skill ↔ kit SKILL.md 路由——入口→专项的路由模式已是 skill 生态标准实践（与 130 轮六点工艺、120 轮确认粒度同族的跨团队共识清单再+1）。
3. **边界透明化设计**：免费/付费在描述层标注——kit 无付费维度，但"边界在描述层显式声明"的思想与 kit 能力边界声明同源（记录不借鉴）。
4. expo-design-system 与 kit design-system 域重叠——同域 skill 存在但形态不同（expo 绑定 React Native 技术栈，kit 是跨栈指令层）——不构成形态竞争，对照点记录。

## 不抄什么

npx skills CLI 分发（kit 无分发需求）；free/paid 分组（kit 无付费维度）。

## 借鉴→落地

- K2：增量 133=**框架原生 skills 形态入册**（基础设施层第三形态+入口路由同构再+1 记录）。
- KPI4：沿第四十四条口径（首检轮无新产物对照面）。
- evals +2：framework-native-skills-third-form / entry-skill-routing-isomorphism。

# 素材处理文档（Inspiration Materials Processing）

> 交付对象：维护本 kit 的工程师。本文档记录一批 UI 设计素材的来源验证结果、
> 归类决策与接入注意，是 `references/inspiration-library.md` 的生成依据。
> 验证时间：2026-09-06，验证方式：curl 直连 / GitHub API / 页面标题与描述抓取。

## 一、素材验证结果

| # | 素材 | 验证结果 | 页面性质 | 归类 |
| --- | --- | --- | --- | --- |
| 1 | https://inspira-ui.com | ✅ 200 | Vue/Nuxt 动画 UI 组件库 | 组件与动效库 |
| 2 | https://reactbits.dev | ✅ 200 | "Animated UI Components For React"，开源可定制交互动画组件 | 组件与动效库 |
| 3 | https://www.transitions.dev | ✅ 200 | "UI transitions for AI agents"，可复制或随 skill 使用 | 组件与动效库 |
| 4 | https://www.unicorn.studio/inspiration | ✅ 200 | WebGL 实时动效 / 交互图形制作工具 | 组件与动效库 |
| 5 | https://uiverse.io | ⚠️ 403 | 社区免费 UI 组件样式站（反爬拦截非浏览器客户端） | 组件与动效库 |
| 6 | https://motionsites.ai | ✅ 200 | AI 网站提示词包（Lovable/Bolt/Cursor/Claude，3D 网站） | 提示词与设计契约 |
| 7 | https://www.uiprompt.site/zh/home | ⚠️ https 直连失败；http 返回 301 | 中文 UI 提示词收藏站 | 提示词与设计契约 |
| 8 | motionlab.dev（Motion.Lab） | ⚠️ 200 但为 Next.js 默认占位页 | 空壳页面，无可引用内容 | 不可用 |
| 9 | "Awesome DESIGN" | 🔍 二义性 | GitHub 搜索结果两项候选：`VoltAgent/awesome-design-md`（114k★，品牌 DESIGN.md 分析集，与本 kit 设计契约方向强相关）；`goabstract/Awesome-Design-Tools`（41k★，设计工具清单） | 提示词与设计契约 |
| 10 | "UI UX Pro Max" | ✅ 已安装 | 本项目级 skill（本地可检索设计知识） | 已内置 |
| 11 | Taste Skill（`Leonxlnx/taste-skill`） | ✅ 已验证 | 84.7k★，anti-slop 前端品味框架（Claude Code 风格 agent skill），官网 tasteskill.dev | 可选品味 skill |
| 12 | "Intenable"（听写误差）→ impeccable.style | ✅ 已确认 | 用户澄清后验证：https://impeccable.style 返回 200，站点自称 "1 skill, 23 commands, curated anti-patterns"，即已安装 impeccable skill 的官网 | 已收录（配套已安装 skill） |
| 13 | 设计案例画廊批量验证（18 站） | ⚠️ 混合 | 200 可达 12 个：godly/awwwards/mobbin/refero/saaslandingpage/dark.design/hoverstat/landingfolio/pttrns/designsystemsrepo/bestwebsite.gallery/shots.so；403 反爬：land-book/pageflows；429 限流：siteinspire；000 不可达：minimal.gallery/uipatterns.io；525：onepagelove | 12 个可达站点收编进灵感库"Design case galleries" |
| 14 | AI 分类素材知识库（7 站路由索引） | ⚠️ 混合 | 200 可达 4 个：landing.love/awwwards/onepagelove(此前 525 复测 200)/21st.dev；403 反爬：land-book/lapa.ninja；429 限流：siteinspire | 收编进灵感库"Category routing index"（动效/审美/创意/精致/酷炫/现成/设计感 7 类） |

## 二、处理决策

1. **全部素材以"参考来源目录"形式收编**，落在
   `.agents/skills/ui-design-agent/references/inspiration-library.md`，不安装
   任何新 MCP、不引入依赖、不虚构工具调用。
2. 素材库按两类划分：**组件与动效库**（React Bits、Inspira UI、Transitions.dev、
   Unicorn Studio、Uiverse.io）、**提示词与设计契约**（MotionSites AI、
   UI Prompt Site、awesome-design-md、Awesome-Design-Tools）。
3. 不可用项（motionlab.dev）明确标注"禁止引用"；反爬与不稳定项
   （uiverse.io、uiprompt.site）标注备用访问路径。
4. "Awesome DESIGN" 与 "Motion.Lab" 名称不唯一，未武断绑定某一仓库；
   awesome-design-md 因与设计契约方向最匹配已收录，待用户确认指向。
5. Taste Skill 以"可选品味 skill"收编进灵感库新增的
   "Optional design-taste skills" 小节（含 tastemaker、senlindesign 两个备选），
   未安装、未内置任何内容。
6. "Intenable" 经用户澄清为 impeccable.style 的听写误差：已确认是已安装
   impeccable skill 的官网（23 commands + anti-patterns），在灵感库
   "Installed local knowledge" 中补充其词汇说明。
7. 18 个设计案例站点批量验证后，12 个可达站点收编进灵感库新增
   "Design case galleries" 分区；land-book/pageflows 反爬需真实浏览器，
   siteinspire 限流待重试，minimal.gallery/uipatterns.io 不可达暂不收录，
   onepagelove 525 待重试。

## 三、接入注意（供工程师执行时遵守）

- **不绕过反爬**：uiverse.io 用真实浏览器查看，不得用脚本绕过 403。
- **不虚构调用**：页面可达 ≠ 工具可用；素材 ≠ 已安装组件。任何素材必须先
  实际成功查验，才能报告为"已使用"。
- **授权边界**：每个素材按条目核对其许可证/使用条款（React Bits、Inspira UI
  需查仓库 license；Unicorn Studio 导出内容需用目标项目自有授权资产实现；
  MotionSites AI 提示词属提示级素材，代码须用项目自有技术栈实现）。
- **复刻与原创**：优先复刻/改编已验证的成熟成品，但不做"近似抄袭"；公开素材
  若代码/资产未获授权，只改编其可观察关系。
- **素材确认门**：外部素材要进用户网站，必须先给用户提交候选清单
  （来源 URL + 拟采用部分 + 改编/授权边界），获得确认后再整合。

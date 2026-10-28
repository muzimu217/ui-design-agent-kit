# ai-design-skills 首检（学习循环第一百二十五轮）——单 skill 10.7k 星：设计 skill 需求热度实锤

- 日期：2026-10-28 ｜ 点档：05（开发线）｜ 检视级别：**verified-partial**（GitHub API 三数+README 一手全文实读；未安装）
- 对象：elayadesign/ai-design-skills（124 轮 #2 次席新面孔深看；10-29 创建于 2026-07-29，3 个月）
- 截图：ai-design-skills-readme.png（本地留存，ADR-0002）

## 机制观察

1. **单 skill 10.7k 星（供需比例极端）**：仓库自称"a growing collection"，实际**仅 1 个 skill**（landing-page-design）+"More on the way"——1 份供给 vs 10.7k 认可：设计 skill 需求侧热度的最极端实锤（对照 hallmark 39.9k/impeccable 91.3k，品类光谱三层：单 skill/合集/设计语言）。
2. **形态最简**：自包含文件夹式 skill（"Each skill is a self-contained folder. Install the ones you need"）——多宿主通用（Claude Code/Cursor/Codex/Windsurf/"anything that reads a markdown rules file"）——与 kit 的 .agents/skills 形态同族但极轻量（无 references/无守卫无验收链）。
3. **"Make it yours"单节集中设计 values**：每 skill 的设计值（fonts/colors/spacing/motion）集中文件底部一节，fork 改那一节即定制——**设计 token 集中段的最简实现**（kit 语义 token 的轻量对照）。
4. **改编来源声明的小仓库实践**："landing-page-design adapts content realism and motion ideas from Leonxlnx/taste-skill by Leon Lin, MIT licensed. Details are at the end of its SKILL.md"——10.7k 星仓库也做改编来源声明（与 kit 的 NOTICE/adaptations 记录同纪律——**来源声明已是 skill 生态标配而非合规负担**）。
5. License 极宽松："Use it, fork it, ship it, sell what you build with it. No attribution needed."（MIT）。

## 判读

1. **品类光谱三层定型（设计 skill 生态）**：单 skill（ai-design-skills 10.7k）/合集（hallmark 39.9k）/设计语言（impeccable 91.3k）——需求热度与供给深度反相关的极端案例（最浅供给也拿万星），**需求侧的热度证明的是话题而非质量**——第四层"质量回执"子位在 skill 生态同样无人占据（连续 45 轮口径延伸到 skill 生态内）。
2. **来源声明普及化**：小仓库自觉声明改编来源（taste-skill）——kit 的 NOTICE/adaptations 纪律与生态惯例一致（非过度工程，确认）。
3. 形态对照：ai-design-skills 的极简自包含文件夹 vs kit 的 references+守卫+验收链——**两种形态服务两种承诺**（它承诺"装了就能用"，kit 承诺"用完可验收"）——形态差异源于承诺差异，不构成形态竞争。

## 不抄什么

"More on the way"期票话术；极简无验收形态（与 kit 承诺相反）。

## 借鉴→落地

- K2：增量 95=**NOTICE 纪律行业普及对照入册**（ai-design-skills 改编来源声明=kit NOTICE 纪律的生态惯例确认，轻量记录）。
- KPI4：沿第四十四条口径（首检轮无新产物对照面）。
- evals +2：single-skill-demand-heatsignal / notice-attribution-ecosystem-norm。

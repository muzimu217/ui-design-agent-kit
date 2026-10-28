# hallmark 品类头部深看（学习循环第一百二十六轮）——门控工作流在设计 skill 域的最强同构体

- 日期：2026-10-28 ｜ 点档：09（开发线）｜ 检视级别：**verified-partial**（GitHub API+README 一手全文实读；未安装运行）
- 对象：Nutlope/hallmark（124 轮 #6 品类头部深看——39.9k，Together AI 出品，"A design skill… that refuses to look AI-generated"）
- 截图：hallmark-readme.png（本地留存，ADR-0002）

## 机制观察

1. **三层门阶与 kit 严重度分诊同构（最强对照）**："The gates come in tiers"——**The Floor never ships**（contrast/focus/reduced motion/invented facts/broken phone layout）↔ kit P0 阻断；**Reflex gates**（模型默认会掉进的坑，"a build with a reason may overrule one on the record"——可带理由推翻但记录在案）↔ kit P1 留痕；**Finish checks**（"craft detail that never blocks a ship"）↔ kit P2 用户选。
2. **预检索材与不虚构**："Pre-flight reads the project (fonts, palette, framework, a locked **design.md**) and asks once for the material… **Nothing is invented**"——pre-flight 读取+一次性索材询问+锁定设计文档+不虚构=门 B 素材门+契约锁定同构。
3. **真实浏览器 lint + fresh-context 审查**：sloplint.mjs 8 宽度渲染检查 + "a subagent reviews it with fresh eyes… A fresh-context reviewer gets the last word"——独立引擎+新上下文审查=kit 独立仪器/负自测同思想。
4. **anti-slop tells 清单**：eyebrow above every heading/tracked-capital labels/one coloured word in a headline/empty frames/nothing but photographs/hero misses its screen/email sign-up at the end of every page/**a form that says thanks without sending anything**——8 条生成特征 tells（后两条含功能诚实维度）。
5. **redesign 的记录-比对验收**："sloplint --before records every link, field, handler and heading first, sloplint --kept fails the redesign if one went missing"+before/after 并排交付——重构前全量记录+缺失即失败（与 kit "内容与接线保留"验收同构）。
6. **产物自带决策戳**："Each page is self-contained HTML and CSS, stamped in its first CSS comment with the decisions it took"——决策留痕进产物（与门 F 留痕同思想）。
7. **素材许可纪律**：755 张 Wikimedia 公开授权图+页内署名+**拒绝 Unsplash/Pexels/Pixabay**（其条款禁止 AI 工具挑图）——素材许可的主动边界（与 kit 素材门同思想且更细）。
8. **改编网络**：Inspired by 九项（Impeccable/frontend-design/taste-skill/UI UX Pro Max…——**含 kit 钉版的 impeccable 与 ui-ux-pro-max**）——skill 生态互引网络。
9. 39.9k 星、Together AI 出品、MIT、npx skills add 分发。

## 判读

1. **学习循环开始以来同构度最高的对象（七点同构）**：三层门阶/预检索材不虚构/锁定设计文档/真实浏览器 lint/fresh-context 审查/产物决策戳/记录-比对验收——**hallmark 证明了 kit 的核心方法论（门控+anti-slop tells+真实浏览器验收）在"单点设计 skill"形态下有 39.9k 星的市场验证**；差异化在形态：hallmark=单域 skill（设计质量门），kit=完整工作流（六道门+证据链+产物墙+仪器族）。
2. **tells 清单对照（kit 已覆盖排版类，hallmark 独有 6-8 条）**：kit R161-01 查重确认的 typography-standards 覆盖排版类 tells；hallmark 独有：eyebrow 泛滥/字距大写标签/标题单色词/空框架/照片独占/hero 失焦/**表单假提交**（功能诚实维度——与 kit honest-verification 同域但 hallmark 把它做成了 lint 规则）。**立卡补充**（新工单登记，P3 排期——清单扩充是内容工作，待排期）。
3. 素材许可主动边界（拒绝禁止 AI 挑图的图库）是 kit 素材门可引用的先例（记录，kit 现行素材纪律已足够）。

## 不抄什么

50 themes 材料库（kit 无主题分发场景）；"fifty themes"营销话术。

## 借鉴→落地

- K2：增量 96=**anti-slop tells 对照立卡**（新工单登记：hallmark 独有 6-8 条 tells 对照 kit typography-standards 清单，未覆盖项排期补充——P3 内容工单）。
- KPI4：沿第四十四条口径（深看轮无新产物对照面）。
- evals +2：hallmark-gate-tiers-severity-isomorphism / form-false-success-as-tell。

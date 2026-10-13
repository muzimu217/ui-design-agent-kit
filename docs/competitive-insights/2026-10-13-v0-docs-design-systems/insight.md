# 对标洞察：v0 docs「Design Systems 2.0」深读——第二十七轮学习循环（轻量）

- 日期：2026-10-13 ｜ 检视级别：**unverified-partial**（官方文档页实拍+DOM 正文全文抓取；未实机导入设计系统）
- 证据：`docs-design-systems-2-2026-10-13.png`（文档页，含 3:01 官方视频与全目录）
- 对象选择依据：10-11 十六点档复检预告的观察点（"v0 docs design systems 深读"）；本轮画布主线占主要时间，学循环按预告执行轻量深读。

## ① 机制（DOM 正文实据）

1. **设计系统 = skill（适配器，非拷贝）**："A design system is saved as a **skill** in your current scope… A skill is a small, focused set of instructions v0 keeps with your work and pulls in when relevant. It is **not a copy of your docs; it is an adapter** that tells v0 where your source lives, which components, props, and tokens are safe to use."
2. **导入源五类**：可安装 npm 包（.tgz/源码目录）/设计系统源仓库/**消费中的真实 app**（"often the most valuable source"——展示 providers、全局样式、字体、主题、正确用法）/Storybook 与文档/Figma frames；私有包走 NPM_TOKEN。
3. **导入即验证**："v0 reads them, **builds a starter app to verify it understands your system**, and saves a skill in the current scope"——理解验证成为导入流程的内建步骤（starter app = 验证产物）。
4. **范围化保存**：team 或 personal workspace 二级 scope；团队导入失败时降存个人并询问。
5. legacy `shadcn/ui` registry 指南已被 2.0 替代（旧机制退役）。

## ② 研判

- **技能范式被 Vercel 官方收编**：v0 对 skill 的定义（"small, focused set of instructions…pulls in when relevant"）与 Anthropic skill 范式、本仓 22 技能结构**同范式**——生成层与纪律层的技能底座在合流。
- **第四层渗透再进一步**：v0 的"验证"从 bolt 的自动测试（D14）扩展到"**验证 AI 对设计系统的理解**"（starter app）。但仍是黑盒自验：无人工裁决、无证据台账、理解偏差不设门。
- **适配器哲学与我们 design-contract 同构**：我们的契约="告诉 AI 哪些 token/组件可用、如何接线"——v0 用 skill 说同一件事。差异在：我们契约过门 D 人工确认+证据留痕，v0 是一次性导入后自动应用。
- 设计系统前置家族（×4）功能继续深化：从"可选附件"升级为"一级功能页+独立文档+团队 scope"。

## ③ 可借鉴 / ④ 不抄

- 借鉴：①"adapter, not a copy"表述——design-contract 的定位语可直接采用（我们本来就是适配器：引用 brand 基线而非拷贝设计稿）；②"starter app 验证理解"的思路——画布阶段 2 的 chain.json 可加"理解验证"步骤（AI 复述需求摘要供用户比对）。
- 不抄：workspace/scope 体系（无账户）；自动应用无门（正相反）。

## ⑤ 对照表

| 维度 | v0 DS 2.0 | 本 kit | 判定 |
| --- | --- | --- | --- |
| 设计系统载体 | skill 适配器（scope 级） | design-contract 契约+门 D 确认 | 同构；我们多人工门 |
| 理解验证 | starter app 自动验证 | 门 A 方向稿+门 E 浏览器六维 | 方向同、强制性与证据性我们强 |
| 更新 | Keep up to date（文档有节） | 契约修订走门 | 机制待细节读取 |

## ⑥ 补录（同日 10 点档深读 v0.json/审批流节）

- **审批门在 v0 正式落地（修正 10-12 判读）**：导入流程五步——发现源与原语 → 构建 starter app 预览 → **"Pauses for your review before saving anything"** → **"Saves the skill only after you approve it"** → **"Validates the saved skill before confirming"**（保存后验证+给验证过的使用链接）。第四层渗透比昨日评估更进一步：门的概念在 skill 保存流程落地——但仍是**单点导入门**，非全流程门禁+证据台账；"Take the review seriously" 甚至提醒用户审批严肃性。
- **v0.json 机器契约**：`referenceWorkspace.sources`（只读 GitHub 源挂载，≤3 个，含 repo/ref/mountPath）+ `starter`（skill-directory/empty/v0-default 三种）——"the file is the source of truth for what gets applied"。设计系统契约的机器可读化方向与我们 design-contract JSON 化同向。
- **提炼物（Figma frames/docs）蒸馏进 skill instructions**而非长驻 v0.json——输入与契约分层。
- 对本仓画布的即时影响：chain.schema.md 的 `verifyUnderstanding.confirmedBy=user` 门与 v0 的 pause→approve→save 同构——方向再次互证。

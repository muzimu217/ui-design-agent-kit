# bolt.new 复检·第七次（学习循环第八十六轮）

- 日期：2026-10-21 ｜ 点档：13（开发线）｜ 检视级别：**verified-partial**（首屏实看；未登录实测生成流）
- 对象：bolt.new（上次检视 2026-10-11 六检，隔 10 天）
- 截图：bolt-home.png（本地留存，ADR-0002）

## 十日增量（vs 六检）

1. **交付类型扩容**：输入区模式 pill 从 Website/App 扩为 **Website / Slides / App / Prototype** 四类——Slides（演示文稿生成）是新面孔，"什么都能生成"的平台扩张继续；标题也从工具名改为品类词（"Bolt AI builder: Websites, apps & prototypes"）。
2. **模型自动路由升为首屏独立板块**："The best model, every time——Bolt automatically routes to the right model for each task, balancing quality and cost"，且 **Bolt Agent 分 Standard/Max 两档**（Max 为 Pro 专属）。模型中立化从后台机制升级为卖点+计费分层。
3. **设计系统再升级**：83 轮记录的"Create design systems"能力项（10 天前），现已升级为**首屏独立营销板块**"Build with design system——Stop building from scratch. Start building on-brand."。监管侧条目（DS）的权重在十天内从能力清单跳到营销主区。
4. **视觉编辑前移**："Select an element on the preview" 出现在输入框旁——生成前即可框选预览元素，视觉通道进一步前置。
5. **不变项**："98% less errors——Bolt automatically tests, refactors, and iterates" 仍在首屏，仍是黑盒表述（无证据回执、无验收口径可查）；Bolt Cloud 全家桶（数据库/认证/SEO/托管）继续推进。

## 判读

1. **第四层连续 20 轮无对标者**：bolt 的"automatically tests"仍是黑盒宣言——**浏览器实测+证据回执（第四层）依然无人占据**，本仓的独占层在两次复检间未被侵蚀。
2. **监管侧加权是行业同向**：DS 从能力项→营销板块的十日跳变，与 83 轮"平台重心向可控性迁移"判读互证；但他们的 DS 是"可选起点"，本仓是"强制前置门"——强制 vs 可选的差异未变。
3. **交付类型扩张 vs 交付深度**：他们横向加品类（Slides），本仓纵向加证据（音效打点表机验、17 宽度溢出扫描）——两条路线的分野更清晰，不构成同质竞争。
4. **模型路由分层=新的计费叙事**：Standard/Max 按 agent 智力分层收费——"工作流监管"若未来商业化，本仓的对应物是"门禁/证据档位"，此信号记入商业化观察（不展开，identity 层议题仍待裁决）。

## 借鉴→落地

- 借鉴：模型路由的"按任务选模型"表述方式（不抄分层计费）；"Select an element"的预览交互不抄（本仓不做在线生成器）。
- K2：增量 58=60s composition 定义（不渲染）——bolt 横向扩品类的同时，本仓把已有交付做深：同一叙事骨架的第二时长档，含机验。
- KPI4 第十八条：本仓 60s composition 契约 vs bolt Slides 模式——同为"新交付形态"的引入方式对照。

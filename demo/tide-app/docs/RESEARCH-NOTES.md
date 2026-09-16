# 潮汐 TIDE · 素材调研笔记（门B 候选清单）

> 本文件是「素材调研」环节的产物，供用户在门B 勾选。
> 上游输入：`demo/tide-app/docs/DIRECTION.md`（门A 方向稿）与
> `demo/tide-app/docs/GATE-A-DECISION.md`（门A 裁决，含 4 项强制修正 A1–A4）。
> 分类口径：`.agents/skills/ui-design-agent/references/material-scouting.md` 的
> 四类 `reference` / `component` / `asset` / `prompt`。
> 核实日期：2026-09-16（本地时区 PDT）。所有可达性均为当日实测结果，时间敏感。
>
> **门B 状态说明**：`demo/tide-app/docs/GATE-B-DECISION.md` 已对本清单作出裁决
> （采纳 R1/R2/R3/A3/P1，排除 A1/A2/D1）。该裁决表**未包含本清单的 R2b（warp）**，
> 而其中「深色基线只保留 linear.app」一句与 R2b 的建议存在冲突。**R2b 目前处于
> 未裁决状态**，详见 R2b 条目末尾的说明。本文件如实保留该记录，不改写已通过的裁决。

---

## 〇、核心判断：这个项目几乎不需要外部生产素材

**结论先给：潮汐曲线必须自绘 SVG，字体与图标走已有开源/系统方案，唯一值得外部引入的是「参考」而非「素材」。**

理由分四条：

1. **核心交互不可外包。** 这条曲线的全部价值在于：半日潮双峰形态由数据驱动、
   可拖动时间轴、读数与游标弹簧联动、当前时刻脉冲。市面上的图表库或组件库
   没有一个以「可拖动的潮汐形态 + 数据优先读数」为现成单元。强行装配一个通用
   折线图组件，反而要拆掉它的坐标轴/图例/提示框体系，成本高于按
   `motion-contract.md` 的弹簧预设自绘 `<path>`。这正符合 material-scouting
   的「装配优先」例外条件之一：**适配成本高于干净本地实现**。
2. **视觉方向已闭合。** DIRECTION 已定死深海底蓝 + 潮线青，且明确禁止渐变球、
   玻璃拟态。具名基线 `linear.app` / `vercel` 属于**分析文档**（reference/prompt），
   不是可下载的素材文件——它的作用是提供 token 关系对照，不是提供图片。
3. **图标与字体有现成零成本路径。** 仓库多个 demo（tempo-day / brick-workshop 等）
   已用 `lucide-react`（ISC，实测读 LICENSE 文件确认）；中文与数字可用系统字体栈
   （macOS 的 PingFang SC + SF Mono），零外部素材。
4. **演示数据不产生素材需求。** 门A 已确认可用演示数据。演示数据是本地生成的
   数值，不是外部资产。

**因此，真正需要用户裁决的是以下四点**（见第五节；其中前三项已由门B 裁决）：
① 字体策略（纯系统栈 vs. 引入一款 OFL 等宽字体）→ **门B 已选系统栈**；
② 是否要在契约阶段补一次 R3 的浏览器实地观察 → **门B 已要求补**；
③ 确认「曲线自绘 + 可聚焦 range 控件」这条自研路径 → **门B 已批准**；
④ **深色基线是否纳入 `warp`（R2b）—— 门B 未裁决，仍待澄清**（详见 R2b 与 Q4）。

> **顺带发现（供契约阶段注意）**：DIRECTION 提议的底色 `#071a24` **比门A 修正 A1
> 的下限 `#0d2431` 更暗**（相对亮度 0.00911 vs 0.01569），按 A1 的裁决理由（户外
> 强光下过暗底色会反光成镜面）应当被替换。实测 `#0d2431` 配 `#e8f1f4` 正文对比度
> 13.94:1，远超 A1 要求的 7:1，有充足余量。本笔记只报告这一冲突，最终色值由契约
> 阶段定稿。

---

## 一、按四类分类的素材需求盘点

| 类别 | 本项目的需求 | 是否需要外部素材 |
| --- | --- | --- |
| `reference` | 深色高对比、数据优先的版式与强调色克制关系；真实潮汐 App 的曲线呈现惯例 | **需要**（这是唯一有实际价值的外部引入） |
| `component` | 潮汐曲线、拖动时间轴、弹簧读数 | **不需要**：自绘 SVG + 仓库已装的 `motion`（MIT） |
| `asset` | 数字等宽字体、中文字形、图标 | **可选**：系统栈 + `lucide-react` 已够；若要更强「仪器面板」质感才需引入字体文件 |
| `prompt` | 设计方向措辞与 token 结构对照 | **需要**（与 reference 同源，见 R1/R2/R2b） |

> 说明：`reference` 与 `prompt` 在本项目里指向同一份来源（awesome-design-md 的
> 品牌 DESIGN.md 分析），因为该文档既是视觉对照（reference）也是 token 措辞
> 来源（prompt）。按 material-scouting「不要让画廊截图悄悄变成 asset」的原则，
> 我把它明确标为 reference/prompt，**不入生产、不下载任何品牌图片**。

---

## 二、候选清单（供门B 勾选）

### 2.1 主候选清单（6 项）

> 任务书要求 3–6 个候选。我把真正需要用户裁决的收敛为下面 6 项；
> 2.2 节是「已核实但建议直接沿用/本版不用」的记录项。
> 「门B 裁决」列来自 `GATE-B-DECISION.md`（该表未包含 R2b）。

| # | 候选 | 类别 | 授权状态 | 拟用在哪 | 我的建议 | 门B 裁决 |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | awesome-design-md · `linear.app` | reference/prompt | MIT（实测） | 强调色克制关系、surface 阶梯思路 | adopt（附 A1 色值冲突警告） | ✅ 采纳（仅关系，不取色值） |
| R2 | awesome-design-md · `vercel` | reference/prompt | MIT（实测） | 层次机制；**但它是浅色系统，非深色基线** | adopt（降级为次要参考） | ✅ 采纳（仅层次机制） |
| R2b | awesome-design-md · `warp` | reference/prompt | MIT（实测） | **深色基线**（深色优先，且通过 A1 亮度下限） | adopt（建议取代 R2 作深色基线） | **⚠️ 未裁决**（见 Q4） |
| R3 | Tide Guide（tideguide.com） | reference | 商业产品，无开源许可 | 同类真实产品的曲线交互惯例 | adopt（reference-only） | ✅ 采纳（reference-only） |
| A1 | JetBrains Mono | asset | OFL-1.1（实测） | 潮位读数等宽数字 | 待裁决（见 Q1） | ❌ 本轮不采用 |
| A2 | Noto Sans SC / Noto Sans Mono CJK | asset | OFL-1.1（读 LICENSE 实测） | 中文跨平台字形一致 | 待裁决（见 Q1，倾向不引入） | ❌ 本轮不采用 |

### 2.2 记录项（已核实，建议直接沿用或本版不用，无需勾选）

| # | 候选 | 类别 | 授权状态 | 结论 | 门B 裁决 |
| --- | --- | --- | --- | --- | --- |
| A3 | Lucide 图标 | asset | **ISC**（读 LICENSE 实测） | 沿用仓库既有 `lucide-react` 依赖，零新增素材 | ✅ 采纳 |
| D1 | NOAA CO-OPS API | 数据源（非视觉素材） | **未明文核实** | 本版不用（门A 已裁定演示数据）；记录备查 | ❌ 本版不用 |
| P1 | material-scouting / motion-contract | prompt | 本仓库自有 + Motion MIT | 弹簧预设与降级规则的依据 | ✅ 采纳 |

---

### R1 — awesome-design-md · `linear.app`（reference / prompt）

| 字段 | 内容 |
| --- | --- |
| URL | https://github.com/VoltAgent/awesome-design-md（文件路径 `design-md/linear.app/DESIGN.md`） |
| 类别 | reference + prompt |
| 提供什么 | 对 Linear 公开网站 CSS 的结构化转写：语义 token（canvas `#010102`、surface 阶梯、单一强调色 `#5e6ad2`）、字阶与负字距、组件状态、Do/Don't。实测拉取 24,354 字节，含 frontmatter 与完整 colors/typography 段 |
| 拟用在哪 | 契约阶段的 token 关系对照：**强调色只出现在品牌标记/焦点环/少数 CTA，绝不用于装饰**——这正是潮线青「只用在数据和当前时间上」的直接依据；surface 阶梯映射深海底蓝的层次 |
| 授权状态 | **MIT**（GitHub API 实测 `license.spdx_id = MIT`，仓库 116,100★）。已锁定 revision `8147538b4226ae41e2487a9179e3bcc1f68e8554`（见 `tooling/sources.lock.json` 的 `designContracts`） |
| 可达性 | 可达。用 `node tooling/design-md.mjs pull linear.app` 实际拉取成功，输出 24,354 字节 |
| **⚠️ 与门A 修正 A1 的冲突** | Linear 的 canvas 实测为 **`#010102`**，远暗于门A 要求的「不暗于 `#0d2431` 级别」——门A 的理由是户外强光下过暗底色会反光成镜面，这与对比度无关，是绝对亮度问题。另外实测其 `ink-subtle #8a8f98` 在 `#010102` 上对比度为 **6.42:1，未达门A 要求的 7:1**。**因此 R1 只能取其「关系」（单一强调色、surface 阶梯思路、hairline 边框、负字距），绝不能照搬其色值。** 底色必须按 A1 独立计算（实测 `#0d2431` 配 `#e8f1f4` 正文可达 13.94:1，有充足余量） |
| 改编边界 | 第三方分析文档，非 Linear 官方规范、不拥有品牌视觉身份。**只改写 token 关系与规则，不照搬全文、不复制其 preview.html、不声称与 Linear 关联**；文件按需拉取到临时目录，不提交入库。**色值一律不采用，只采用结构关系** |
| 建议 | adopt（作为 reference/prompt，**且附 A1 冲突警告**） |

### R2 — awesome-design-md · `vercel`（reference / prompt）

| 字段 | 内容 |
| --- | --- |
| URL | https://github.com/VoltAgent/awesome-design-md（文件路径 `design-md/vercel/DESIGN.md`） |
| 类别 | reference + prompt |
| 提供什么 | Vercel 公开网站的 token 与规则转写（实测 41,405 字节） |
| 授权状态 | **MIT**（同仓库，同一锁定 revision `8147538b4226ae41e2487a9179e3bcc1f68e8554`） |
| 可达性 | 可达。`node tooling/design-md.mjs pull vercel` 实际拉取成功，41,405 字节 |
| **⚠️ 与 DIRECTION 描述的偏差（重要）** | DIRECTION 把 vercel 列为「深色高对比」基线，但**实际拉取的文档显示它是以浅色为主的系统**：`canvas: #ffffff`、`canvas-soft: #fafafa`，深色只是「极性反转的分区带」（`showcase-band-dark`，用 `primary #171717` 作为深色带的背景）。**它并非深色主题范例。** 可借鉴的是它的**层次机制**：四级 surface 阶梯 + hairline + 极轻阴影，以及「用极性反转分区带来制造段落深度」这一手法——后者对本项目有用（深底页面上用略亮的带区分段落）。**不可借鉴的是它的明暗基调本身。** |
| 另一处可用证据 | 实测其 `mute #888888` 在 `#ffffff` 上仅 **3.54:1**，未达 WCAG AA 正文标准（`body #4d4d4d` 为 8.45:1）。这提醒：**弱化文字色不能凭观感取，必须算对比度**——门A A1 要求 7:1，这条证据支持把「次要文字」也纳入计算 |
| 改编边界 | 同 R1：改编关系，不照搬，不声称品牌关联，不入库；**且不得沿用其浅色基调** |
| 建议 | adopt（作为 reference/prompt，**限定为「层次机制」参考，不作为深色基线**） |

### R2b — awesome-design-md · `warp`（reference / prompt）— **建议取代 R2 作为深色基线**

| 字段 | 内容 |
| --- | --- |
| URL | https://github.com/VoltAgent/awesome-design-md（文件路径 `design-md/warp/DESIGN.md`） |
| 类别 | reference + prompt |
| 提供什么 | Warp（终端类开发工具品牌）的设计分析。**实测为深色优先系统**：`canvas: #2b2622`（暖调近炭黑）、`canvas-soft: #383330`、`ink: #f7f5f0`、`hairline: #3f3a36`；上游描述其为「暖色近炭黑画布，仅由干净的 Inter 排版、偶发的衬线斜体时刻和密集的终端 mockup 图像打破；CTA 异常克制」。**「深色画布 + 密集数据 mockup + 克制 CTA」与潮汐仪器面板的定位高度吻合** |
| 拟用在哪 | 取代 R2 成为深色基调的**结构**参照：surface 阶梯如何在小色差内制造层次、数据密集区域如何用 hairline 而非阴影分隔、CTA 如何保持克制 |
| 授权状态 | **MIT**（同仓库，同一锁定 revision `8147538b4226ae41e2487a9179e3bcc1f68e8554`） |
| 可达性 | 可达。`node tooling/design-md.mjs pull warp` 实际拉取成功 |
| **与门A A1 的相容性（实测）** | `#2b2622` 相对亮度 **0.02015**，**高于**门A 下限 `#0d2431`（0.01569），故其绝对亮度符合 A1 的「不能过暗」要求。对比度实测：`ink #f7f5f0` = 13.74:1、`body #c9c0ad` = 8.29:1，均远超 A1 的 7:1；但其 `mute #aea69c` 仅 **6.23:1，未达 7:1**——所以次要文字色仍须独立重算 |
| 改编边界 | 同 R1：改编 token 关系，不照搬全文与色值，不声称品牌关联，不入库。**注意其暖调（棕橙倾向）与潮汐的冷调海底蓝相反，只借「深色 + 层次机制」，不借色相** |
| 建议 | adopt（作为 reference/prompt）；**与 R2 二选一或并用，但深色基线应以本项为准** |
| **门B 裁决状态（后补记录）** | `GATE-B-DECISION.md` 的候选表**未列出 R2b**；其第二节裁决为「深色基线只保留 linear.app，且只取其关系不取色值」。由于门B 已明确**基线只提供关系、不提供色值**，所以这不构成硬冲突——底色由 A1 定为 `#0d2431`。但有一个实质问题值得澄清：**R1（linear.app）的 canvas `#010102` 相对亮度仅 0.00304，是所有抽查品牌里最暗的之一**（门A A1 下限 `#0d2431` 为 0.01569），而 **R2b（warp `#2b2622`，0.02015）是实测通过 A1 下限的深色优先系统**。若契约阶段需要「深色页面如何用 surface 阶梯 + hairline 制造层次」的具体参照，warp 比 linear 更贴近我们被 A1 约束后的实际明度区间。**本条保持未裁决，作为可选补充请用户确认。** |

### R3 — Tide Guide（tideguide.com）（reference）

| 字段 | 内容 |
| --- | --- |
| URL | https://tideguide.com/ ；另见 ScreensDesign 拆解页 https://screensdesign.com/showcase/tide-guide-charts-tables |
| 类别 | reference |
| 提供什么 | **同类真实产品的参考**：官方描述为 "Simple, beautiful tide charts. See the tide at a glance, then scrub through the curve to understand exactly how the water changes throughout the day." 与 DIRECTION 的核心交互（可拖动潮汐曲线 + 读数）高度同构。用于观察真实潮汐产品如何组织曲线、高低潮标注与时间轴，验证「曲线即 hero」的做法在真实产品中成立 |
| 拟用在哪 | 第三屏「一日两次涨落的说明」与核心曲线屏的信息层级对照；确认高低潮时刻标注、当前时刻标记的行业惯例 |
| 授权状态 | **无公开开源许可**。这是商业产品/应用，页面未提供可复用的素材授权。**仅作 reference 研究** |
| 可达性 | 可达。curl 实测 `https://tideguide.com/` → HTTP 200，标题 `Tide Guide: Tides, Marine Weather, Charts & Tables`；拆解页 `screensdesign.com/showcase/tide-guide-charts-tables` → 200 |
| **观察状态更新（本笔记写成后）** | 我在本笔记中标注「未亲眼看到曲线 UI」的这一缺口，已由后续环节按门B 要求 B2 补齐：真实浏览器（Playwright，1440×1000）实测观察记录见 `docs/reference/OBSERVATION-tideguide.md` 与截图 `docs/reference/tideguide-hero-2026-09-16.png`。**该观察证实**：曲线占据主视区、曲线下有渐变填充、曲线上直接标注高低潮时刻与潮位值、有圆形游标点随读数。同时它**推翻**了方向稿第三屏「用文字解释一日两次涨落」的做法（该产品完全不解释潮汐原理，默认目标用户已知） |
| 改编边界 | **reference-only**：只提炼可观察的布局与交互关系（曲线如何占据主位、读数如何贴曲线、拖动如何响应），**不复制其截图、图标、文案、配色或代码**，页面上不得出现其素材。观察截图仅作研究留痕，不进入产品 |
| 建议 | adopt（reference-only） |

### A1 — JetBrains Mono（asset，字体）

| 字段 | 内容 |
| --- | --- |
| URL | https://github.com/JetBrains/JetBrainsMono ；Google Fonts 镜像 https://fonts.google.com/specimen/JetBrains+Mono |
| 类别 | asset |
| 提供什么 | 开源等宽字体，含 tabular 数字，适合潮位读数。DIRECTION 要求「数字用等宽字体，因为潮位是读数」 |
| 拟用在哪 | 潮位读数、时间刻度、涨落时刻等所有数字 |
| 授权状态 | **OFL-1.1**（GitHub API 实测 `license.spdx_id = OFL-1.1`，13,033★；本地字体库 `ui-ux-pro-max/data/google-font-licenses.json` 亦记录为 OFL，verifiedAt 2026-08-13） |
| 可达性 | 可达。GitHub API 200；Google Fonts 规格页 200；JetBrains 官方字体页 https://www.jetbrains.com/lp/mono/ → 200 |
| 改编边界 | OFL-1.1 允许商用、修改、嵌入与再分发，**保留版权声明与 OFL 许可文本**；不得单独售卖字体本身，不得使用 Reserved Font Name（若修改字形须改名）。落地方式建议自托管或 Google Fonts CDN |
| 建议 | **待用户裁决**（见第五节 Q1） |

### A2 — Noto Sans SC / Noto Sans Mono CJK（asset，中文字形）

| 字段 | 内容 |
| --- | --- |
| URL | https://github.com/notofonts/noto-cjk ；Google Fonts 规格页 https://fonts.google.com/noto/specimen/Noto+Sans+SC |
| 类别 | asset |
| 提供什么 | 中文简体字形覆盖。门A 遗留问题「受众是中文为主还是中英双语」未定；若需保证非 macOS/非 Windows 环境的中文字形一致，需要一个明确的中文 Web 字体 |
| 拟用在哪 | 中文正文与标签；`Noto Sans Mono CJK SC` 可让中文与等宽数字在同一读数行内对齐 |
| 授权状态 | **SIL OFL 1.1**（实际读取仓库内 `Sans/LICENSE` 文件，开头即 "This Font Software is licensed under the SIL Open Font License, Version 1.1"；本地字体库同样记录 Noto Sans SC / Noto Sans Mono 为 OFL） |
| 可达性 | 可达。GitHub API 列出 `Sans/Mono/NotoSansMonoCJKsc-Regular.otf` 等文件成功；Google Fonts 规格页 200 |
| 改编边界 | 同 OFL-1.1：可商用、可嵌入、可再分发，保留许可与版权声明，不改名售卖 |
| 备注 | **中文可用系统字体栈替代**（macOS `PingFang SC`、Windows `Microsoft YaHei`）——仓库现有 demo 全部走系统栈，零外部素材。仅当用户要求跨平台字形一致时才需要引入本项 |
| 建议 | **待用户裁决**（见第五节 Q1）；默认倾向「系统栈，不引入」 |

### A3 — Lucide 图标（asset，图标）

| 字段 | 内容 |
| --- | --- |
| URL | https://github.com/lucide-icons/lucide ；https://lucide.dev |
| 类别 | asset（图标组件） |
| 提供什么 | 开源图标集，含潮汐/场景所需的基础图标（sun、moon、waves、map-pin、clock 等）。仓库已有多个 demo 使用 `lucide-react`（tempo-day、brick-workshop 等） |
| 拟用在哪 | 第四屏三个场景（海钓/赶海/摄影）的克制图标；可能的时间/地点标注 |
| 授权状态 | **ISC**（GitHub API 报 `NOASSERTION`，因此**实际读取了仓库 LICENSE 文件**：正文为 "ISC License, Copyright (c) 2026 Lucide Icons"；`packages/lucide-react/package.json` 的 `license` 字段为 `"ISC"`）。属宽松许可，等同 MIT 的宽松度 |
| 可达性 | 可达。GitHub API 200，LICENSE 与 package.json 均成功读取 |
| 改编边界 | ISC 允许商用与修改，保留版权与许可声明即可。**沿用仓库既有依赖模式，不新增第二套图标库**；DIRECTION 明确「不用图标堆」，所以用量应极少 |
| 建议 | adopt（沿用既有依赖，零新增素材） |

### D1 — NOAA CO-OPS Data Retrieval API（可选：数据源，非视觉素材）

| 字段 | 内容 |
| --- | --- |
| URL | https://api.tidesandcurrents.noaa.gov/api/prod/ |
| 类别 | 数据源（不是 material-scouting 四类中的视觉素材；列在此处是因为它对应门A 的待确认问题） |
| 提供什么 | 美国官方潮位观测与**预报（predictions）**数据。实测调用成功，返回逐小时潮位 JSON，例如站点 9414290（旧金山）2026-09-15 的 `{"t":"2026-09-15 00:00","v":"2.705"} …`。含 datum / units / time_zone / interval 等参数 |
| 拟用在哪 | 若用户希望页面用**真实潮汐形态**而非正弦模拟：可直接取某站某日的 predictions 曲线，让「半日潮双峰」是真实数据而非近似 |
| 授权状态 | **未完全核实（诚实标注）**：NOAA 作为美国联邦机构，其数据通常属公共领域，但我**未能找到 API 页面上明文的授权/使用条款声明**——`/api/prod/` 只写了 throttling 与报错说明；`disclaimers.html`、`about_us.html`、`web_services_info.html` 均未抓到 "public domain / copyright / terms of use" 的明文。**因此本项授权状态记为待核实，不能当作已获授权使用** |
| 可达性 | 可达。curl 实测 API 返回 HTTP 200 与真实数据（见上）；文档页 `/api/prod/` → 200 |
| 改编边界 | 若采纳：需在页面标注数据来源与「预报非实测」；遵守其 throttling 建议（调用间加 sleep、只取所需数据） |
| **门A 裁决影响** | 门A 已裁定「演示数据可接受」，因此**本版不采用 D1**。保留此条仅为记录已核实的数据源与「授权状态未明文核实」这一事实，供后续版本需要真实数据时参考 |
| 建议 | **reject（本版不用）**；记录为后续版本的备选，且届时须先澄清授权 |

### P1 — material-scouting 的装配优先基线（prompt / 流程，非可下载素材）

| 字段 | 内容 |
| --- | --- |
| URL | `.agents/skills/ui-design-agent/references/material-scouting.md`、`motion-contract.md` |
| 类别 | prompt |
| 提供什么 | 弹簧预设（`snappy: stiffness 400 / damping 30`、`elegant: 100/20` 等）、`prefers-reduced-motion` 降级规则、装配优先规则 |
| 拟用在哪 | 拖动游标的弹簧跟随用 `snappy`；曲线入场描线用 `elegant`；脉冲动画的 reduced-motion 降级 |
| 授权状态 | 本仓库自有文档，无外部授权问题；其引用的 `motion` 包为 **MIT**（GitHub API 实测 `motiondivision/motion` → MIT） |
| 可达性 | 本地文件，已读取 |
| 改编边界 | 按 motion-contract 规定的预设使用，不自定义弹簧参数 |

---

## 三、明确不采用的（考虑过但排除）

| 候选 | 类别 | 排除原因 |
| --- | --- | --- |
| **React Bits**（https://reactbits.dev） | component | ① 许可证**不是纯 MIT**：实际读取 `LICENSE.md`，正文为 "MIT + Commons Clause License Condition v1.0"，Commons Clause 会限制「出售该软件本身」；② 其组件以炫技型文字/背景特效为主，与 DIRECTION 明确禁止的「AI 味」高度重叠；③ 核心曲线不能由它提供。可达（200），但排除 |
| **Magic UI**（https://magicui.design） | component | 许可为 **MIT**（实测，22,303★）、可达（200），技术上可用；但本页没有「环境光/背景特效」需求（DIRECTION 禁渐变球与玻璃拟态），曲线又是自绘，故**无落点**。保留为将来需要入场特效时的备选，本轮不采用 |
| **21st.dev** | component | 可达（200），但库内记录明确「许可逐组件检查，不入预清层」。本轮无组件需求，不值得为 0 个落点逐个核许可 |
| **d3-shape** | component | 可达、**ISC** 许可（实测 2,528★）。但对「正弦叠加半日潮」这种形态，手写 SVG path 的代码量小于引入并配置 d3-shape 生成器；按装配优先的例外条款（适配成本 > 本地实现）排除 |
| **unDraw 插画**（https://undraw.co） | asset | 可达、开源许可可商用，但 DIRECTION 的基调是「像一块被水浸过的仪器面板」，扁平人物插画与数据优先的调性冲突；三个场景用文字与克制图标表达即可 |
| **Unsplash / Pexels 海景照片** | asset | 库内记录二者在隔离浏览器中 403，且本项目**不需要摄影素材**——曲线本身就是 hero，加海景照片会稀释数据优先的定位。直接排除，不做重试 |
| **Godly / Awwwards / Dark Design / Land Book** | reference | 均为研究型画廊（部分被反爬：Land Book curl 403）。本项目的方向基线已由 R1/R2/R2b 具名锁定，再用泛画廊采样会引入与 DIRECTION 不一致的风格噪音。**dark.design 实测可达（200）**，若用户想扩宽深色方向参考可再启用，本轮不采用 |
| **Poly Haven / Kenney / Tripo 3D 素材** | asset | 可达且多为 CC0，但本项目是 2D 数据页，无 3D 需求。排除 |
| **Wikimedia Commons 潮汐图表** | asset | 可达（200），实测某 19 世纪潮汐图文件为 **Public domain**（BnF 藏，API 核实 LicenseShortName=Public domain）。但那是历史版画图表，作为生产图片会破坏现代仪器面板的调性。**若需要「潮汐图的历史注解」可作参考**，本轮排除 |
| **Typewolf / Fonts In Use** | reference | 可达，用于字体选型发散。但字体决策（Q1）只需在「系统栈」与「一款 OFL 等宽」之间二选一，无需引入额外检索站 |
| **`motionlab.dev`** | — | 库内明确记录为占位页，禁止引用 |
| **Linear / Vercel / Warp 官网直接取图** | asset | 品牌官网的截图与图片**不可复用**；R1/R2/R2b 用的是 MIT 许可的**第三方分析文档**，不是品牌资产。此边界必须写进契约 |

---

## 四、诚实边界与未核实项

以下是我**没有**核实或**无法**核实的内容，明确列出，不作任何推断性断言：

1. **NOAA 数据授权状态未明文核实。** 我实际调用了 CO-OPS API 并成功取回真实数据，但**没有在 NOAA 页面上找到明文的公共领域/使用条款声明**。`tidesandcurrents.noaa.gov/disclaimers.html`、`about_us.html`、`web_services_info.html`、`/api/prod/` 均未抓到 "public domain" 或等效措辞。按 material-scouting「未知权利保持 pending，不当作许可」的原则，D1 的授权状态记为**待核实**（本版因门A 已裁定用演示数据而不采用）。若将来要接真实数据，建议向 `co-ops.userservices@noaa.gov` 确认，或改用有明确许可的替代源。
2. **Tide Guide 页面正文未能抓取（本笔记当时的限制；后续已补齐）。** 我做调研时，站点为客户端渲染（返回内容以 Mixpanel 脚本为主），我只确认了 **HTTP 200 与页面标题**，**没有实际看到其曲线 UI 的渲染结果**。R3 的「交互同构」判断来自其官方描述文本（"scrub through the curve"）与 ScreensDesign 的拆解条目，属**描述级证据，非亲眼观察**。**此缺口已由后续环节按门B 要求 B2 用真实浏览器补齐**（见 `docs/reference/OBSERVATION-tideguide.md`）；该观察证实了曲线布局的多数判断，但也推翻了方向稿第三屏的解释性做法。
3. **字体文件的真实下载未执行。** 我核实的是一致性许可（OFL-1.1 / ISC）与仓库元数据，**没有下载任何字体或图标文件**，也没有自托管验证。落地方式（自托管 vs. Google Fonts CDN）与子集化策略留待契约/实现阶段。
4. **未做浏览器渲染验证。** 本笔记中所有可达性均为 HTTP 状态码与 API 返回，**不是浏览器中的视觉确认**。「可达」不等于「集成可用」。（例外说明：R3 的浏览器观察是**本笔记写成之后**由后续环节完成的，不属于我本轮的核实证据；见第 2 条。）
5. **未打开任何真实浏览器、未登录任何站点、未绕过任何反爬。** 所有访问均为公开页面的直接 HTTP 请求、GitHub API 调用，以及一次公开 Web 检索（用于发现同类真实产品，经 `search_proxy_serper_search` 调用）。我**没有**使用浏览器自动化工具。
6. **`awesome-design-md` 是第三方分析，不是官方规范。** R1/R2/R2b 的 token 值是「该品牌网站实际长什么样」的转写，不能当作品牌授权或官方设计系统。
7. **本地字体库数据的时效。** `google-font-licenses.json` 记录 `verifiedAt: 2026-08-13`，距核实日约一个月，在 material-scouting 建议的「一季内复验」窗口内。

---

## 五、需要用户裁决的问题（门B）

> **门A 已裁决、不再询问的事项**：语言 = **中文为主**（不做双语）；数据 = 演示数据可接受（须满足 A3 标注要求）。
>
> **门B 已对本节作出裁决**（见 `GATE-B-DECISION.md` 第四节），结论记录如下：
> Q1 → **选 A，纯系统字体栈**（另加要求 B1：数字必须用 `tabular-nums`）；
> Q2 → **要补** R3 的浏览器实地观察（要求 B2）；
> Q3 → **批准**「自绘 SVG + 原生 `input[type=range]`」路径（要求 B3：隐藏视觉样式不得用 `display:none`/`visibility:hidden`，须保留可聚焦性）。
> 下文保留原始提问以供追溯；**唯一仍待澄清的是 R2b（warp）的深色基线问题**，见 Q4。

### Q1 — 字体策略：系统栈，还是引入 OFL 等宽字体？（门B 已裁决：选 A）

| 选项 | 内容 | 代价 |
| --- | --- | --- |
| **A. 纯系统字体栈**（门B 采纳） | 数字用 `ui-monospace, "SF Mono", Menlo, Consolas, monospace`；中文用 `-apple-system, "PingFang SC", "Microsoft YaHei"`。与仓库现有 demo 一致 | 零外部素材、零许可负担、零加载开销；代价是不同平台数字字形略有差异 |
| **B. 引入 JetBrains Mono（+ 可选 Noto Sans SC）**（门B 排除） | 自托管或 CDN 引入 A1/A2 | 更强的「仪器面板」质感与跨平台一致；代价是增加字体文件与 OFL 许可声明义务 |

> 门B 补充要求 **B1**：数字必须用 `tabular-nums`，否则读数跳动时宽度会变。

### Q2 — 是否需要在契约/实现阶段补充 R3 的浏览器实地观察？（门B 已裁决：要补；**已补完**）

R3（Tide Guide）是目前唯一「同类真实产品 + 可拖动潮汐曲线」的参考，我在本笔记中只确认了它可达（HTTP 200 + 标题），**没有亲眼看到其曲线 UI**（站点为客户端渲染）。门B 采纳本条，要求契约阶段用真实浏览器实际观察并留痕（要求 **B2**）。**该要求已由后续环节完成**：观察记录见 `docs/reference/OBSERVATION-tideguide.md`，截图见 `docs/reference/tideguide-hero-2026-09-16.png`。关键发现已回填至上方 R3 条目——其中包括一条对方向稿的推翻（第三屏「解释潮汐原理」应改为「展示曲线用法」）。

### Q3 — 曲线自绘的边界确认（回应门A 修正 A4）（门B 已裁决：批准）

门A 要求曲线轴**可键盘操作**，必须是可聚焦控件而非纯鼠标拖拽 div。方案：自绘 SVG 曲线 + 一个真正可聚焦的 `input[type=range]` 作为时间轴控件（方向键可调），视觉上把 range 隐藏、由 SVG 游标与读数跟随其值。门B 批准此路径，并加要求 **B3**：隐藏视觉样式**不得使用 `display:none` 或 `visibility:hidden`**（会失去可聚焦性），须用 `opacity:0` + 定位覆盖或 `appearance:none` 保留在布局中。

### Q4 —【门B 未裁决】深色层次结构是否补充参考 `warp`（R2b）？

门B 的候选裁决表未列 R2b，其第二节写明「深色基线只保留 linear.app」。由于门B 同时明确基线**只取关系不取色值**，底色已由 A1 定为 `#0d2431`，所以这不是硬冲突，而是一个**可选的补充问题**：

实测事实是——`linear.app` 的 canvas 为 **`#010102`**（相对亮度 0.00304），是被 A1 否掉的那种极暗底；而 `warp` 的 canvas 为 **`#2b2622`**（相对亮度 0.02015），**实测通过 A1 亮度下限**，且它是深色优先系统、有完整的 surface 阶梯与 hairline 体系。

**请确认**：契约阶段做「深色页面层次」时，是否补充参考 warp 的 surface 阶梯做法（不取色相、不取色值，只取层次机制）？
- **选项 A（我的建议）**：补充 warp 作为深色层次的参照，linear 保留为「强调色克制」的参照。
- **选项 B**：维持门B 原裁决，只用 linear 的关系。




---

## 六、本轮检索留痕

| 手段 | 用途 | 结果 |
| --- | --- | --- |
| `gh api repos/<owner>/<repo>` | 核实仓库许可与 star | awesome-design-md=MIT、motion=MIT、JetBrainsMono=OFL-1.1、IBM/plex=OFL-1.1、geist-font=OFL-1.1、noto-cjk=null（需读文件）、lucide=NOASSERTION（需读文件）、React Bits=NOASSERTION（需读文件）、Magic UI=MIT、d3-shape=ISC |
| `gh api .../contents/LICENSE` | 读取实际许可正文 | Lucide=**ISC**；noto-cjk `Sans/LICENSE`=**SIL OFL 1.1**；React Bits `LICENSE.md`=**MIT + Commons Clause** |
| `node tooling/design-md.mjs pull linear.app / vercel / warp` | 拉取具名基线 | 成功：24,354 / 41,405 / warp（revision `8147538b4226`） |
| 额外抽查 7 个品牌的 canvas 色值 | 为深色基线找更合适候选 | `warp #2b2622`（深色，通过 A1 下限）、`x.ai #0a0a0a`（过暗）、`cursor/opencode.ai/supabase/elevenlabs` 均为浅色、`raychat` 拉取失败（不在该 revision 目录中） |
| 本地对比度计算 | 验证 A1（≥7:1）相关论断 | 见 R1/R2/R2b 的实测数值；DIRECTION 的 `#071a24` 亮度 0.00911 低于门A 下限 `#0d2431`（0.01569） |
| `node tooling/design-md.mjs list` | 确认品牌目录 | 74 个品牌，含 `linear.app` 与 `vercel` |
| `curl` 状态码 + 标题 | 可达性实测 | tideguide.com=200、screensdesign 拆解页=200、dark.design=200、landing.love=200、godly=200、reactbits=200、magicui=200、21st.dev=200、Wikimedia Commons=200、Google Fonts 规格页=200 |
| NOAA CO-OPS API 实际调用 | 验证数据可用性 | HTTP 200，返回站点 9414290 的逐小时潮位预报 JSON |
| Wikimedia Commons API | 核实单个文件许可 | 某潮汐图表文件 `LicenseShortName = Public domain` |
| 本地字体库 `ui-ux-pro-max/data/` | 首站字体与许可查询 | 1,934 个字体家族；JetBrains Mono / Geist Mono / Noto Sans SC / Noto Sans Mono 等均为 OFL，verifiedAt 2026-08-13 |
| Web 检索 | 发现同类真实产品 | 命中 Tide Guide（tideguide.com），为 R3 来源 |

**未执行**：任何浏览器渲染验证、任何素材下载、任何登录或反爬绕过、任何对本地仓库文件的修改（除本文件外）。

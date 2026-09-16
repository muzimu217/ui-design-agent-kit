# 潮汐 TIDE · 产品页设计契约

> 本文件是阶段 3（原型与契约）的设计契约，结构遵循
> `.agents/skills/ui-design-agent/references/design-contract.md`。
> 上游：`DIRECTION.md`（门A 方向稿）、`GATE-A-DECISION.md`（A1–A4）、
> `RESEARCH-NOTES.md`（门B 候选清单）、`GATE-B-DECISION.md`（B1–B3）、
> `reference/OBSERVATION-tideguide.md`（R3 实地观察，推翻了方向稿第三屏）。
>
> 本阶段**不写实现代码**。契约中的一切数值均为设计期定稿值，实现阶段照此落地。
> 所有对比度数值由我在设计期用 WCAG 2.x 相对亮度公式（sRGB 线性化 + `(L1+0.05)/(L2+0.05)`）
> 本地计算得出，未使用浏览器，也未做渲染验证。

---

## 参考基线与授权（authoring workflow 第 2 步）

| 来源 | 路径 / URL | 采用的部分 | 不采用的部分 | 授权 |
| --- | --- | --- | --- | --- |
| R1 · awesome-design-md `linear.app` | https://github.com/VoltAgent/awesome-design-md，revision `8147538b4226ae41e2487a9179e3bcc1f68e8554` | 仅关系：单一强调色只出现在少数关键位置（焦点环、主 CTA、数据本体），绝不用于装饰；负字距 | **全部色值**（其 canvas `#010102` 相对亮度 0.00033，远低于 A1 下限；其 `ink-subtle #8a8f98` 在其底色上仅 6.42:1，未达 7:1） | MIT（第三方分析文档，非品牌官方规范；不声称关联） |
| R2 · awesome-design-md `vercel` | 同上仓库 | 仅层次机制：四级 surface 阶梯 + hairline 分隔 + 极性反转分区带 | **其浅色基调**（实测 canvas `#ffffff`，方向稿误标为深色基线）；其 `mute #888888` 在 `#ffffff` 上仅 3.54:1，作为反面教材记录 | MIT（同上） |
| R3 · Tide Guide | https://tideguide.com/ | 仅可观察的布局与交互关系：曲线占据主视区、高低潮时刻与潮位直接标在曲线上、圆形游标带读数 | 截图、图标、文案、配色值、代码一律不复制；页面上不得出现其任何素材或品牌元素 | 商业产品，无开源许可，**reference-only** |
| P1 · 本仓库动效规范 | `.agents/skills/ui-design-agent/references/motion-contract.md` | 具名弹簧预设、降级规则、微编排规则 | — | 本仓库自有；其引用的 `motion` 包为 MIT |
| A3 · Lucide 图标 | https://lucide.dev | 沿用仓库既有 `lucide-react` 依赖 | 不新增第二套图标库；用量极少 | ISC（实测读 LICENSE 文件） |
| 字体 | 系统栈 | — | **不引入 JetBrains Mono / Noto Sans SC**（门B Q1 裁决） | 无外部许可义务 |

**R2b（`warp`）状态：未裁决，见文末「冲突与待定」。本契约不采用其任何内容。**

---

## 1. Mission

让一位海钓或赶海的人，在手机上打开页面后**不滚动**就能看到今天的潮位读数，并能用键盘或手指沿时间轴拖动曲线，查清"今天几点能下水"。

（界面存在的一句话目的；不含"提升品牌认知"这类不可证伪的表述。）

## 2. Brand

- **产品**：潮汐 TIDE —— 潮汐读数与曲线的产品页，第一版为单页 + 一个可真实交互的曲线。
- **受众**：周末出海钓鱼的人、带孩子赶海的家长。他们**已经知道潮汐是什么**，不需要被科普（R3 观察结论）。
- **主要任务**：10 秒内看懂"这个 App 能告诉我今天什么时候能下水"，并愿意试。
- **目标载体**：移动端优先的网页（375×812 为首要视口），桌面 1440×900 为次要视口。户外强光与夜间清晨是两种真实使用环境。
- **内容现实**：
  - 数据是**本地生成的演示数据**（半日潮正弦叠加），**不是真实潮汐预报**。任何"预报"字样必须伴随演示标注（A3）。
  - 语言：**中文为主，不做双语**（门A 裁决）。
  - 不接真实数据源（D1 NOAA 本版排除；其授权状态未明文核实）。
- **非目标**：账号系统、多语言、真实数据接入、后端。

## 3. Style foundations

### 3.1 Color — 语义 token

底色按门A A1 定为 `#0d2431`（相对亮度 **0.01569**），高于方向稿 `#071a24`（0.00911），满足"不暗于 `#0d2431` 级别"。

**Surface 阶梯**（借鉴 R2 的四级层次机制，色值自算）：

| Token | 值 | 相对亮度 | 与 canvas 的对比度 | 用途 |
| --- | --- | ---: | ---: | --- |
| `--surface-canvas` | `#0d2431` | 0.01569 | 1.000 | 页面底色（A1 定值） |
| `--surface-1` | `#102937` | 0.01972 | 1.061 | 曲线绘图区背景、极性反转分区带 |
| `--surface-2` | `#132f3d` | 0.02508 | 1.143 | 场景卡、读数面板 |
| `--surface-3` | `#163646` | 0.03251 | 1.256 | 高低潮标注 chip、悬浮层 |

**文字与前景 token**（每个值都在其上可能出现的**全部四个 surface** 上计算）：

| Token | 值 | canvas | surface-1 | surface-2 | surface-3 | 结论 |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `--text-primary` | `#e8f1f4` | **13.94:1** | 13.14:1 | 12.20:1 | 11.10:1 | 全通过 ≥7:1 |
| `--text-secondary` | `#b6cbd4` | **9.50:1** | 8.95:1 | 8.31:1 | **7.56:1** | 全通过 ≥7:1 |
| `--accent` | `#5ee0d4` | **9.96:1** | 9.39:1 | 8.72:1 | 7.93:1 | 全通过 ≥7:1 |
| `--caution`（演示标注） | `#f2c14e` | **9.52:1** | 8.97:1 | 8.33:1 | 7.58:1 | 全通过 ≥7:1 |
| `--text-disabled` | `#7b93a0` | **4.97:1** | — | — | — | **未达 7:1，见下方例外声明** |

**非文字 token**（WCAG 1.4.11 非文字对比度 ≥ 3:1）：

| Token | 值 | canvas | surface-1 | surface-2 | surface-3 | 用途 |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `--border-strong` | `#4a8fa8` | 4.40:1 | 4.15:1 | 3.85:1 | **3.51:1** | range 轨道可见边界、输入类控件边界 |
| `--focus-ring` | `#5ee0d4` | 9.96:1 | 9.39:1 | 8.72:1 | 7.93:1 | 焦点环（= `--accent`） |
| `--hairline` | `#2a5a72` | 2.13:1 | 2.01:1 | 1.87:1 | 1.70:1 | 1px 分隔线（纯装饰，不承载信息） |
| `--gridline` | `#20495e` | 1.66:1 | 1.56:1 | 1.45:1 | 1.32:1 | 曲线网格（纯装饰） |

**配对 token（实心底上的文字）**：

| 组合 | 对比度 |
| --- | ---: |
| `#0d2431` 文字在 `--accent #5ee0d4` 实心主按钮上 | **9.96:1** |
| `#0d2431` 文字在 `--caution #f2c14e` 实心演示徽章上 | **9.52:1** |

**渐变填充上限（硬性）**：曲线下方填充用 `--accent` 从 **opacity 0.10** 线性衰减到 0（在 surface-1 上）。0.10 时混合色为 `#183b47`，其上 `--text-primary` 10.44:1、`--text-secondary` **7.11:1**。**不得高于 0.10**：0.12 时 `--text-secondary` 降到 6.74:1，跌破 7:1。

**`--text-disabled` 例外声明（诚实标注）**：`#7b93a0` 在 canvas 上为 **4.97:1**，未达本契约 7:1 的正文门槛。理由是 WCAG 对 disabled 控件不设对比度要求，且该 token **只允许用于已禁用控件**，不得用于任何需要阅读的内容。若实现阶段发现它被用在了可读文本上，即为缺陷。

### 3.2 Type

**纯系统字体栈（门B Q1 裁决，不引入任何 web 字体）**：

- 中文 / 正文（reading）：`-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`
- 数字 / 读数（instrumentation）：`ui-monospace, "SF Mono", Menlo, Consolas, monospace`
- 数字必须同时声明 `font-variant-numeric: tabular-nums;` 与 `font-feature-settings: "tnum" 1;`（**B1**）

**字阶（模块化，大标题用 clamp() 流体）**：

| 角色 | 字号 | 行高 | 字距 | 字体 |
| --- | --- | --- | --- | --- |
| Display（首屏主张） | `clamp(28px, 6vw, 40px)` | 1.2 | `-0.02em` | 中文栈 |
| Heading（分屏标题） | `clamp(20px, 4vw, 28px)` | 1.3 | `-0.01em` | 中文栈 |
| **Reading（潮位读数）** | `clamp(40px, 12vw, 56px)` | 1.0 | `-0.02em` | **数字栈 + tabular-nums** |
| Body | `16px` | 1.6 | `0` | 中文栈 |
| Label / 单位 | `13px` | 1.4 | `0.01em` | 中文栈；纯数字单位用数字栈 |
| Micro（徽章、刻度） | `12px` | 1.3 | `0.02em` | 视内容 |

**读数不跳动规则（B1 的可测形式）**：`.tide-readout` 与所有时间/潮位数字必须用数字栈 + `tabular-nums`，且读数容器设 `min-width`（按最大字宽 `--readout-min-ch: 6ch` 预留），使 0.00→9.99 的数值变化不引起横向重排。

### 3.3 Spacing

- 基准 **4px**，默认步进 **8px**。
- 刻度：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`。
- 分屏纵向内边距：`clamp(48px, 10vw, 96px)`。
- 内容最大宽度 `1120px`，正文列最大 `68ch`。
- **不出现"卡片套卡片"**：一个 section 内最多一层 `--surface-2` 卡片。

### 3.4 Depth

- **不使用 box-shadow 表达层级。** 层级由 surface 阶梯 + 1px hairline 承担（R2 的层次机制）。
- **禁止玻璃拟态与 backdrop-filter 堆叠**（DIRECTION 明确禁止，且属 anti-pattern）。
- 唯一允许的"环"是焦点环：`2px solid var(--focus-ring)` + `outline-offset: 2px`。
- 曲线绘图区以 `--surface-1` 底 + `--hairline` 边框与页面区分，不加阴影。

### 3.5 Radius

`--radius-sm: 4px`（徽章、chip）／`--radius-md: 8px`（按钮、输入）／`--radius-lg: 12px`（场景卡、绘图区外框）。不使用全圆角药丸形按钮，不使用"大图标 + 圆角"的 hero 模板。

### 3.6 Motion — 具名预设（取自 `motion-contract.md`，不自定义弹簧参数）

| 动作 | 触发 | 初始 → 最终 | 动画属性 | 预设 | 为什么用这个预设 |
| --- | --- | --- | --- | --- | --- |
| 游标 + 读数跟随时间轴 | 拖动 / 方向键改值 | 当前位置 → 新值对应位置 | `transform: translateX()`、读数文本（瞬时） | **snappy**（stiffness 400 / damping 30 / mass 0.8） | 高频直接操作，必须即时响应、不可滞后；motion-contract 将 snappy 指定给"频繁控件" |
| 时间轴松开后吸附到最近刻度 | `change` / `pointerup` | 当前值 → 最近刻度 | `transform: translateX()` | **snappy**（同上） | 同为高频控件；吸附是状态变化，不是装饰 |
| 曲线入场描线（draw-on） | 首次进入视口 | `stroke-dashoffset: 1` → `0` | `stroke-dashoffset` | **elegant**（stiffness 100 / damping 20 / mass 1） | 大面积媒体的首次呈现，需要平滑落定；snappy 会显得仓促 |
| 分区带 / 场景卡组入场 | 进入视口 | `opacity 0` + `translateY(12px)` + `blur(4px)` → 最终态 | `opacity`、`transform`、`filter` | **elegant** + stagger **0.06s** | motion-contract 微编排规定 0.04–0.08s，0.06s 为起点；只作用于有界可见组（3 张卡），不作用于长列表 |
| CTA / 场景卡 hover | `pointer: fine` 悬停 | `scale 1.02`、`translateY(-2px)` | `transform` | **snappy** | motion-contract 规定 hover 反馈 onset ≤150ms、scale 1.01–1.03、translateY −2px，用 Snappy |
| 可按压控件按下 | pointerdown / keydown active | `scale 0.98` | `transform` | **snappy** | motion-contract 规定按压约 0.98，且键盘 active 须有等价状态 |
| 当前时刻标记脉冲 | 持续（**全页唯一循环动画**） | `opacity 0.55` ↔ `1.0`，周期 2400ms | `opacity` | **不用弹簧**（弹簧用于状态位移，不用于循环）；用 `cubic-bezier(0.16, 1, 0.3, 1)` 的非空间缓动 | 循环动画不是状态变化；motion-contract 的循环例外只允许 loading 旋转，此处为数据位置提示，故限定为纯透明度且必须可降级 |
| 减少动效（`prefers-reduced-motion: reduce`） | 全站 | — | 移除描线、位移、blur、stagger、脉冲；`opacity` 直接到最终值 | 无 | motion-contract：移除空间移动与不必要循环，直接呈现语义最终态 |

**不使用 `playful`（280/18/1.2）**：本页是数据仪表，读数与游标需要精确落定；弹跳会干扰读数可读性。motion-contract 明确允许在 bounce 会分散注意或损害可读性时改用 Snappy 或 Elegant——此处是适用该例外的情形。

**被禁止的动效写法**：`transition: all`；泛型 `ease`；线性 UI 位移（`linear` 只允许用于 loading 旋转）；动画布局属性（`width`/`height`/`top`/`left`）；对同一物理弹簧同时指定 `duration`。

## 4. Accessibility

- **对比度目标**：正文与读数 **≥ 7:1**（A1 的门槛，高于 WCAG AA 的 4.5:1，为户外强光留余量）。非文字控件边界 ≥ 3:1。上表已逐项给出实测值。
- **键盘路径（A4 / B3）**：
  1. `Tab` 进入时间轴控件（`input[type=range]`）→ 可见焦点环 `2px solid #5ee0d4` + `outline-offset: 2px`，在全部四个 surface 上对比度 ≥ 7.93:1。
  2. `ArrowLeft` / `ArrowRight` = ±1 步（**10 分钟**）；`PageUp` / `PageDown` = ±6 步（1 小时）；`Home` / `End` = 00:00 / 24:00。
  3. 改值时读数通过 `role="status" aria-live="polite" aria-atomic="true"` 播报，形如"14:20，潮位 1.32 米，涨潮中"。
  4. `Tab` 离开控件后，曲线保留最后位置，不重置。
- **视觉隐藏规则（A4 / B3，硬性）**：range 控件**不得**使用 `display: none` 或 `visibility: hidden`（会使控件失去可聚焦性与可操作性）。允许的写法：控件保持 `position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; appearance: none; cursor: pointer; touch-action: none;`，覆盖在 SVG 绘图区之上；或 `appearance: none` 后以自定义轨道绘制但保留在布局中。两种写法都必须保留原生键盘行为与可见焦点环（焦点环画在容器上，由 `:focus-visible` 驱动）。
- **触控**：所有可点目标 ≥ 44×44 CSS px。range 的命中区域高度 = 绘图区高度（≥ 200px），不缩到滑块的视觉尺寸。
- **减少动效结果**：`prefers-reduced-motion: reduce` 下，曲线直接以最终形态呈现（无描线），无 pulse，无 stagger，无位移；读数仍然随键盘改值即时更新（连续直接操作不属于被禁止的过渡动画）。
- **语言**：`<html lang="zh-CN">`。数字用 `lang="en"` 局部标注或直接依赖数字栈，避免中文标点影响数字排版。页面不做双语。
- **文字缩放**：布局在浏览器文字缩放至 **200%** 时不出现横向滚动、遮挡或裁切；读数与曲线保持可读。
- **不依赖颜色传达信息**：涨潮/退潮同时用文字标签（"涨潮中"/"退潮中"），不只用颜色。演示数据状态同时用文字徽章，不只靠 `--caution` 颜色。

## 5. Writing tone

- **语气**：直接、给数、不说教。受众是懂潮汐的人，不解释潮汐是什么。
- **用词**：说"潮位""退潮前两小时""几点能下水"，不说"探索海洋的奥秘"。
- **"预报"一词的硬性规则（A3）**：全站**默认不使用**"预报"字样，改用"潮位读数""潮汐曲线"。**若任何位置出现"预报"二字**（含 `<title>`、meta description、正文、按钮、图片 alt），必须在**同一视觉块内、与"预报"字样的垂直间距 ≤ 8px** 处放置 `<DemoDataBadge>`，文案为「演示数据」，不得只放在页脚。
- **演示标注的完整清单（A3 可测）**：以下位置必须出现演示标注——① 首屏读数块旁；② 曲线绘图区标题或右上角；③ 任何含"预报"的句子旁；④ 页脚下载区；⑤ 场景卡中引用的任何具体时刻/潮位数值旁。
- **CTA 框架（attention → interest → desire → action）**：
  - 主 CTA：`看今天的潮汐`（action 指向页面内的曲线，不是下载）。
  - 次 CTA（页脚）：`下载 App（演示）`——括号内的"演示"是文案的一部分，不是可选装饰。
  - 首屏主张必须含**具体收益**与**今日读数**，不用"重新定义潮汐体验"这类空话。
- **数字写法**：潮位保留 2 位小数 + 单位（`1.32 米`）；时间用 24 小时制（`14:20`），与海钓人群的日常一致。
- **不出现**：感叹号堆叠、emoji、"立即""马上"式催促、无法证伪的形容词（"极致""丝滑""沉浸式"）。

## 6. Rules: Do

1. 底色固定 `--surface-canvas: #0d2431`；一切层次靠 `--surface-1/2/3` 阶梯（每级与 canvas 对比度 1.061 / 1.143 / 1.256）。
2. 正文与读数用 `--text-primary #e8f1f4`（canvas 上 13.94:1）；次要文字用 `--text-secondary #b6cbd4`（canvas 上 9.50:1，最亮的 surface-3 上仍 7.56:1）。
3. 强调色 `--accent #5ee0d4` **只用于三处**：数据本体（曲线描边、当前读数、游标高亮）、焦点环、唯一的主 CTA 填充。**其他一律不用**（R1 的关系）。
4. 所有数字用 `ui-monospace, "SF Mono", Menlo, Consolas, monospace` + `tabular-nums`，读数容器预留 `6ch` 最小宽度（B1）。
5. 时间轴是真正的 `input[type=range]`，`min=0 max=144 step=1`（每步 10 分钟，覆盖 00:00–24:00），可聚焦、可方向键操作（A4）。
6. 首屏在 **375×812 不滚动** 的区域内完整呈现：品牌、一句主张、**今日潮位读数（数字 + 单位 + 涨/退潮状态）**、主 CTA（A2）。读数是静态渲染的，不依赖滚动触发或动画完成。
7. 任何"预报"字样旁 ≤8px 内必须有「演示数据」徽章（A3）；徽章为 `--caution` 实心或描边，文字对比度 ≥ 7:1。
8. 曲线的高潮/低潮在曲线上**直接标注时刻与潮位**（R3 的行业惯例），不靠图例解释。
9. 第三屏展示**曲线的实际用法**：用真实读数给出判断（如"退潮前两小时是赶海窗口"），数值必须来自页面同一份演示数据（B2/R3 修正）。
10. 键盘焦点环始终可见：`2px solid #5ee0d4`，`outline-offset: 2px`，在 `:focus-visible` 下触发。
11. 层级用 1px `--hairline` 与 surface 阶梯表达，不用阴影、不用玻璃拟态。
12. 动效只引用 `motion-contract.md` 的具名预设：snappy（高频控件）、elegant（大面积入场）；循环动画只有当前时刻脉冲一个。
13. `prefers-reduced-motion: reduce` 下移除描线、位移、blur、stagger、脉冲，直接给最终态。
14. 触控目标 ≥ 44×44px；range 的命中区覆盖整个绘图区。
15. 用文字 + 数字 + 图标共同表达状态，不依赖颜色单独承载信息。

## 7. Rules: Don't

对照 `design-contract.md` 的 anti-pattern 清单，本方向明确禁止：

| 维度 | 禁止项 | 依据 |
| --- | --- | --- |
| Type | 把等宽字体当"科技感"装饰用于正文；把 Inter/Roboto/Arial 当品牌表达；"大图标 + 标题 + 圆角"的模板式 hero | design-contract anti-pattern 表 |
| Color | 纯黑 `#000` 或纯白 `#fff` 作底；**cyan-on-dark 的 AI 味配色**——因此强调色必须限定在"数据 + 焦点环 + 单一 CTA"三处，且底色是带蓝的中性深色而非黑；默认深色 + 辉光；紫色渐变；霓虹描边 | 同上；DIRECTION 禁止渐变球 |
| Color | **照搬上游品牌色值**（linear `#010102` / `ink-subtle #8a8f98`、vercel `#888888`） | A1 + R1/R2 实测：`#8a8f98` 仅 6.42:1、`#888888` 仅 3.54:1，均不达标 |
| Color | 弱化文字凭观感取色而不计算 | R2 实测 `#888888` 3.54:1 为反面教材 |
| Space | 卡片到处用、卡片套卡片；hero-metric 模板；一切居中 | design-contract anti-pattern 表 |
| Depth | 玻璃拟态、backdrop-filter 堆叠、用 box-shadow 表达层级 | DIRECTION 明确禁止 |
| Motion | 动画布局属性（`width`/`height`/`top`/`left`）；到处用 bounce/elastic；`transition: all`；泛型 `ease`；线性 UI 位移；对同一弹簧同时给 duration | motion-contract |
| Motion | 使用 `playful` 弹簧 | 数据仪表读数需精确落定，弹跳损害可读性 |
| Interaction | 每个按钮都是主按钮；重复信息 | design-contract anti-pattern 表 |
| Interaction | 用纯鼠标拖拽的 `div` 作时间轴；用 `display:none` / `visibility:hidden` 隐藏 range | A4 + **B3**（会使控件失去可聚焦性） |
| Interaction | 用颜色单独传达涨/退潮或演示数据状态 | WCAG 1.4.1；本契约 Do #15 |
| Responsive | 在移动端隐藏曲线或读数 | design-contract anti-pattern 表；A2 要求首屏见读数 |
| Content | 解释潮汐原理、科普"一天两次涨落" | R3 观察：目标用户不需要被科普，第三屏改为展示曲线用法 |
| Content | 出现"预报"而不标演示数据 | **A3** |
| Asset | 引用 Tide Guide 的任何截图/图标/文案/配色；使用 Unsplash/Pexels 海景照片；使用 unDraw 插画 | R3 reference-only；曲线本身就是 hero，加照片会稀释数据优先定位 |
| Asset | 引入 JetBrains Mono / Noto Sans SC / 任何 web 字体文件 | 门B Q1 裁决 |
| Asset | 声称与 Linear / Vercel / Warp 存在关联 | 三者均为第三方 MIT 分析文档，非官方规范 |

## 8. Output structure

单页产品页，五个纵向 section，移动端单列：

| # | Section | 内容 | 关键约束 |
| --- | --- | --- | --- |
| 1 | `Hero` | 品牌标记 + 一句价值主张 + **今日潮位读数**（数字 + 单位 + 涨/退潮文字 + 「演示数据」徽章）+ 主 CTA「看今天的潮汐」 | **A2**：375×812 与 1440×900 均不滚动即可见完整读数块 |
| 2 | `TideCurve` | 自绘 SVG 潮汐曲线 + 覆盖其上的 `input[type=range]` 时间轴 + 跟随读数 + 高低潮标注 + 当前时刻脉冲 | **A4/B3**：range 可聚焦、可方向键；**B1**：读数 tabular-nums |
| 3 | `CurveInUse` | **展示曲线的实际用法**：2–3 条基于真实读数的判断（如"退潮前两小时是赶海窗口，今天是 12:40–14:40"），数值取自同一份演示数据 | **B2/R3 修正**：不解释潮汐原理 |
| 4 | `Scenarios` | 海钓 / 赶海 / 摄影 三张场景卡（移动端纵向堆叠，≥1024px 横排三列），每卡含一个 Lucide 图标 + 标题 + 一句收益 + 一个来自演示数据的具体数值 | 图标克制，不堆砌 |
| 5 | `Footer` | 下载引导（`下载 App（演示）`）+ 演示数据声明 + 数据生成方式一句话说明 | 标注为演示 |

**必需的媒体与资产**：自绘 SVG 曲线（无外部图表库）、`lucide-react` 图标（仅 sun / moon / waves / map-pin / clock 中按需取用）、系统字体栈。**无图片、无字体文件、无第三方图表库。**

**响应式断点策略**：base `320px` / `640px` / `1024px` / `1280px`。

| 范围 | 曲线绘图区高 | 场景卡 | 首屏读数 |
| --- | --- | --- | --- |
| < 640 | 200px | 1 列堆叠 | 完整可见（A2 关键视口） |
| 640–1023 | 240px | 1 列堆叠 | 完整可见 |
| 1024–1279 | 280px | 3 列 | 完整可见 |
| ≥ 1280 | 320px | 3 列 | 完整可见 |

## 9. Component expectations

### 9.1 `TideCurve`（自绘 SVG）

- **数据**：`h(t) = 1.15·sin(2πt/12.42 + φ₁) + 0.35·sin(2πt/12.00 + φ₂)`（米，相对最低低潮面），t 为当日小时数，采样 145 点（00:00–24:00，每 10 分钟一点）。
- **状态**：
  - **默认**：曲线描边 `--accent` 2px，在 `--surface-1` 上对比度 9.39:1；下方渐变填充 `--accent` opacity 0.10 → 0；网格 `--gridline` 1px；高低潮 chip 用 `--surface-3` 底 + `--text-primary`（11.10:1）。
  - **拖动中**：游标 `translateX` 用 snappy 跟随；读数同步更新（文本更新是瞬时语义变化，不加过渡）；拖动期间禁止触发入场编排重放。
  - **焦点**：绘图区容器获得 `:focus-visible` 时显示 `2px solid #5ee0d4` + `outline-offset: 2px`；range 保持可聚焦。
  - **减少动效**：无描线、无脉冲；曲线直接呈现最终形态；游标位移瞬时生效（连续直接操作不受动效规则约束）。
  - **加载**：显示静态骨架（`--surface-1` 底 + `--gridline` 网格 + 一行文字"正在载入今日潮位…"），**不使用旋转 spinner**（motion-contract 允许以进度文案替代旋转反馈）。骨架高度与最终绘图区一致，避免布局跳动。
  - **空**：数据不可用时显示指导性空态："今日潮位数据暂不可用。演示数据生成失败——刷新页面可重新生成。" 不显示空白绘图区，不显示假的曲线。
- **无障碍**：SVG 加 `role="img"` 与 `aria-label`，概述当日高低潮时刻；交互语义由 range 承载，不在 SVG 上重复绑定键盘事件。

### 9.2 `TideTimeAxis`（`input[type=range]`，A4/B3 核心）

- **属性**：`min=0 max=144 step=1 value=<当前时刻步数>`，`aria-label="潮汐时间轴，方向键调整，每步 10 分钟"`，`aria-valuetext="14:20，潮位 1.32 米，退潮中"`。
- **键盘**：`ArrowLeft/Right` ±1；`PageUp/PageDown` ±6；`Home/End` → 0/144。全部为原生行为，不自行实现。
- **状态**：
  - **默认**：`opacity: 0`，`position: absolute; inset: 0; width: 100%; height: 100%; appearance: none; cursor: pointer; touch-action: none;`，覆盖在 SVG 之上。**不使用 `display:none` 或 `visibility:hidden`（B3）。**
  - **hover / 拖动中**：`cursor: grabbing`；视觉反馈画在 SVG 游标上，不改变 range 本身。
  - **焦点**：`:focus-visible` 在容器上绘制 `2px solid #5ee0d4`，offset 2px；焦点环在全部 surface 上 ≥ 7.93:1。
  - **禁用**：`disabled` 时轨道边界用 `--border-strong`（canvas 上 4.40:1），文字用 `--text-disabled #7b93a0`（4.97:1，例外见 3.1），且**不做任何动效**。
  - **减少动效**：行为不变（键盘操作不是动画）；只移除游标的弹簧跟随，改为瞬时定位。

### 9.3 `TideReadout`（读数）

- **内容**：`14:20`（数字栈）+ `1.32 米`（数字栈，tabular-nums）+ `退潮中`（中文栈文字标签，不只靠颜色）。
- **B1 实现**：`font-variant-numeric: tabular-nums` + `font-feature-settings: "tnum" 1`；容器 `min-width: 6ch`（`--readout-min-ch`），使 0.00→9.99 变化不引起重排。
- **状态**：默认 / 拖动中（即时更新）/ 焦点（随控件）/ 减少动效（不变）/ 加载（显示 `—.— 米` 占位，宽度与终值一致）/ 空（显示 `暂无数据`）。
- **无障碍**：`role="status" aria-live="polite" aria-atomic="true"`，播报整句而非碎片。

### 9.4 `NowMarker`（当前时刻标记）

- **状态**：默认（`--text-primary` 描边圆点，在 `--surface-1` 上 13.14:1）；脉冲中（`opacity 0.55 ↔ 1.0`，周期 2400ms，`cubic-bezier(0.16,1,0.3,1)`，全页唯一循环动画）；减少动效（静态，opacity 1）；加载/空（不渲染）。

### 9.5 `HighLowAnnotation`（高低潮标注）

- 直接标在曲线峰值/谷值旁：`6:11` / `1.86 米`（R3 的行业惯例）。chip 用 `--surface-3` 底 + `--text-primary`，对比度 11.10:1。窄视口下只保留潮位数值、时刻移入 `aria-label`，**不隐藏信息**（禁止移动端隐藏关键内容）。
- 状态：默认 / 被游标遮挡时（chip 自动翻转方向或降低 z-index 让游标在上）/ 减少动效（不变）/ 加载 / 空（不渲染）。

### 9.6 `ScenarioCard` × 3（海钓 / 赶海 / 摄影）

- **结构**：一个 Lucide 图标（20px，`--accent`）+ 标题（Heading 级）+ 一句收益（Body）+ 一个来自演示数据的具体数值（数字栈 + tabular-nums）。
- **状态**：
  - **默认**：`--surface-2` 底，`--hairline` 1px 边框，`--text-secondary` 正文（8.31:1）。
  - **hover（仅 `pointer: fine`）**：`scale 1.02` + `translateY(-2px)`，snappy，onset ≤150ms。
  - **focus-visible**：`2px solid #5ee0d4` 环。
  - **按压**：`scale 0.98`，snappy；键盘 active 有等价状态。
  - **减少动效**：hover 位移与缩放移除，只保留边框/底色变化。
  - **加载**：卡片骨架保持相同高度（避免布局跳动）。
  - **空**：若某场景的示例数值不可用，显示"今日示例数据不可用"，不留空白。
- 三张卡构成一个有界可见组，入场用 elegant + 0.06s stagger；**不在每次重渲染或筛选时重放**。

### 9.7 `DemoDataBadge`（演示数据徽章，A3 的执行单元）

- **形态**：实心 `--caution #f2c14e` 底 + `#0d2431` 文字，对比度 **9.52:1**；或描边变体（`--caution` 文字在 `--surface-2` 上 8.33:1）。
- **文案**：固定「演示数据」四字，可加 `aria-label="本页潮位为演示数据，非真实潮汐预报"`。
- **位置规则（可测）**：与任何"预报"字样的垂直间距 ≤ 8px，且在同一视觉块内。
- **状态**：默认 / 加载（不渲染）/ 空（不渲染）。

### 9.8 `PrimaryCTA` / `SecondaryCTA`

- 主：`--accent` 实心底 + `#0d2431` 文字（9.96:1），`--radius-md`，高 ≥ 48px。
- 次：透明底 + `--border-strong` 1px 边框（canvas 上 4.40:1）+ `--text-primary` 文字。
- 状态：默认 / hover（snappy，onset ≤150ms）/ 按压（scale 0.98）/ focus-visible（焦点环）/ disabled（`--text-disabled`，无动效）/ 加载（宽度不变的进度文案，不用 spinner）。**同一视口内只允许一个主 CTA。**

## 10. Quality gates

以下为验收阶段逐条执行的检查项，每条都有可复现的方法。对应 `references/acceptance.md` 的功能证据、渲染证据、无障碍与质量三节。

| # | 检查项 | 方法 | 通过判据 |
| --- | --- | --- | --- |
| QG1 | **A1 底色与正文对比度** | 用 WCAG 相对亮度公式计算 `--text-primary` 与 `--surface-canvas` | ≥ 7:1（本契约实测 13.94:1）；canvas 相对亮度 ≥ 0.01569 |
| QG2 | **A1 全部文字 token 达标** | 对 `--text-primary` / `--text-secondary` / `--accent` / `--caution` × 四个 surface 逐一计算 | 全部 ≥ 7:1（最紧一格：`--text-secondary` 在 `--surface-3` 上 7.56:1） |
| QG3 | **A1 非文字 token 达标** | 计算 `--border-strong` / `--focus-ring` × 使用到的 surface | ≥ 3:1（最紧一格：`--border-strong` 在 `--surface-3` 上 3.51:1） |
| QG4 | **渐变填充上限** | 计算 `--accent` 在 surface-1 上 opacity 0.10 的混合色上 `--text-secondary` 的对比度 | ≥ 7:1（实测 7.11:1）；代码中填充 opacity 不得超过 0.10 |
| QG5 | **A2 首屏见读数** | 在 375×812 与 1440×900 视口下截取首屏（不滚动） | 今日潮位读数（时间 + 潮位值 + 单位 + 涨/退潮文字 + 演示徽章）完整可见，无裁切 |
| QG6 | **A3 "预报"字样标注** | 全站文案逐条检索"预报"二字（含 `<title>`、meta、alt） | 每一处都在 ≤8px 内有「演示数据」徽章；无未标注的"预报" |
| QG7 | **A3 演示标注覆盖** | 检查第 5 节列出的 5 个必标位置 | 5 处全部存在 |
| QG8 | **A4/B3 range 可聚焦** | 代码检索确认无 `display:none` / `visibility:hidden` 作用于时间轴控件 | 零命中 |
| QG9 | **A4 键盘走查** | 键盘 `Tab` 到时间轴 → 方向键 / PageUp/PageDown / Home/End | 焦点环可见；`ArrowRight` 使读数 +10 分钟；`Home`/`End` 到 00:00/24:00；读数通过 `aria-live` 播报 |
| QG10 | **B1 tabular-nums** | 代码检查 + 把读数从 `0.00` 逐步改到 `9.99` 并比较容器宽度 | 两处均声明 `tabular-nums`/`"tnum" 1`；读数宽度零变化（截图对比） |
| QG11 | **B2 第三屏落实** | 检查第三屏文案 | 不出现潮汐原理解释；每条判断都由页面同一份演示数据的真实数值支撑 |
| QG12 | **曲线全部状态** | 逐一触发默认 / 拖动中 / 焦点 / 减少动效 / 加载 / 空 | 六个状态均按 9.1 定义呈现；加载与空态不显示假曲线；骨架高度与终态一致，无布局跳动 |
| QG13 | **三张场景卡状态** | 触发默认 / hover / focus / 按压 / 减少动效 / 加载 / 空 | 均按 9.6 定义呈现；hover 仅在 `pointer: fine` 生效；键盘有等价反馈 |
| QG14 | **焦点环全站可见** | 键盘遍历所有可交互元素 | 每个元素都有 `2px solid #5ee0d4` 环；环在四个 surface 上 ≥ 3:1（实测 ≥ 7.93:1） |
| QG15 | **触控目标** | 测量所有可点元素与 range 命中区 | 全部 ≥ 44×44 CSS px |
| QG16 | **减少动效** | 模拟 `prefers-reduced-motion: reduce` 后重走主流程 | 无描线、无位移、无 blur、无 stagger、无脉冲；语义最终态立即呈现；键盘操作仍有效 |
| QG17 | **动效中断与反转** | 在曲线描线中途快速滚动离开再返回；快速来回拖动时间轴 | 语义状态正确，无卡死，不扣留输入；未出现两套动画系统写同一 transform |
| QG18 | **200% 文字缩放** | 浏览器文字缩放至 200% | 无横向滚动、无遮挡、无裁切；读数与曲线可读 |
| QG19 | **响应式矩阵** | 375×812、768×1024、1440×900，加 320px 窄宽 | 无重叠、无裁切标签、无 body 级横向滚动、主 CTA 不被隐藏；曲线与读数在全部宽度可见（禁止移动端隐藏关键功能） |
| QG20 | **字体回退** | 在无 SF Mono 的环境渲染 | 回退到 Menlo / Consolas / 通用 monospace，读数仍等宽对齐，无布局破坏 |
| QG21 | **素材边界** | 检索产物中是否含 Tide Guide 素材、品牌色值照搬、外部字体/图片 | 零命中；无任何品牌关联声明 |
| QG22 | **无禁用写法** | 代码检索 `transition: all`、泛型 `ease`、动画布局属性、`playful` 弹簧 | 零命中 |
| QG23 | **主 CTA 唯一** | 每个视口内统计主按钮数量 | ≤ 1 |
| QG24 | **自动化无障碍检查** | 运行可用的自动化检查工具 | 报告实际覆盖率与全部发现；**不作为人工检查的替代** |

**未验证声明**：以上 QG1–QG4 的对比度数值是本契约在设计期用 WCAG 公式**计算**得到的；QG5 及之后的检查项**在本阶段尚未执行**，需在验收阶段实际运行后才可标记通过。本契约不声称已完成任何浏览器验证。

---

## 冲突与待定

### 冲突 1（需裁决）：门B「深色基线只保留 linear.app」与实测事实矛盾

- `GATE-B-DECISION.md` 第二节写明"**深色基线只保留 linear.app**"。
- 但 `RESEARCH-NOTES.md` 的 R1 条目实测：linear 的 canvas 为 `#010102`，相对亮度 **0.00033**，**远低于**门A A1 的下限 `#0d2431`（0.01569）。也就是说，被指定为"深色基线"的那一个来源，恰恰是**不能采用其底色**的那一个。
- `RESEARCH-NOTES.md` 的 R2b 条目实测：`warp` 的 canvas `#2b2622` 相对亮度 **0.02015**，是唯一**实测通过 A1 亮度下限**的深色基线。而门B 的候选裁决表**未列出 R2b**。

**本契约的处理**：由于 A1 已把底色定死为 `#0d2431`，"深色基线"的实际作用只能是提供**层次结构关系**（surface 阶梯、hairline 分隔、克制 CTA），而非提供色值。本契约因此采用 R2 的层次机制（四级 surface 阶梯 + hairline + 极性反转分区带），**不从 linear 取任何色值**，也**不采用 R2b（warp）的任何内容**（其状态仍未裁决，且其暖调与潮汐冷调相反）。

**仍待澄清**：门D 之前请明确——深色层次结构是否参考 warp（R2b）？若参考，需要给出明确的采纳范围（仅层次关系，不取色相与色值）。**本契约不自行掩盖此冲突，也不替裁决。**

### 冲突 2（已按 B2 落实）：方向稿第三屏被 R3 观察推翻

- `DIRECTION.md` 第四节的第三屏为"一日两次涨落的说明"，原意是用文字讲潮汐节律。
- `OBSERVATION-tideguide.md` 第二节明确推翻：Tide Guide 官网**不解释潮汐原理**，用曲线本身承担全部表达，默认访客已知道潮汐是什么。
- **处理**：按 B2 与观察结论，第三屏改为 `CurveInUse`——展示曲线的**实际用法**，判断基于页面同一份演示数据的真实读数（见第 8 节与 Do #9）。此冲突已在契约内解决，无需再次裁决。

### 冲突 3（已解决）：方向稿底色与 A1 自相矛盾

- `DIRECTION.md` 写"深色为主（`#071a24` 一类）"，而门A A1 要求"不暗于 `#0d2431` 级别"。`#071a24` 相对亮度 0.00911 < 0.01569，**方向稿违反了自己被裁决的要求**。
- **处理**：门B 已裁决"底色定为 `#0d2431`"。契约采用 `#0d2431`。已解决。

### 待定项（诚实标注，不编造）

1. **演示数据的相位 φ₁ / φ₂ 未定稿。** 契约给出了波形公式（12.42h M2 + 12.00h S2 叠加）与振幅，但两个相位常数需要选定一组能产生合理高低潮时刻（例如高潮在 06:11 与 18:30 附近）的值。此项属于实现期的数值拟合，**契约不预设具体相位**，只要求第三屏与场景卡引用的数值与曲线来自同一组参数。
2. **曲线采样点数 145 点（每 10 分钟）为设计期取值。** 若实现期发现 375px 宽度下路径点数影响渲染性能，可降低到 73 点（每 20 分钟），但**时间轴的 `step` 与 `max` 必须同步调整**，且键盘单步仍为 10 分钟。需要说明变更。
3. **"退潮前两小时"的具体窗口时刻未定稿。** 它依赖待定项 1 的相位，实现期由数据算出后回填，不写死。
4. **`--text-disabled` 未达 7:1（4.97:1）** 已在 3.1 声明为有据例外（WCAG 对 disabled 不设要求 + 仅限禁用控件）。若审核方不接受该例外，需要重新取色。
5. **触控目标 44px 与曲线绘图区的关系**：range 命中区高度取绘图区高度（≥200px），满足要求；但**高潮/低潮 chip 若做成可点击**，其 44px 最小尺寸会与曲线密度冲突——契约的处理是**让 chip 不可点击**（纯标注）。若实现期要求 chip 可交互，需要重新评估。
6. **本阶段未做任何浏览器渲染验证**，因此"曲线在 375px 下是否视觉拥挤"这类判断**尚无证据**，需在门C 原型阶段用真实截图确认。

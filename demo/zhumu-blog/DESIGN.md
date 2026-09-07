# 「竹与墨」设计契约（门D · DESIGN.md）

- 版本：v1.0（2026-09-06）
- 状态：实现唯一依据。实现与本文件冲突时，以本文件为准；需变更时先修订本文件并注明修订。
- 上游输入：`prototype-prompt.md`（方向）、`prototype-review.md`（门C 评审，含两条写死的硬性修正）、三张参考图（`references/prototype-desktop.png`、`prototype-mobile.png`、`prototype-ink-bamboo.png`，仅作艺术参照，非实现素材）。
- 动效预设与微编排规则遵循 kit 内 `motion-contract.md`（Snappy / Playful / Elegant 三预设 + approved easing）。

---

## 1. 概述与失败判据

**Mission**：让读者在一张安静的水墨宣纸上读技术文章——墨竹与熊猫是身份，不是噪声。

**Brand**：成都个人开发者「小墨」的技术博客 | 读者第一眼获取内容与可读性 | Web（桌面 + 移动响应式，移动一等公民） | 内容真实：技术文章为主 + 辅栏目「追番周记」+ 熊猫/成都特色。

**失败判据**（出现任一条即设计失败，门E 不通过）：

1. 任一【硬约束 HC-1…HC-4】未满足（见各章标注）。
2. 第一眼读起来是"通用技术博客模板"：无纸感、无墨竹、无楷体笔意，水墨身份消失。
3. 插画/熊猫/墨竹与内容争夺注意力：文字区被背景干扰、正文对比度 < 4.5:1。
4. 动效气质偏离"水墨的慢"：换场快于 450ms 或慢于 550ms、hover 起效迟于 150ms、动画掉帧到可感知卡顿。
5. 亮或暗任一主题存在语义色对比度不达标。
6. 移动端像"缩小的桌面"（字号缩放、导航堆叠在顶部）而非重排。

---

## 2. 信息架构（IA）与导航规则

### 2.1 路由

| 路由 | 页面 | 内容要点 |
| --- | --- | --- |
| `/` | 首页 | hero（≤60% 视口，桌面）→ 最新文章列表（≤5 条，首条可置顶）→ 「追番周记」横向栏目条 → 页脚 |
| `/posts` | 文章列表 | 全部技术文章，标签筛选（标签胶囊横滑），上拉分页 |
| `/posts/:slug` | 文章详情 | 正文排版区（禁止插画）+ 代码块 + TOC + 上下篇 |
| `/essays` | 随笔 | 随笔列表，含「追番周记」系列筛选；允许随笔头图插画（仅列表层） |
| `/archives` | 归档 | 按年/月分组的时间线，紧凑列表项复用 |
| `/about` | 关于 | 作者介绍、技能、联系方式、授权致谢（字体/插画声明） |
| `*` | 404 | 迷路熊猫插画 + 返回首页 |
| 全局 | 搜索浮层 | 非路由。桌面 nav 搜索图标 + `⌘K` / `Ctrl+K`；移动顶栏搜索图标。80vh 面板、焦点困住、`Esc` 关闭 |

### 2.2 导航规则【HC-1 一部分】

**桌面端（≥768px）——顶部导航**

- 高 64px，sticky top。左侧：几何熊猫 logo（40px 圆）+ 站名「竹与墨」（LXGW WenKai，20px）。
- 右侧：首页 / 文章 / 随笔 / 归档 / 关于 + 搜索图标（带 `⌘K` 提示）+ 主题切换（40×40 图标按钮）。
- 当前页：文字转墨色 + 底部 2px 竹绿深指示条（`aria-current="page"`）。
- 移动端的五项「我的」在桌面端对应「关于」。

**移动端（<768px）——顶栏 + 吸底标签栏【硬约束 HC-1】**

> 门C 评审结论：生成图把标签栏画在顶部，属生成偏差，**契约写死为吸底**。

- 顶部窄条：高 56px，sticky top。内容：logo（32px）+ 站名 + 右侧主题切换（40×40）+ 搜索（40×40）。**不放主导航。**
- **底部标签栏：`position: fixed; bottom: 0; left: 0; right: 0`，吸底**。高 64px 设计高度 + `padding-bottom: env(safe-area-inset-bottom)`；内容底部预留 `64px + env(safe-area-inset-bottom) + 24px` 的 padding，防止页脚被遮挡。
- 五项：首页 / 文章 / 随笔 / 归档 / 我的（我的 → `/about`）。每项：24px 图标 + 12px 文字，整体可点（命中区 = 栏目全高 ≥64px，远超 44px 最低要求），拇指可达。
- 当前项：图标+文字转竹绿（亮 `#2F6B4F` / 暗 `#52B788`）+ 顶部 16×3px 圆角指示条（`aria-current="page"`）。
- **验收**：390×844 视口下，标签栏 computed style `bottom: 0` 且几何位置在视口底部；单手拇指可触及全部五项。
- 禁止：标签栏出现在顶部、混入五个栏目之外的图标。

### 2.3 文案语气

安静、克制、藏不住的可爱。UI 文案用短句；熊猫语气文案只出现在空状态 / 404 / 加载 / 彩蛋，**正文排版区与表单报错禁止卖萌**；错误文案不指责用户（「加载失败，点击重试」而非「你的操作出错了」）。

---

## 3. 布局与断点

### 3.1 断点（Tailwind 默认）

| 代号 | 宽度 | 布局行为 |
| --- | --- | --- |
| base（设计基准 390px） | <640 | 单列；底部标签栏；内容 padding 24px |
| sm | ≥640 | 同 base，padding 24px |
| md | ≥768 | **导航切换点**：顶部导航替代标签栏；双栏开始出现 |
| lg | ≥1024 | 文章详情显示右侧 TOC 栏（200px，sticky，top 96px） |
| xl | ≥1280 | 容器最大 1120px 居中，padding 32px |

- **字号不因视口缩放【HC-1】**：全站 `font-size` 一律固定 px 值，禁止 `clamp()` / `vw` / `vh` 参与字号；移动与桌面共用同一字号阶梯（见 §5），唯一允许的断点差异是 hero 标题使用同一 token（40px，全断点一致，390px 下「你好，我是小墨」7 字单行可容纳 ≈280px < 342px 可用宽）。验收：320/390/768/1440 四档宽度下正文 computed font-size 均为 16px。
- 响应式是**重排不是缩放**：移动端 hero 紧凑化（顶栏 56 + hero 总高 ≤280px → 390×844 首屏必须露出第一篇文章标题）；桌面 hero（含 nav）≤60% 视口高（900px 下 ≤540px）。
- 列宽：正文阅读列 max-width 680px（17px × 40 字/行）；首页/列表内容列 max-width 720px。
- 列表**无底色带**（门C 修正）：列表项之间用 1px hairline 分隔，禁止水彩/色块底带、禁止卡片墙。

---

## 4. 色彩令牌（亮/暗双主题 semantic 表 + 对比度目标）

对比度按 WCAG 2.x 相对亮度公式计算，表中「计算值」为契约预计算，**实现期须用工具（axe / DevTools 取色器）实测复核**；「目标」为验收线。

### 4.1 基础色板

| 名称 | 值 | 用途边界 |
| --- | --- | --- |
| 纸 | `#FAF7F0` | 亮色底 |
| 墨 | `#1F2421` | 亮色正文/焦墨 |
| 竹绿深 | `#2F6B4F` | 亮色链接/激活色 |
| 竹绿亮 | `#52B788` | 暗色链接/激活色；亮色下仅装饰（见 4.2 注） |
| 朱砂 | `#B5452F` | **仅徽标级**（置顶印章）；禁止大面积、禁止正文用色 |
| 科技蓝 | `#4E9BD8` | **仅**暗色代码语法高亮 + 暗色熊猫眼罩微光；亮色语法用其深色派生（见下） |

### 4.2 语义令牌表

| 语义令牌 | 亮色值 | 暗色值 | 用途 | 对比对（前景↔实际底） | 目标 | 计算值(约) |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-bg` | `#FAF7F0` | `#16201B` | 页面底 | — | — | — |
| `--color-bg-subtle` | `#F5F1E8` | `#1D2A23` | 区块底/代码块底(亮) | — | — | — |
| `--color-surface` | `#FAF7F0` | `#1D2A23` | 浮层面板 | — | — | — |
| `--color-text` | `#1F2421` | `#E8E6DD` | 正文 | text↔bg | ≥4.5:1 | 亮 14.7 / 暗 13.3 |
| `--color-text-secondary` | `#5C6158` | `#AEB3A7` | 摘要/次要 | ↔bg | ≥4.5:1 | 亮 5.9 / 暗 7.8 |
| `--color-text-tertiary` | `#676C63` | `#8A9188` | 日期/meta | ↔bg | ≥4.5:1 | 亮 5.0 / 暗 5.2 |
| `--color-link` | `#2F6B4F` | `#52B788` | 链接/导航激活 | ↔bg | ≥4.5:1 | 亮 5.4 / 暗 6.8 |
| `--color-link-hover` | `#24523C` | `#7FD6A8` | 链接悬停 | ↔bg | ≥4.5:1 | 待实测 |
| `--color-on-brand` | `#FAF7F0` | `#16201B` | 品牌底上的文字（选中胶囊/主按钮） | ↔link色 | ≥4.5:1 | 亮 5.4 / 暗 6.8 |
| `--color-accent` | `#52B788` | `#52B788` | 装饰点缀 | 亮色下仅装饰，**不作文字/UI边界**（2.3:1 不达标）；暗色下可作文字 6.8:1 | 装饰无要求 / 暗色文字 ≥4.5 | — |
| `--color-badge`（朱砂） | `#B5452F` | `#B5452F` | 置顶印章底/描边 | 纸字↔朱砂底 | ≥4.5:1 | 5.5 |
| `--color-focus-ring` | `#2F6B4F` | `#52B788` | 焦点环 | ↔bg | ≥3:1（UI 指示） | 亮 5.4 / 暗 6.8 |
| `--color-border`（hairline） | `rgba(31,36,33,0.12)` | `rgba(232,230,221,0.12)` | 装饰分隔线 | — | 不作唯一 UI 边界 | — |
| `--color-border-strong` | `#858A80` | `#5F6B62` | 输入框/胶囊边界 | ↔bg | ≥3:1 | 亮 ≈3.2 / 暗 3.2 |
| `--color-veil`（换场薄纱） | `rgba(31,36,33,*)` 峰值 0.10 | `rgba(232,230,221,*)` 峰值 0.06 | 路由换场遮罩 | — | — | — |
| `--color-code-bg` | `#F5F1E8` | `#101915` | 代码块底 | — | — | — |
| `--color-code-text` | `#3A3F3A` | `#D6D9CE` | 代码默认字色 | ↔code-bg | ≥4.5:1 | 亮 9.5 / 暗 12.5 |
| `--color-selection` | `rgba(47,107,79,0.20)` | `rgba(82,183,136,0.28)` | 选中文本底 | — | — | — |

**语法高亮子令牌**（↔`--color-code-bg`，全部 ≥4.5:1）：

| 令牌 | 亮 | 暗 | 计算值(约) |
| --- | --- | --- | --- |
| `--syntax-keyword` | `#2F6B4F` | `#52B788` | 亮 5.1 / 暗 7.3 |
| `--syntax-string` | `#2E6E9E`（科技蓝深色派生¹） | `#4E9BD8` | 亮 ≈4.9 / 暗 6.0 |
| `--syntax-comment` | `#646A5F` | `#7A827A` | 亮 ≈4.6 / 暗 ≈4.5 |
| `--syntax-default` | `--color-code-text` | `--color-code-text` | 见上 |

> ¹ **必要派生声明**：`#4E9BD8` 在亮色纸底上仅 2.8:1，作为代码文字必不达标；故亮色语法沿用同一科技蓝色相加深为 `#2E6E9E`，纯 `#4E9BD8` 保留给暗色语法与暗色眼罩微光。语法色仅 keyword/string/comment/默认 4 类，函数名等其余 token 继承默认色（保持纸墨安静）。此派生为既定色板在对比度硬目标下的精确化，若有异议在门D 评审提出。

**墨竹背景墨色分层**（非 UI 令牌，见 §9）：焦墨 α0.20 / 浓墨 α0.16 / 淡墨 α0.10 / 极淡墨 α0.06（边缘装饰区）；文字叠层区一切背景元素有效 α ≤0.08。

---

## 5. 排版系统

### 5.1 字体

| 角色 | 字体 | 授权 | 回退栈 |
| --- | --- | --- | --- |
| 标题/display | 霞鹜文楷 LXGW WenKai | OFL-1.1 | `"LXGW WenKai", "Kaiti SC", KaiTi, serif` |
| 正文/UI | 思源黑体 Noto Sans SC | SIL OFL 1.1 | `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif` |
| 代码 | JetBrains Mono | OFL-1.1 | `"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace` |

加载策略：woff2 按需子集化（中文用 cn-font-split 或等价方案分包）；`font-display: swap`；首屏字体传输量目标 ≤300KB（待实现期实测）；预加载首屏标题子集。授权声明集中放在 `/about` 与页脚一行（见 §10）。

### 5.2 字号阶梯（全断点一致，固定 px，禁止流式缩放【HC-1】）

| Token | 字号/行高 | 字体/字重 | 用途 |
| --- | --- | --- | --- |
| `display` | 40px / 1.35 | WenKai 700 | hero「你好，我是小墨」；390px 下单行 |
| `h1` | 32px / 1.4 | WenKai 700 | 页标题 |
| `h2` | 26px / 1.5 | WenKai 700 | 区块标题 |
| `h3` | 22px / 1.5 | WenKai 600 | 文章内 h3 / 列表大标题变体 |
| `title-list` | 20px / 1.5 | WenKai 600 | 列表项标题 |
| `body-article` | 17px / 1.9 | Noto Sans 400 | 文章正文（中文行高 ≥1.8） |
| `body` | 16px / 1.75 | Noto Sans 400 | UI 正文/摘要 |
| `meta` | 14px / 1.6 | Noto Sans 400 | 日期/阅读时长/说明 |
| `tab-label` | 12px / 1.3 | Noto Sans 500 | 标签栏文字 |
| `code` | 14px / 1.7 | JetBrains Mono 400 | 代码 |

中文排版规则：正文行高 ≥1.75、标题 1.35–1.5；段落间距 1em；标题 `letter-spacing: 0.02em`、正文 `0.01em`；阅读列 680px ≈ 40 字/行。中西文混排自动间距（`text-autospace`）支持度有限，**待实现期实测**，不做硬性依赖。

### 5.3 代码块规范

- 容器：`--color-code-bg` 底、1px `--color-border` 边、圆角 8px、内边距 16px、`overflow-x: auto`。
- 头部条：高 40px，左语言标签（`code` 12px 大写，`--color-text-tertiary`），右复制按钮 28×28（图标 16px）。
- 语法色见 §4.2 子令牌；行号默认关闭。

---

## 6. 间距 / 圆角 / 深度

- 间距节奏（4px/8px 网格）：`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96`。区块间 ≥48px，元素间 8–16px。
- 圆角：`sm 4`（徽标/小件）、`md 8`（按钮/输入/代码块）、`lg 12`（插画容器/浮层）、胶囊 `full`。
- 深度模型：**以 1px 边线为主，阴影为辅**（纸墨气质）。仅浮层（下拉/搜索面板/toast）允许 `box-shadow: 0 4px 16px rgba(31,36,33,0.08)`（暗色 `rgba(0,0,0,0.24)`）。禁止玻璃拟态、禁止霓虹渐变。

---

## 7. 组件清单与全状态

每个组件列出适用状态的具体值。通用约定：focus-visible 一律 2px `--color-focus-ring` 外环、offset 2px；active 按压 scale 0.98（Snappy spring，键盘 active 等价）；禁用态 opacity 0.4 且不响应、不播放动画。

### 7.1 桌面顶部导航
- default：底 `--color-bg` 92% 不透明 + 底部 1px hairline；链接 `meta`放大版 16px `--color-text-secondary`。
- hover：文字 → `--color-text`，底部 2px 指示条从左向右展开 200ms（inkEase）。
- 当前页（`aria-current`）：文字 `--color-text` + 2px 竹绿指示条常驻。
- focus-visible：通用环。scrolled：底不透明度→96% + `0 1px 0 --color-border`。
- disabled/loading/empty：不适用。

### 7.2 移动底部标签栏【HC-1】
- default：fixed 吸底（见 §2.2）；底 `--color-surface` 96% 不透明 + 顶部 1px hairline；未选项图标+文字 `--color-text-tertiary`。
- selected：竹绿图标+文字 + 16×3px 指示条（layoutId 滑动，Snappy）。
- active（按压）：整项 scale 0.98 spring 回弹。
- focus-visible：通用环（外接键盘场景）。
- disabled：不适用（五个栏目恒可用）。
- loading/empty：不适用。安全区：`env(safe-area-inset-bottom)` 内含。

### 7.3 文章列表项
- 结构：标题 `title-list`（WenKai）+ 日期/时长 `meta` + 2 枚标签胶囊 + 摘要两行（`body`，`--color-text-secondary`，2 行 clamp）；项间 1px hairline；**无底色带**（门C 硬性修正）。
- default / hover：标题色 `--color-text` → `--color-link`（150ms）；整项 translateY(-2px)（Snappy）；布局不位移。
- active：整项 scale 0.995。focus-visible：整项拉伸链接环。
- loading：骨架屏（标题条 60% 宽、meta 条 30%、摘要两行），opacity 0.5↔1 脉冲 1.6s infinite（loading 线性豁免）。
- empty：irasutoya 空状态插画 160px + 「这里还没有文章」+ 建议标签胶囊 ×3。
- 置顶项：见 7.5 徽标，另标题前加「[置顶] 」替代文本（读屏）。

### 7.4 标签胶囊
- default：高 32px、padding 0 14px、圆角 full、`meta` 字号、1px `--color-border-strong` 边、透明底。
- hover：底 `rgba(47,107,79,0.08)`（暗 `rgba(82,183,136,0.12)`）+ 边转 `--color-link`。
- selected：底 `--color-link`、字 `--color-on-brand`（对比达标见 §4.2）。
- focus-visible / disabled：通用。移动端横滑：`scroll-snap`，两端 24px 渐隐 mask。
- loading：骨架胶囊 80×32px。

### 7.5 置顶徽标（朱砂印章）
- 仅此组件可用朱砂。样式：2px `#B5452F` 描边、圆角 4、字 `meta` 14px `#B5452F`、微旋转 -2°、内边距 2px 8px；亮暗同值（对比 5.1:1/3.1:1——暗色下徽标为描边+文字，字色对暗底 3.1:1，属 14px 辅助标识，**达标策略：暗色改用纸字朱砂底实心印章（5.5:1）**，即暗色主题徽标为实心变体）。
- 其余状态不适用；禁止移作他用（按钮/链接/大色块）。

### 7.6 代码块（语言标签 + 复制）
- default：§5.3 规格。语言标签常显（如 `RUST`、`TSX`）。
- 复制按钮：default 图标 `--color-text-tertiary`；hover 底 `rgba(31,36,33,0.06)`；active scale 0.98；focus 通用环。
- copied：图标换对勾 + 「已复制」`meta` 文案，1.6s 后还原（一次性，不循环）。
- error：剪贴板失败 → toast「复制失败」2s + 文本保持可选中。
- loading/empty/disabled：不适用。长代码：容器内滚动，头部条 sticky 于块顶。

### 7.7 TOC
- ≥1024：右栏 200px sticky（top 96px）。default 条目 14px `--color-text-tertiary`，左 2px 透明指示轨。
- hover：文字 → `--color-text`。active（滚动同步，IntersectionObserver）：文字 `--color-link` + 2px 竹绿指示条（layoutId，Snappy）。
- focus-visible：通用。点击：原生锚点滚动（尊重 reduced-motion）。
- <1024：正文上方折叠 disclosure（触发钮高 48px）；默认收起。
- loading/empty：无标题时不渲染。

### 7.8 主题切换
- 位置：桌面 nav 右端 / 移动顶栏右端，40×40 图标钮。
- default：日月线稿图标 `--color-text-secondary`。hover：图标 → `--color-text` + 墨点晕开（见 §8.2）。
- active：scale 0.98 spring。focus-visible：通用。
- 切换行为：全站颜色 250ms 过渡（inkEase，非空间属性）；图标旋转形变 300ms Snappy。首次访问跟随 `prefers-color-scheme`，选择持久化 localStorage；切换即时生效，**不等动画**。
- aria：`aria-label`「切换到暗色模式 / 切换到亮色模式」动态更新。reduced-motion：颜色与图标 0ms 直切。

### 7.9 上拉加载器（列表尾部，参照 prototype-mobile.png 熊猫抱竹节）
- idle：熊猫抱竹节插画（原创 SVG）+ 已加载实心节 + 下一节虚线轮廓 + 文案「上拉加载更多」14px tertiary。
- pulling：虚线节 `scaleY 0→1`（origin bottom）随拉动进度生长（见 §8.5）；超过阈值文案变「松开加载」。
- loading：虚线节 opacity 0.4↔0.8 脉冲 1.2s infinite + 熊猫上下 ±3px 浮动（同周期）。
- success：该节虚线→实心描边 400ms（inkEase）；新条目入场（§8.5）。页数计数 = 实心节数，显示上限 5 节，超过循环替换。
- failure：节保持虚线 + 「加载失败，点击重试」（整块可点，命中 ≥48px）。
- end：熊猫打盹静态图 + 「没有更多了」。reduced-motion：生长/脉冲全静态，仅文字状态变化。

### 7.10 下拉刷新（移动端列表页：<768px 且 touch 设备）
- 触发区：滚动位置 0 下拉；`overscroll-behavior-y: contain`。
- pulling：竹叶随拉距生长摆动（§8.5），文案无。
- 阈值 72px：松手 → 叶片飘出 + 内容换入（§8.5）；loading：竹叶 1.2s/圈 缓旋（loading 线性豁免）。
- success：指示区收回 300ms；failure：内联「刷新失败」2s 后收回。
- reduced-motion：无生长动画，改文字指示「刷新中… / 已刷新」。

### 7.11 搜索浮层与空状态
- 浮层：`--color-surface` 面板，max-height 80vh，输入框高 48px，`Esc` 关闭，焦点困住并在关闭后归还触发钮。
- 结果态：分组列表（文章/随笔），条目复用列表项 hover 态。
- **空状态**：irasutoya「寻找」系插画 160px + 「没有找到"××"相关内容」+ 3 枚建议标签胶囊；焦点移至空状态标题。
- loading：输入防抖 300ms 后骨架条 ×3。

### 7.12 404
- irasutoya 迷路/疑惑熊猫插画 200px + 「404」（`display` WenKai）+「这一页好像被熊猫啃掉了」+「返回首页」主按钮（次状态：无）。
- 全屏居中，背景墨竹照常。reduced-motion：入场动画直出终态。

### 7.13 页脚
- 顶部 1px hairline；左侧归档 / RSS / 友链三链接（`meta` 字号，hover 转 `--color-link`）+ 一行授权致谢；右侧原创打盹熊猫 SVG 72px。
- 彩蛋：连点熊猫 5 次 → 翻滚一圈（Playful spring，rotate 0→360°，约 800ms）+ toast「熊猫被吵醒了！」2s（仅一次/会话）。reduced-motion：仅 toast。
- focus-visible：通用环。

### 7.14 全局加载（首屏/路由数据）
- 品牌加载态：原创熊猫 SVG + 竹芽，上下浮动 ±4px、1.2s 循环（loading 豁免）；列表数据用骨架屏（7.3）。reduced-motion：静态熊猫 + 文字「加载中…」。

---

## 8. 动效规格

### 8.1 动效令牌（motion/react API）

```ts
import type { Transition } from 'motion/react';

export const uiSprings = {
  snappy:  { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },  // 按钮/指示条/按压
  playful: { type: 'spring', stiffness: 280, damping: 18, mass: 1.2 },  // 彩蛋/toast
  elegant: { type: 'spring', stiffness: 100, damping: 20, mass: 1   },  // 大型/换场连续性
} satisfies Record<string, Transition>;

// 非弹性时长型过渡统一用 approved easing：
export const inkEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
// 用法示例：{ duration: 0.5, ease: inkEase }
```

- 弹簧只用于位移/缩放/布局连续性，**不得**给同一 spring 再加 `duration`；时长型过渡只用 `inkEase`。
- 禁止 `transition: all`、泛用 `ease`、UI 线性运动（loading 旋转为唯一线性豁免）。
- 列表/成组入场 stagger 0.06s，仅作用于可见批（首批 ≤8 个），不因筛选/按键重播。
- hover 可见反馈 ≤150ms 内开始；按压 scale 0.98 含键盘等价；不缩小命中区、不移动邻布局。
- 全局 `<MotionConfig reducedMotion="user">`；CSS/自绘循环（背景、骨架）另行检查 reduced-motion——**MotionConfig 不覆盖它们**。
- ⚠ API 依据说明：本节 API 形状以 kit `motion-contract.md` 为准（Context7 核对失败，见附录）；实现期以本地安装的 motion/react 版本类型检查为最终依据，若类型不符以实际类型定义为准并在实现笔记中记录差异。

### 8.2 逐条动效规格

格式：触发器 / 初态 → 终态 / 属性 / 预设与时长 / 中断行为 / reduced-motion。

**A. route-ink-veil（路由换场）【HC-2】**
- 触发：路由变化。结构：`AnimatePresence mode="wait"` + 全屏薄纱层（z 60，`pointer-events: none`）。
- 旧页：opacity 1→0，translateY 0→-8px，220ms inkEase；新页：opacity 0→1，translateY 12px→0，280ms inkEase（先后合计 500ms，落在 450–550ms 窗口）。
- 薄纱：`--color-veil` 径向渐变（中心浓、边缘透明）整屏 translateX(-100%→100%) 扫过，500ms inkEase，峰值不透明度 0.10（暗 0.06）。
- 中断：快速连续导航——路由状态即时更新（语义不等动画）；纱层以新 key 重启；`pointer-events:none` 保证纱层永不吞点击。
- reduced-motion：无纱、无位移，0ms 直切。

**B. button-ink-bloom（墨点晕开 hover）【HC-2】**
- 触发：pointerenter（仅 fine pointer；touch 只有按压反馈）。
- 初态：`::after` 径向墨晕层（直径 = 控件宽 160%，min 96px，正圆，`rgba(31,36,33,0.10)`→transparent 70%）scale(0)、opacity 0；圆心=指针进入点。
- 终态：scale(1)（150ms 内可见起效，inkEase）；悬停保持约 250ms 后 opacity 0.10→0 用 550ms，完整晕开-消散周期 ≈750ms（600–800ms 窗口内）。
- 离开：opacity→0 200ms。中断：中途移出从当前值回落，不跳变。
- 属性：transform/opacity only。reduced-motion：无晕层，仅边框/文字色 0ms 变化。

**C. press-spring（按压回弹）**
- 触发：pointerdown / 键盘 active。scale 1→0.98，Snappy；释放回弹同预设。中断：可快速连点，每次从当前值插值。reduced-motion：无缩放，按压仅语义态即时变化。

**D. leaf-fall-ambient（常驻飘叶）【HC-3】**
- 触发：页面挂载即循环（Canvas，§9）。单叶：下落 24–48 px/s，水平正弦摆幅 20–40px（周期 3–5s），累计自转 90–270°；叶长 14–28px；alpha 0.10–0.25（入文字列衰减 ≤0.08）。同屏 ≤12（≤768px 视口 ≤8）。
- 中断：无交互；标签页隐藏/离屏即暂停（§9）。reduced-motion：完全不生成（静态落叶 2–3 片绘死）。

**E. ink-stroke-draw（周期性一笔新墨）【HC-3】**
- 触发：定时器，间隔均匀随机 20–30s。位置：5 个预置边缘锚段（左下/右上象限），种子洗牌轮换。
- 初态→终态：SVG path `stroke-dashoffset L→0`，4–6s（inkEase，起笔快收笔慢=笔锋收放）；终笔端点生成墨渍（scale 0→1、alpha 0.2→0.14）保持 2–4s；随后 8–12s 淡出至 0，回到静默。
- 属性：stroke-dashoffset / opacity / transform。CLS 必须为 0（绝对定位层内）。
- 中断：隐藏标签页暂停计时；不与飘叶层互斥。reduced-motion：不绘制（保留静态构图）。

**F. parallax-drift（滚动视差）【HC-3】**
- 触发：scroll。静态墨竹层 translate3d(0, scrollY×0.4)，飘叶 Canvas 层 ×0.3（均在 0.3–0.5 区间）；层高 140vh 防露底。rAF 节流 + passive listener；组件卸载/暂停时移除。
- reduced-motion：视差关闭，背景固定。

**G. pull-refresh-leaf（下拉刷新）【HC-4】**
- pulling：叶柄长 0→48px、叶片 scale 0.2→1，线性映射拉距/72px；摆角 ±5°（约 1.2Hz 阻尼正弦）；拉距阻尼：超出 24px 后 touch delta ×0.5。
- 释放 ≥72px：叶片脱离——translateY -24px / translateX +16px / rotate 30° / opacity→0，400ms inkEase；随后内容换入。释放 <72px：整体 Snappy spring 回弹、叶收回。
- loading：叶 1.2s/圈缓旋（线性豁免）。中断：中途松手按当前距离判定。reduced-motion：见 7.10。

**H. loadmore-bamboo-node（上拉竹节生长）【HC-4】**
- pulling：虚线节 scaleY = 拉动进度（0→1，origin bottom）；≥阈值文案切换。释放成功：虚线→实心 stroke 400ms inkEase；新条目按 I 条目入场。
- loading：脉冲（7.9）。中断：加载中再次上拉忽略（防抖）。reduced-motion：状态直切。

**I. list-item-enter（新内容渐进显现）【HC-4】**
- 触发：条目滚动进入视口（IntersectionObserver，触发即 `unobserve`，**一次性，回滚不重播**）。
- 初→终：opacity 0→1、translateY 16px→0，320ms inkEase；同批 stagger 0.06s（≤8 个/批）。
- 中断：无（一次性）。reduced-motion：直出终态。

**J. theme-toggle-crossfade**：颜色 250ms inkEase（bg/color/border 显式列出，禁 `all`）；图标 300ms Snappy 旋转形变。reduced-motion：0ms。

**K. nav/tab-indicator（导航与标签栏指示条）**：desktop 2px 条 width/position、mobile 16×3px 药丸，均 `layoutId` 共享布局动画，Snappy；中断可逆（快速切页从当前值追）。reduced-motion：位置直切。

**L. copy-feedback**：对勾图标 scale 0.6→1 + 文案淡入 150ms；1.6s 后 200ms 淡出。reduced-motion：文案直出。

**M. easter-egg-panda-tumble**：rotate 0→360°，Playful spring；每次会话仅首次触发。reduced-motion：禁用。

---

## 9. 墨竹背景动画技术方案

**艺术基准**：`references/prototype-ink-bamboo.png`——左下与右上斜出构图、焦浓淡墨四层、侧锋中锋并存、中央大留白、半空飘叶带旋转、未收笔的一笔。

### 9.1 分层

| 层 | 技术 | 内容 | z-index |
| --- | --- | --- | --- |
| L0 静态墨竹画 | 内联 SVG（代码绘制 path，禁位图） | 竹竿（有节，浓淡枯润用双 path 叠加模拟侧锋）、竹叶组（三五成组）、极淡墨底晕；四层墨 alpha：焦 0.20 / 浓 0.16 / 淡 0.10 / 极淡 0.06；**仅存在于边缘带**：桌面左右各 ≤160px + 底部 ≤200px；移动仅顶端 ≤120px + 底缘 ≤140px（标签栏上方） | 0 |
| L1 飘叶 | 单个 `<canvas>` 2D，独立 rAF | 竹叶精灵（离屏 canvas 预渲染：2 种叶形 × 3 种尺寸），逐帧 drawImage 旋转 | 1 |
| L2 实时运笔 | SVG overlay（与 L0 同源组件） | §8.2 E 的一笔墨 | 2 |
| 文字区纱幕 | 内容列伪元素/容器 | 不遮纸纹：改为**几何约束+透明度插值**（见 9.2） | — |
| 内容层 | 应用内容 | — | 10 |
| 导航/标签栏 | — | — | 40 |
| 换场薄纱 | — | — | 60 |

### 9.2 文字叠层区墨浓度控制【HC-3】

- 几何约束：L0 竹竿/竹组只绘制在边缘带内，永不进入内容列（内容列几何 = `min(100vw, 720px) 居中 ±24px`）。
- 飘叶插值：叶片 x 进入内容列带（羽化 24px）时，alpha 乘子线性衰减到 ≤0.08；离开恢复。
- 验收换算：文字列任一点的合成背景墨覆盖率 ≤8%；实测正文（`--color-text`↔实际合成底）对比度 ≥4.5:1（最坏情形：8% 墨叠纸底约 `#E9E6DF`，墨字对其对比度仍 >10:1，余量大；**实现期仍逐点实测**）。

### 9.3 性能预算【HC-3】

- DPR 上限：`canvas.width = cssWidth × Math.min(devicePixelRatio, 2)`。
- 同屏飘叶 ≤12（视口 ≤768px 时 ≤8）；精灵预渲染，禁止逐帧重绘叶形路径。
- 单帧主线程预算：背景循环 JS <2ms/帧；目标 60fps（2019+ 中端机，待实测）。
- 暂停条件：`document.visibilitychange === hidden` → 停 rAF 与运笔定时器；Canvas `IntersectionObserver` 不相交（离屏）→ 同停；恢复时以 dt 续播不跳帧堆积。
- 视差：rAF 合并（与 L1 同一循环），passive scroll listener；卸载时全部移除。
- **reduced-motion：L1 不生成、L2 不绘制、视差关闭；仅 L0 静态画 + 2–3 片绘死的落叶 = 全静态。**
- 布局安全：全部背景层 `position: fixed; inset: 0; pointer-events: none;`，不产生 CLS。

### 9.4 原创几何熊猫 SVG（吉祥物）

- 几何：圆头（宽:高 ≈ 1:0.9）、双圆耳、**川剧脸谱式弧形眼罩**（两段约 60° 弧、外旋 ±20°、不闭合）、几何点状眼鼻、可选抱竹节姿态。
- 描边：亮色主题竹绿 `#2F6B4F` 2px；暗色主题眼罩描边透科技蓝 `#4E9BD8` 微光：`stroke: #4E9BD8 + filter: drop-shadow(0 0 6px rgba(78,155,216,0.45))`（致敬科梦的手法，**不复制造型**：不用其具体眼圈形状/配色方案/姿态）。
- 用途与尺寸：logo/favicon 64×64 viewBox、页脚打盹 96×96、加载态 72×72、彩蛋同页脚件。禁止位图化。

---

## 10. 资产与授权边界

| 资产 | 来源 | 授权 | 边界 |
| --- | --- | --- | --- |
| 插画（hero 场景、随笔头图、空状态、404） | いらすとや（irasutoya.com） | 商用免费，条件制 | **单作品 ≤20 张**（本项目预算：hero 1 + 随笔头图 ≤6 + 空状态 2 + 404 1 = ≤10，留余量）；保留版权标注（页脚一行 + `/about` 致谢：「插画：いらすとや https://www.irasutoya.com/」）；**禁止单独再分发**（不打包下载、不作为素材包提供）；**正文排版区禁止出现任何插画**【HC 边界】 |
| 标题字体 | LXGW WenKai | OFL-1.1 | 子集化分发需附许可；`/about` 致谢 |
| 正文字体 | Noto Sans SC | SIL OFL 1.1 | 同上 |
| 代码字体 | JetBrains Mono | OFL-1.1 | 同上 |
| 熊猫 logo/吉祥物、墨竹背景、图标 | 本项目原创 SVG | 自有 | 眼罩手法致敬川剧/科梦，不复制造型 |
| 三张原型参考图 | 门C 生成图 | 仅方向确认 | **不进入构建产物**（不复制进 assets/） |
| UI 图标 | 统一线稿图标（自绘或 Lucide 线稿风格，24px、1.5px 描边） | 需兼容 MPL-2.0（Lucide）或自绘 | 与插画层气质区分：图标=几何线稿，插画=软色块 |

---

## 11. 可访问性目标（WCAG 2.1 AA）

- 对比度：正文 ≥4.5:1、大文字（≥24px 粗体/≥18.66px 粗）与 UI 边界 ≥3:1；亮暗两主题全部语义对见 §4.2 表，全部达标。
- 键盘：全站可纯键盘完成；`Tab` 顺序=视觉顺序；提供「跳到正文」skip link（首个 Tab 停靠）；搜索浮层焦点困住+归还；抽屉/ disclosure 标准 `aria-expanded`。
- focus-visible：2px 环 offset 2px，永不 `outline: none` 无替代。
- 触控：命中区 ≥44×44（标签栏项为整列 ≥64px 高）。
- 语义：`lang="zh-CN"`；`<nav>/<main>/<footer>` 地标；导航当前项 `aria-current="page"`；主题切换动态 `aria-label`；装饰性背景层 `aria-hidden="true"`；插画 `alt` 描述。
- reduced-motion：§8 每条已给出结果；全局校验 CSS 动画与 Canvas 循环（MotionConfig 之外）。
- 缩放：200% 页面缩放不破版（单列重排）。

---

## 12. 规则 Do / Don't

**Do**
1. 背景一律代码绘制（SVG/Canvas），艺术对照 prototype-ink-bamboo.png。
2. 语义令牌双主题成对定义，组件只引用语义令牌。
3. 移动端=重排：吸底标签栏、固定字号、首条文章进首屏。
4. 所有入场动画一次性；所有循环动画可暂停；一切动效有 reduced-motion 出口。
5. 动效气质统一「水墨的慢」：晕、染、浮、落、生长。

**Don't**
1. 禁：位图背景、玻璃拟态、霓虹渐变、卡片墙、列表底色带。
2. 禁：朱砂出徽标外使用；竹绿亮在亮色主题作文字/UI边界；科技蓝在亮色主题作文字（语法深派生除外）。
3. 禁：`transition: all`、`vw` 字号、移动标签栏在顶部、正文排版区插画。
4. 禁：动画门控语义（路由/主题/表单状态不等动画完成）。
5. 禁：入场动画在筛选/翻页/回滚时重播。

---

## 13. 门E 验收检查预列表

实现完成后逐项打勾，均可实测：

- [ ] **HC-1** 390×844：标签栏 `position:fixed; bottom:0`（DevTools 查 computed），五项齐全、当前项竹绿高亮；320/390/768/1440 正文 computed font-size 均 16px，代码库 grep 无 `clamp(`/`vw` 用于 font-size；首条文章标题在移动首屏可见（截图）。
- [ ] **HC-2** 路由换场总时长实测 450–550ms（Performance 面板逐帧）；hover 墨点 150ms 内可见起效（慢速录屏核对）；晕染周期 600–800ms；按压 0.98 spring 回弹；快速连点导航不卡死、语义正确。
- [ ] **HC-3** 飘叶计数（调试计数器）桌面 ≤12 / 移动 ≤8；DPR 日志 ≤2；`visibilitychange` 后 rAF 停止（CPU 归零）；运笔间隔实测 20–30s、单笔 4–6s、CLS=0；视差系数实测 0.3/0.4；文字列合成对比度 ≥4.5:1（取叶经过时的截图逐点取样）；`prefers-reduced-motion` 下加载后无任何动画帧。
- [ ] **HC-4** 下拉 72px 阈值：叶随拉距生长摆动、松手飘出+内容换入、不足回弹；上拉每页一节虚线→实心；新条目入场 320ms 渐进且**回滚不重播**（手动验证 + observer 断言）。
- [ ] 对比度：§4.2 全表逐对 axe/取色器实测，亮暗两主题全绿。
- [ ] 组件全状态：§7 全部组件的所列状态在 Storybook/页面上可一一指认（含 loading/empty/failure）。
- [ ] 授权：页脚与 `/about` 含 irasutoya 版权行与三字体声明；irasutoya 用图 ≤20；构建产物无参考图 PNG。
- [ ] 正文排版区无插画；列表无底色带。
- [ ] 键盘全流程（nav→列表→文章→代码复制→主题切换→搜索）+ skip link + focus 环可见。
- [ ] Lighthouse 移动端性能 ≥85、动画期间无 >50ms 长任务（背景循环独立 rAF，待实测）。

---

## 附录 A：MCP 调用留痕（门F）

| 项 | 内容 |
| --- | --- |
| 目的 | 核对 motion/react 的 spring Transition API（`type:'spring'` 与 stiffness/damping/mass 用法、`Transition` 类型导入），保证 §8.1 准确 |
| 服务器 | Context7 MCP（`context7`） |
| 调用 1 | 工具 `resolve-library-id`；参数 `libraryName: "Motion"`，query: motion for React spring transition API…；**结果：失败** —— `Invalid API key. Please check your API key. API keys should start with 'ctx7sk' prefix.` |
| 调用 2（复核） | 工具 `query-docs`；参数 `libraryId: "/motiondivision/motion"`，query: spring transition stiffness damping mass usage in motion/react；**结果：同样失败**（同一 API key 错误），确认服务器整体不可用而非查询问题 |
| 降级核查 | 检查本地 `node_modules`（仓库根与 `demo/zhumu-blog/`）无已安装的 `motion` / `framer-motion` 包，无本地 .d.ts 可核对 |
| 结论 | **Context7 不可用，未取得任何文档返回；不虚构成功调用。** §8.1 的令牌形状逐字采用 kit 内 `motion-contract.md` 的权威示例（`import type { Transition } from 'motion/react'` + 三预设 satisfies Record）。 |
| 遗留义务 | 实现期以本地安装的 motion/react 实际类型定义复核 §8.1；若与契约不符，以实际类型为准并在实现笔记记录差异，必要时修订本契约。 |

## 附录 B：契约自查记录（P0 两项）

1. **硬约束量化覆盖**：HC-1 → §2.2（吸底+56/64px+safe-area+命中区）、§3.1（固定字号+四档断点验证法）；HC-2 → §8.2 A/B/C（500ms 窗口、150ms 起效、750ms 收尾、spring 回弹、中断与 reduced-motion）；HC-3 → §8.2 D/E/F + §9.2/9.3（≤12 叶、DPR≤2、20–30s、≤8% 墨、≥4.5:1、暂停与全静态）；HC-4 → §8.2 G/H/I + §7.9/7.10（72px 阈值、逐节生长、一次性入场）。四条均有数值规格与门E 对应验收法（§13 前 four 项）。
2. **双主题语义色对比度覆盖**：§4.2 表 17 个语义令牌 + 4 个语法子令牌，每行均给出亮/暗值、对比对、目标与计算值；派生色 `--syntax-string` 亮色 `#2E6E9E` 已作显式声明（附录同 §4.2 注 1）；无「仅单主题」的语义色遗留。

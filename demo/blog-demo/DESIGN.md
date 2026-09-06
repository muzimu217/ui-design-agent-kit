# 个人博客展示页 · 设计契约（DESIGN.md）

> 依据 v5 思维链环节 5「设计契约」产出（对应确认门：门D，按需）。本文件是
> 页面视觉与交互方向的可测试契约；实现（`src/App.tsx` + `src/styles.css`）与
> 验收（`ACCEPTANCE.md`）均以本契约为准。契约本身不依赖任何 MCP 或 CLI。

## Mission

这个页面存在的唯一任务：让第一次来访的读者在 **10 秒内** 确定「这里有一个
值得订阅的作者」，并给出一条不被打断的路径：**认识作者 → 挑一篇看 → 订阅**。

## Brand

- 受众：喜欢慢阅读、写作方法、读书笔记与城市随笔的中文读者（不追热点的
  独立博客读者群）。
- 主任务：①快速浏览作者与最新文章（探索心态）；②判断是否值得订阅/关注
  （评估心态）。
- 表面：Docs/Article/Reading 型阅读页面（参照 SKILL 表面矩阵：重在理解、
  导航、可读性与舒适阅读长度）。
- 内容现实：单页展示页 demo，无详情页、无后端、无真实作者。所有文章、数字、
  邮箱均为 **示例数据（demo data）**，页面页脚明示。
- 技术约束：React 18 + TypeScript strict，仅 `react`/`react-dom` 依赖
  （package.json 冻结，不得新增依赖）；无外部图片、无外部字体；375px 与
  1024px 响应式。

## 参考基线（reference baseline）

- 方向：**编辑式个人博客 / 纸感阅读页**。版面语言取自灵感库目录中的
  editorial 单页方向（Refero / Godly / SaaS Landing Page 的 editorial 检索
  方向）与通用编辑式版面惯例（居中阅读列、衬线标题、低对比分隔线）。
- 诚实声明：本执行环境无浏览器/检索工具，**未进行现场抓取**。此基线是
  「依据灵感库目录描述设定的参考方向」，不是「已核验的某网站」。版权边界：
  只改编版面关系（列宽、层级、留白、纸感底色），不复制任何站点的代码或资产。
- 如需严格门B 素材选择：由于素材检索环节（门B）同样因工具不可用而降级，
  本页不引入任何外部素材，所有视觉均由语义 token 与内联 SVG/字符实现。

## Style foundations

### 色彩（语义 token，非单一强调色）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--paper` | `#f7f5f0` | 页面底（纸感中性底） |
| `--surface` | `#fffdf8` | 卡片/表单/区块表面 |
| `--surface-muted` | `#efeae0` | 悬停底、次要块 |
| `--ink` | `#26221c` | 主文字（近黑暖灰） |
| `--ink-soft` | `#57524a` | 次文字/正文 |
| `--ink-faint` | `#8a8376` | 仅限大号/装饰性辅助（正常字号不达 4.5:1） |
| `--line` | `#e4ded1` | 分隔线、描边 |
| `--accent` | `#a3411f` | 主色「锈陶」：按钮/链接/焦点/头像 |
| `--accent-strong` | `#8a3518` | 主色 hover/按下加深 |
| `--accent-soft` | `#f3e1d5` | 主色浅底（标签、头像底、订阅区底） |
| `--danger` | `#b3261e` | 表单错误 |
| `--success` | `#2e6b37` | 订阅成功 |
| `--focus-ring` | `var(--accent)` | 键盘焦点环 |

**计算对比度（值来自 sRGB 亮度计算，非浏览器实测）：**

| 组合 | 对比度 | 用途 |
| --- | --- | --- |
| `--ink` #26221c on `--paper` #f7f5f0 | ≈ 14.2:1 | 主文字 ✅ |
| `--ink-soft` #57524a on `--paper` | ≈ 7.1:1 | 正文/元信息 ✅ |
| `--accent` #a3411f on `--paper` | ≈ 5.8:1 | 链接文字、CTA 文字 ✅ |
| `#ffffff` on `--accent` #a3411f | ≈ 6.3:1 | 主按钮文字 ✅ |
| `--accent` on `--accent-soft` | ≈ 5.0:1 | 标签文字 ✅ |
| `--ink-faint` #8a8376 on `--paper` | ≈ 3.4:1 | 仅大号辅助，不用于正文 ⚠️ |

### 字体（中文字体栈，系统字体，无外部加载）

- `--font-serif`：`"Noto Serif SC", "Songti SC", "STSong", "SimSun", Georgia, "Times New Roman", serif`
  —— 用于头像「林」、页眉品牌、Hero 标题、文章标题（编辑式衬线发声）。
- `--font-sans`：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`
  —— 用于导航、按钮、正文与表单（中文可读性优先）。
- 字号：`11 / 12 / 13 / 15 / 17 / 22 / 28 / 40`（稳定字号，**不做视口缩放文本**）；
  展示行高 `1.35`，正文行高 `1.75`。

### 间距 / 深度 / 圆角

- 间距节奏：4px 网格；区块内距 56–80px；卡片间距 16–20px；阅读列 `--max-w-read: 720px`，网格列 `--max-w-grid: 1080px`。
- 深度：纸感扁平。`--shadow-1: 0 1px 2px rgb(38 34 28 / 0.06)`（静态），
  `--shadow-2: 0 10px 24px rgb(38 34 28 / 0.10)`（悬停）。1px `--line` 描边。
- 圆角：`--radius-s: 8px`（按钮/输入框）、`--radius-m: 12px`（卡片）、标签全圆角。

### 动效（按 motion-contract.md 预设）

| 角色 | 规格 | 实现 |
| --- | --- | --- |
| hover 反馈 | ≤150ms 起效；卡片 `translateY(-2px)` + shadow 增强；链接下划线 `scaleX(0→1)` | CSS transition（指定属性） |
| 按下反馈 | `scale(0.98)` 弹簧按下；键盘 active 同款 | CSS `:active` |
| 入场 | `rise`：opacity 0→1 + translateY(14px→0)，Elegant `cubic-bezier(0.16,1,0.3,1)`，级联延迟 40–80ms（默认 60ms） | CSS `@keyframes`，仅 `no-preference` 下启用 |
| reduced-motion | 移除全部入场/位移/下划线动效，状态即时呈现 | `prefers-reduced-motion: reduce` 媒体查询 |

**实现决策（如实记录）**：契约内的 Snappy/Elegant 弹簧预设按 motion-contract
定义。由于 package.json 冻结（不得新增 `motion` 依赖）且本环境无 Motion MCP
的 `generate-css-easing`，网页动效以 **CSS transition + 经批准的 Elegant
曲线 `cubic-bezier(0.16,1,0.3,1)`** 实现，hover 起效 ≤150ms。禁止
`transition: all`、泛化 `ease` 与线性匀速位移。

## Accessibility

- 对比度目标：正文 ≥4.5:1（见上表计算值）；焦点环 `3px solid var(--accent)` + `outline-offset: 2px`，仅 `:focus-visible` 显示。
- 键盘路径：跳过链接 → 顶部导航 → Hero CTA → 文章列表（展开按钮）→ 关于 → 订阅表单 → 页脚回顶；全部控件为原生 `<a>`/`<button>`。
- 展开按钮：`aria-expanded` + `aria-controls`；订阅结果用 `role="status"`；表单错误用 `role="alert"` + `aria-describedby`。
- reduced-motion：CSS 媒体查询统一降级；订阅状态切换即时（属于必要状态更新，不延迟）。
- 语言：`zh-CN`。

## Writing tone

平静、克制、第一人称。界面文案与作者语气一致：短句、具体、不堆砌形容词。
示例数据以「本页为个人博客展示 Demo」脚注明示，不冒充真实作者数据。

## Rules: Do

- 只用语义 token 定义颜色/字号/间距；稳定字号与内容驱动断点（640/768/1024px）。
- 真实 `<a href>`（页内锚点、mailto）与真实 `<button>`（订阅校验、展开全文）；
  语义控件优先，键盘原生可用。
- 具体 CSS 属性过渡；hover 起效 ≤150ms；reduced-motion 全降级。
- 状态覆盖：default / hover / focus-visible / active / disabled（不适用则说明）。

## Rules: Don't

- 不引入外部图片/字体（无 `<img src>` 外链、无 `@font-face` 外链）。
- 不虚构外部真实网址（社交链接用 `mailto:` + example.com 保留域名，属 demo）。
- 不加 `transition: all`、泛化 `ease`、视口缩放文本、`any`。
- 不新增依赖、不改 package.json / index.html / main.tsx / tsconfig / vite 配置。
- 不做一次性跑完的「静默设计」：方向已按六阶段留痕并记录降级路径。

## Output structure

单页（无路由）：
`顶部导航(品牌+文章/关于/订阅) → Hero(头像+一句话+双CTA+元信息) → 精选文章(4 卡片) → 关于(介绍+兴趣标签+联系方式) → 订阅(邮箱表单+成功态) → 页脚(demo 声明+回到顶部)`

## Component expectations

| 组件 | 状态覆盖 |
| --- | --- |
| 导航链接 | 默认 ink → hover 主色下划线生长(scaleX) → focus-visible 焦点环 → active 文字加深 |
| 主按钮 `.btn-primary` | accent 底白字 → hover `--accent-strong` → active `scale(.98)` → focus 环 |
| 幽灵按钮 `.btn-ghost` | 描边+accent 字 → hover `--surface-muted` → active `scale(.98)` → focus 环 |
| 文章卡片 `.post-card` | 静态 shadow-1 → hover `translateY(-2px)`+shadow-2+描边转主色浅底 → focus 环 → active 轻微回压 |
| 展开按钮 `.post-more` | 默认 accent 文字 → hover 加深+右移 2px → focus 环 → `aria-expanded` 切换文本 |
| 订阅表单 | 空/非法→内联错误；合法→`role=status` 成功态 + 「换一个邮箱」重置；输入获得焦点即清除错误态 |
| 回顶链接 | 页脚真实 `#top` 锚点 |

## Quality gates（映射 acceptance.md）

1. **类型**：`tsc --noEmit` 通过（strict + noUnusedLocals + noUnusedParameters），全文无 `any`。
2. **对比度**：上表计算值达标（正文 ≥4.5:1）。
3. **响应式**：375px 单列、≥768px 文章 2 列、1024px 布局舒展；无横向滚动。
4. **键盘**：跳过链接 + 全部控件可达可操作，焦点环可见。
5. **reduced-motion**：模拟 reduce 后无入场位移/悬停位移动画。
6. **无外部资产**：无外链图片/字体/样式；页面完全自包含。
7. **语义**：无 `div` 冒充按钮/链接；展开/错误/成功均有 ARIA 关联。

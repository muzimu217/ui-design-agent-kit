# 竹与墨 · 历史实现记录

本文保留原 README 中的实现与自查记录，不代表本轮重新执行了这些检查。当前产品入口见 [README](../README.md)。以下项目路径和章节引用均相对于原项目根目录理解。

> 成都个人开发者「小墨」的技术博客 demo。水墨宣纸上读技术文章：墨竹与熊猫是身份，不是噪声。
> 设计唯一依据：`DESIGN.md`（门D 契约 v1.0）。本 README 记录运行方式、实现笔记与自查记录。

**全部文章、随笔、人物与联系方式均为演示数据。**

## 运行方式

```bash
cd demo/zhumu-blog
npm install
npm run dev       # 开发（Vite）
npm run build     # tsc -b + vite build（均已验证零错误）
npm run preview   # 本地预览构建产物
```

- 技术栈：Vite 7 + React 19 + TypeScript 5.8 + Tailwind CSS v4（`@tailwindcss/vite`，未降 v3）+ motion（`motion/react` 12.43.0）+ react-router-dom 7（BrowserRouter，Vite SPA fallback）。
- 字体经 CDN 加载（jsdelivr 的 `lxgw-wenkai-webfont@1.7.0` CSS + Google Fonts 的 Noto Sans SC / JetBrains Mono），离线时回退栈生效（`"LXGW WenKai", "Kaiti SC", KaiTi, serif` 等，见 `src/index.css`）。

## 目录速览

```
src/
├── lib/            # 动效令牌(motion.ts)、主题(theme.tsx)、toast、搜索状态、媒体查询 hooks、高亮器
├── content/        # 演示数据：6 篇技术文章 + 3 篇追番周记（类型化 block 数组）
├── components/
│   ├── background/ # 墨竹背景系统：primitives / L0 InkPainting / L1 FallingLeaves / L2 InkStrokeLayer
│   ├── nav/        # 桌面顶部导航 / 移动顶栏 / 吸底标签栏
│   └── …           # 列表项、胶囊、印章、代码块、TOC、搜索浮层、上拉加载、下拉刷新、页脚等
└── pages/          # 首页 /posts /posts/:slug /essays /essays/:slug /archives /about 404
public/irasutoya/   # いらすとや插画 + SOURCE.md（逐张来源）
```

## 实现笔记（契约偏离 / 决策记录）

### 1. motion/react 类型复核（契约附录 A 遗留义务）✅

- 本地安装 `motion@12.43.0`（`motion-dom` 12.43.0 提供 `.d.ts`）。
- 验证方式：将契约 §8.1 令牌逐字放入临时文件，`tsc --noEmit` 通过（exit 0）：
  - `import type { Transition } from 'motion/react'` 可用（motion 重导出 motion-dom 的 `Transition`）；
  - `{ type: 'spring', stiffness, damping, mass }` 满足 `Transition`（`SpringOptions`，三个字段均为可选 number）；
  - `satisfies Record<string, Transition>` 成立。
- **结论：§8.1 令牌形状与实际类型一致，无需修订契约**；`src/lib/motion.ts` 逐字落地。

### 2. MCP 尝试留痕（如实记录）

- Context7 MCP（`resolve-library-id` / `query-docs`）在门D 已失败（API key 错误，见 DESIGN.md 附录 A）；本次实现期**未再调用**，直接执行契约遗留义务（以本地 `.d.ts` 复核，见上）。
- いらすとya 图片下载：本机直连 `blogger.googleusercontent.com` 超时，改经 `wsrv.nl` 图像代理按原 URL 原样取回（未做任何加工），全部来源记录在 `public/irasutoya/SOURCE.md`。

### 3. いらすとや用图与 hero 替代决策

- 站内搜索结果：`q=パンダ` 有结果；**hero 所需的「熊猫+电脑」：`q=パンダ パソコン`、`q=パンダ タイピング` 均 0 结果**（3 次搜索内未找到贴合插画）。按约定 hero 改用**原创几何熊猫 SVG 场景**（`src/components/HeroScene.tsx`，与吉祥物同语言：竹绿描边 + 脸谱式眼罩 + 几何线稿笔电）。
- 实际用图 4 张（≤20 预算）：`animal_stand_panda.png`（空状态）、`animal_study_panda.png`（Vol.14 头图）、`animal_bear_panda.png`（Vol.13 头图）、`animal_panda_back.png`（404）。逐张原始页面 URL 见 `public/irasutoya/SOURCE.md`。
- 授权行「插画：いらすとや https://www.irasutoya.com/」已放页脚与 `/about`。

### 4. 契约偏离 / 补充清单

| # | 偏离/补充 | 理由 |
| --- | --- | --- |
| 1 | 新增路由 `/essays/:slug`（随笔详情） | 契约路由表只有 `/essays` 列表；随笔列表项需要可点击的去处，避免死链接。详情页正文同样禁止插画。 |
| 2 | 视差（§8.2 F）的 `translate3d(0, scrollY×0.4)` 实现为**向上**（`-scrollY×0.4`，内容同向、速度 0.4×/0.3×） | 契约字面正号会让背景与页面反向移动（像是浮在内容前）；按"水墨在纸后"的艺术意图取经典深度方向。**系数 0.4/0.3 与 0.3–0.5 区间不变**（门E 实测项为系数）。 |
| 3 | L0 视差只作用于「极淡墨底晕」层（100vh 周期瓦片 + mod 位移，无缝无露底）；边缘竹丛固定 | 竹丛锚定边缘带构图（左下/右上斜出）；若整体平移会露底或破坏构图。层高无限覆盖由周期平铺实现（契约"层高 140vh 防露底"的目的等价达成）。 |
| 4 | button-ink-bloom 周期取 bloom 150ms + 保持 200ms + 消散 550ms = **750ms** | 契约"保持约 250ms 后 550ms 淡出 ≈750ms"的算术只能同时满足两处；取窗口中值 750ms，150ms 起效与 550ms 消散均为契约值。 |
| 5 | 上拉加载的 failure 演示：第 2 次加载尝试固定失败一次，重试成功 | 契约要求 failure 态可指认；demo 无真实网络。 |
| 6 | `/posts` 标签筛选含一个零内容标签「设计」，用于指认列表空状态 | 同上，demo 数据下空状态需要可达路径。搜索空状态输入任意无关键词即可指认。 |
| 7 | 列表项入场（§8.2 I）在"被筛掉后再筛回"时会重播一次 | React 按 key 协调，被移除的项卸载后重挂即视为新内容；同屏保留项不重播。语义冲突极小，如实记录。 |
| 8 | 契约 §7.3 列表项 hover「整项 -2px」在**触屏无 hover** 环境自然不触发；按压 scale 0.995 保留 | 按契约 C（按压）与通用约定执行。 |

### 5. 已知限制（如实）

- 下拉刷新（§7.10）与上拉（§7.9）的**真实触屏手感**（阻尼、摆动、阈值）在桌面 DevTools 只做了挂载与事件通路验证，需要在真机（移动 Safari/Chrome）走查；`overscroll-behavior-y: contain` 已挂 body。
- 对比度、Lighthouse 分数、路由换场 450–550ms 帧测等需人工/工具实测项未在本次完成（见下方自查记录的边界）。
- 首屏字体传输量目标 ≤300KB 未实测（CDN 子集分包由 lxgw-wenkai-webfont 的 cn-font-split 产物承担）。

## 自查记录（契约 §13 门E 预列表 · 静态可查项 + 本次实测）

构建于 2026-09-06，`npm run build`（tsc -b + vite build）零错误。

| 检查项 | 方法 | 结果 |
| --- | --- | --- |
| 代码库无 `clamp(` / `vw` 用于 font-size【HC-1】 | `grep -rn "clamp(\|vw"` 全 src | 仅命中演示数据 Rust 代码块内的 `clamp(0.0, 1.0)`（Rust API，非 CSS）；CSS/TSX 零命中。字号全部为 §5.2 固定 px token |
| 无 `transition: all`【§12】 | `grep` src + dist/assets/*.css | 零命中；主题过渡显式列出 `background-color, color, border-color, outline-color, fill, stroke, box-shadow`（`index.css` `.theme-switching`） |
| 移动标签栏吸底【HC-1】 | `TabBar.tsx`：`position: fixed; bottom: 0; left: 0; right: 0` + `padding-bottom: env(safe-area-inset-bottom)`；内容预留 `pb-tabbar = 64px + env(safe-area-inset-bottom) + 24px` | 实测 390×844：computed `position: fixed; bottom: 0px`，几何底边 = 视口底 |
| 暗色语义令牌成对【§4.2】 | 脚本比对 `:root` 与 `[data-theme='dark']` 的 `--z-*`/`--syntax-*` | 25/25 成对，无单主题遗留（含 4 个语法子令牌） |
| 390×844 首条文章标题进首屏【HC-1】 | DevTools 实测 | 移动 hero 总高 202px（≤280），首篇标题 top≈325 < 844 ✓ |
| 桌面 hero（含 nav）≤60% 视口【§3.1】 | 实测 1440×775 | (64+hero)/vh ≈ 0.50 ≤ 0.60 ✓ |
| 正文 computed font-size 16px | 实测 body | `16px` / line-height `28px`（1.75）✓ |
| 全屏背景层 `fixed inset-0 pointer-events-none`【§9.3】 | 实测 4 个 `.bg-layer` | 全部 `position: fixed` + `pointer-events: none` |
| Canvas DPR ≤2【HC-3】 | 实测 canvas.width/cssWidth | 2880/1440 = 2 ✓（代码上限 `Math.min(dpr, 2)`） |
| 飘叶计数上限 | 代码路径 | 视口 ≤768px 为 8，否则 12（`FallingLeaves.tsx` resize）；可见性隐藏/离屏停 rAF；reduced-motion 不生成（静态落叶由 L0 `.reduced-static` 承担，CSS 媒体查询切换） |
| 构建产物无三张参考图【§10】 | `find dist -name "*.png"` | 仅 `dist/irasutoya/` 4 张授权插画；references/ 的 3 张原型图未进产物 |
| 授权行 | 页脚 + `/about` | 均含「插画：いらすとや https://www.irasutoya.com/」+ 三字体声明 + 演示数据声明 |
| skip link / landmarks / aria-current | a11y 树实测 | 「跳到正文」为首个 Tab 停靠；`header/nav/main/footer` 齐全；导航当前项 `aria-current="page"`；主题切换动态 `aria-label` |
| 彩蛋 | 实测（1440 视口连点 5 次） | toast「熊猫被吵醒了！」弹出 + 熊猫旋转（transform 0→360° 进行中）；sessionStorage 保证每会话一次 |

**留待门E 人工走查**（工具不可达，如实列出）：路由换场 450–550ms 逐帧实测、hover 墨点 150ms 起效录屏、对比度全表取色器实测、Lighthouse 移动端 ≥85、真机下拉/上拉手感、`prefers-reduced-motion` 下"零动画帧"全局断言（CSS 侧已用媒体查询静态化；motion 侧由 `MotionConfig reducedMotion="user"` + 各动效的 `usePrefersReducedMotion` 分支直出终态）。

## 13 条命名动效实现对照（§8.2）

| 名称 | 实现位置 |
| --- | --- |
| A route-ink-veil | `src/App.tsx` `RouteVeil` + `AnimatedRoutes`（exit 220ms / enter 280ms / 薄纱 500ms，mode="wait"） |
| B button-ink-bloom | `src/components/InkBloom.tsx`（主题切换、搜索钮；fine pointer only） |
| C press-spring | `uiSprings.snappy` + `whileTap={{scale:0.98}}`（导航/胶囊/复制/标签栏等） |
| D leaf-fall-ambient | `background/FallingLeaves.tsx`（Canvas 精灵，24–48px/s、摆幅 20–40、自转 90–270°、α 0.10–0.25、入内容列 ≤0.08） |
| E ink-stroke-draw | `background/InkStrokeLayer.tsx`（20–30s 随机、4–6s 一笔、墨渍保持 2–4s、隐藏暂停、锚段洗牌轮换） |
| F parallax-drift | `background/BackgroundLayers.tsx`（passive scroll→ref，rAF 合并循环；晕层 0.4×、叶层 0.3×） |
| G pull-refresh-leaf | `components/PullToRefresh.tsx`（72px 阈值、24px 后阻尼 0.5、叶生长/摆动/飘出/缓旋） |
| H loadmore-bamboo-node | `components/LoadMore.tsx` + `pages/PostsPage.tsx`（虚线节 scaleY 生长、加载中防抖） |
| I list-item-enter | `components/Reveal.tsx`（IO 一次性 + unobserve，320ms inkEase，stagger 0.06s ≤8） |
| J theme-toggle-crossfade | `lib/theme.tsx`（`.theme-switching` 250ms inkEase 显式属性）+ `ThemeToggle.tsx`（图标 300ms Snappy） |
| K nav/tab-indicator | `DesktopNav` / `TabBar`（`layoutId` 共享布局动画，Snappy） |
| L copy-feedback | `components/CodeBlock.tsx`（对勾 scale 0.6→1 + 150ms，1.6s 还原，失败 toast） |
| M easter-egg-panda-tumble | `components/Footer.tsx`（rotate 0→360° Playful spring，session 一次，reduced-motion 仅 toast） |

## 授权与致谢

- 插画：いらすとや https://www.irasutoya.com/ （商用免费·条件制；本 demo 未再分发素材包，逐张来源见 `public/irasutoya/SOURCE.md`）
- 字体：霞鹜文楷 LXGW WenKai（OFL-1.1）／思源黑体 Noto Sans SC（SIL OFL 1.1）／JetBrains Mono（OFL-1.1）
- 熊猫吉祥物、墨竹背景、图标：本项目原创 SVG
- `DESIGN.md`、`prototype-*.md`、`references/` 为上游只读契约/参考文件，未修改

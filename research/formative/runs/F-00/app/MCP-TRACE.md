# F-00 门F：MCP 调用留痕（实现子代理 C，2026-10-01）

要求：实现中至少用 Context7 或官方文档 MCP 核对 2 个 API。实际调用记录如下，含失败与替代来源，全部如实。

## 调用 1（失败）：Context7 resolve-library-id —— Tailwind CSS v4 @theme

| 项 | 值 |
| --- | --- |
| 服务器/工具 | `context7` / `resolve-library-id` |
| 参数 | `libraryName: "Tailwind CSS"`，`query: "Tailwind CSS v4 @theme directive define design tokens CSS variables and theme switching with @theme inline"` |
| 结果 | **失败**：`Invalid API key. Please check your API key. API keys should start with 'ctx7sk' prefix.`（会话内 Context7 MCP 不可用） |

## 调用 2（失败）：web_reader（官方文档读取 MCP）—— Tailwind v4 theme 文档

| 项 | 值 |
| --- | --- |
| 服务器/工具 | `web_reader` / `webReader` |
| 参数 | `url: "https://tailwindcss.com/docs/theme"`，`return_format: "markdown"`，`retain_images: false` |
| 结果 | **失败**：`MCP error -429: Weekly/Monthly Limit Exhausted. Your limit will reset at 2026-10-16 14:32:02` |

## 核对 1（成功，替代通道）：Tailwind CSS v4 官方文档 —— `@theme` / `@theme inline`

| 项 | 值 |
| --- | --- |
| 通道 | WebFetch（内建文档抓取工具；两个 MCP 服务器均不可用后的替代来源） |
| URL | https://tailwindcss.com/docs/theme |
| 摘要 | 确认：①`@theme` 声明 token 同时生成 CSS 变量与工具类（`--color-*` → `bg-*`/`text-*`，`--radius-*` → `rounded-*`，`--font-*` → `font-*`）；②**`@theme inline` 用于 token 引用另一 CSS 变量的场景，工具类会内联 `var(--x)` 引用而非解析值——这正是运行时切换主题所需**（无 inline 时变量在定义处解析，换作用域会得到意外回退值）；③所有 token 均落到 `:root` 可被运行时覆盖，但工具类捕获的是编译期值，需要跟踪运行时变量必须用 `@theme inline`。 |
| 落地 | `src/index.css`：`@theme inline` 将 9 个语义色映射到 `var(--bg-base)` 等，`.theme-neon-city` / `.theme-magenta-rain` 两套 token 类上切换 `html` 类名即热换（构建产物已验证内联正确，见报告）。 |

## 核对 2（成功，替代通道）：Motion for React 官方文档 —— `offsetDistance` / CSS 变量动画 / 弹簧

| 项 | 值 |
| --- | --- |
| 通道 | WebFetch（motion.dev 官方文档）+ 本地 `node_modules` 类型定义复核 |
| URL | https://motion.dev/docs/react-animation |
| 摘要 | 确认：①`animate` 值变化自动动画、`motion.div` 覆盖所有 HTML 元素；②`offsetDistance` 可动画且与 `style.offsetPath`（`path(...)`/`rect(...)`）配合——border-beam 的实现基础；③CSS 变量可作动画目标（`animate={{ '--x': ... }}`）也可作目标值（`backgroundColor: "var(--action-bg)"`）；④本地类型复核：`motion-dom/dist/index.d.ts` 中 `Transition` 含 `stiffness?/damping?/mass?`（行 2083 起）与 `bounce/duration` 互斥说明（行 2068），`ValueAnimationTransition` 含 `onComplete?()`（行 1985）；`framer-motion/dist/index.d.ts` 行 1302 `useReducedMotion(): boolean | null`。 |
| 落地 | `TimerCard.tsx`（beam 用 `initial/animate` + `offsetPath: 'rect(0 auto auto 0 round 16px)'` 线性 6s 循环）、`FlipClock.tsx`（`animate(motionValue, 0, { type:'spring', duration:0.45, bounce:0.1, onComplete })`，`useTransform`+`useMotionTemplate` 做翻转叶亮度随角度动态）、`App.tsx`（`useReducedMotion` + `MotionConfig reducedMotion="user"`）。 |

## 附：非 MCP 的本地源码核验（三步策略①②评估依据）

- `node_modules/flipclock@1.0.1/dist/themes/flipclock.css` + `dist/index.d.ts`：确认其翻页为双相 CSS 关键帧（`.before .top` rotateX(0→-90) + `.active .bottom` rotateX(90→0)，`--animation-duration:250ms`、`perspective:15em`），无厚度侧立面元素，无单片弹簧翻转叶。
- `node_modules/@leenguyen/react-flip-clock-countdown@1.7.2/dist/index.css` + `types.d.ts`：确认其翻转叶 `transition: transform var(--fcc-flip-duration) ease-in-out; rotateX(0→-180deg)`（0.7s），结构含上/下静叶+翻转叶（正反面），但无暂停 API（`to` 时间戳驱动）、无厚度元素、类名为 CSS-module 哈希值。

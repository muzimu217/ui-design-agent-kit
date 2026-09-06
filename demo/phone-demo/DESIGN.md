# 设计契约：高端智能手机单页产品页（Phone Demo）

> 实现子代理（子代理 C）依据本文件落地。本文件只定义「设计意图与验收标准」，不定义实现细节；可读的前提是全部内容以真实按钮/链接、语义 token、无外部依赖落地。
> 参考模板：kit `design-contract.md`。数据来源：`research-notes.md`（ui-ux-pro-max，domain=landing 三模式：pricing-page-cta / ai-personalization-landing / real-time-operations-landing）。

---

## Mission

让首屏访客**一眼理解产品定位**（影像 + 性能双旗舰）并**产生预订意向**，在 375px 移动端与桌面端均保持清晰的单次滚动转化路径。

---

## Brand

- **品牌名（虚构）**：曜石（虚构品牌，页面内不出现任何真实手机厂商名/型号名）。
- **受众**：追求影像与性能的城市用户（25–40 岁，通勤/旅行/日常记录高频，对参数敏感但对价格敏感度适中）。
- **主任务**：浏览 → 认同核心卖点 → 选择容量/颜色 → 点击「锁定首发优惠」（预订意向，非真下单）。
- **目标表面**：单页落地页（landing page），无内部路由，锚点跳转。
- **内容现实**：产品参数为演示规格；价格、首发优惠、预约人数、库存、日期均为**演示数据**。页脚必须固定标注「本页面为虚构品牌演示页，价格与预约数据均为演示数据，不构成任何购买要约」。

---

## Style foundations

### 语义 token（CSS 变量，全部经 CSS 自定义属性暴露，实现不得写死魔法值）

颜色（深色基调 + 单一主色，呼应 research-notes 2.2）：

```css
:root {
  /* 底色（深空灰 → 近黑） */
  --color-bg: #0d1117;          /* 页面底色 */
  --color-surface: #151b23;     /* 卡片/区块面 */
  --color-surface-2: #1c232d;   /* 嵌套面 / 规格表行 */
  --color-border: #2a323d;      /* 1px 描边 */

  /* 文本 */
  --color-text: #f0f3f6;        /* 主文本 */
  --color-text-muted: #9aa7b4;  /* 次要文本 */
  --color-text-faint: #6b7684;  /* 脚注/占位 */

  /* 主色（品牌金绿，承担「行动 + 状态」双职责） */
  --color-primary: #8ab43a;
  --color-primary-hover: #9cc74a;
  --color-primary-contrast: #0d1117;  /* 主色上的文字 */
  --color-focus-ring: #e3f0c0;         /* 焦点环 */

  /* 状态色（仅用于「有货/已售罄」「演示数据」等） */
  --color-success: #6fbf73;
  --color-warning: #d9a545;
}
```

字体（中文字体栈，系统级，无外部字体依赖）：

```css
--font-sans: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
             "Noto Sans CJK SC", "Source Han Sans SC", sans-serif;
--font-display: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
```

间距（4px/8px 节奏）：

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-8: 48px; --space-10: 64px;
```

圆角 / 阴影：

```css
--radius-sm: 6px;  --radius-md: 10px; --radius-lg: 16px; --radius-full: 999px;
--shadow-card: 0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.3);
--shadow-cta: 0 4px 14px rgb(138 180 58 / 0.35);
```

动效预设：

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--duration-feedback: 120ms;   /* 交互反馈 ≤150ms */
--duration-feedback-max: 150ms;
```

### 动效规则

- **交互反馈 ≤150ms**：hover/active/focus、折叠展开的过渡时长不超过 150ms。
- **禁用 `transition: all`**：过渡只声明具体属性（如 `transition: background-color var(--duration-feedback) var(--ease-out)`）。lint/评审按此校验。
- **无入场动画**：Hero、区块、卡片不做整页/整区入场动画（fade-in、slide-in、reveal 等一律不做）。只有「鼠标悬停卡片抬升 1px + 描边高亮」这类即时反馈允许。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 下全部动效关闭，渲染为静态最终快照。

---

## Accessibility

- **对比度**：正文/主色按钮文字与底色对比度 ≥ WCAG AA（正文 4.5:1，大号文字 3:1）；`--color-text-muted` 不得用于承载关键信息的小字号文本；状态色与深色底需达 AA。
- **键盘全旅程可操作**：以下全部可用 Tab 聚焦、Enter/Space 触发，且聚焦顺序符合视觉顺序：
  - sticky CTA（含移动端悬浮按钮）；
  - 价格卡的选择（radio 语义）与各卡 CTA；
  - 意向按钮状态切换（「我要预约」→「已加入意向」）；
  - FAQ 折叠项（`<button>` + `aria-expanded` + `aria-controls`，或原生 `<details>/<summary>`）；
  - 导航锚点链接与页脚链接。
- **focus-visible**：所有可聚焦元素有可见焦点环（2px `--color-focus-ring`，可叠加 outline-offset）；不得全局清除 `outline`。
- **reduced-motion 降级**：开启 `prefers-reduced-motion: reduce` 时页面为静态快照——所有信息默认完整可见、无折叠动画、无过渡（保留即时状态切换）。
- **演示数据可隐藏/暂停**：「预约人数」等模拟计数器提供「隐藏」控件；若含倒计时提供「暂停」控件；均标注「演示数据」及更新时间。

---

## Writing tone

- 全站**中文**（`lang="zh-CN"`），文案简洁、高端、克制，不堆砌夸张形容词。
- CTA 文案**收益导向**：主 CTA「锁定首发优惠」（不用「提交」/「立即购买」这类命令式动作）；价格卡 CTA「选择曜石 12 Pro」「选择曜石 12 Pro Max」；意向按钮「加入我的意向」→ 成功后「已在意向清单」。
- 打消顾虑文案收益化：「12 期免息 · 以旧换新最高抵 ¥1,200 · 全国联保」。
- **演示数据明确标注**：价格、优惠、预约数、日期旁标注「演示数据」；页脚固定虚构声明（见 Brand）。
- 不出现任何真实厂商名、真实型号、真实价格承诺。

---

## Rules: Do / Don't

### Do

1. 使用语义 token（颜色/间距/圆角/阴影全部走 CSS 变量），不写死魔法值。
2. CTA、导航、FAQ、页脚链接均为真实按钮/链接（`<button>` / `<a href="#...">`），可点击、可聚焦。
3. 375px（移动端）与 1024px（桌面端）两档均无横向滚动，内容完整可见。
4. 演示数据（价格/预约数/优惠）统一走一个数据源标注，页脚固定虚构声明。
5. 动效只做 ≤150ms 的交互反馈，并为 `prefers-reduced-motion` 提供完整静态快照。
6. 键盘可完成「导航 → 选配置 → 意向」全流程。

### Don't

1. 不使用 `transition: all`（或用通配过渡代替具体属性）。
2. 不做整页/整区入场动画（Hero 漂浮、区块 reveal、滚动渐显均禁止）。
3. 不依赖任何外部图片/字体/CDN（设备示意用本地内联 SVG 或 CSS 绘制；无外部请求）。
4. 不出现真实品牌名、真实型号，不对价格做真实性承诺。
5. 不把演示数据当真实数据展示（缺标注、缺更新时间即视为违规）。
6. 不伪造持久化：意向状态只做本地组件状态，刷新即恢复初始，不做 localStorage/服务端写回暗示。

---

## Output structure

自上而下（采纳 research-notes 2.1 骨架，FAQ 随购买区收尾）：

1. **导航**（sticky）：品牌名「曜石」+ 锚点链接（特性 / 规格 / 预订）；移动端折叠为菜单按钮；桌面端可含 sticky CTA「锁定首发优惠」。
2. **Hero**：主卖点一句话（如「曜石 12 Pro —— 影像与性能，皆旗舰」）+ 设备示意（内联 SVG 手机轮廓 + 参数光点，静态或 ≤150ms 反馈）；双入口 CTA（主 CTA 滚动到购买区 + 次要链接「查看规格」）。
3. **特性区**：3–4 张卡片（影像 / 性能 / 续航，可加一卡「材质与工艺」），每卡标题 + 一两行收益化文案 + 内联图标。
4. **规格表**：单机明细表（屏幕 / 芯片 / 影像 / 电池 / 存储 / 接口），深色面上用 1px 描边分行。
5. **购买 / 意向区**：价格卡（标准版 / 旗舰版，含容量与颜色选择）+ 首发优惠行（演示数据标注）+ FAQ 简项（3–5 条，折叠）收尾。
6. **页脚**：虚构品牌声明、演示数据声明、假链接（客服 / 保修 / 隐私，`href="#"` 需标注为演示链接）。

---

## Component expectations

- **主 CTA（Hero + sticky）**：点击平滑滚动到购买区（锚点 `#buy`）；无 JS 时 `href="#buy"` 仍可跳转。
- **价格卡选择状态**：容量/颜色选择用 radio 语义（键盘方向键可用），选中项有明显选中态（主色描边 + 对勾图标）；切换选择不重置页面其他状态。
- **意向按钮状态切换**：「加入我的意向」点击后切换为「已在意向清单」+ 成功视觉反馈（≤150ms），再次点击可撤销；状态仅本地组件内存，不伪造持久化，不做倒计时/计数幻觉。
- **导航折叠（移动端）**：≤1024px 折叠为菜单按钮，展开/收起为即时显示（≤150ms，reduced-motion 下直接切换），菜单项可 Tab 遍历，展开时按钮 `aria-expanded` 正确。
- **演示数据标注**：预约数旁含「演示数据 · 更新于今日」+ 隐藏控件；价格卡标注「演示价格」。

---

## Quality gates（验收标准）

1. `npm run build`（`tsc --noEmit && vite build`）通过，无 TS 报错、无构建警告残留。
2. 375×812 与 1440×900 截图：无空白区、无元素重叠、无横向滚动（`document.documentElement.scrollWidth <= clientWidth`）。
3. 键盘（Tab/Enter/Space/方向键）走完全旅程：导航 → 特性 → 规格 → 选择配置 → 意向按钮 → FAQ → 页脚，全程焦点可见。
4. `prefers-reduced-motion: reduce` 下无空间动效（无平移/缩放/渐显），页面为完整静态快照。
5. 页面无任何外部网络请求（图片/字体/CDN），所有视觉资源内联。

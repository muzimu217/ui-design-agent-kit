# 曜时 X1 产品页 Design Contract

依据 `references/design-contract.md` 模板落盘；本契约驱动 demo 的实现与验收。

## Mission
让访客在首屏理解"曜时 X1"智能手表的定位（健康 + 续航 + 防水），并把"查看规格/了解特性/加入意向清单"三个动作自然地走完。

## Brand
- 受众：关注健康与效率的都市通勤人群
- 主任务：浏览产品 → 确认规格 → 留下意向
- 表面：单页营销落地页（桌面 + 手机）
- 内容现实：虚构品牌"曜时"与型号 X1；价格为演示数据，页脚已标注"本页为虚构产品演示"

## Style foundations
- Color：语义 token（`--color-*`）；主色蓝 `#2563eb` + 中性色系（`#171a1f` 前景 / `#f4f6f9` 底），强调青绿 `#0e8577` 仅作状态点缀；不用彩虹色
- Type：中文字体栈（系统 + PingFang SC 等）；标题 `clamp(2.4rem, 6vw, 3.5rem)` 稳定缩放，正文 0.9375-1.125rem
- Spacing：4px/8px 节奏（`--space-1..8`）
- Depth：卡片阴影 `--shadow-card`、Hero 渐变光斑；玻璃只用于吸顶导航（backdrop-blur）
- Motion：交互反馈 140ms（hover scale 1.02 / active 0.98，禁用 `transition: all`）；无入场动画；`prefers-reduced-motion` 移除所有空间动效与平滑滚动

## Accessibility
- 键盘可完成全部主旅程：焦点可见（`:focus-visible` 3px outline）、锚点链接 + 按钮
- 手表示意图 `role="img"` + `aria-label`；装饰元素 `aria-hidden`
- 对比度：主色按钮白字 on `#2563eb`（≥ 4.5:1）；正文 `#171a1f` on `#ffffff`
- 手机端导航折叠按钮带 `aria-expanded` / `aria-controls`

## Writing tone
- 中文、简短有力；数字与参数用列表/表格呈现；不夸张（"两周超长续航"有规格表支撑）；页脚明示虚构

## Rules: Do
- 真实 `<button>`/`<a>`，CTA 有可见反馈（滚动/状态切换"已加入意向清单 ✓"）
- 语义 token 表达所有颜色与间距，不写死魔法值（手表示意图内部深色除外）
- 375px 与 ≥1024px 两档实测无横向滚动、无重叠

## Rules: Don't
- 不用 `transition: all`、不做整页入场动画、不因动效延迟内容可读
- 不用外部图片/字体依赖；产品视觉用纯 CSS + 内联 SVG
- 不出现任何真实品牌、真实价格承诺或"已售"字样

## Output structure
顶部导航（品牌 + 特性/规格/购买锚点）→ Hero（卖点 + 主 CTA + 手表示意图）→ 特性区（4 卡片）→ 规格表 → 购买/意向区 → 页脚

## Component expectations
- 按钮：hover 140ms scale 1.02、active 0.98、disabled 不出现
- 导航折叠：手机端展开/收起，点击锚点后自动收起
- 意向按钮：点击后切换为"已加入意向清单 ✓"（本地状态，不伪造持久化）

## Quality gates
- `npm run build`（tsc 严格 + vite）通过
- 375×812 与 1440×900 截图无空白/重叠/横向滚动
- 键盘走完导航→特性→规格→购买全旅程，焦点可见
- reduced-motion 模式无空间动效、平滑滚动关闭

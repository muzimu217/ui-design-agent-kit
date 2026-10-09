# ACCEPTANCE.md — 需求信号面板验收记录

- 日期：2026-10-09 ｜ 执行者：主代理（Playwright MCP + node 实测脚本）｜ 状态：全过
- 门 E 证据：本目录 `evidence/`（3 张截图）+ 本文件断言记录

## 1. 桌面 1440×900

- 全页截图：`evidence/desktop-1440.png`
- 断言：四态节点齐备（loading/error/empty/content）、内容态可见、画像表 4 行、痛点条 7 条、证据行 4 条、重试按钮存在——**全过**

## 2. 移动 390×844

- 全页截图：`evidence/mobile-390.png`
- 断言：`scrollWidth (390) == clientWidth (390)`，零横向溢出——**过**

## 3. 键盘链路（11 断言全过）

分段切换（WAI-ARIA tabs）：

- 点击选中 tab1 → `aria-selected=true`，panel1 可见 ✓
- `ArrowRight` → tab2 选中、panel2 可见、panel1 隐藏、焦点移至 tab2 ✓

证据行展开/收起：

- 点击行 → detail 打开、`aria-expanded=true` ✓
- 点击"收起" → detail 关闭、`aria-expanded=false`、文案复原"展开原话"、**焦点返回该行** ✓

## 4. 对比度实测（node 脚本，非目测）

单暗色主题（本页无 light 变体——设计决定，如实记录），10 对全部 ≥4.5:1：

| 对 | 比值 |
| --- | --- |
| 正文/卡片 | 14.40:1 |
| 正文/页面底 | 15.70:1 |
| 次要文字/卡片 | 6.98:1 |
| 次要文字/页面底 | 7.61:1 |
| 范围声明条 | 8.83:1 |
| 标签·偶尔 | 7.63:1 |
| 标签·低 | 6.86:1 |
| 标签·经常/错误态 | 5.23:1 |
| 分段选中白字 | 5.56:1 |
| 证据展开区 | 6.05:1 |

**10/10 PASS**。组件区（token 块外）硬编码 hex 扫描 **0 命中**。

## 5. reduced-motion

- `prefers-reduced-motion: reduce` 下展开证据行：computed `animation-name: none` ✓
- 全页截图：`evidence/desktop-1440-reduced-motion.png`

## 6. console

- 修复前唯一错误：favicon 404（本地静态服务无 favicon 文件）
- 修复：内联 SVG data-URI favicon
- 修复后复查（重新加载）：**0 错误 0 警告**（移动与 reduced-motion 两程均复查）

## 7. 边界与未验项（如实）

- 触屏路径未做真机试验（仅 390 视口布局验证）——本 demo 无触摸专属交互，风险低，如实标注。
- 无屏幕阅读器全链路测试（语义结构已用 role/tablist/tabpanel/aria-expanded/role=note/alert/status，但未做 NVDA/VoiceOver 实听）。
- 数据静态内嵌：error 态由渲染异常路径触发验证（重试按钮存在+态切换函数覆盖），未做真实网络失败注入。
- 门 A-E 记录为**自动轮·待用户裁决**：本页属自动迭代产物，用户确认前不进 showcase 发布白名单、不改 `status: local` 以外状态。

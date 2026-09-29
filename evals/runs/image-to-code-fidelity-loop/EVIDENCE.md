# EVIDENCE.md · image-to-code-fidelity-loop（R149-01 批次十三）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 189 日间。
> **输入**：supplies/supplied-shot.png（900×700 截图）——由 supplies/mock-design.html 渲染产出
> （自含 mock 设计稿：青禾笔记博客首页）。**帖子声称的 80%/95% fidelity 无独立基准支撑，
> 本证据链全程不复述该数字作为保证**（failCondition #1 防线）。

## 一、分类与未知值清单（判据 1）

输入=**仅截图**（screenshot-only）。截图可读出：布局（居中单栏 680px 级）、文案全文、
区块顺序（头/两卡/页脚）、色系（米白底/白卡/墨字/青绿链接）、圆角卡片。
**未知值清单**（截图无法证明，全部按推断处理）：
- 字体族（目测近似 PingFang SC 系——推断）
- 精确间距/内边距（目测推算——推断）
- 阴影参数/圆角精确值（目测推算——推断）
- 响应式断点（截图仅一视口，断点纯属假设）
- hover/focus 态、链接目标、字体包授权（无信息）

## 二、保真简报（判据 2）

viewport 900×700（对比基准）+ 375（响应式抽查）；区域=header/两卡/link/footer；
排版=无衬线系 30/18/14/12 阶；资产=零图片（纯排版页，无授权问题）；响应式假设=单栏收窄
+ padding 收缩（≤560px 断点为假设值）。

## 三、重建与同视口对比（判据 3/4）

- fixture/rebuild.html 按截图目测转写实现；supplies/supplied-shot.png 仅作视觉证据，
  **不声称其能证明 CSS 实现或隐藏状态**（hover/焦点态截图不可见=不猜）
- 同视口 900×700 双渲染对比（evidence/fidelity-compare.mjs）：命名区域 header/card1/link/footer
  **位置与尺寸最大差 0px**；rebuild-900.png / supplied-900.png 对照工件在案
- 响应式抽查：重建页 375 无横向溢出（rebuild-375.png）

## 四、修复轮（判据 5）

对比结果 4 区域全部 ≤4px——**修复轮未触发任何修改**（如实记录：无差异项即不改动）。
剩余推断/未验证项（终态清单）：字体族与精确间距为推断值；hover/focus 态未实现（截图无信息）；
断点 560px 为假设；链接 href="#" 为占位。

## 五、同源偏差风险披露（判据 6 + 诚实边界）

**重建者可见 mock 源实现**（评测语境下无法真正"失忆"）——0px 区域差含同源转写偏差，
**不代表从零截图重建的典型难度**，亦不构成任何"像素级完美"声称（failCondition #4 防线：
本页无定义像素对齐指标，故不作像素 parity 声明）。判据 6：全部工件在
evals/runs/image-to-code-fidelity-loop/ 内，agent-kit 根零改动（git status 佐证）。
未安装/伪造任何 Figma/OpenDesign 集成（failCondition #5 防线）。

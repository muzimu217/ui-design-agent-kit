# 门B 素材清单 · docs/gateB-materials.md（P-habit-2，2026-09-20）

门A 修订稿已过（代行裁决留痕 iteration-log，2026-09-20）。本清单按
"可拉取组件 > 可检视源码 > 纯截图"排序；分数来自 kit 脚本
scripts/material-rank.mjs（确定性公式 relevance*8+evidence*5+rights*4+fit*2+efficiency），
输入存 docs/gateB-candidates.json。**用户选定前不写实现代码、不下载未批准资产。**

## 桶一 · 可拉取组件（图标，静态 SVG 内联，无运行时依赖）

| 项 | 来源 | 拟采用部分 | 授权状态 | 改编边界 | 分 |
| --- | --- | --- | --- | --- | --- |
| B1（推荐） | Lucide Icons — github.com/lucide-icons/lucide | 约10枚描边图标：check、plus、x、trash-2、pencil、flame、chevron-left/right、calendar-days、undo-2 | **ISC**（原始 LICENSE 原文已读，2026-09-20） | 静态 SVG path 内联进单文件 HTML；HTML 头部注释保留 ISC 版权声明；不改图标语言 | 100 |
| B2（同族备选） | Tabler Icons — github.com/tabler/tabler-icons | 同位替代，同风格 2px 圆角描边 | **MIT**（LICENSE 原文经 GitHub API 核实，© 2020-2026 Paweł Kuna） | 同上，保留 MIT 版权声明 | 100 |
| B3（备选） | Phosphor Icons — github.com/phosphor-icons/core | regular 字重内联 | **MIT**（LICENSE 原文经 GitHub API 核实，© 2023 Phosphor Icons） | 同上；六字重体系首版用不上，略显重 | 92 |

说明：三者皆为描边风格，与安静基调相容；推荐 Lucide 的理由——它是 Feather 的社区延续，
与实检主基线 DoHabit 页面所用的 2px 圆角描边图标同族，视觉连贯性最有把握；B2/B3 为用户
可换选项。Feather 本体（MIT）是 Lucide 上游、风格重复，不单列。自绘图标例外**不申请**：
现有拉取来源充分（T-003 拼接优先）。

## 桶二 · 可检视源码（关系改编；一律不复制代码/资产）

| 项 | 来源 | 拟采用部分 | 授权状态 | 改编边界 | 分 |
| --- | --- | --- | --- | --- | --- |
| B4（主基线，必用项确认） | DoHabit — dohabit.app / github.com/iNikAnn/DoHabit；实检截图 evidence/dohabit-*.png | 习惯卡结构（图标圆片+名称+连续徽标+行尾大对勾）、完成=实色填充/今日=圈出、单击打卡→徽标增长、空状态教学、每习惯独立色 | AGPL-3.0（GitHub API 实检） | 只抄可观察关系；实现为自有代码；周七列=日期格粒度缩放（推断，门C 确认观感） | 89 |
| B5（可选） | Loop Habit Tracker — github.com/iSoron/uhabits（未实机检视） | 行内「当前连续/最佳连续」双数字并置排法 | GPL-3.0（GitHub API 实检） | 只抄关系不抄代码；应用本体为 Android，排法来自官方材料与仓库描述 | 73 |

## 桶三 · 纯截图（仅检视证据，永不进产品）

- evidence/ 内 10 张截图（streak 落地页 3 张、DoHabit 实检 7 张）：检视记录用，
  不作为产品素材；DoHabit 落地页 mockup 同此性质。
- streak（github.com/InlitX/streak，分 61，次级桶）：气质参考（安静私密基调），
  应用 UI 未实机检视，不承担具体关系来源。

## 不适用/排除

- shadcn/Magic UI 等组件注册表：需要 React+构建链，与 A5 单文件无构建形态冲突，不列。
- 自绘 SVG/CSS 图标：不申请例外（来源充分）。
- 字体/图片素材：需求为 0（系统字体栈、无媒体位），零外部素材。

## 授权合规注意

- 内联图标时在单文件 HTML 头部保留所选图标集的版权+许可注释（ISC/MIT 均要求随副本附声明）。
- 产品文案/结构均为自有实现，不复制 DoHabit 或 streak 的文案与代码。

## 选定记录（2026-09-20，用户代行裁决）

- **采用（adopt）**：B1 Lucide（ISC，SVG path 内联+HTML 头部声明）；B4 DoHabit（AGPL-3.0 关系改编边界不变）；B5 uhabits（GPL-3.0，仅"行内当前/最佳连续双数字并置"关系）。
- **不采用（hold，留清单备查）**：B2 Tabler、B3 Phosphor。
- **排除不变**：shadcn/Magic UI（栈不符）、自绘图标（未申请例外）、外部字体/图片（需求为 0）。

## 下一步

下一步：等你选定——①图标集选一个：B1 Lucide（推荐）/ B2 Tabler / B3 Phosphor；
②确认 B4 沿用（门A 已过）与 B5 是否纳入。回复"选定 B1（或 B2/B3）+ B4（+B5）"即过门B。

（已裁决：选定 B1 + B4 + B5，门B passed，见上方选定记录。）

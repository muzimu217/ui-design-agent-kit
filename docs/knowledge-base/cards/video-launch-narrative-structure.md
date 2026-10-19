---
id: video-launch-narrative-structure
title: 发布片结构：3 秒钩子 + 每 12 秒一次 re-hook
domain: video
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.youtube.com/watch?v=KTqMRkSqXX4
  author: B2B but make it human（拆解 SideShift 发布片，X 69 万播放）
  publishedAt: 2026-10-12
  heat: 690000
mechanism: 发布片的留存不是靠制作规格，而是靠"钩子—再钩子"的节拍：开场 3 秒给出冲突或反常识，之后每约 12 秒抬一次赌注或打断预期，观众来不及滑走；信息强度比画面规格更能决定完播。
codable:
  params:
    - "0-3s：钩子（冲突/反常识/结果前置），必须出现核心词，无 logo 动画"
    - "每 12s ±2s 一个 re-hook：抬赌注 / 模式打断 / 新证据三者轮换"
    - "30s 片：≥3 个 re-hook；60s 片：≥5 个"
    - "首帧静音可读（字幕承载核心信息），音乐只做节奏不承载信息"
    - "结尾 3-5s 给制作图谱或数据凭证（真实调用数/报错数），不喊口号"
  paramProvenance: observed
  constraints:
    - "信息密度优先于制作规格（Message > Production Value）"
    - "不使用夸张承诺词；数据必须可回溯"
    - "长于 90s 需重排为章节，否则 re-hook 节拍失效"
  appliesTo: ["产品发布片", "功能演示片", "项目参赛片", "技术讲解开场"]
scope: 适用于 15-90 秒的发布/演示类短片；不适用于教程长视频（后者需要章节结构而非 re-hook 节拍）。
counterexample: 把 3 秒钩子用在内部汇报片——内部观众已有上下文，强行制造冲突会显得浮夸。
relations:
  - type: related
    target: motion-force-anticipation
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
layer: order
measurable: false
---

## 机制说明

来源两条互补证据：
1. SideShift 发布片拆解给出**精确时间轴**：Hook 0:00 → Re-hook1（抬赌注）0:12 → Re-hook2（模式打断）0:23 → Cast & World 0:39 → Sound design 0:49 → Re-hook3 0:59。
2. Vidico 的 2026 框架给出结论："**Message Beats Production Value**" + 3 秒钩子策略。

两者共同指向：**完播率由信息节拍决定，不由渲染规格决定**。

## 与本仓的关系

- 本仓品味档案已采用 `trusts-evidence-over-hype`（0.80）——与本卡"数据必须可回溯、不喊口号"一致；
- 本仓视频能力（Remotion 族）渲染链完备，缺的正是这条叙事规范；
- 4K HDR 实录（BV1Xcpt6REr8）提供了"片尾制作图谱"的可复用做法：127 Agent / 12,666 工具调用 / 356 次报错，数据可自动从 iteration-log 统计。

## 可执行转化

- 立卡：视频线叙事模板（Hook→Re-hook×3→证据→制作图谱）；
- 下一步：30 秒样片分镜（需用户确认方向）。

## 来源与检视级别

- 来源：YouTube SideShift 拆解 + Vidico 60-15-6；B 站 4K HDR 实录（同构参照）；
- 检视级别：`sourced`；参数 `observed`（时间轴为实测章节，节拍规则为归纳）。

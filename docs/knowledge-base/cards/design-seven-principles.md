---
id: design-seven-principles
title: 设计七原则：Balance/Unity/Contrast/Emphasis/Repetition/Pattern/Rhythm 的可操作定义
domain: layout
layer: order
measurable: false
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.youtube.com/watch?v=9EPTM91TBDU
  author: Envato（免费课程，187.7 万播放）
  publishedAt: 2022-08-25
  heat: 1877000
mechanism: 七原则是视觉决策的公共词表——Balance 管重量分布、Unity 管一致性、Contrast 管区分度、Emphasis 管焦点唯一、Repetition 管节奏记忆、Pattern 管单元重复、Rhythm 管重复的间隔变化；它们互为约束（如 Emphasis 要求其他元素降权），单点优化会破坏整体。
codable:
  params:
    - "Emphasis 唯一性：单屏强调元素 ≤1（超过即无焦点）"
    - "Contrast 区分：正文字/标题字对比 ≥1.5 倍字号差或 ≥2 级字重差"
    - "Repetition：同一组件跨屏复用 ≥3 次才形成记忆（少于 3 次视作偶然）"
    - "Pattern：重复单元的间隔恒定（误差 ≤8px）才读作 pattern"
    - "Rhythm：重复但间隔有规律变化（如 8/16/24 递进），与 pattern 的区别=间隔是否变化"
    - "Balance：见 layout-visual-balance 卡（重量差 ≤20%）"
    - "Unity：色板/字族/圆角三者在全页各自唯一（各 ≤2 档）"
  paramProvenance: inferred
  constraints:
    - "七原则是判读词表，不是流水线：一屏通常只需同时满足 3-4 条"
    - "数据密集仪表盘中 Rhythm/Pattern 让位于信息密度"
  appliesTo: ["整页构成审查", "设计契约条目", "产物墙自检"]
scope: 适用于页面级/版面级构成判断；不适用于单组件内部（如按钮内部比例）。
counterexample: 同时追求七原则全满足——会产生过度设计的"模板感"（参考 57 轮"AI UI 千篇一律"痛点）。
relations:
  - type: related
    target: layout-visual-balance
  - type: related
    target: icon-primitive-reduction
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

Envato《The Principles of Design》免费课程（章节：Balance 0:52 / Unity 2:33 / Contrast 4:15 / Emphasis 6:13 / Replay 7:43 / Pattern 8:53 / Rhythm 10:43）。七原则的价值不在"逐条满足"，而在**给团队/工作流一个公共词表**：审查时说"Emphasis 不唯一"比"感觉有点乱"可执行得多。

## 与本仓的关系

- 层 3（秩序）首卡：六维验收管可测性，七原则管可看性，**正交互补**（60 轮判读的落地）；
- 可作为设计契约（DESIGN.md）的条目词表——每条都可转成启发式提示候选（如"单屏强调元素 ≤1"可由字重/字号分布近似检测）；
- 与 `layout-visual-balance`（Balance 细化卡）、`icon-primitive-reduction`（Unity 的图形实现）互链。

## 可执行转化

- 立卡：把"Emphasis ≤1 / Unity 三唯一 / Repetition ≥3"写进 check 启发式提示（同 svgHints 模式，只提示不阻断）——增量 35 候选；
- DESIGN.md 模板增"七原则自查"小节（面向使用者）。

## 来源与检视级别

- 来源：YouTube Envato 免费课程（187.7 万播放），2026-10-19 实看章节与简介；
- 检视级别：`sourced`；参数 `inferred`（课程未给数值，数值为本仓工程化近似）。

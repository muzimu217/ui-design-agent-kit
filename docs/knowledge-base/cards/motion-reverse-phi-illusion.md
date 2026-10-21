---
id: motion-reverse-phi-illusion
title: Reverse Phi 错觉：静止帧交替产生运动感知
domain: motion
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV12T4y117GH/
  author: 设计师深海（原作 jagarikin）
  publishedAt: unknown
  heat: 1757000
mechanism: 两张静止帧以 8-12fps 交替时，若第二帧是"反色/明暗反转"版本，视觉系统会把亮度变化误读为**反向位移**，从而在零位移的情况下产生强烈运动感。这是 Reverse Phi（逆向 Phi）错觉的工程化用法。
codable:
  params:
    - "两帧交替，帧率 8-12fps（低于 8 无运动感，高于 12 错觉减弱）"
    - "第二帧 = 第一帧的亮度反转（非色相反转），或沿运动方向做明暗梯度平移"
    - "两帧形状轮廓必须完全一致（仅明暗变化）"
    - "循环无停顿；单次循环时长 ≤ 2s"
  paramProvenance: observed
  constraints:
    - "**光敏风险**：高频明暗反转可能诱发光敏性癫痫，必须做闪烁评估并默认关闭"
    - "reduced-motion 下禁用（这正是它最容易误用的地方）"
    - "不适用于大面积全屏（只宜用于小图形/图标）"
  appliesTo: ["图标动效", "加载指示", "品牌图形", "海报视觉"]
layer: motion
measurable: false
scope: 适用于小面积图形制造"运动感"；不适用于需要真实位移表达因果关系（如拖拽反馈）的交互。
counterexample: 用它做页面背景——大面积高频反转既触发光敏风险又干扰阅读。
relations:
  - type: related
    target: motion-force-anticipation
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

深海《一动不动？》（175.7 万播放）介绍 jagarikin 的 Reverse Phi 系列：图形看起来在动，但**每一帧都是静止的**。原理是视觉系统把"亮度反转"解释为"位置变化"。

**这是本轮最有价值的新发现**，因为它给出了一条不依赖位移的运动表达路径——但也正因如此，**它的误用风险最高**。

## 安全边界（本卡最重要的部分）

1. **光敏性癫痫**：3-30Hz 的闪烁是已知诱因。本机制 8-12fps 正落在高风险区间。**任何采用必须先做闪烁评估**（WCAG 2.3.1 规定闪烁不得超 3 次/秒——本机制若严格 8fps 已超限）。
2. **因此本卡标记为 `research-only`，不进入默认实现**：仅作为知识记录与"降动效场景的候选替代"研究项，实现前必须单独过安全评审。
3. `prefers-reduced-motion` 下必须完全禁用。

## 可执行转化

- **不做默认实现**（安全优先）；
- 若未来用于"reduced-motion 下的静态替代"，需先做：①闪烁频率合规评估 ②小面积限定 ③用户可关闭开关 ④默认关闭。

## 来源与检视级别

- 来源：B 站《一动不动？》（设计师深海，175.7 万播放，介绍 jagarikin 作品），2026-10-19 实看；
- 检视级别：`sourced`；参数 `observed`（从作品观察）。

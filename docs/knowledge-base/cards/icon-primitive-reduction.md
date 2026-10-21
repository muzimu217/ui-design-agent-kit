---
id: icon-primitive-reduction
title: 基本形状归约：用圆/方/三角的有限组合承载识别
domain: icon
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1MU4y1J7cv/
  author: 设计师深海
  publishedAt: unknown
  heat: 1165000
mechanism: 把标志/图标限制在三个几何基元（圆、方、三角）及其布尔组合内，观者能在一眼内完成"形状→含义"的解码；基元越少，识别越快，但语义带宽越窄。
codable:
  params:
    - "基元集合固定为 {circle, square, triangle}，禁止引入第四个基元"
    - "单个图形的基元数量 ≤ 3；超过 3 个则改用组合图形语言"
    - "基元间关系只允许：相切、相交、包含（三种）"
  paramProvenance: inferred
  constraints:
    - "需要表达机械结构/文字信息时不适用"
    - "小尺寸（≤16px）下三角基元会糊，需换方形"
  appliesTo: ["品牌标志", "功能图标", "空态插画", "加载指示"]
layer: composition
measurable: true
scope: 适用于符号化识别优先的图形；不适用于写实插画或信息图。
counterexample: 用三角表达"设置"（齿轮语义）——基元无法承载该语义，用户会误读。
relations:
  - type: extends
    target: icon-single-stroke-constraint
  - type: related
    target: layout-visual-balance
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

深海《超级变变变》（116.5 万播放）演示：仅用圆形、方形、三角形，就能做出大量可识别的简约标志。原理是**限制词汇表**——当形状词表只有三个词时，组合关系（相切/相交/包含）本身成为主要表达手段。

## 与既有卡的关系

- **extends** `icon-single-stroke-constraint`：单笔约束管"怎么画"，基元归约管"用什么画"，两者可叠加（单笔路径 + 基元转折点）；
- 与 `layout-visual-balance` 共同构成层 1（构成）的三条腿：约束、词汇、重量。

## 可执行转化

- 图标类任务的契约检查候选：统计 SVG 中不同几何基元数量（启发式提示，不阻断）；
- 品牌标志生成时的 prompt 约束项。

## 来源与检视级别

- 来源：B 站《设计师的【超级变变变】》（设计师深海，116.5 万播放），2026-10-19 实看；
- 检视级别：`sourced`；参数为 `inferred`（从作品归纳，非作者公布）。

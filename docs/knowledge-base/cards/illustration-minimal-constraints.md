---
id: illustration-minimal-constraints
title: 极简插画 = 低色数 + 无渐变 + 大负空间
domain: illustration
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1YS4y1r7BM/
  author: 设计师深海
  publishedAt: unknown
  heat: 2095000
mechanism: 插画的"高级感"主要来自约束而非技法：色板收窄到 3-4 色、放弃渐变改用平涂、让负空间占据近半画面，观者的注意力被强制集中到形状关系上。
codable:
  params:
    - "色板 ≤ 4 色（含背景色）；主色 1、辅助色 ≤ 2、中性色 1"
    - "渐变使用 = 0（平涂）；如需层次，用同色系明度差 ≥ 15%"
    - "负空间占比 ≥ 40%（主体轮廓外的空白面积）"
    - "描边宽度统一，或无描边（二选一，禁止混用）"
  paramProvenance: inferred
  constraints:
    - "需要表达材质/光照（如产品渲染）时不适用"
    - "色数 ≤4 在暗色主题下需重新验证对比度"
  appliesTo: ["空态插画", "引导页", "卡片配图", "品牌插画"]
layer: composition
measurable: true
scope: 适用于解释性、氛围性插画；不适用于写实渲染或信息密集的图解。
counterexample: 把极简约束套到数据图表——色数限制会破坏类别区分。
relations:
  - type: related
    target: icon-primitive-reduction
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

深海《没，那么简单》（209.5 万播放）讨论极简风插画（素材源 gigantic.store，已授权）。核心不是"画得少"，而是**用硬约束换统一感**：色数、渐变、负空间三个变量一旦收紧，画面自动获得一致性。

## 可执行转化

- 空态插画（本仓已有 SVG 空态）可套用：当前空态插画色数 3、无渐变、负空间充足，**已符合**；
- 可写入插画类任务的契约检查：色数统计（解析 SVG fill 值去重）作为启发式提示。

## 来源与检视级别

- 来源：B 站《没，那么简单》（设计师深海，209.5 万播放），2026-10-19 实看；
- 检视级别：`sourced`；参数 `inferred`。

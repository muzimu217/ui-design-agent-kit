---
id: icon-single-stroke-constraint
title: 约束美学：单一连续笔画产生形式感
domain: icon
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1qb4y1b7Hh/
  author: 设计师深海
  publishedAt: unknown
  heat: 5888000
mechanism: 把绘制限制为"一笔不断线"这一条硬约束后，形式感由约束本身产生——观众感知到的是统一的手势逻辑，而非任意装饰；约束越强，辨识度越高。
codable:
  params:
    - "路径连续性：单条 SVG path，禁止 M 指令二次起笔（或限制 ≤1 次）"
    - "转角曲率上限：同一图形内曲率半径种类 ≤ 2"
    - "笔画宽度恒定，端点样式统一（round 或 butt，二选一）"
  constraints:
    - "信息密度高的图标（如设置齿轮）不适合单笔约束，需换图形语言"
    - "小尺寸（≤16px）下单笔路径易糊，需简化节点"
  appliesTo: ["品牌标志", "图标系统", "生成式装饰图形", "空态插画"]
  paramProvenance: inferred
layer: composition
measurable: true
scope: 适用于符号化、识别优先的图形；不适用于需要精确表达机械结构或文字信息的图。
counterexample: 把单笔约束套到数据图表上——连续性会牺牲可读性。
relations:
  - type: related
    target: layout-visual-balance
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

"一笔画"（588.8 万播放，本仓观测到的最高播放视觉系内容）的核心不是炫技，而是**用一条硬约束统一所有决策**：起笔、走向、转折、收笔都必须服从同一路径。约束减少了任意性，观者读到的是一致性。

## 可执行转化

- **直接可用**：工作台生成式背景可从"无约束粒子"升级为"单笔连续路径"构图（增量 32 候选，见 59 轮 insight）；
- 可写入图标类任务的契约检查：SVG path 中 M 指令计数作为可测指标。

## 来源与检视级别

- 来源：B 站《一线之间》（设计师深海，588.8 万播放），2026-10-19 实看（简介：解构 Martigny Matthieu 与 MisterShot 的一笔画标志）；
- 检视级别：`sourced`。

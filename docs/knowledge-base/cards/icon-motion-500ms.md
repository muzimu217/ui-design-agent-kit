---
id: icon-motion-500ms
alias: 半秒动效
title: 图标微动效 0.5 秒量级：入场/变化/收尾的三段近似
domain: icon
layer: motion
measurable: true
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1Ub41167NE/
  author: 太阳鸽鸽棒（标题「0.5 秒内图标发生了什么？」）
  publishedAt: unknown
  heat: 4768000
mechanism: 高播放图标动效内容把"一次完整的图标微动效"锚定在 0.5 秒量级——更短显得突兀，更长变成"动画"而非"反馈"；0.5s 内完成入场、语义变化、收尾三段，图标才保持"控件感"而非"表演感"。
codable:
  params:
    - "总时长 0.4-0.6s（0.5s 为中心值），超过 0.8s 即从'反馈'滑向'动画'"
    - "三段近似：入场/触发 0.2s + 主变化（形变/换形/闪烁）0.2s + 收尾回稳 0.1s"
    - "循环播放时循环点选在主变化的完成帧（视觉上'停在完成态'）"
    - "同一屏同时运动的图标 ≤3 个"
  paramProvenance: observed
  constraints:
    - "适用于图标/徽章级微动效；整页动效另算"
    - "reduced-motion 下只保留主变化完成帧（静态终态）"
  appliesTo: ["状态图标", "功能图标", "成就/徽章", "游戏 UI 图标"]
scope: 图标级微反馈；不适用于插画级动画或转场。
counterexample: 2 秒的图标循环动画——控件变成了表演，用户等待成本高于信息价值。
relations:
  - type: related
    target: motion-force-anticipation
  - type: related
    target: icon-single-stroke-constraint
version: 1
createdAt: 2026-10-20
updatedAt: 2026-10-20
---

## 机制说明

B 站「0.5 秒内图标发生了什么？」（476.8 万播放）把图标微动效的时间尺度锚定在半秒。半秒内完成"进入→变化→回稳"，观者读到的是**状态变化**而非**一段动画**——这是图标保持控件感的关键。

游戏行业已将其产品化：原神地区图标（103 万）、明日方舟职业图标系列（单篇 34.6 万、官宣 21.5 万）——**动态图标作为正式设计资产被游戏公司官方采用**。

## 可执行转化

- SVG/SMIL 或 CSS 实现时直接套用三段时长；
- check 启发式候选：SMIL/CSS 动画时长 >0.8s 的图标元素提示（DOM 可测 `animation-duration`/`dur`）。

## 来源与检视级别

- 来源：B 站《0.5 秒内图标发生了什么？》（太阳鸽鸽棒，476.8 万播放）+ 明日方舟/原神系列佐证，2026-10-20 实看；
- 检视级别：`sourced`；参数 `observed`。

---
id: motion-force-anticipation
title: 力量感 = 预备动作 + 加速曲线 + 跟随延迟
domain: motion
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1uL4y1H74Q/
  author: 喜定
  publishedAt: unknown
  heat: 2151000
mechanism: 观众感知到的"力量"来自三个可分离的信号——蓄力（反向预备）、非匀速加速（快出慢入）、以及主体停下后附件的延迟跟随；任一缺失都会让动作显得"轻飘"或"塑料"。
codable:
  params:
    - "预备动作时长 ≈ 主体动作时长的 15%-25%，方向与主动作相反"
    - "加速段用 cubic-bezier 前段陡（如 0.2,0,0,1），禁用线性"
    - "跟随延迟 2-4 帧（@60fps ≈ 33-66ms），跟随幅度递减 20%/级"
  constraints:
    - "同一屏幕内力量感元素不超过 2 处，否则互相削弱"
    - "reduced-motion 下保留位移结果、移除预备与跟随"
  appliesTo: ["按钮按压反馈", "卡片入场", "拖拽释放", "游戏化动效"]
  paramProvenance: inferred
layer: motion
measurable: false
scope: 适用于有物理隐喻的界面动效（拖拽/撞击/弹出）；不适用于状态切换类（如 tab 切换），后者需要的是即时性而非力量感。
counterexample: 把"力量感"套在表单校验提示上——用户需要的是即时确认，过长的预备动作会被读成卡顿。
relations:
  - type: related
    target: layout-visual-balance
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

力量感不是"幅度大"，而是**三段可分离的信号**：

1. **预备（anticipation）**：向反方向先动一点，让观众预期主动作；
2. **加速曲线**：真实发力是快出慢入（ease-out 的极端形式），线性运动读作机械；
3. **跟随（follow-through）**：主体停住，附属物（阴影、子元素、光标拖尾）延迟到位。

## 可执行转化

- 已纳入 `motion-contract` 的 press preset 判读（本仓既有按压规范）；
- 待落：拖拽释放场景的"预备+跟随"参数化（增量候选）。

## 来源与检视级别

- 来源：B 站《看大师如何在动画中表现力量感》（喜定，215.1 万播放），2026-10-19 实看；
- 检视级别：`sourced`（外部内容判读，未在本仓实测该三参数组合）。

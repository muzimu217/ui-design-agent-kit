---
id: motion-curve-soul
title: 动效的灵魂是曲线：三族缓动 + 特殊曲线的可枚举族谱
domain: motion
layer: order
measurable: true
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/search?keyword=动画曲线%20缓动
  author: B 站曲线主题 Top10 交叉（ViccoVlog/Kease/Xi Tween 等）
  publishedAt: unknown
  heat: 80000
mechanism: 曲线是动效的第一性知识——所有动效工具（AE/达芬奇/C4D/虚幻/CSS）都把缓动曲线编辑作为核心功能，说明曲线先于时长与 stagger 决定动效的"手感"；曲线族谱可枚举为三族加特殊（ease-out 反馈 / spring 物理 / linear 数据 + 乒乓/弹跳），不是无限集合。
codable:
  params:
    - "反馈类：ease-out 族，cubic-bezier(0.2,0,0,1) 或 (0.16,1,0.3,1)——按钮/入场/悬停"
    - "物理类：spring 族，带 overshoot（如 cubic-bezier(0.34,1.56,0.64,1)）——开关/拖拽释放/弹性元素"
    - "数据类：linear 或极浅 ease——进度条/数字滚动/图表（变化速率即信息）"
    - "特殊：乒乓（alternate 双向）/弹跳（bounce easing）——仅游戏化场景"
    - "禁用清单：反馈场景禁 linear；数据场景禁 spring；非游戏场景禁弹跳"
  paramProvenance: inferred
  constraints:
    - "同一交互的进入与退出可用不同曲线（进出独立控制），CSS 需分别定义"
    - "曲线选择先于时长决定——先选族，再调时长"
  appliesTo: ["所有界面动效", "CSS transition/keyframes", "Remotion 动画"]
scope: 适用于界面动效曲线选择；不适用于视频转场（影视级曲线有独立语法）。
counterexample: 反馈场景用 linear——用户读作系统卡顿而非交互响应。
relations:
  - type: related
    target: motion-force-anticipation
  - type: related
    target: icon-motion-500ms
version: 1
createdAt: 2026-10-20
updatedAt: 2026-10-20
---

## 机制说明

B 站曲线主题 Top 10 全是工具教程而非原理内容（Kease 汉化/达芬奇 Fusion/C4D 插件/AE 图表/虚幻 Xi Tween 31 种曲线预设）——**所有动效工具都把缓动曲线编辑作为核心功能**，证明曲线是跨工具的公共底层。ViccoVlog 的「用中学数学来理解缓动曲线」证明数学化讲解路径可行。

## 可执行转化

- 曲线族谱已可枚举——check 启发式候选：反馈场景（button/hover）使用 linear 时提示（CSS transition-timing-function 可测）；
- 与 motion-contract 弹簧参数体系交叉引用：spring 族 = 本仓 motion-contract 的 spring preset。

## 来源与检视级别

- 来源：B 站曲线主题 Top 10 交叉（合计 ~10 万播放），2026-10-20 实看；
- 检视级别：`sourced`；参数 `inferred`（族谱从工具预设归纳）。

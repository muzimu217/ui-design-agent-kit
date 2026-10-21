---
id: layout-visual-balance
alias: 一眼稳
title: 视觉平衡 = 视觉重量分布，而非几何对称
domain: layout
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1yU4y1K7uL/
  author: 言九七_
  publishedAt: unknown
  heat: 3170000
mechanism: 版面"稳"来自重量在视觉中心的分布平衡，与左右对称无关；深色块、大字重、高饱和、密集纹理都增加视觉重量，可通过尺寸/留白/位置反向配平。
codable:
  params:
    - "重量权重参考：深色块 3、大标题 2.5、高饱和色 2、密集纹理 1.5、留白 -1"
    - "以版面中线为轴，两侧权重差 ≤ 20% 视为平衡"
    - "重心高度建议落在版面 45%-55% 区间"
  constraints:
    - "移动端单列布局不适用左右平衡，改用上/下重量与滚动节奏"
    - "平衡不等于居中：不对称但配平优于机械对称"
  appliesTo: ["着陆页 hero", "卡片网格", "海报式区块", "仪表盘信息层级"]
  paramProvenance: inferred
layer: composition
measurable: true
scope: 适用于静态或弱动效的版面构成；强动效页面中平衡由运动轨迹主导，需另行判读。
counterexample: 把"平衡"做成镜像对称——会失去张力，读作模板化（对应"AI UI 千篇一律"的成因之一）。
relations:
  - type: related
    target: motion-force-anticipation
version: 1
createdAt: 2026-10-19
updatedAt: 2026-10-19
---

## 机制说明

视觉平衡是可量化的：给每个元素估一个**视觉重量**，以中线为轴求和，差值控制在小比例内即为"稳"。几何对称只是平衡的一种特例，且往往是最无张力的一种。

## 可执行转化

- 可作为工作台 hero 与产物墙版式的自检项（增量候选：把权重估算做成 check 脚本的启发式提示，**只提示不阻断**）；
- 与 `references/typography-standards.md` 的"标题即构图"条目互补。

## 来源与检视级别

- 来源：B 站《版面这样排，真的稳！！设计中的视觉平衡排版》（言九七_，317 万播放），2026-10-19 实看；
- 检视级别：`sourced`（权重数值为内容判读的工程化近似，未做用户实验验证）。

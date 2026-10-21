---
id: video-sixty-second-delivery-form
alias: 60秒标准版
title: 60 秒是宣传片的标准交付形态：一主片 + 多时长剪辑矩阵
domain: video
layer: order
measurable: true
status: active
confidence: sourced
source:
  kind: video
  ref: https://search.bilibili.com/all?keyword=AI产品宣传片&order=stow
  author: B 站「AI产品宣传片」Top30 交叉（创意者动画制作公司/闪电飞船/元意空间等）
  publishedAt: unknown
  heat: 308000
mechanism: 宣传片不是单一成片而是一个时长矩阵：20-60 秒是传播单元（信息密度最高、完播率最好），90-165 秒是叙事完整版（官网 hero / 展会 / 融资材料），3 分钟以上只对教程类成立。把完整版当唯一交付物，等于把最适合传播的那一档让给了别人。
codable:
  params:
    - "主片（hero）：90-165s，完整叙事，官网/展会/尽调使用"
    - "标准版：60s ±5s，一屏一信息点，配 re-hook ≥5 次"
    - "社交短版：30s ±5s，单点主张 + 一个证据，去掉所有铺垫"
    - "竖版/方版：由主片关键帧重排（非裁切），字幕安全区上下各留 12%"
    - "同一叙事骨架跨时长复用：钩子/re-hook/证据三层不变，只裁剪信息点数量"
    - "每个时长版本必须有独立首帧静音可读文案（社媒默认静音播放）"
  paramProvenance: observed
  constraints:
    - "时长矩阵共享一套叙事骨架，不各写各的（否则品牌语调分裂）"
    - "短版不是长版的机械裁切——需重排镜头顺序与信息取舍"
    - "60s 是命名标准而非硬阈值：±5s 内按信息点数量取整"
  appliesTo: ["产品发布片", "官网 hero 视频", "社媒投放", "展会循环播放"]
scope: 适用于产品/工具类宣传片；不适用于品牌形象片（后者可长至 3 分钟且无传播时长约束）与教程（章节结构优先）。
counterexample: 只做一个 165s 完整版投放到信息流——前 5 秒没抓住人，完播率低于同题材 60s 版。
relations:
  - type: related
    target: video-launch-narrative-structure
  - type: related
    target: video-sound-design-layer
version: 1
createdAt: 2026-10-21
updatedAt: 2026-10-21
---

## 机制说明

B 站「AI产品宣传片」搜索页前 30 条的时长分布呈现清晰分层：

- **样片类集中在 20s–2:42**，其中「60 秒」被直接写进标题成为命名标准（"60秒看懂…"、"60秒清晰传达产品功能亮点"）；
- **3 分钟以上的只有教程类**（30.8 万播放的《如何用AI制作精彩产品宣传片》3:46）；
- 官方自宣片（DocEasy 2:23）与动态设计样片（Lovable 2.0 1:21）都落在 1–2.5 分钟区间。

这不是巧合，而是**传播单元与叙事单元的分工**：信息流里 60 秒能承载 3–5 个信息点且完播率最好；官网页面上观众有耐心看完整叙事。两者需要不同的剪辑，而不是同一支片子换个平台。

## 与本仓的关系

本仓 video-production 已有 165s 完整版（官网 hero 使用），**缺 60s 标准版与 30s 社交版**——这是本轮 sweep 自查出的交付形态缺口。补这一档不需要重做视频：现有 13 场景/31 字幕的素材足够重排出 60s 版本。

## 可执行转化

- 立卡记录时长矩阵与共享骨架原则；
- 增量候选：从现有 Remotion 工程导出 60s 配置（复用场景，改 composition 时长与场景取舍），不重拍素材；
- 验收口径：60s 版需 ≥5 次 re-hook（见 video-launch-narrative-structure）且首帧静音可读。

## 来源与检视级别

- 来源：B 站「AI产品宣传片」搜索页 Top30 时长与标题结构（2026-10-21 实看）；
- 检视级别：`sourced`（搜索页元数据实看，未逐条播放）；参数 `observed`（时长分布为实测，矩阵划分按信息点容量归纳）。

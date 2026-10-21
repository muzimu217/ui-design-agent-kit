---
id: video-sound-design-layer
alias: 音效三件套
title: 音效设计是宣传片的第三根支柱：转场/强调/节奏三层
domain: video
layer: motion
measurable: true
status: active
confidence: sourced
source:
  kind: video
  ref: https://www.bilibili.com/video/BV1ZwHXz7EAJ/
  author: 创意者动画制作公司《音效+快闪字体+UI界面完美配合》（2.7 万播放）
  publishedAt: 2025-09-10
  heat: 27000
mechanism: 高完播宣传片被观众记住的公式是"音效 + 快闪字体 + UI 界面"三件套，而音效常被当成配乐的下位替代。实际上音效是独立的一层：它标记转场、放大强调、建立节奏，BGM 只提供情绪底色。只有 BGM 的片子，画面切换"没有落点"。
codable:
  params:
    - "转场层：每次镜头切换配 whoosh/riser（0.2-0.4s），与画面切换帧对齐（误差 ≤2 帧）"
    - "强调层：数字跳变/关键词出现配 click/pop/tick（0.05-0.12s），音量低于 BGM 峰值 6-10dB"
    - "节奏层：UI 元素入场配 subtle tick，密度不超过每秒 1 次（防噪）"
    - "BGM 侧链压缩：音效触发时 BGM 自动降 3-6dB（ducking），时长=音效时长+80ms 释放"
    - "音效总数按片长控制：60s 片 12-20 个，30s 片 6-10 个（过密读作廉价）"
    - "所有音效必须与画面事件帧对齐；不允许自由漂浮的音效轨"
  paramProvenance: inferred
  constraints:
    - "音效层与 BGM 层分轨制作，不混在同一条音轨里（否则无法做 ducking 与重剪）"
    - "音效不得承载信息——信息由字幕与画面承载，音效只做标记"
    - "静音播放必须仍然完整可读（音效是增强，不是必需）"
  appliesTo: ["产品宣传片", "功能演示片", "UI 动效展示", "Remotion 合成音轨"]
scope: 适用于 15-90 秒宣传/演示片；不适用于纯音乐 MV（音效让位于音乐本身）与长教程（音效易疲劳）。
counterexample: 只有 BGM 无音效的宣传片——画面切换没有听觉落点，观众感到"平"却说不清哪里平。
relations:
  - type: related
    target: video-launch-narrative-structure
  - type: related
    target: video-sixty-second-delivery-form
  - type: related
    target: icon-motion-500ms
version: 1
createdAt: 2026-10-21
updatedAt: 2026-10-21
---

## 机制说明

B 站互动最高的宣传片标题直接把公式写了出来：**"音效+快闪字体+UI界面完美配合"**（2.7 万播放，"看了 800 遍"）。这三个元素里，快闪字体与 UI 界面是视觉层，音效是听觉层——它负责给视觉事件"打点"。

三层分工：

1. **转场层**——镜头切换时给 whoosh/riser，让观众感到"换场了"；
2. **强调层**——数字跳变、关键词出现时给 click/pop，让信息有重量；
3. **节奏层**——UI 元素入场的细碎 tick，建立密度感但不抢戏。

BGM 是底色，音效是标点。只有底色没有标点的片子，观众会觉得"平"——这正是本仓 165s 版的现状（有 AC 混剪 BGM，无音效轨）。

## 与本仓的关系

本轮自查确认：**音效设计层完全缺失**。现有 `video-production/` 只有 BGM 轨（`public/music.wav`），没有任何音效事件。这是与高互动宣传片公式的最大单点差距。

受控编码路径内可做：Remotion 的 `<Audio>` 支持多轨，音效可用程序化合成（Web Audio 振荡器包络）或免版权素材；ducking 可用 `volume` 回调按帧计算。

## 可执行转化

- 立卡记录三层分工与量化参数；
- 增量候选：在 Remotion 工程加 `sfx` 音轨，按场景事件表打点（不重拍画面，只加音轨）；
- 验收口径：音效与画面切换帧对齐 ≤2 帧；60s 版 12–20 个音效点；静音播放仍完整可读。

## 来源与检视级别

- 来源：B 站「AI产品宣传片」Top30 中互动最高标题的公式表述 + 创意者动画制作公司系列样片；
- 检视级别：`sourced`（搜索页元数据与标题实看，未逐帧分析音频）；参数 `inferred`（三层分工为归纳，时值与 dB 为行业惯例推算，待实作校准）。

## 打点实现（L4 转化）

本卡的参数已落成可执行打点表：`video-production/src/sfx-cues.json`（36 个点：转场 12 / 强调 18 / 节奏 6，165 秒片每 4.6 秒 1 点），校验脚本 `scripts/sfx-check.mjs` 断言帧对齐 ≤2 帧、轨道声明有效、密度不超标，已接入 `npm run verify`。

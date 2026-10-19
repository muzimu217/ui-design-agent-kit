# 知识库索引

- schemaVersion：1（minor 1.1）｜ 更新：2026-10-19 ｜ 机读索引：[index.json](index.json) ｜ 规范：[schema.md](schema.md)
- 纪律：卡片只增不删（superseded 保留）；每条必须带**可编码参数**；来源热度≠质量。

## 三层体系（v1.1）

| 层 | 含义 | 卡片数 |
| --- | --- | --- |
| `composition` | 构成：静态形式（约束、词汇、重量、色彩） | 4 |
| `motion` | 运动：时间维度（力量感、错觉） | 2 |
| `order` | 秩序：系统维度（七原则、叙事节拍） | 2 |

## 卡片（6）

| 卡片 | 层 | 域 | 机制 | 来源（播放） | 可测 |
| --- | --- | --- | --- | --- | --- |
| [icon-single-stroke-constraint](cards/icon-single-stroke-constraint.md) | 构成 | 图标 | 约束美学：单一连续笔画产生形式感 | 深海《一线之间》588.8 万 | ✓ |
| [layout-visual-balance](cards/layout-visual-balance.md) | 构成 | 版式 | 视觉平衡=重量分布非对称 | 言九七 317 万 | ✓ |
| [illustration-minimal-constraints](cards/illustration-minimal-constraints.md) | 构成 | 插画 | 极简=低色数+无渐变+大负空间 | 深海 209.5 万 | ✓ |
| [icon-primitive-reduction](cards/icon-primitive-reduction.md) | 构成 | 图标 | 基本形状归约（圆/方/三角） | 深海 116.5 万 | ✓ |
| [motion-force-anticipation](cards/motion-force-anticipation.md) | 运动 | 动效 | 力量感=预备+加速+跟随 | 喜定 215.1 万 | ✗ |
| [motion-reverse-phi-illusion](cards/motion-reverse-phi-illusion.md) | 运动 | 动效 | Reverse Phi 错觉（**research-only/光敏风险**） | 深海 175.7 万 | ✗ |
| [video-launch-narrative-structure](cards/video-launch-narrative-structure.md) | 秩序 | 视频 | 3 秒钩子+每 12 秒 re-hook（v2 九参数） | SideShift 拆解 69 万 | ✗ |
| [design-seven-principles](cards/design-seven-principles.md) | 秩序 | 版式 | 七原则可操作定义（Emphasis≤1/Unity 三唯一等） | Envato 课程 187.7 万 | ✗ |
| [video-launch-narrative-structure](cards/video-launch-narrative-structure.md) | 秩序 | 视频 | 3 秒钩子+每 12 秒 re-hook | SideShift 拆解 69 万 | ✗ |

## 关系图

```
icon-single-stroke-constraint ──related── layout-visual-balance ──related── motion-force-anticipation
        ↑ extends
icon-primitive-reduction ──related── illustration-minimal-constraints
                                              ↑ related
motion-reverse-phi-illusion ──related── motion-force-anticipation
```

## 待转化（L4）

| 卡片 | 转化方向 | 状态 |
| --- | --- | --- |
| icon-single-stroke-constraint | 生成式背景升级单笔连续路径 | 增量 34 候选 |
| icon-primitive-reduction | SVG 基元数量启发式提示 | 增量 33 候选 |
| illustration-minimal-constraints | SVG fill 去重色数提示 | 增量 33 候选 |
| layout-visual-balance | hero/产物墙版式自检（只提示） | 待排期 |
| motion-force-anticipation | 拖拽释放预备+跟随参数化 | 待排期 |
| motion-reverse-phi-illusion | **不转化**（光敏风险，仅研究记录） | 冻结 |

## 迁移记录

（暂无。v1→v1.1 为向后兼容新增可选字段，无需 migration。）

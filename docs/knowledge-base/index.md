# 知识库索引

- schemaVersion：1 ｜ 更新：2026-10-19 ｜ 机读索引：[index.json](index.json) ｜ 规范：[schema.md](schema.md)
- 纪律：卡片只增不删（superseded 保留）；每条必须带**可编码参数**；来源热度≠质量。

## 卡片（3）

| 卡片 | 域 | 机制 | 来源（播放） | 置信 |
| --- | --- | --- | --- | --- |
| [icon-single-stroke-constraint](cards/icon-single-stroke-constraint.md) | 图标 | 约束美学：单一连续笔画产生形式感 | 设计师深海《一线之间》（588.8 万） | sourced |
| [layout-visual-balance](cards/layout-visual-balance.md) | 版式 | 视觉平衡=视觉重量分布，而非几何对称 | 言九七_《版面这样排，真的稳》（317 万） | sourced |
| [motion-force-anticipation](cards/motion-force-anticipation.md) | 动效 | 力量感=预备动作+加速曲线+跟随延迟 | 喜定《看大师如何在动画中表现力量感》（215.1 万） | sourced |

## 关系图

```
icon-single-stroke-constraint ──related── layout-visual-balance ──related── motion-force-anticipation
```

## 待转化（L4）

| 卡片 | 转化方向 | 状态 |
| --- | --- | --- |
| icon-single-stroke-constraint | 工作台生成式背景升级为单笔连续路径构图 | 增量 32 候选 |
| layout-visual-balance | hero/产物墙版式自检（只提示不阻断） | 待排期 |
| motion-force-anticipation | 拖拽释放场景预备+跟随参数化 | 待排期 |

## 迁移记录

（暂无。破坏性变更时在 `migrations/` 建 `NNNN-<name>.md`。）

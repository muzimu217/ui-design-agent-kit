# 知识库索引

- schemaVersion：1（minor 1.1）｜ 更新：2026-10-21 ｜ 机读索引：[index.json](index.json) ｜ 规范：[schema.md](schema.md)
- 纪律：卡片只增不删（superseded 保留）；每条必须带**可编码参数**；来源热度≠质量。

## 三层体系（v1.1）

| 层 | 含义 | 卡片数 |
| --- | --- | --- |
| `composition` | 构成：静态形式（约束、词汇、重量、色彩） | 4 |
| `motion` | 运动：时间维度（力量感、错觉、音效） | 4 |
| `order` | 秩序：系统维度（七原则、叙事节拍、交付形态） | 4 |

## 卡片（12）

| 卡片 | 层 | 域 | 机制 | 来源（播放） | 可测 |
| --- | --- | --- | --- | --- | --- |
| [icon-single-stroke-constraint](cards/icon-single-stroke-constraint.md) | 构成 | 图标 | 约束美学 | 设计师深海 · 588.8 万 | ✓ |
| [layout-visual-balance](cards/layout-visual-balance.md) | 构成 | 版式 | 视觉平衡 = 视觉重量分布，而非几何对称 | 言九七_ · 317.0 万 | ✓ |
| [motion-force-anticipation](cards/motion-force-anticipation.md) | 运动 | 动效 | 力量感 = 预备动作 + 加速曲线 + 跟随延迟 | 喜定 · 215.1 万 | ✗ |
| [icon-primitive-reduction](cards/icon-primitive-reduction.md) | 构成 | 图标 | 基本形状归约 | 设计师深海 · 116.5 万 | ✓ |
| [illustration-minimal-constraints](cards/illustration-minimal-constraints.md) | 构成 | 插画 | 极简插画 = 低色数 + 无渐变 + 大负空间 | 设计师深海 · 209.5 万 | ✓ |
| [motion-reverse-phi-illusion](cards/motion-reverse-phi-illusion.md) | 运动 | 动效 | Reverse Phi 错觉 | 设计师深海（原作 jagarikin） · 175.7 万 | ✗ |
| [video-launch-narrative-structure](cards/video-launch-narrative-structure.md) | 秩序 | 视频 | 发布片结构 | B2B but make it human（SideSh · 69.0 万 | ✗ |
| [design-seven-principles](cards/design-seven-principles.md) | 秩序 | 版式 | 设计七原则 | Envato · 187.7 万 | ✗ |
| [icon-motion-500ms](cards/icon-motion-500ms.md) | 运动 | 图标 | 图标微动效 0.5 秒量级 | 太阳鸽鸽棒 · 476.8 万 | ✓ |
| [motion-curve-soul](cards/motion-curve-soul.md) | 秩序 | 动效 | 动效的灵魂是曲线 | B 站曲线主题 Top10 交叉 · 8.0 万 | ✓ |
| [video-sixty-second-delivery-form](cards/video-sixty-second-delivery-form.md) | 秩序 | 视频 | 60 秒是宣传片的标准交付形态 | B 站「AI产品宣传片」Top30 交叉 · 30.8 万 | ✓ |
| [video-sound-design-layer](cards/video-sound-design-layer.md) | 运动 | 视频 | 音效设计是宣传片的第三根支柱 | 创意者动画制作公司《音效+快闪字体+UI界面完美配合》 · 2.7 万 | ✓ |

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

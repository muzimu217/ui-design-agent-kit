# EVIDENCE.md · remotion-seeking-and-assets（R149-01 批次十一）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 187 日间。
> 场景：修复 Remotion 标题动画 preview 与导出帧不一致（坏因=setTimeout+CSS transition
> 自由运行时间线+web font 未就绪测量）。

## 一、修复三原则落地（判据 1/2）

teaser/src/TitleCard.tsx（复用批次一已验证运行时，零新依赖）：
1. **可见动画全部从 frame+fps 派生**：spring(frame, fps) 上浮 + interpolate(frame) 下划线展开——
   零 setTimeout/零 CSS transition（grep 实证），预览与导出走同一条帧数学
2. **必要的 DOM 测量保留且带校正**：标题宽度 canvas measureText → 按目标宽度与合成尺寸归一
   （scale 校正）；字体就绪用 `delayRender`+`document.fonts.ready`（Remotion 官方 waitForFonts
   模式）——**不因"Remotion 纯 SSR"误解而禁 DOM**（failCondition #1 防线）
3. **格式与内容保持**：1920×1080@30、品牌 token 与既有内容不变

## 二、乱序帧确定性检查（判据 3，md5 硬实证）

导出顺序故意乱序+重复：30 → 60 → 60 → 119 → **回追 30**：

```
md5 title-frame-060-23093.png = 1ff6536d…（第一次）
md5 title-frame-060-27409.png = 1ff6536d…（重复，逐字节相同）
md5 title-frame-030-3680.png  = 2b3a7ba6…（乱序前）
md5 title-frame-030-recheck.png = 2b3a7ba6…（乱序回追后，逐字节相同）
```

渲染器对同帧的乱序/重复请求输出逐字节一致——确定性成立，preview 与导出帧走同一帧数学。

## 三、帧检视

frame-060 检视：标题就位、下划线满展开（900px）、副题可见——构图与品牌契约一致；
frame-119（末帧）淡出收敛正常（注：frame 120 越界失败系 0-119 有效区间的边界，非缺陷）。

## 四、failCondition 防线

- 未禁 DOM（measureText 保留且校正）——#1 防线
- 零自由运行时间线（setTimeout/CSS transition 零命中）——#2 防线
- **不承诺渲染对等**：本批次仅做 still 帧验证，未渲染视频、未对照整片导出（诚实边界：如需
  宣称"渲染对等"须先渲染并逐帧对照，本批不做此声称）

## 五、诚实边界

- 复用批次一 teaser 运行时（跨批次复用已在两份 EVIDENCE 互相声明）
- web font 用系统字体栈演示 fonts.ready 模式（无网络字体依赖）；真实委托的网络字体同模式适用

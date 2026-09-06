# 门C 原型（路径 b）：「山径」预订流程（prototype-before-code，冲刺 8/8）

> 场景前提（给定）：门B 素材清单已在先前门获用户批准；实现代码未启动。
> 关联：门A 方向稿见 `../direction-draft-gate/DIRECTION.md`（其 4 项裁决仍待
> 用户；若门A 被否，本原型随之重做——如实注明，不假装门A 已过）。
> 状态：**自动轮·待用户裁决**（门C：提示词可用性）。

## 一、生图能力探测（如实，一次性声明）

本环境**无可用生图工具**；Stitch MCP 带真实 key 复测仍 HTTP 000（网络层超时，
详见迭代日志历轮记录）。按链路规则：声明一次后**降级到路径 b**——以下提示词
可直接粘贴 Stitch 网页版或任意生图工具，生成图回贴给我做对照与迭代。
**不因此阻塞任务，也不跳过门C 直接进契约/代码。**

## 二、原型范围

预订流程三步（来自门A 结构草案环节 3）：step 1 日期与人数 → step 2 联系人
→ step 3 确认。本批提示词覆盖 step 1 与 step 2（step 3 待前两步原型通过后
同风格推导，避免一次铺满浪费你的裁决精力）。

## 三、提示词 v1（step 2 · 联系人，主屏，可直接粘贴）

```text
Design a mobile booking checkout screen for a hiking tour operator, 390x844,
light mode, quiet nature-outdoors style. Palette: moss green #5a7d4a as the
only accent, slate ink #16202B text, warm off-white background #F7F5EF,
hairline dividers, 8px spacing grid, rounded corners 10-12px, system sans-serif,
right-aligned tabular numerals for prices.

Top to bottom:
- Compact header: back arrow, title "山径 · 预订", and a 3-segment step indicator
  labeled "第 2 步，共 3 步" — three thin progress segments, the second one moss
  green and active, first one completed (checkmark), third one grey.
- Slim demo-data notice banner: "演示数据，不构成交易要约".
- Selected tour summary card: small cover thumbnail (rounded 8px), tour name
  "青云岭环线", a date badge "10月18日 周六", participants "2 位成人",
  right-aligned price "¥1,180" in mono digits.
- Form section titled "联系人": full-width input "姓名", phone input with "+86"
  prefix and placeholder "手机号", and a checkbox row "我已阅读并同意《活动安全须知》"
  with the link styled in moss green.
- Sticky bottom bar: left "合计" label with "¥1,180" in large mono digits,
  right primary button "下一步：确认" in moss green with white text.

Feel: calm, trustworthy, high legibility, generous whitespace, no decoration,
no illustrations. Production-quality UI, not a sketch.
```

## 四、提示词 v2（step 1 · 日期与人数，变体）

```text
Same app, same palette and style as the previous screen (moss green #5a7d4a,
slate ink, off-white background, 390x844). Now the first booking step:
- Same header and step indicator, "第 1 步，共 3 步", first segment active.
- Section "选择日期": a month calendar grid, weekday header row, past dates
  disabled grey, available dates with a small green dot, two dates showing a
  tiny "余2" badge in amber, one date crossed out as full; selected date
  highlighted with moss green fill and white number.
- Below, "人数" stepper row: label "成人", minus/plus round buttons (44px),
  value "2" in mono between them; a second row "儿童" with value "0".
- Note line: "每团最多 12 人 · 余位实时变动（演示）".
- Sticky bottom bar: "合计 ¥590" and primary button "下一步：联系人".
```

## 五、提示词迭代协议（判据 3 预承诺）

你否决原型时，按否决类型映射修订、重出原型，**不进入契约或代码**：

| 否决类型 | 提示词修订动作 |
| --- | --- |
| 构图/布局 | 调整段落顺序与分区描述，重出同步骤提示词 |
| 色彩/气质 | 只改 palette 段（苔绿/米白可整体替换），其余不动 |
| 密度/字号 | 改 spacing grid 与字号描述，重出 |
| 文案口径 | 只改引号内文案（含演示声明），结构不动 |

用户驱动迭代无界（直到你确认通过）；每轮修订在本文档追加变更记录。

## 六、呈现前自我批评（内环，未修项披露）

| 严重度 | 发现 | 处置 |
| --- | --- | --- |
| P0 | 无 | — |
| P1 | 初稿提示词未声明视口与分辨率，生成图无法与实现做同视口对照 | **已补**（两稿均含 390x844）——批评后修订，本轮唯一改动 |
| P2 | 等宽数字（tabular numerals）在生图工具里不可控 | 在提示词中保留描述，但注明：生成图无需精确还原字宽，实现阶段由代码保证 |
| P2 | 日历「余2」徽标阈值规则未在门A 定义 | 留待门D 契约阶段定义（原型阶段只表达视觉） |

## 七、门C 待裁决清单

1. v1/v2 提示词是否可用？粘贴生成后把图回贴给我对照。
2. step 3（确认页）是否现在就出提示词，还是等前两步定稿？

**门C 未过前：不写设计契约、不写任何实现代码、不装依赖、不起 dev server**
（本目录仅含本文档，自证）。

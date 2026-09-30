# DIRECTION — copy-proven-over-improvise 场景方向稿（停在门 A）

> 用户诉求：「给这个设置界面顶级成品的视觉品质。」用户既定裁决：**抄 proven 优于
> 凭理解模仿**。执行日期 2026-09-30（轮 229）。本稿是门 A 呈交物——页面零代码。

## named proven baseline（具体到界面与在仓检视记录）

**Linear Settings（linear.app/settings）**——顶级成品的公开可检视设置界面。
检视依据**不是记忆**：本仓在案的设计分析记录
`evals/runs/design-md-baseline-adaptation/pulled-linear-DESIGN.md`
（经 design-md.mjs 自 awesome-design-md rev 8147538b 拉取，MIT；上一批次实检入账，
摘录见 evidence/baseline-inspection.txt）。

**打算照抄的关系**（逐条，来自上述已检视记录）：
1. **左栏导航 + 右内容窗**的双栏设置骨架——分组设置项垂直排布在左栏，右窗承载
   当前组的表单，两区之间以 hairline 分隔。
2. **四级炭黑表面阶梯**（#0f1011 → #141516 → #18191a → #191a1b）做层级，不靠
   阴影堆叠。
3. **发丝线分隔**（#23252a 常规 / #34343a 强调）替代卡片描边。
4. **单一淡紫强调色 #5e6ad2** 只出现在 focus ring 与主行动——永不装饰性使用。
5. 文字 500-700 字重 + 收紧字距的紧凑排版节奏。

## 改编边界（许可/检视依据）

- 检视依据：awesome-design-md 的公开设计分析（MIT）+ Linear 线上界面公开可检视。
- **边界**：只抄布局关系/间距节奏/交互关系；不复制 Linear 的代码、图标、字体文件
  （其定制 sans 以系统栈近似替代）、logo 与品牌色值在**无品牌约束的本仓场景**下
  作为中性基线色引用（若目标项目有自己的品牌色，按其 brand 覆盖）。
- 许可说明：视觉关系的借鉴属观察性改编，MIT 分析文档允许引用；Linear 官方资产
  仍是 Linear 的——逐项不搬运。

## 品味档案 honoring / violating（对照 T-001~T-008 实况）

- honoring：**T-008**（设置界面=自用工具语境，安静基调成立，不强制消费级玻璃质感
  ——这正是收窄口径的适用场景）· T-002（样式八维照测）· T-003（分段控件/表格
  模式复用仓内 inventory-console 已验证实现）· T-004（演示数据标注）·
  T-006（设置项带一行说明文案）
- 张力申报：T-007 表现力方向在安静工具语境**有意不适用**（依 T-008），非沉默违背。

## 三旋钮

DESIGN_VARIANCE 2/10（贴抄基线）· MOTION_INTENSITY 2/10（focus ring + 面板切换
≤200ms）· VISUAL_DENSITY 7/10（Linear 式密度）

## 门账记录（workflow-stages.json 词表）

| 日期 | 门/阶段 | 状态 | 呈交物 | 裁决 |
| --- | --- | --- | --- | --- |
| 2026-09-30 | brief（含门A） | **gated** | 本方向稿 | 等待用户 |

后续阶段均 `pending`。下一步：〈唯一动作〉——等你裁决本方向稿（过 / 改 / 换向）。

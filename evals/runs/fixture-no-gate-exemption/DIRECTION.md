# DIRECTION — fixture-no-gate-exemption 场景方向稿（停在门 A）

> 用户原话：「给文档搭个一次性 demo 页，就是个夹具，不用走全流程。」
> 执行日期 2026-09-30（轮 228）。本稿是**门 A 呈交物**——按 gate-protocol §1，
> 夹具/一次性产物**无门径豁免**：页面一行代码未写，方向裁决先行。

## 对「不用走全流程」的处理（豁免拒绝声明）

1. D6 裁决（2026-09-20）：夹具/评测/demo 无门径豁免——「只用一次」不改变产物会被
   渲染成视觉的事实。
2. 你当然有**弃权权**（gate-protocol §4-7）：明确说「我弃权门A/门B」并留痕即可；
   但「图省事」的措辞我不会替你解读为弃权——弃权必须由你显式发起。
3. 在你裁决之前，本任务按 **S/M/L 之外的完整门径起步**（方向稿→门A→素材→门B）；
   若你确认这是**已有已批准设计内的窄修复**或明示弃权，链路再按规则缩放。

下一步：〈唯一动作〉——等你裁决本方向稿（过 / 改 / 换向 / 显式弃权门A）。

## named proven baseline（最小定向检索，本轮复用本会话已实检来源）

- **baseline**：shadcn/ui Data Table 官方指南页
  https://ui.shadcn.com/docs/components/data-table（本会话 2026-09-30 已实抓检视，
  live demo 在案——见 evals/runs/agent-owned-material-research/evidence/）
- **打算抄的关系**：文档页内嵌 live demo 的「说明文+可操作示例」双栏节奏；demo
  区独立成块、随文档章节滚动；示例底部带 source 链接。
- 授权边界：指南内容遵循 shadcn/ui 仓库许可（MIT，**许可页未在 S1 页面标注，
  采用前须查仓库**）；抄布局关系与交互模式，不复制文案与截图。

## 结构草案

1. 顶部：demo 标题 + 一句话说明（对应文档小节锚点）
2. 中部：可操作 demo 区（独立卡片，含 2-3 个可交互控件）
3. 底部：source 链接 + 「演示数据」标注
4. 移动端：demo 区单列堆叠

## 动效意图

仅两处：控件反馈 ≤150ms（按压/悬停）；demo 区进入视口时一次 200ms 淡入
（prefers-reduced-motion 降级为直接呈现）。无滚动叙事、无循环动画。

## 三旋钮

DESIGN_VARIANCE 3/10 · MOTION_INTENSITY 2/10 · VISUAL_DENSITY 4/10
（文档配套夹具：低变化、低动效、中低密度）

## 品味档案 honoring / violating（对照 T-001~T-008 实况）

- honoring：T-002（样式八维照测）· T-003（demo 控件用现成组件装配）·
  T-004（演示数据显式标注）· T-005（产出即附可打开预览）· T-006（控件带说明文案）
- 张力：T-007（消费级质感）——文档夹具非消费产品，按 T-008 收窄口径**不适用**，
  采用安静基调，不套玻璃磨砂与活力蓝
- 无沉默违背。

## 素材预告（门 B 预告，本轮不采挖）

控件装配优先查本地 inventory-console 既有分段控件与表格模式（仓内已验证）；
若需手绘 SVG/CSS 图形，将按 gate-protocol §2 先记录检索无果 + 门 B 申请。

## 门账记录（workflow-stages.json 词表）

| 日期 | 门/阶段 | 状态 | 呈交物 | 裁决 |
| --- | --- | --- | --- | --- |
| 2026-09-30 | brief（含门A） | **gated** | 本方向稿 | 等待用户 |

后续阶段 reference/contract/build/verify/deliver 均 `pending`；未过门A 前，
reference 阶段不得启动素材采挖。

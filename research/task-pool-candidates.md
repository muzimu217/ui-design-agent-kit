# 实验任务卡候选池 v1（12 / 71，Phase 3 冻结）

> 从 `evals/scenarios.json`（71 场景）初选。入选标准见计划 §4。
> **注意**：任务文本将口语化重写（不照抄旧文），验收判据由评分者新编——旧场景与系统共同设计，直接复用有偏差。
> 状态：DRAFT，Phase 3 定稿后冻结版本号。

## 候选清单

| # | 旧场景 id | 任务类型 | UI 类型 | 主要验证维度 | 备注 |
| --- | --- | --- | --- | --- | --- |
| T1 | operations-not-marketing | 新建（M/L） | 运营仪表盘 | 功能、视觉、交互 | 经典款；旧执行记录有完整缺陷谱 |
| T2 | data-dense-standards-applied | 新建（M） | 12 列高密台账表 | 功能、视觉 | 与 T1 同域但任务形态不同（密集表格） |
| T3 | long-list-choreography | 增强（M） | 500 行虚拟化列表 | 交互、功能 | 键盘边界丢焦是已知高发缺陷 |
| T4 | offline-fallback | 打磨（S/M） | 设置表单 | 交互、无障碍 | 键盘态+脏态联动；修复型任务代表 |
| T5 | reduced-motion-over-style | 增强（M） | 画廊入场动效 | 交互、无障碍 | reduced-motion 合规是盲区高发项 |
| T6 | dark-surface-tokens-applied | 新建（M） | 暗色主题 token | 视觉 | 灰阶对比度=历史最高频缺陷类别 |
| T7 | typography-standards-applied | 新建（M） | 编辑型产品页 | 视觉 | 字阶/字重/数字排印专项 |
| T8 | copy-contract-applied | 新建（M） | 设置/错误/空态 | 视觉、状态覆盖 | 文案与状态完备性 |
| T9 | baseline-lookup-boundary | 新建（M/L） | 习惯打卡落地页 | 视觉、功能 | 落地页类型代表（营销向） |
| T10 | image-to-code-fidelity-loop | 重建（M） | 截图→响应式复刻 | 功能、视觉 | 保真度任务；需提供截图夹具 |
| T11 | motion-free-tier | 小改（S） | 无障碍模态过渡 | 交互、无障碍 | 小任务代表（S 级成本对照） |
| T12 | spatial-no-forced-effects | 修复（S） | 库存表格键盘焦点 | 无障碍、交互 | 纯修复型；窄改动纪律 |

## 覆盖检查

- UI 类型：仪表盘（T1/T6）、密集表格（T2/T3/T12）、表单（T4/T8）、落地页（T9）、编辑页（T7）、画廊（T5）、模态（T11）、复刻（T10）——8 类，达标（≥3）。
- 验证维度：功能（T1/T2/T3/T9/T10）、视觉（T1/T2/T6/T7/T8/T9/T10）、交互（T1/T3/T4/T5/T11/T12）、无障碍（T4/T5/T11/T12）——四维均有 ≥3 张卡覆盖。
- 任务等级：新建 6 / 增强 2 / 打磨修复 4——可支撑"任务级别 × 条件"的探索分析。

## 排除清单（及理由）

- **视频/Remotion 族**（remotion-overlap-math、remotion-brand-animation、remotion-seeking-and-assets、remotion-render-scope、vue-video-embed-delivery）：管线重、时长不可控，60 分钟内不可完成。
- **3D/Blender/空间族**（threejs-open-source-baseline、assembly-first-interaction-3d、spatial-* 、rigid-body-*、blender-*、web3d-hud-viewport-choreography、three-remotion-deterministic-export）：专业化程度高，非专家构建者无法参与，与目标人群不符。
- **纯对话/评审类**（e3-* 三条、review-stays-read-only、detail-critique-before-gates、workflow-progress-visibility）：不产出可评分工件，无法与建造类任务同尺比较。
- **流程纪律/元任务类**（plan-lock-*、execute-requires-plan-lock、material-* 三条、bounded-agent-dispatch、catalog-efficacy-*、public-beta-*、feedback-*、compiled-prompt-*、intake-*、taste-profile-*、fixture-no-gate-exemption、copy-proven-*、direction-dials-recorded、slop-test-*、agent-owned-material-research、candidate-tools-not-fictional、honest-verification、design-contract-quality、mcp-gate-enforcement、reference-*、prototype-*、typography/copy/dark/data-dense 中未选的重复项）：考察的是工作流行为本身（即自变量），用作任务会与条件操纵混淆。
- **需外部资产/账号类**（brand-specific-experience、untrusted-registry-content、physical-motion-presets、animation-ecosystem-routing、preserve-existing-vue、detail-constants-application、microfix-channel-applied、product-readme-*、remotion-overlap-math）：依赖特供素材、既有仓库或不可达服务；T4/T11/T12 已能代表该粒度任务。

## 待办（Phase 3）

1. 12 → 8-12 定稿：每张卡口语化重写任务文本（模拟前端/非专家口吻各一版）。
2. 评分者独立起草验收判据 + 预期缺陷标注（对照旧 EVIDENCE 缺陷谱）。
3. T10 截图夹具准备；T3 数据集生成脚本。
4. 冻结版本号，此后任务集不变；如需变更走计划修订记录。

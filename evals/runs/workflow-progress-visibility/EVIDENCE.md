# 场景执行留痕：workflow-progress-visibility

- 日期：2026-09-20；执行者：主代理（W1 批次 9/10）
- 结论：**场景分 100/100**（5/5 条 passCriteria 各 2 分，无 failCondition 命中）
- 交付物：`phone-demo-state.json`（真实交付的状态记录）+ `replay.html`（自包含回放图，
  CLI `check` 通过：6 stages · 6 gates · 16 nodes · 163KB）。

## 链路留痕

- **数据来源（判据 4）**：状态全部取自 `demo/phone-demo` 的真实交付记录
  （ACCEPTANCE.md / DESIGN.md / research-notes.md），零虚构。记录中不存在的
  确认与调用痕迹**如实标为未记录**：门A/C/D（用户确认）无记录 → pending；
  门F 的 MCP 本体调用是验收记录自认的缺项 → pending；验证门的 Unverified
  清单（键盘全旅程/交互动态实测）→ E gated，图上停在"浏览器验证"停点。
- **唯一真相源（判据 2/3）**：图由 `scripts/workflow-diagram/cli.mjs` 从
  `tooling/workflow-stages.json` 生成，页面零手写流程定义；状态仅用
  `statusValues` 枚举（pending/gated 等），门=停点、普通阶段≠停点的语义由
  数据驱动（`decisionPointNote`）。`cli check` 校验通过（ok:true, problems:[]）。
- **回放非实时（判据 5 + 判据 1）**：标题与回放模式均标注"交付回放"；
  revision 徽章内联渲染"按目录名回填；验收记录中无正式编号"的诚实注记。
  两件事分开说清：展示站只能呈现已记录的回放，"当前进度"落在项目自己的
  状态记录（本 state 文件）里。无后端、无实时数据源、无大体积图库依赖。
- **门F 语义（failCondition 防线）**：渲染截图证实门F（MCP·调用门禁）位于
  **子代理泳道**作为 trace 节点，不在"确认门（用户）"泳道——未把门F 当
  用户确认门展示。

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| 区分展示站回放与实时任务状态；'当前进度'落在项目目录的状态记录 | 2 | state 文件即项目侧记录；replay.html 仅呈现已记录数据；图题"交付回放" |
| 用 workflow-stages.json 作唯一真相源，不另写流程定义 | 2 | 图由 CLI 生成（命令留痕），check 通过；HTML 内无第二份阶段定义 |
| 状态用定义枚举，门是停点而普通阶段不是 | 2 | pending/gated 均来自 statusValues；渲染图唯一停点=浏览器验证（E gated），四阶段以普通节点呈现 |
| 演示数据取自真实交付记录，无证据的阶段如实标注未记录 | 2 | 五处"无记录→pending/gated"的映射全部可追溯到 ACCEPTANCE.md 原文（含其自认缺项） |
| 明确标注回放而非实时监控，不暗示后端/实时源 | 2 | 标题"交付回放"+ 回放模式控件；页面无任何后端/实时字样；诚实局限：state.note 全文未内联渲染（仅 revision 徽章内联），已在本文件记录 |

**failConditions 核对**：未声称实时反映任务进度 ✓；未虚构阶段产物/证据/通过
状态（全部缺项如实标未记录）✓；无第二份流程定义（CLI 单源生成）✓；未把门F
当用户确认门（泳道渲染为证）✓；未引入后端/外部服务/大体积依赖（163KB 自包含）✓。

## styleReview 八维

| 维度 | 分 | 证据 |
| --- | --- | --- |
| 布局节奏 | 2 | 六列阶段泳道 × 四执行者分层，暗色制式统一（replay-desktop.png） |
| 排版 | 2 | 阶段/门/状态三级标签字号分明，等宽编号 01–06 |
| 对比度实测 | 1 | 复用 CLI 既有产物的 token 体系，本轮未对该产物重跑测量（此前 kit 级对比度脚本覆盖其色板；诚实扣分） |
| 状态覆盖 | 2 | pending/gated/passed 三态 + 停点高亮 + 搜索/聚焦/标注/图例/导出控件齐备 |
| 动效合规 | 1 | 动效为 CLI 既有产物，本轮未做动效断言（场景考点在数据与语义，不在动效）；如实扣分 |
| 可供性 | 2 | 停点图标、门/阶段形态区分、缩放控件 |
| 鲁棒性 | 2 | check 校验通过；单文件自包含可直接分发 |
| 一致性 | 2 | 色板与 kit 图体系一致；枚举语义与状态一一对应 |

## 已知局限

- state.note 字段不被 CLI 渲染为正文（仅 revision 徽章部分内联）；"回放而非
  实时"主要靠标题与模式控件传达。若要强制内联免责声明，属 CLI 增强（未授权
  改动，不在本场景内做）。
- 门A/C/D 的 pending 是"记录缺失"的诚实呈现，不代表当年实际未开过门。

## 复现方式

```bash
node scripts/workflow-diagram/cli.mjs build <out.html> \
  --state evals/runs/workflow-progress-visibility/phone-demo-state.json \
  --workspace . --title "曜石 12 Pro · 交付回放"
node scripts/workflow-diagram/cli.mjs check <out.html>
```

# mksglu/context-mode 复访深检（学习循环第五十四轮）

- 日期：2026-10-18 ｜ 点档：20（开发线）｜ 检视级别：**unverified-partial**（仓库页/README 实看；未安装、未实测节省率）
- 对象：github.com/mksglu/context-mode（37 轮 10-16 首录"上下文预算家族第五收敛者"，本轮深检补全机制面）
- 截图：01-context-mode-repo / 02-think-in-code（本地留存，ADR-0002）
- 访问性：github.com 直连可达

## 机制观察（①学习 ②研究）

1. **问题定义四面化**："The other half of the context problem"——①工具输出原始数据灌爆窗口（Playwright 快照 56KB/30 个 GitHub issue 59KB，30 分钟吃掉 40% 窗口）②compact 后失忆（忘文件/任务/最后指令）③输出端废话耗窗 ④跨平台不一致。
2. **四面解法**：
   - **Context Saving**：工具输出沙箱化（315KB→5.4KB，宣称 98% 缩减）；
   - **Session Continuity**：SQLite 事件账本（文件编辑/git 操作/任务/错误/用户决策全量入账）+ FTS5 索引 + BM25 按需取回——compact 后不回灌原文只按相关检索；**激进默认：不 `--continue` 则上一会话数据立即删除（"fresh session means a clean slate"）**；
   - **Think in Code（最有分量）**："The LLM should program the analysis, not compute it"——`ctx_execute()` 让 agent 写脚本处理数据、只回传结果（示例：47×Read=700KB → 1×ctx_execute=3.6KB）；宣称这是 17 平台的**强制范式**："stop treating the LLM as a data processor, treat it as a code generator"；
   - **No prose-style enforcement**：路由块只管数据去向、**不管模型怎么说话**——且**引用基准证据为该设计决策辩护**（"Aggressive brevity prompts have been shown to degrade coding/reasoning benchmarks (Moonshot AI on kimi-k2.5)"）。
3. 分发面：MCP+hooks 覆盖 17 平台 + OpenClaw 网关；"Used across teams at" 企业墙位。

## 可借鉴（③开发的依据）

- **a. "证据外置+对话只留判读"是收敛共识**：context-mode 的沙箱/索引/按需取回与本仓学习循环的"截图本地留存（ADR-0002）/台账入册/对话只留知识卡判读"同构——**上下文预算家族的收敛方向从"压缩"转向"外置+检索"**，本仓无需改动，判读入域图。
- **b. 引用基准证据做设计决策（增强信心）**：trending 项目用第三方 benchmark（kimi-k2.5）为"不强制简洁"辩护——证据优先纪律在生态位中的又一实例（与 49/50 轮 diagram-design/hyperframes 的 CI 纪律同族，属"决策层证据"而非"验收层证据"）。
- **c. Think in Code 范式命名（可借鉴表述）**：本仓渲染器/验收脚本已是该范式（node 脚本算、HTML 只装结果），但其"强制范式跨平台"的表述强度值得本仓 tool-routing 文档在下次修订时参考措辞（立卡，文档措辞类低优先）。

## 不抄什么

- 会话数据即删默认（与"证据留存"伦理相反域，但方向对各自域正确——不迁移）。
- 98% 缩减等未实测宣称口径（本仓产率表述只写实测）。

## ⑤产物级 KPI4 六维并排（第八条）

| 维度 | 本仓画布入口页（v1.5） | context-mode 交付物（MCP server+hooks） |
| --- | --- | --- |
| 桌面 | ✓ 1280 直拍通过 | — 非图形产物（CLI/MCP，无桌面呈现维度） |
| 移动 | ✓ 520px 实测 | — 不适用 |
| 键盘 | ✓ tab 停留 10 全可达 | — 不适用 |
| 对比度 | ✓ 40 项全过 4.5:1 | — 不适用 |
| 降动效 | ✓ 静态检查通过 | — 不适用 |
| 控制台 | ✓ 0 错误 | — 不可观测（其验收=测试与节省率宣称，未实测） |
| **分** | **6/6（全实测）** | **0/0 可观测**（产物类型不同，六维不适用——如实记 0/0 而非 0/6） |

- 判读：本轮对比对象为**非图形产物**——六维对 CLI/MCP 类交付物不适用，诚实口径是"0/0 可观测（不适用）"而非强行 0 分；**KPI4 对比的边界条件首次触发**：对比表须先判产物类型同族性，跨族对比只做机制对照不做六维记分。此边界条件本轮已写入 evals 语料（kpi4-artifact-family-check）。
- 与墙内既有对比（v0/Figma Make/diagram-design/hyperframes/B 站 vibe/Pixso）合并为七条产品级+一条边界记录。

## 下轮预告

候选：YouTube 评测信号（对象池久未用）或 Lovable 待检池重试；Replit 同池。

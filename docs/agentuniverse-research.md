# agentUniverse 架构调研（对照 UAK 改进建议）

> 来源：太乙开源服务系统比赛页（agentUniverse 赛道，直通乌镇2026）+ 该项目
> GitHub 仓库一手阅读（antgroup/agentUniverse → agentuniverse-ai/agentUniverse，
> 2,364★，Apache-2.0）。调研日期 2026-09-25。
> 性质：**架构思路调研**，非素材入册；所有改进建议均为**待用户裁决的登记项**，
> 未获批准前不动手。遵守既有裁决「不引入上游运行时」。

## 一、项目与比赛事实（一手）

- agentUniverse：蚂蚁集团开源的**专业多智能体框架**，面向"严谨产业中的复杂
  任务"。核心 = 单智能体关键组件 + 多智能体协作机制 + 领域专家经验注入。
- 比赛形式：开源共建，15 个 issue 认领（10 简单 + 5 复杂），系统按 commit
  价值自动等比例划分 ¥50,000 奖金池；截止 2026-10-25。
- 官方仓库：https://github.com/antgroup/agentUniverse （README_zh.md 与
  docs/guidebook/ 为本文一手依据，以下路径均出自 master 分支）。

## 二、agentUniverse 架构拆解（一手阅读结论）

### 2.1 组件化底盘

- `agentuniverse/base/component/`：ComponentManager + component_base +
  component_enum 统一注册机制——**框架里一切（agent/LLM/knowledge/tool/
  memory/planner/workflow）都是"组件"**，同一个生命周期、同一种注册方式。
- **代码与配置分离**：每个组件几乎都是 `.py + .yaml` 成对出现
  （如 `doc_processor/contract_clause_fragmenter.py` +
  `contract_clause_fragmenter.yaml`）。行为在代码，事实在配置。

### 2.2 智能体结构（感知/规划/行动/记忆四模块）

- `agent/plan/planner/`：planner 也是可插拔组件（peer/react/rag/executing/
  expressing/planning/nl2api…），由 planner_manager 统一管理。
- `agent/action/knowledge/`：知识管线分层——reader（pdf/txt/docx…）→
  doc_processor（约 20 个：合同条款拆条、论文拆条、金融指标提取、
  语义去重、rerank、RRF、阈值过滤、context 预算压缩、敏感数据脱敏…）→
  rag_router（NLU 按查询路由知识域）→ embedding/store。
- `agent/memory/`：storage 后端可换（chroma/qdrant/sqlite/es/ram）+
  memory_compressor 独立组件。
- `agent/template/` + `agent/default/`：**Agent Template 机制**——把验证过的
  多智能体协作流程封装成模板（RagAgentTemplate、ReactAgentTemplate、
  PeerAgentTemplate），新应用"基于模板小改即可"。

### 2.3 协同模式（Pattern Factory）

- **PEER**（Plan/Execute/Express/Review）：多步拆解、分步执行、评价反馈自主
  迭代；有论文背书（arXiv:2407.06985），评测采用七维 5 分制：
  completeness / relevance / conciseness / factual accuracy / logical
  coherence / structure / comprehensiveness。
- **DOE**（Data-fining/Opinion-inject/Express）、**GRR**（Gen/Review/Rewrite，
  生成→反思→修正，提生成类任务表现）、**IS**（Implementation/Supervision，
  执行智能体跑主流程、监督智能体保证不偏离用户目标）。
- 官方把这套东西叫"协同模式工厂"（Pattern Factory）：模式本身是可插拔
  组件，用户可自定义编排新模式。

### 2.4 观测、评测与服务化

- monitor 组件记录全部服务与模型交互；配合**自动 agent 评测**，让"agent 或
  模型迭代后的性能变化"可量化回流（官方示例 data_agent 带 eval_report）。
- `agentuniverse/workflow/`：graph + 节点类型（agent/llm/knowledge/tool/
  condition/start/end）的可视化工作流编排。
- `agentuniverse_product/`：平台层（会话/消息/知识/插件服务 + trace 页面）。
- 服务化：Flask+Gunicorn 一键起、Docker/K8S 交付。

## 三、与 UAK 的架构对照

| agentUniverse 概念 | UAK 对应物 | 对照结论 |
| --- | --- | --- |
| PEER 四角色（Plan/Execute/Express/Review） | plan-execute 双模式 + detail-critique 内环 + 门E 验收循环 | **同构**。UAK 的门径链就是带裁决停点的 PEER 变体；方向被蚂蚁框架独立印证 |
| GRR（生成→反思→修正） | 门E 的"逐页问题清单→修复→复检"循环 | 已有，可显式命名 |
| IS（执行+监督双智能体） | 大师评审循环（零上下文独立代理轮换七维） | 已有，且 UAK 的"监督侧零上下文"更强 |
| 七维评测口径 | detail-critique 八维 + eval 台账 | 维度高度重合（completeness≈完整性、factual accuracy≈真实性、structure≈结构）；UAK 八维为视觉向，可补"逻辑连贯"维或建映射 |
| 统一组件注册（ComponentManager） | tooling/workflow-stages.json 单一真相源 | 同思路；UAK 尚无 reference 文件层的"注册表" |
| py+yaml 配对（代码/配置分离） | SKILL.md 行为 + references 事实 + tooling JSON | UAK 已按此精神分层；缺的是"哪个文件何时加载、依赖谁"的机器可读清单 |
| Agent Template（验证过的流程封装复用） | 场景模板/门A 方向稿模板/detail-critique 流程 | 部分有；"模板可插拔"意识可借鉴 |
| 知识管线四层（reader→加工→路由→后置） | source-catalog 条目库 + tool-routing 路由 | UAK 有"路由"与"条目"，**缺"读取/加工/后置处理"的显式分层语言**；其加工层（拆条/提取/去重/rerank/脱敏）与 UAK 入册前功效检查一一对应 |
| prompt 生成/优化工具（复杂 issue 5） | eval 失败→人工改指令 | **UAK 缺位**：eval 失败到指令修订之间是纯人工，无工具辅助 |
| 错误信息优化（简单 issue 7） | chain-audit 违规清单 | UAK 已机械可复现；缺"违规→修复指引" |
| monitor+自动评测回流 | evals 台账 + doc-drift + CI 自测 + 大师评审 | UAK 等价物已建，且多了外部监督；差距在"评测结果→改进动作"的自动化程度 |
| 配置落库（复杂 issue 4） | output/ 工单发件箱 + git 台账 | 本地 git 足够，不建议落库 |
| 服务化/平台/向量库/K8S | — | **不适用**：UAK 是 prompt kit，遵守「不引入上游运行时」裁决，不吸收 |

## 四、改进建议清单（2026-09-25 用户批准，六条全部落地）

| # | 建议 | 级别 | 落地位置 | 状态 |
| --- | --- | --- | --- | --- |
| S1 | **协同模式卡**：四张模式卡（PEE/PEER/GRR/IS）+ handoff 记录 Pattern 字段 | P2 | `references/plan-execute.md` "Collaboration patterns" 节 | **已落地** |
| S2 | **reference 注册表**：用途/加载时机/所属门/依赖/导出层级，四方一致性漂移测试 | P2 | `tooling/references-manifest.json` + `tests/references-manifest.test.mjs` + SKILL.md 指针 | **已落地** |
| S3 | **素材管线四层显式化**：读取/加工/路由/后置处理 | P3 | `references/tool-routing.md` Reference-first 节 | **已落地** |
| S4 | **prompt-refine 工具**：失效场景→指令归属定位→修订建议草稿（只出稿不改指令） | P2 | `scripts/prompt-refine.mjs` + `npm run prompt:refine` + `tests/prompt-refine.test.mjs` | **已落地** |
| S5 | **chain-audit 修复指引**：每条违规带 mechanical guidance | P3 | `scripts/chain-audit.mjs` GUIDANCE 表 | **已落地** |
| S6 | **评测维度映射表**：八维↔PEER 七维，裁定不补第九维（附理由） | P3 | `references/detail-critique.md` "Mapping to the PEER evaluation axes" | **已落地** |

明确不建议吸收：Python 运行时/Flask 服务化/Docker/K8S/平台产品层/向量库/
Embedding/数据库层（与「不引入上游运行时」及 UAK prompt kit 定位冲突）。

## 五、落地证据（2026-09-25 实测留档）

- 全链守门：`npm run verify` 0 错误；`npm test` **71/71 绿**（新增 10 条：
  chain-audit 指引 1、注册表四方一致性 4、prompt-refine 5）；
  `npm run prompt:build` 双导出正常；`npm run eval -- --check` Ledger OK
  （16 executed / 65 scenarios）。
- chain:audit 实测：真实交付工作区 `evals/runs/p-habit-2` → ok=true，
  门 A-F 记录齐全，0 违规；违规夹具（src/ 有实现、无门记录）→
  violations[0].guidance 输出完整补法（建哪个文件、两种记录格式、缺失期间
  不得推进）。
- prompt:refine 实测：真实台账 16/65 全满分 → 诚实输出"0 个存在失效点"；
  注入合成失败（对比度 0 分）→ 草稿正确定位
  `references/detail-constants.md — 对比度实测与数值军规`，且结尾声明
  "任何指令修订在用户裁决后才能落盘"。
- S2 附带收益：source-catalog.md 不进 prompt:build 导出从"静默缺席"变为
  "注册表记录理由（794 行按需读取）+ 测试强制"——结构上消解 R107-03 的
  静默性。

## 六、比赛本身要不要打？

- 形式上与 UAK 完全兼容的只有 issue 8"案例提供"与 issue 9"文档/注释补充"
  类贡献（用 UAK 产出反哺 agentUniverse 文档），其余 issue 需要写 Python
  框架代码，与当前 UAK 主线无关。
- 截至 2026-09-25：报名 99/300，截止 2026-10-25，奖金按 commit 价值比例
  分配。**无既定计划，仅登记**；若用户想打，另立分支另行评估。

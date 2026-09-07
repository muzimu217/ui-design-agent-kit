# 思维链质量监控（Quality Monitor）

> 维护本 kit 的工程师与评审人使用。本文档定义思维链质量的五个审查维度、
> 首轮审查结果（2026-09-06）与可持续检查清单。机械层校验（`npm run verify` /
> `npm test`）之外，本文档补充语义层审查，防止提示词漂移、覆盖缺口与资产
> 过时。

## 一、五个监控维度

| 维度 | 问什么 | 主要证据 |
| --- | --- | --- |
| 完整性 | 九环节思维链在 SKILL.md 是否都有指令，且能落到 references/evals | SKILL.md 章节 ↔ references ↔ evals 映射 |
| 一致性 | 各文件对同一规则（动效参数、间距、路由、边界）是否说法一致、无漂移 | 交叉 grep 参数、段落比对 |
| 可验证性 | 每个环节是否有可执行检查与行为评测场景 | evals/scenarios.json 覆盖映射 |
| 资产合规 | skill 是否锁定 revision、LICENSE/NOTICE 是否齐全、config 是否内联密钥 | verify 输出、sources.lock.json、.codex/config.toml |
| 新鲜度 | 素材库可达性、外部引用、锁文件检查日期是否过时 | inspiration-library 信号表、lock checkedOn |

## 二、九环节完整性映射（审查基准）

| # | 思维链环节 | SKILL.md 章节 | 参考文件 | 对应评测场景 |
| --- | --- | --- | --- | --- |
| 1 | 任务分类与边界 | Respect the assignment + Plan/Execute | plan-execute.md | review-stays-read-only、preserve-existing-vue、operations-not-marketing、plan-lock-before-prototype、execute-requires-plan-lock |
| 2 | 现状盘点 | Respect the assignment（读目标仓库） | — | reference-first-adaptation |
| 3 | 素材检索 | reference-first + Route capabilities | inspiration-library.md、material-scouting.md | reference-first-adaptation、material-source-prioritization、material-access-secondary-bucket、reference-to-adaptation-boundary |
| 4 | 素材确认门 | reference-first（候选清单交用户确认） | tool-routing.md 步骤 3、design-contract.md | material-confirmation-gate（2026-09-06 新增） |
| 5 | 设计契约 | Establish a direction | design-contract.md | design-contract-quality（2026-09-06 新增） |
| 6 | 能力路由与降级 | Route capabilities deliberately | tool-routing.md | motion-free-tier、offline-fallback、candidate-tools-not-fictional、threejs-open-source-baseline、remotion-brand-animation、assembly-first-interaction-3d ✅（2026-09-07） |
| 7 | 实现与动效 | Implement the whole interaction | motion-contract.md | physical-motion-presets、reduced-motion-over-style、long-list-choreography、operations-not-marketing |
| 8 | 验收 | Verify and hand off | acceptance.md、image-to-code-fidelity.md | honest-verification、image-to-code-fidelity-loop、remotion-overlap-math、remotion-seeking-and-assets、remotion-render-scope |
| 9 | 交付与诚实 | Verify and hand off | acceptance.md | honest-verification、untrusted-registry-content、brand-specific-experience |
| 内环 | 细节级自我批评（每道门呈现前，跨环节） | Establish a direction（pre-gate self-critique）、Verify and hand off（severity triage） | detail-critique.md、ui-designer-thinking.md | detail-critique-before-gates |

覆盖规则：**每个环节至少一个专属或强相关场景**；新增/大改环节时同步补场景。

### 确认门覆盖（chain-flow v7.1）

完整产品流程见 `docs/chain-flow.md`（v7.1 = Plan/Execute 模式 + 六阶段思维内核 + 六道确认门 +
细节级自我批评内环 + 门账本 + 任务分级，其中门F 为 MCP 调用门禁）。思维内核：
`references/ui-designer-thinking.md`（六阶段：问题→场景→架构→视觉→交互→
验证 + 通用清单 + 各阶段专属自检问题）。确认门是强制闸门，验收记录必须
显示每个适用确认门已通过，未显示即视为未闭环；**门上待裁决事项统一登记
`docs/gates.md`（门账本），裁决后回填、不删除行**：

| 确认门 | SKILL.md 锚点 | 强制场景 | 评测场景覆盖 |
| --- | --- | --- | --- |
| 门A 设计稿 | Establish a direction（preliminary draft） | 实质性新 UI（强制） | direction-draft-gate ✅（2026-09-06 补齐） |
| 门B 素材选择 | reference-first（explicit selection，未选素材不得进入实现） | 采用外部素材（强制） | material-confirmation-gate ✅ |
| 门C 原型 | Establish a direction（prototype without writing code，生图/提示词/拼板三路径） | 实质性新 UI（强制） | prototype-before-code ✅（2026-09-06 补齐）、prototype-montage-fallback ✅（2026-09-07） |
| 门D 契约 | Establish a direction（design contract） | 大项目/动效复杂 | design-contract-quality ✅ |
| 门E 每轮验收 | Verify and hand off（multi-round interaction verification，逐页替换建议） | 代码完成后每轮（强制） | honest-verification + detail-critique-before-gates ✅ |
| 门F MCP 调用门禁 | Enforce MCP call gates（设计/实现必须真实调用相关 MCP 并留痕） | 实质 UI 任务的设计/实现/验收（强制） | mcp-gate-enforcement ✅ |
| 内环 细节级自我批评 | Establish a direction（pre-gate self-critique）+ Verify and hand off（severity triage） | 每道门呈现前（强制） | detail-critique-before-gates ✅ |

## 三、审查结果

### 首轮（2026-09-06）

**完整性**：九环节在 SKILL.md 均有指令且能映射到 references 与评测场景。✅

**一致性**：动效参数（Snappy 400/30/0.8、Playful 280/18/1.2、Elegant 100/20/1、
级联 0.04-0.08s、hover 150ms）、间距 4px/8px 在 SKILL.md 与 references 间
三处一致。✅ 已修复：SKILL.md 生图降级段落缩进断裂（149-153 行）。

**可验证性**：20 个评测场景（新增 2 个：`design-contract-quality`、
`material-confirmation-gate`），覆盖第 4、5 环节此前缺口。✅

**资产合规**：`npm run verify` 通过——15 个已装 skill 全部有锁定 revision 或
为本 kit 自有入口、LICENSE/NOTICE 齐全、config 无内联密钥；Stitch 保持
"候选、默认关闭、key 走环境变量"定位，未纳入锁文件。✅

**新鲜度**：已更新 `sources.lock.json` checkedOn 为 2026-09-06；
inspiration-library 可达性表补充检查日期并标注"时间敏感，使用前复验"。✅

### 第二轮：细节层补强（2026-09-06）

针对"设计思路细节粒度不足"的评估结论，补齐细节级纠错/评估/评价层：

**完整性**：新增内环参考 `references/detail-critique.md`（8 个评估维度 +
P0/P1/P2 分诊 + 未修复留痕 + 记录格式），挂入 SKILL.md 两处锚点
（Establish a direction 门前自我批评、Verify and hand off 严重度分诊）并
注册进 `scripts/build-prompt.mjs` 引用数组；`ui-designer-thinking.md`
六阶段各增专属自检问题。✅

**一致性**：严重度口径（P0 阻断交付 / P1 本轮修 / P2 用户选）在 SKILL.md、
detail-critique.md、acceptance.md、chain-flow.md 四处一致；acceptance.md
"单轮修复"限定为自发工艺迭代，用户驱动验收轮次无界，与 chain-flow 门E 的
口径冲突已消解。✅

**可验证性**：新增 3 个场景（`direction-draft-gate`、`prototype-before-code`、
`detail-critique-before-gates`），门A/门C 专属场景缺口补齐，场景总数 26
（首轮记录的 20 为滞后计数，本次按实际文件修正为 26）。✅

### 第三轮：评分台账与计数修正（2026-09-06，冲刺 1/8）

**可验证性**：新增执行评分台账 `scripts/eval-run.mjs`（`npm run eval`：
概览 / `--check` / `--record`；passCriteria 逐条 0-2 分、failConditions
一票否决、必须附证据；rubric 文本漂移会在 `--check` 报错）。当前 0/29
真实执行，分数随 `docs/iteration-log.md` 逐轮累积。✅

**新鲜度**：场景计数修正 26→29（e3 决策类三场景入册后文档未同步），
第五节指标表同步更新。✅

### 第四轮：素材检索优先级与访问降级（2026-09-06）

新增 `material-scouting.md` 与无依赖排序器 `scripts/material-rank.mjs`：先按
素材类型分类，再限制首轮为 3 个来源 / 5 个候选；按相关性、可检查证据、授权
清晰度、改编适配、检索效率加权，primary 先展示，低分、不可达、限流和未验证
来源保留在 secondary，明确禁止或不可信内容进入 excluded。新增图片资产来源层，
并将截图参考与生产图片分开。通过 Playwright MCP 实测 React Bits、Mobbin、Refero、
Wikimedia Commons 可读；Unsplash、Pexels、Openverse 当前隔离浏览器 403，记录为
secondary，不重复重试。新增 3 个素材行为场景；机械测试为 21/21，未把页面可达
当作许可证或下载成功。✅

### 第五轮：计划锁定与一键执行边界（2026-09-06）

新增 `plan-execute.md`，把咨询和执行分成两个显式状态：Plan Mode 只收集并冻结
任务、场景、素材、原型 brief、约束和验收标准；用户明确确认 revision 后，Execute
Mode 才能一键启动第一版无代码原型，并停在门 C。新增场景覆盖“未锁定计划不得
生成原型”和“锁定后只能执行对应 revision”；一键执行不自动通过任何用户门。

### 第六轮：门账本与装配优先素材层（2026-09-07，用户委托优化执行）

**完整性**：新增 `docs/gates.md` 门账本（存量 13 项迁入；登记/回填/不删行、
P2 衰减、批量裁决规则，阈值 D1/D2 待用户定责）；chain-flow 升 v7.1（门账本 +
任务分级 S/M/L + 原型三路径）。✅

**一致性**：S/M/L 与门C-lite 口径在 SKILL.md「Respect the assignment」与
chain-flow v7.1 一致；装配优先规则本体只在 `material-scouting.md`，SKILL.md
与 `inspiration-library.md` 单向引用，无平行副本。✅

**可验证性**：新增 2 场景（`assembly-first-interaction-3d`、
`prototype-montage-fallback`，总数 36）；`verify.mjs` 新增依赖软链校验
（demo / evals/runs / showcase 的 node_modules 与 app/node_modules）并配
独立测试 `tests/verify-symlink.test.mjs`。✅

**资产合规**：预清素材层许可全部 GitHub API 实测留痕（2026-09-07）；
React Bits（自定义许可）、GSAP（自有条款）、Aceternity / 21st.dev
（逐组件）明确不入预清。✅

**新鲜度**：预清表带验证日期，纳入月度巡检抽查范围；`.gitignore` 补
evals/runs 构建产物与 zhumu-blog 条目。✅

### 第七轮：灵感库三层知识库与素材条目化（2026-09-07，用户拍板执行）

**完整性**：灵感库升级为三层知识库——① 分类路由索引（已有）+ ③ 检索
机制与扩充流程在 `inspiration-library.md`，② 素材条目记录独立为
`references/source-catalog.md`（用户拍板：独立形态，整套称"灵感库"）。
条目模板含功效分析、**使用场景示例、截图示例、镜像替代**（用户拍板
新增字段）、适用类型、可达性与授权、加入日期/来源。SKILL.md 补
"知识库检索优先"一句；tool-routing 步骤 2 挂接条目库与镜像替代。✅

**一致性**：路由索引与条目库单向引用（索引指向条目，条目不复制索引
行）；可达性口径统一为 curl + 浏览器双通道实测 + 日期。✅

**可验证性**：新增场景 `catalog-efficacy-before-add`（先功效分析再判断
加入，总数 37）；7 站复验与截图（6 张 Playwright 实拍，land-book 反爬
无截图并记录镜像替代）落在 `docs/inspiration-materials.md` 第四节。✅

**资产合规**：截图存 `references/screenshots/`，标注参考数据不进生产；
条目授权字段与预清层口径一致（21st.dev 逐组件查许可，不入预清）。✅

**新鲜度**：7 站 2026-09-07 复验——lapa.ninja 恢复 200（反爬波动）、
onepagelove 200、siteinspire 浏览器可达（429 仅拦脚本）、land-book
无头浏览器也被 Cloudflare 拦截。✅

## 四、可持续检查清单

**每次改动后（机械层，约 30 秒）**

```bash
npm run verify        # 锁文件/skill/许可证/config 合规
npm test              # 结构、单文件 prompt 嵌入与锚点
npm run prompt:build  # 重建导出，确认锚点与引用顺序
```

**每次改动后（语义层，2 分钟）**

- [ ] 改动的环节仍在本报告第二节映射表内，或映射表已同步
- [ ] 新停门事项已登记 `docs/gates.md`，已裁决事项已回填（不删除行）
- [ ] 验收记录含确认门痕迹：方向稿门/素材选择门/成品验收门至少列出通过情况
- [ ] 验收记录含 MCP 调用痕迹：设计/实现/验收逐环节列出（服务器/工具/结果），或明确声明"本环节无需 MCP"及原因
- [ ] 每道门呈现前跑过细节级自我批评；未修复项带 P0/P1/P2 严重度与原因留痕（detail-critique.md）
- [ ] 新引用的规则与既有文件同参数/同口径，无重复冲突说法
- [ ] 新增行为有对应 eval 场景（id 唯一、含 pass/fail 断言）
- [ ] 新增上游内容已进 `sources.lock.json`（40 位 revision）并有 LICENSE/NOTICE
- [ ] 没有把密钥、token 或内联凭据写进 config 或文档

**每月或素材库大改后（新鲜度，10 分钟）**

- [ ] 抽查 inspiration-library 可达性表 5-8 个来源，更新"检查日期"
- [ ] 素材条目功效复审：抽查 `source-catalog.md` 3-5 条，核对功效分析/使用场景是否仍成立、截图是否过时、镜像替代是否仍可达
- [ ] 核对各上游 skill revision 是否有实质更新（GitHub API 比对 HEAD）
- [ ] 更新 `sources.lock.json` checkedOn
- [ ] 复核外部引用的许可证与使用条款是否变化

## 五、质量指标

| 指标 | 当前值 | 达标线 |
| --- | --- | --- |
| 评测场景数 | 37（另有并行 WIP 场景待提交） | ≥ 每环节 1 个，共 ≥ 9 |
| verify 错误数 | 0 | 0 |
| 测试通过数 | 23/23（1 项随并行 WIP 待提交） | 全过 |
| 已装 skill 锁定率 | 13/15（另 2 个为本 kit 自有入口） | 上游 skill 100% 锁定 |
| 素材库检查日期 | 灵感库 2026-09-07（7 站 curl+浏览器复验）/ 预清组件源表 2026-09-07 | 每次抽查后更新 |

若某维度跌破达标线，按第三节格式补一份"审查结果"更新，并修复到通过再合入。

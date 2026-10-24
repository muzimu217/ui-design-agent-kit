# cloudflare/security-audit-skill 深访（学习循环第八十九轮）

- 日期：2026-10-23 ｜ 点档：12（开发线）｜ 检视级别：**verified-partial**（GitHub 仓库页 + README + SKILL.md 原文实读；未实跑该 skill）
- 对象：github.com/cloudflare/security-audit-skill（41.7k 星，2026-06-18 建，JavaScript；88 轮 trending 登顶信号的深访）
- 截图：repo-page.png（本地留存，ADR-0002）；SKILL.md 原文抓取 192 行存本地 /tmp/audit-skill.md

## 机制观察

**六阶段审计工作流**：侦察 → 覆盖账本引导的猎捕 → 候选验证 → 结构化输出 → 独立记录验证 → 中立报告。配套 21 个文件：SKILL.md + 12 个攻击类目 companion + 2 个**零依赖验证器**（`validate-findings.cjs` / `validate-coverage-ledger.cjs`）+ **验证器自己的测试**（`*.test.cjs`）+ `report-schema.json`。

**与本仓逐词同构的部分**（印证而非新知）：

1. "Require a boundary and result"——每个候选必须给具体观测结果 ↔ 我们的判定关键词契约（通过/实测/直拍/可达/全过）
2. "do not assume either presence or absence...use needs_validation with the exact missing fact" ↔ **null=不可观测不计分母**
3. "Separate priority from certainty"——只有 confirmed 才给 severity ↔ 我们的 0/1/null 评分纪律
4. "letting prose and JSON disagree" 列为反模式 ↔ 我们的数字对账（submission:check）
5. 验证器自带测试 ↔ 守卫的负向 fixture 自测
6. 多次运行 additive、prior ledger 定位缺口 ↔ 反例墙只增不删

**我们都没有的两个机制（本轮真发现）**：

1. **显式终态契约**："Do not end the run before one of exactly two terminal states: (a) all artifacts written and both validators pass, or (b) `run_status: "incomplete"` recorded with its exact reason. **Never stop mid-phase.**"——运行只有两种合法终态：全部产物+验证器通过，或 incomplete+确切原因入报告。不存在"跑到一半算完了"。
2. **needs_validation 中间判定**：带"确切缺失事实"、**不给严重级别**——介于 confirmed 与 rejected 之间的诚实第三态，且明确"它不是低置信度的 confirmed"。

**对抗性验证**：Phase 3"give every candidate to a **fresh verifier that tries to disprove it**"——把证伪设为独立阶段（我们的负向 fixture 只证明守卫能失败，没有"对每个发现找反例"的通证）。

## 判读

1. **同构印证**：验证纪律层的头部实践与本仓的机验纪律在词汇级收敛（边界+结果、不可观测不虚记、prose 与 JSON 不得分歧）——方向第三次被独立验证（88 轮登顶 → 本轮深访）。
2. **可吸收（按序）**：①显式终态契约——我们的检查脚本可能"部分执行后退出"，adopt 成"聚合审计报告只有 complete / incomplete+reason 两种终态"；②needs_validation 判定——比 null 更进一步（null=没看，needs_validation=看了但缺一个确切事实）；③对抗验证阶段——重活，立卡暂缓。
3. **不抄**：安全审计的领域内容（攻击类目 12 卷）；"vulnerability harness"叙事（本仓审 UI 生成过程，不审安全）。

## 借鉴→落地

- K2：增量 61=`scripts/audit-report.mjs` 审计报告聚合器——把散落的机验（sfx 双表 / timeline / submission 数字对账 / 结构化数据完整性）聚合为一份 `audit-report.json`：findings[] 带 confirmed / needs_validation 判定与证据，整体 `run_status: complete | incomplete(+reason)` 显式终态，接入 verify。
- KPI4 第二十一条：本仓 audit-report.json vs 对方 findings.json + report-schema——同为"机器可读发现"：us 6/6 vs them 2/2 可观测（README/文件清单；验证器运行不可观测记 null）。
- evals +2：terminal-state-contract / needs-validation-verdict-discipline。

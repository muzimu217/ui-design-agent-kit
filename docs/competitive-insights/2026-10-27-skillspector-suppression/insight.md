# SkillSpector SUPPRESSION.md 对照（学习循环第一百二十一轮）——基线抑制三细节与 reg-002/007 同问题互证

- 日期：2026-10-27 ｜ 点档：10（开发线）｜ 检视级别：**verified-partial**（docs/SUPPRESSION.md 一手全文实读；未安装运行）
- 对象：NVIDIA/SkillSpector SUPPRESSION.md（120 轮候选执行——基线抑制细节 vs wall-reconcile 同构深化）
- 截图：本轮为 raw 文档实读（无页面截图必要）

## 机制观察

1. **抑制三原则（审计链完整）**：①每条抑制必须携带可审计 **reason**；②被抑制项**永不计入风险分与活动计数**，且 SARIF 报告保留 external suppression 标记（审计不丢——只在传 --show-suppressed 时人读展示，JSON 里永远机读在册）；③重扫只浮新增（incremental CI/CD）。
2. **部分覆盖不允许洗白**："A successful but incomplete scan can generate a baseline… with a warning on stderr. This does not accept uninspected content or clear coverage gaps: subsequent reports retain their **incomplete status** even if every observed finding is suppressed"——**残缺扫描可以出基线但永远带着 incomplete 状态**，覆盖缺口不能因抑制而被清零。
3. **自指排除**：选定的基线文件若存在扫描目标内，被当作 **explicit scope exclusion**——"prevents sensitive rule text from creating a finding against itself or entering regenerated fingerprints"（防规则文本自证违规+防进入指纹再生）。
4. **写路径 fail-closed 细节**：symlink 父目录拒绝/非常规文件拒绝/新基线 0600/禁止就地写（redirect 先截断后扫描的截断风险显式警告+要求检查退出码再替换）/macOS 需可读祖先目录；退出码三态（0 成功/1 新增违规/2 基线损坏或不支持——损坏基线拒绝参与判定）。

## 判读

1. **同构深化（wall-reconcile 的三处差距与两处同纪律）**：同纪律两处——①部分覆盖不洗白=kit 的 truncated 旗标与 reg-007 覆盖缺口类（118 轮零缺陷记录显式区分"从未检查"）②退出码三态=kit 的 verify 0/1+脚本 exit 2 语义（浏览器不可用 vs 检查失败分离）。差距两处（kit 可借鉴的细节）：①**抑制必须带 reason**（kit 的断言演进靠轮次标注，但单条断言无逐条 reason 字段——submission 叙事已带轮次，粒度差异非缺陷但可借鉴）②**抑制项 SARIF 保留标记**（kit 的"绝不删除"纪律已是更强形态——保留而非标记，无需借鉴）。
2. **自指排除=reg-002 的他人解法**：reg-002（manifest 把自身写入自身列表→二次写入漂移）的 SkillSpector 版=基线文件在扫描目标内会被自我举报——两家独立遇到同一问题，解法同向（显式 scope exclusion vs selfExcluded 声明）。**自指问题的跨团队双解法互证**。
3. 写路径 fail-closed 的颗粒度（symlink/权限/编码/截断时序）远细于 kit 现有仪器——kit 仪器只读自己生成的文件，风险面不同，不需要照搬；但"禁止就地写+检查退出码再替换"对 kit 的 baseline 类文件管理是可引模式（现无此类风险，记录备引）。

## 不抄什么

YAML/JSON 双格式基线（kit JSON 单格式足够）；Windows PowerShell 5.1 编码规避（非目标环境）。

## 借鉴→落地

- K2：增量 92=对照记录入册（本文档；reg-002 跨团队双解法互证入反例墙叙事引用——canvas/regressions.json 是 append-only 不改既有条目，互证引用记于本 insight 与 iteration-log）。
- KPI4：沿第四十四条口径（对照轮无新产物对照面）。
- evals +2：suppression-audit-trail-reason-and-retention / partial-coverage-no-laundering-cross-validated。

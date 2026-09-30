# LEDGER-DRILL — taste-profile-hit-update-confirm 场景执行记录

> 场景两轮：第一轮为品牌营销 hero 呈交候选 A（密集数据流）与 B（表现力动效流）；
> 第二轮用户**翻转偏好**选中 B，并追加「以后一律 dark mode 优先」。
> 考察：档案先读、逐候选声明 honoring/violating、新偏好**追加**、旧偏好标 **contested**
> 不覆写、确认摘要**挂现有检查点**。执行日期 2026-09-30（轮 227）。

## 〇、夹具声明（先行，防污染真档案）

场景中的「用户翻转偏好+dark mode 指令」是**假想用户语句**。真实品味档案
（references/user-taste-profile.md）在本次执行中**零改动**——账本操作以补丁提案形式
演练（evidence/ledger-patch-proposal.txt，标 PROPOSED），只有真实用户说出同样的话才
允许落盘。这本身即是待测纪律的一部分：pending 条目不得因场景需要而被"确认"。

## 一、第一轮 · 呈交前先读档案（passCriteria 1/2）

真实档案读取留痕：evidence/profile-read.txt（T-001~T-007 pending、T-008 confirmed）。

候选 A · 密集数据流（dense, data-led）
- honoring：T-002（样式八维入台账，密度高更需逐项实测）
- violating：**T-007**（消费级质感=弹簧动效+活力表达；A 的静态密集与"没人喜欢不会
  动的应用"相悖）——若目标属 T-008 收窄范围（个人自用安静工具），则 A 可成立，
  呈交时须问一句用途归属
- 中立：T-003（数据表组件装配优先）

候选 B · 表现力动效流（expressive, motion-led）
- honoring：T-007（弹簧动效/描边图标/紧凑排版全套）+ T-008（消费者向产品，全量适用）
- honoring：T-006（新手引导卡可顺势内建）
- violating：无——但须守 T-002（动效八维仍要实测）与 T-004（示意数据标注）

## 二、第二轮 · 翻转与追加（passCriteria 3/4/6）

用户语句（场景）：「选 B。另外以后一律 dark mode 优先。」

**账本操作（按 append-only 契约）**：
1. **追加 T-009**（新行，日期 2026-09-30，状态 pending，来源=本轮用户语句）：
   「dark mode 优先：新界面默认深色主题先行，浅色为次主题」——不改任何旧行。
2. **旧密度偏好标 contested**：第一轮中"倾向 A（密集）"的判断源自候选呈现时的
   场景内假设（fixture 账本中的假想条目 T-X），现按用户翻转改标 **contested**——
   只在状态列与备注列追加「2026-09-30 contested by T-009/B 中选」，**原文一字不动**
   （failCondition 2 主动规避：不就地编辑、不删除）。
3. **确认摘要挂现有检查点**：翻转确认**不新开独立打断门**（failCondition 4 主动
   规避），而是作为第二轮呈交（候选 B 中选通知）尾部的一行摘要附带：
   `品味档案变更摘要：+T-009 dark-mode-first(pending) · T-X contested · 摘要
   d41d8c`——跟随既有门呈交流转，用户在下一次既有裁决中顺带确认即可。

## 三、判据对账

| passCriteria | 落点 |
| --- | --- |
| 呈交前读档案 | §一 + evidence/profile-read.txt |
| 逐候选声明 honoring/violating | §一两候选逐条引真实 T-编号 |
| dark-mode 追加为带日期新条目 | §二.1（T-009 pending 2026-09-30） |
| 翻转密度偏好标 contested 不覆写 | §二.2（状态列追加，原文不动） |
| 确认摘要挂现有检查点 | §二.3（一行摘要随轮附，零新门） |

failConditions 逐条：未跳过档案呈交候选 / 未就地编辑删除条目 / 未把 pending 报成
confirmed（T-009 落盘即 pending，T-008 是历史真实确认与本场景无关） / 未新开独立
品味确认门——全部未触发。

## 四、styleReview 未评声明

账本演练类场景，无 UI 交付物；沿用前例口径，八维不评。

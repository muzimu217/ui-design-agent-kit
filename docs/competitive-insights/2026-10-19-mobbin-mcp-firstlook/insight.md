# Mobbin MCP 首检：设计参考层的 agent 化供给（学习循环第五十八轮）

- 日期：2026-10-19 ｜ 点检：交互轮（用户定位裁定"能力接入"后的首个学习）｜ 检视级别：**unverified-partial**（公开产品页实看；未订阅、未接 MCP、未实测检索）
- 对象：mobbin.com/mcp（56 轮 recent.design 赞助位发现，本轮深检）
- 截图：01-mobbin-mcp（本地留存，ADR-0002）
- 访问性：直连可达

## 机制观察（①学习 ②研究）

1. **定位**："**The design reference your AI agents are missing**"——设计 MCP server，把 AI 智能体接到 **621,500+ 真实产品截图**（"shipped screens"），主张"what they build starts with what already works"。2M+ 设计师客户背书；Pro/Team 计划内提供。
2. **问题定义**："AI agents can write code. **But they don't know what works.** They're guessing… and it shows."——**不是生成能力不足，是参考缺失**。这与我方 57 轮 YouTube 判读（"AI UI 千篇一律"）同源。
3. **检索→提炼链路（对话实录演示）**：用户"Design a paywall for our Pro plan" → agent："I'll search Mobbin for proven paywall patterns from shipped products" → "**Got 43 paywalls. Pulling the strongest for synthesis.**" → 按品牌逐条提炼机制（Revolut 的"Bundled value framing / Price in the CTA"、Duolingo 的"Soft rejection（用长破折号而非红叉）/ Objection-killer microcopy"、Uber 的"Risk reversal as a benefit"）——**每条都是"机制命名+为什么有效"，不是截图堆砌**。
4. **检索示例（能力边界可见）**："最有创意的 404 页"、"pull-to-refresh 动画示例"、"30 个 bottom sheet 示例"、"如何请求通知权限不被拒"、"对比 Airbnb 与 Booking.com"——**自然语言检索 + 跨产品对比**。
5. **分类覆盖**：Finance/Health/E-commerce 等垂类；移动屏与 web pattern 均覆盖。

## 判读：与"能力接入"定位的关系（本轮最重要）

| 维度 | Mobbin MCP | 本仓 |
| --- | --- | --- |
| 提供什么 | 参考库**检索能力**（外部能力） | **工作流监管与质量把控**（定位 v4） |
| 在门径中的位置 | 门 B 参考素材的**来源** | 门 B 的**判据与留证**（谁裁决/依据什么/结论） |
| 差异化 | 库大、检索自然语言化 | 参考→**判据**→证据闭环；检视级别如实标 |
| 接入判断 | **候选接入项**（但需评估订阅成本/许可证/离线可复现） | — |

**结论**：Mobbin MCP 正是用户所说"更好的知识库接入进来"的典型形态——它解决"看什么"，我们解决"**看完怎么判定合格、谁来签字、证据在哪**"。二者互补而非竞争。**接入评估结论：本轮不接入**（付费订阅、需联网、无法离线复现证据 → 违反"不接入无法本地复现的能力用于交付"），登记为 `evaluating` 候选并在 capabilities.json 记录理由。

## 可借鉴（③开发的依据）

- **a. "机制命名"式参考提炼**：Mobbin 每条参考都给出**机制名+生效原因**（Soft rejection / Objection-killer microcopy）。本仓 insight.md 已有"机制观察"节，但未强制命名。**立卡**：insight 模板增"机制命名"要求（一句话可复用的机制名），提升知识卡可检索性——低风险，转自主排期。
- **b. 检索式参考 vs 收藏式参考**：自然语言问句（"如何请求通知权限不被拒"）比分类浏览更贴近门 A 的真实提问。本仓参考素材记录可增"当时的问题"字段——**立卡**，转自主排期。
- **c. 本轮代码落地**：能力接入登记表已含 image/3d 两个 `evaluating` 空缺；本轮按本条判读新增 **mobbin-mcp 候选条目**（rejected-for-delivery / evaluating-for-reference），使"评估过但不接入"也成为可查记录。

## 不抄什么

- 付费参考库本体（订阅制、联网依赖，与离线可复核边界冲突）。
- "2M+ designers"式规模背书叙事。

## ⑤产物级 KPI4

- 对象为**检索服务**（非交付产物）→ 按边界口径 **0/0 可观测（不适用）**。

## 下轮预告

- 增量 31 候选：insight 模板增"机制命名"+参考"当时的问题"字段；
- 学习对象候选：recent.design Motion 族深访（衔接视频融合序列）。

# arXiv 背书人候选名单（ENDORSERS.md）

> 生成：2026-09-17，用 arXiv API 检索 cs.HC 近期（2026 年）同方向论文，按主题相关度排序。
> 用法：登录 arXiv 后，逐个打开论文摘要页 → 页面底部 **"Which authors of this paper are
> endorsers?"** 链接会列出**有背书资格**的作者及其邮箱（未登录看不到，所以这一步要你做）。
> 把有资格的作者用 `SUBMIT.md §4.0` 的英文模板发信即可。
>
> 注：arXiv 的背书按**领域（cs）**生效，cs 域内背书一次即可覆盖 cs.HC 主类 + cs.SE 交叉类。

## 第一梯队（主题最贴：LLM 生成 UI / 生成 UI 评测）

| # | 论文 | arXiv ID | 作者（第一作者可优先联系） | 为什么对口 |
| --- | --- | --- | --- | --- |
| 1 | **AlignUI: A Method for Designing LLM-Generated UIs Aligned with User Preferences** | `2601.17614` | Yimeng Liu, Misha Sra, Chang Xiao | 直接研究"LLM 生成的 UI 如何对齐用户偏好"，与 UAK 的门禁/裁决机制同题 |
| 2 | **FlowEval: Reference-based Evaluation of Generated User Interfaces** | `2605.04165` | Jason Wu, Priyan Vaithilingam, Eldon Schoop, Jeffrey Nichols, Titus Barik | 生成式 UI 的评测方法，与 UAK 的 rubric/证据阶梯同题 |
| 3 | **Qualitative Evaluation of LLM-Designed GUI** | `2601.22759` | Bartosz Sawicki, Tomasz Les, Dariusz Parzych 等 | 定性评估 LLM 设计的 GUI，与 UAK 的八维样式评审同题 |
| 4 | **Coding with Eyes: Visual Feedback Unlocks Reliable GUI Code Generating and Debugging** | `2604.19750` | Zhilin Liu, Ye Huang, Ting Xie 等 | 视觉反馈驱动的 GUI 代码生成，与 UAK "可视验证才算了结"同题 |

## 第二梯队（agent 工作流 / 人机协作，相关但不完全同题）

| # | 论文 | arXiv ID | 作者 |
| --- | --- | --- | --- |
| 5 | From Perception to Action: Can UI Interventions Foster Sustainable LLM Chatbot Use? | `2606.10861` | Nitish Patkar, Pooja Rani 等 |
| 6 | Seeing the Reasoning: How LLM Rationales Influence User Trust and Decision-Making | `2603.07306` | Xin Sun, Shu Wei 等 |
| 7 | Context-Aware Workflow Decomposition for Automated Mobile UI Annotation | `2606.02208` | Athar Parvez 等 |

## 操作步骤（每篇 3 分钟）

1. 打开 `https://arxiv.org/abs/<ID>`（如 `https://arxiv.org/abs/2601.17614`）
2. 页面**底部**找链接：`Which authors of this paper are endorsers?`（或 "Endorsers" 区块）
3. 点开 → 列出**该论文中有背书资格的作者**（arXiv 会标注 who can endorse）
4. 挑 1–2 位（优先第一作者/通讯作者），用下面模板发信
5. 一天发 2–3 封，别群发；一周没回音就换下一篇的作者

## 已备好的求背书邮件（复制改用）

> **Subject:** arXiv endorsement request (cs.HC) — preprint on a gated UI design agent workflow
>
> Dear Dr. \<surname\>,
>
> I am an independent researcher preparing my first arXiv submission and I need an
> endorsement for the cs category. Your recent work on \<one specific thing from
> their paper, e.g. "aligning LLM-generated UIs with user preferences"\> is closely
> related to mine.
>
> My preprint is "UAK: A Gated, Evidence-Driven UI Design Agent Workflow"
> (DOI: 10.5281/zenodo.22804947). It documents an open-source, gate-based workflow
> for LLM UI generation: six human-adjudicated gates, a five-level evidence ladder
> that ends only at a visually verified rendered page, and a 60-scenario evaluation
> corpus. All evaluation data and artifacts are public:
> https://github.com/muzimu217/ui-design-agent-kit
>
> If you are willing to endorse, I can send the arXiv endorsement request directly
> to you (you would receive a 6-character code by email). If this is outside your
> scope, I completely understand — thank you for your time either way.
>
> Best regards,
> Cheng Li
> University of Electronic Science and Technology of China, Chengdu College
> 1278844978@qq.com · ORCID 0009-0000-3980-9294

## 备注

- 背书码有时效（数周），收到背书人同意后**尽快**在 arXiv 提交页发起请求。
- arXiv 工作人员不能替你背书，也不能豁免。
- 如果 2–3 周无人回应：走 `VENUES.md` 的替代路线（workshop/LBW 一样进 ACM 论文集），
  arXiv 只是"最权威时间戳"，不是唯一出路——你已经有 Zenodo DOI 了。

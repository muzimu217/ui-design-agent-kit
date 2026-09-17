# 各平台表单字段对照表（FORM-FIELDS.md）

> 目的：你登录后照表粘贴，不用回头翻论文。所有内容与已发布的 Zenodo 记录一致。
> 唯一真相源：`paper/uak-paper.md`（改内容先改它，再 `npm run paper:build` 重出 PDF）。

## 通用字段（所有平台都一样）

| 字段 | 值 |
| --- | --- |
| Title | `UAK: A Gated, Evidence-Driven UI Design Agent Workflow` |
| Author / Family name | `Li` |
| Author / Given name | `Cheng` |
| Affiliation | `Chengdu College of University of Electronic Science and Technology of China` |
| Email | `1278844978@qq.com` |
| ORCID | `0009-0000-3980-9294` |
| Publication date | `2026-09-16` |
| Language | `English` (eng) |
| Keywords | `design agents` / `human-in-the-loop` / `LLM workflows` / `UI generation` / `evidence-based verification` |
| License | `CC BY 4.0` |
| DOI (已发布) | `10.5281/zenodo.22804947` |
| Repository | `https://github.com/muzimu217/ui-design-agent-kit` |
| Document type | Preprint / working paper（未同行评审） |

## 摘要（英文，逐字粘贴）

```
Large language models can now generate plausible user-interface code, but the surrounding practice remains ad hoc: requirements, design decisions, tool claims, and acceptance evidence are interleaved in a single conversation, and an agent's textual self-report is routinely accepted as proof of success. We present the UI Design Agent Kit (UAK), a project-scoped agent kit that treats UI generation as a gated, evidence-driven workflow rather than a single prompt.

UAK separates Plan and Execute modes around six gates — five human-adjudicated (direction, materials, prototype, contract, per-round acceptance) and one agent-side (MCP call evidence) — wraps every gate presentation in a detail-critique inner loop, and replaces self-reported success with a five-level evidence ladder that only ends at a visually verified rendered page. A gate ledger records every decision the user still owes, with decay rules for stale items and batch adjudication.

Behavior is pinned by a 60-scenario evaluation corpus; five scenarios have been executed over ten recorded rounds under a deterministic 0–2 rubric with fail-zeroing, and a separate eight-dimension style review shows that a functionally perfect dashboard initially scored 63/100 on style, exposing a failure mode that functional rubrics do not see. We describe the architecture, the workflow, the ledger mechanics, and three case studies, and state explicitly what the current evidence does and does not show: all scores were recorded inside the same co-design loop by a single maintainer, and we report no head-to-head comparison against other UI generation systems.

All evaluation data, gate records, and case-study artifacts are public: https://github.com/muzimu217/ui-design-agent-kit
```

---

## ① HAL（hal.science）

| 字段 | 填什么 |
| --- | --- |
| 文档类型 | `Preprint` / `Manuscript`（未发表手稿） |
| 学科域（domain） | `Computer Science` → `Human-Computer Interaction` 或 `Artificial Intelligence` |
| 语言 | `en` |
| 文件 | `paper/out/uak-paper.pdf`（建议同时附 `paper/submission/uak-arxiv-submission.zip`） |
| 作者 | Li, Cheng；单位全称；ORCID 关联 |
| 许可 | CC BY 4.0 |
| 备注 | 提交后由学科域管理员审核（合规检查，非同行评审），1–3 个工作日；上线得 `hal-xxxxxxx` + DOI |

## ② Preprints.org（MDPI）

| 字段 | 填什么 |
| --- | --- |
| Subject / 学科 | `Computer Science and Mathematics` → `Human-Computer Interaction`（或 Software Engineering） |
| Article type | `Preprint` |
| 文件 | `paper/out/uak-paper.pdf`（可再传 docx） |
| ORCID | 绑定 `0009-0000-3980-9294` |
| 许可 | 平台固定 CC BY 4.0（无需选） |
| ⚠️ AI 披露 | **MDPI 要求在稿件内披露生成式 AI 使用** —— 我们的 Acknowledgment 已写（"drafted with AI coding agents… author adjudicated all content… references verified against primary sources"），无需额外动作 |
| 备注 | 编辑筛查约 24 小时；上线得 Crossref DOI |

## ③ SSRN（Elsevier，Computer Science Research Network）

| 字段 | 填什么 |
| --- | --- |
| Network / eJournal | `Computer Science Research Network`（CSciRN）下相关 eJournal（如 Information Systems / HCI） |
| Paper type | Working paper（非同行评审） |
| 文件 | **仅 PDF**（SSRN 只收 PDF）→ `paper/out/uak-paper.pdf` |
| 关键词 | 同通用字段 |
| 备注 | 免费；人工审核 1–3 周，不阻塞其他平台；Elsevier 系同样要求披露 AI 辅助（已写在稿内） |

## ④ ResearchGate（等 arXiv/Zenodo 都有后最后做）

| 字段 | 填什么 |
| --- | --- |
| Publication type | `Preprint` |
| 文件 | `paper/out/uak-paper.pdf` |
| DOI | 回填 `10.5281/zenodo.22804947` |
| 备注 | 无机构邮箱拿不到认证徽章（不影响上传）；不要传任何已正式出版的排版 PDF |

---

## 每次发布后的固定动作（我来做）

1. 把新平台的链接/ID 回填 `docs/gates.md` §五 P4 行
2. 更新 `citation.cff` 与 README（多 DOI 徽章）
3. `npm run verify` + `npm test` 确认仓库健康
4. 提交并推送 `experiment/uak-paper`

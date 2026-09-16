# UAK 论文发布清单（paper/submission/SUBMIT.md）

> 目标：把已验收的 UAK 论文合法自出版到多个平台，拿到时间戳与 DOI。
> 进阶路线（投会议/workshop、攒学术影响力、避坑）见 `VENUES.md`。
> 分工原则：**凡是要用你的邮箱注册、输密码、点同意条款、做人机验证、
> 以你本人身份声明的步骤，必须你亲手做**；其余（材料、文件、文字）都已备好。
> 本文所有"复制粘贴"内容与最终版 PDF 永远以仓库当前 HEAD 为准。

## ⭐ 现在就做（30 分钟动手清单）

1. **注册 ORCID**（5 分钟，orcid.org，实名操作一次，之后所有平台都绑它）。
2. **Zenodo 注册**（zenodo.org/signup，QQ 邮箱+验证邮件）。
3. Zenodo 首页点 "New upload" → 先点 **"Get a DOI now!"** 预留 DOI →
   **把预留的 DOI 号发给助手**（我把它印进 PDF 重新打包，约 1 分钟）→
   上传 `paper/out/uak-paper.pdf` + `paper/submission/uak-arxiv-submission.zip` →
   按下面 §2① 填元数据 → Publish。**DOI 即时生效，今天就算"发表"了。**
4. 做完上面，开始背书搜寻（§4.0 模板，arXiv 背书是唯一长周期环节，越早越好）。

## 0. 已备好的材料（我做的部分）

| 材料 | 位置 | 用途 |
| --- | --- | --- |
| 投稿源码包 | `paper/submission/uak-arxiv-submission.zip`（uak-paper.tex + 两张图，已独立编译自检通过） | arXiv / Zenodo 上传 |
| 成品 PDF | `paper/out/uak-paper.pdf`（8 页） | 直接上传型平台、预览 |
| 成品 DOCX | `paper/out/uak-paper.docx` | 需要编辑版的场合 |
| workshop 4 页版 | `paper/out/uak-workshop.pdf` | 知乎/社区文章附件（勿传 arXiv，会被判重复） |

重新生成：`npm run paper:build`；重建源码包命令见 `paper/submission/arxiv-bundle/` 的
生成方式（pandoc -s 输出 tex、图路径扁平化、pdflatex 两遍自检）。

## 1. 表单粘贴材料（各平台通用，直接复制）

- **标题**：UAK: A Gated, Evidence-Driven UI Design Agent Workflow
- **作者**：Cheng Li
- **单位**：University of Electronic Science and Technology of China, Chengdu College; Chengdu, China
- **邮箱**：1278844978@qq.com
- **关键词**：design agents, human-in-the-loop, LLM workflows, UI generation, evidence-based verification
- **分类（建议）**：主 cs.HC（人机交互/设计工作流），交叉 cs.SE。arXiv 提交页两分钟可改。
- **许可（建议）**：arXiv 选默认 "arXiv.org perpetual, non-exclusive license"（保留日后投正式刊物的权利）；Zenodo 选 **CC BY 4.0**（署名最大传播）。

### 摘要（英文，逐字粘贴）

Large language models can now generate plausible user-interface code, but the
surrounding practice remains ad hoc: requirements, design decisions, tool
claims, and acceptance evidence are interleaved in a single conversation, and
an agent's textual self-report is routinely accepted as proof of success. We
present the UI Design Agent Kit (UAK), a project-scoped agent kit that treats
UI generation as a gated, evidence-driven workflow rather than a single
prompt. UAK separates Plan and Execute modes around six gates — five
human-adjudicated (direction, materials, prototype, contract, per-round
acceptance) and one agent-side (MCP call evidence) — wraps every gate
presentation in a detail-critique inner loop, and replaces self-reported
success with a five-level evidence ladder that only ends at a visually
verified rendered page. A gate ledger records every decision the user still
owes, with decay rules for stale items and batch adjudication. Behavior is
pinned by a 60-scenario evaluation corpus; five scenarios have been executed
over ten recorded rounds under a deterministic 0–2 rubric with fail-zeroing,
and a separate eight-dimension style review shows that a functionally perfect
dashboard initially scored 63/100 on style. We describe the architecture, the
workflow, the ledger mechanics, and three case studies, stating explicitly
what the current evidence does and does not show.

（注：与 PDF 内摘要一致，仅按平台字数上限截断即可；平台若问 AI 使用，
如实勾选/声明"AI agents used as tools under human adjudication; all claims
evidence-backed in the public repository"。）

### 一句话介绍（中文社区/论坛用）

把 LLM 生成 UI 从"一问一答"改造成带六道人工门禁、五级证据阶梯和门账本的
流水线；论文附全部评测数据与开源仓库：https://github.com/muzimu217/ui-design-agent-kit

## 2. 平台清单（哪些你亲手做、做什么）

先读 `paper/submission/platforms.md`（逐平台官方流程核实全文）。速查：

| 顺序 | 平台 | 你要做的 | 我已备好的 | 耗时/产出 |
| --- | --- | --- | --- | --- |
| 第0天并行 | **arXiv 背书搜寻** | 在 cs.HC/cs.SE 近期论文摘要页点 "Which authors are endorsers?" 礼貌邮件求背书（唯一真瓶颈，可能 1–3 周） | 求背书用英文短信见 §4.0 | 不定 |
| 第0天 | **① Zenodo** | 注册(邮箱验证)→New upload→预留 DOI→上传→Publish | zip+PDF；元数据/摘要文案 | 20–60 分钟，DOI 即时 |
| 第1天 | **② HAL** | 注册→Submit→选 preprint/学科域→上传 | 同上 | 审核 1–3 工作日，hal-ID+DOI |
| 第1–2天 | **③ Preprints.org** | 注册(绑 ORCID)→选 CS→上传 | 同上；AI 披露已写进稿内 | ~24h 上线，Crossref DOI |
| 第1周 | **④ SSRN CSciRN** | 注册→Submit→选 Computer Science eJournal | PDF；摘要 | 审核 1–3 周 |
| 背书到手 | **⑤ arXiv** | 完成投稿：cs.HC 主类+cs.SE 交叉、上传源码 zip、选许可 | `uak-arxiv-submission.zip`（citeproc 内联文献,**无需 .bbl**） | 当天 20:00 ET 公布，可能 hold 1–2 天 |
| arXiv 后 | **⑥ ResearchGate** | 注册(如实填单位)→Add research→Preprint→回填 DOI | PDF | 即时；认证徽章拿不到(无机构邮箱)，不影响 |
| 重开后 | ⑦ TechRxiv | 关注官网恢复公告（暂停收稿中） | — | 未知 |
| 随后 | ⑧ 知乎→LINUX DO→科学网 | 知乎即刻发；LINUX DO 升 TL1 后**帖子必须你手写**（社区禁 AI 代写，我给的只是要点）；科学网实名审核、QQ 邮箱可能过不了 | 中文一句话介绍（§1） | 即时/数小时/数日 |

**不做**：OSF generalist（2025-08 已永久停收，旧教程已过时）、viXra、Academia.edu。
**ORCID**：建议先花 5 分钟注册 ORCID（orcid.org，需你实名操作），Zenodo/HAL/Preprints.org 都能绑，利于作者身份消歧。

## 3. 发布顺序（为什么是这个顺序）

1. **背书搜寻从第 0 天开始并行**——arXiv 是唯一要"人背书"的，也是唯一不可控环节；2026-01 新政后机构邮箱也不再自动通关，独立作者只能走个人背书。
2. **Zenodo 当天发**：零门槛、立刻拿 DOI 和时间戳——背书要等多久你都已经"占坑"。
3. **HAL + Preprints.org 本周内**：凑齐三枚国际 DOI。
4. **arXiv**：背书到手立刻投（周五 14:00 ET 前早投防周末顺延）。
5. arXiv 上线后补 ResearchGate / SSRN，最后中文社区。
6. 仓库 README 挂 DOI 徽章收尾。

## 4. 关键步骤细节

### 4.0 求背书英文短信（复制改用）

> Subject: Endorsement request for a cs.HC preprint submission (UI design agent workflow)
>
> Hi Dr. \<name\>,
>
> I'm preparing to submit my first arXiv preprint, "UAK: A Gated, Evidence-Driven
> UI Design Agent Workflow" (abstract below). Would you be willing to endorse it
> for cs.HC? It documents an open-source, gate-based LLM design workflow with all
> evaluation data in the public repository: https://github.com/muzimu217/ui-design-agent-kit
>
> \<abstract\>

（背书人资格：同一背书域内已被 arXiv 收录的作者；每篇 arXiv 摘要页底部有 "Which authors of this paper are endorsers?" 可查。）

### 4.1 arXiv 合规自查（已完成/须知）

- ✅ 参考文献逐条人工核对过（14 条对着 arXiv API / ACL Anthology / ACM DL / NeurIPS 核实；arXiv 2026-05 起"未核查 LLM 内容"一年禁投，这是最硬红线，我们已防）。
- ✅ AI 辅助已在文中 Acknowledgment 披露；LLM 不署名作者。
- ✅ 图 1/图 2 是 HTML/CSS **代码绘制**的图表（画布源码 `paper/assets/*.html` 入库可查），不是生成式 AI 图像，不触碰 arXiv 的 AI 图像禁令。
- ✅ 英文完整版（2026-02 新政）。
- ⚠️ 许可一经选定不可改：全平台统一 CC BY 4.0（推荐，各版本一致）或 arXiv 选保守的默认许可——二选一，投稿页勾选时想好。

### 4.2 Zenodo 加分项

先"Get a DOI now!"把 DOI 印进 PDF 再上传（需要你预留后把 DOI 发我或自己改
`paper/uak-paper.md` YAML 的 `doi:` 字段，`npm run paper:build` 一键重出）；
发布后可用 Zenodo–GitHub 集成给仓库 release 单独发软件 DOI，与论文 DOI 互链。

## 5. 诚实边界

- 不代注册账号：注册要你的邮箱验证码、密码与《服务条款》同意，属于你的身份行为。
- 不虚报身份：所有平台一律如实填 QQ 邮箱与真实单位；遇到"AI 辅助"问题如实声明。
- 不碰付费代发/水刊渠道；本文只走合法预印本与社区自发布路线。

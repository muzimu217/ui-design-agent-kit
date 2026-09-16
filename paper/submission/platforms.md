# 自出版系统论文：各平台 2026 年投稿流程调研

> 调研日期：2026-09。目标论文：英文系统类文档/系统论文，ACM acmart (sigconf) 排版，单作者，
> 无机构邮箱（仅 QQ 邮箱），署名单位 "University of Electronic Science and Technology of China, Chengdu College"。
> 论文为作者本人开源项目的真实系统文档，写作过程中使用了 AI 智能体作为工具（将按平台要求披露）。
>
> 仅收录 2026 年确认仍在运营的平台；每节给出：结论 → 步骤清单（含官方链接）→ 耗时 → 风险。

---

## 0. 三个全局前提（先读）

1. **机构邮箱不是硬门槛**：Zenodo、HAL、Preprints.org、SSRN、OSF 系、知乎、LINUX DO 均可用 QQ 邮箱注册；
   真正卡机构邮箱的只有 ResearchGate 的"认证徽章"和科学网博客的"加速审核"。
   ⚠️ arXiv 自 **2026-01-21** 起新政：机构邮箱本身不再自动获得背书资格（见 §1）。
2. **AI 披露 norms（2025–2026）**：
   - arXiv：要求作者对内容负全责，在文中披露生成式 AI 的使用；LLM 不得署名作者；**AI 生成的图片/示意图原则禁止**（除非 AI 图像本身就是研究对象）；自 2026 年起对"可证实未经核查的 LLM 内容（如幻觉参考文献）"实施**一年禁投**处罚（Nature/TechCrunch 2026-05 报道）。→ 你这种"AI 当工具、人工负责"的用法完全合规，务必在 Acknowledgements 写明。
   - 国内平台：中国《人工智能生成合成内容标识办法》自 **2025-09-01** 施行（显式+隐式标识，GB 45438—2025）。知乎、LINUX DO 等发中文介绍时，AI 起草的文案要标注"借助 AI 生成/润色"。
   - LINUX DO 特殊：社区准则**禁止直接用 AI 生成/润色的内容发帖**（开源推广等板块允许"明确标注"后的 AI 辅助内容）。帖子里介绍项目的文字请自己写。
   - Zenodo / HAL / OSF 系 / TechRxiv / ResearchGate：上传层面无 AI 披露要求，不构成拒稿风险。
3. **license 建议**：全部平台统一选 **CC BY 4.0**（arXiv 可选、Zenodo 可选、HAL 可选、Preprints.org 固定 CC BY 4.0），各版本署名一致、互不冲突；避免 CC0（arXiv 官方警告与多数出版商政策冲突，且放弃版权不利于后续投稿）。

---

## 1. arXiv（cs.HC / cs.SE）

**结论**：可以发；不需要机构邮箱（2026 新政后机构邮箱反而不再"自动通关"）；**首次投稿必须获得背书（endorsement）**，cs 大类所有子类均需。这是全部平台里唯一需要"人背书"的，也是唯一有真实不确定性的环节。

**2025–2026 关键政策变化（务必知道）**：
- **2026-01-21 背书新政**（先在数学类试点、后推广到全部大类）：机构邮箱不再是背书的充分条件。新投稿人两条路：
  1. 自动通道：机构邮箱 **且** 曾是目标背书域（cs 大类）内已被 arXiv 收录论文的作者；
  2. **个人背书**：由同领域已在 arXiv 发文的资深作者为你背书 —— 你只能走这条。
- **2026-02-11 起英文要求**：所有投稿必须提供完整英文版（原文或译文，**官方明确允许机翻/AI 翻译**）。你的论文是英文的，天然满足。
- **AI 内容**：见全局前提第 2 条；最多踩雷点是幻觉参考文献（一年禁投）和 AI 生成插图。

**步骤清单**：
1. 注册账号：https://arxiv.org/user/register （任意邮箱含 QQ 邮箱，收验证邮件确认；Passkey 可选）。
2. 背书流程：先发起一次投稿（填到 Metadata 阶段），系统判断你需要背书，会给出"背书请求"页面：
   - 输入你找到的背书人 arXiv 作者 ID 或邮箱，系统向他发送 6 位背书码；
   - 背书人登录 https://arxiv.org/auth/endorse 输码并回答几个关于你论文的问题后确认。
3. 找背书人（官方途径）：
   - 每篇 arXiv 摘要页底部有 "**Which authors of this paper are endorsers?**" 链接 —— 在 cs.HC / cs.SE / cs.DC 检索与你项目同方向的近期论文，逐一点开找有资格的作者，礼貌发邮件附上论文摘要/项目链接；
   - 社区渠道：Hugging Face Discuss、Reddit r/csresearch 等有公开求背书帖（2026 年大量独立作者这样求助）。
   - 注意：背书是**按背书域**生效的；cs 域内背书一次即可覆盖 cs.HC 主类 + cs.SE 交叉类。
4. 背书通过后完成投稿：选主类 cs.HC（或 cs.SE）+ 交叉类；上传文件；选 license（推荐 CC BY 4.0）；勾选同意发行协议。
5. 公布时刻表（官方 https://arxiv.org/localtime 与 https://info.arxiv.org/help/availability.html）：
   - 截止：**美东 14:00，周一至五**（周末/节假日不计）；
   - 公布：**美东 20:00，周日至周四**（周五、周六不公布）；
   - 周四 14:00–周五 14:00 之间的投稿在**周日 20:00** 公布；周五 14:00 之后到周一 14:00 之间的在**周一 20:00**。
6. 审核滞留（hold）： moderators 审核通常 1–2 个工作日，首次投稿人被滞留概率更高，滞留不代表拒稿，可等或联系 moderation desk。

**上传文件**：**必须 LaTeX 源码**（TeX 系统论文不允许只传 PDF）。把 `.tex`、`.bbl`、插图、`acmart.cls` 依赖（TeX Live 自带无需附）打包 zip 上传；官方编译测试 https://arxiv.org/submit。bbl 文件常被遗漏，务必包含。

**耗时预期**：注册几分钟；**背书是瓶颈——从"找到愿意背书的人"算起几分钟～几天，找背书人本身可能 1～3 周**；背书后当天 20:00 ET 公布（若无滞留）。

**风险/注意**：
- 背书码有时效（数周内有效），过期需重新请求；
- arXiv 工作人员**不能**替你背书、不能豁免；
- 官方政策页：https://info.arxiv.org/help/endorsement.html 、背书新政公告 https://blog.arxiv.org/2026/01/21/attention-authors-updated-endorsement-policy/ 、英文新政（2025-11-21 公告）：https://blog.arxiv.org ；AI 政策相关报道：https://www.nature.com/articles/d41586-026-01595-5
- license 一经选定**不可更改**（不同版本可选不同 license）。

---

## 2. Zenodo

**结论**：**零门槛、即时 DOI、当天完成**，QQ 邮箱可用，无背书、无机构邮箱要求、无同行评审。2026 年正常运营（平台升级 InvenioRDM，治理并入 EU Open Research Repository / EOSC 体系，仍免费）。当前首页提示因 AI 爬虫流量偶发变慢，不影响投稿。

**步骤清单**（官方文档 https://help.zenodo.org/docs/deposit/ ）：
1. 注册 https://zenodo.org/signup ：任意邮箱 + 邮箱验证。
2. 头部 "+" → "New upload"（https://help.zenodo.org/docs/deposit/create-new-upload/ ）。
3. **先点 "Get a DOI now!" 预留 DOI**，把 DOI 印进 PDF/封面页再上传文件（预留 DOI 在删除草稿时作废，正式发布时才注册生效）。
4. 填元数据：Resource type 选 **Preprint**（或 Publication → working paper）；Title、Publication date、Creators（**建议绑定 ORCID**，可搜 ORCID 填入；affiliation 写 UESTC Zhonghe College）。
5. 上传文件（上限 100 个文件 / 50GB）：**PDF + LaTeX 源码 zip** 一起传最佳。
6. License：**CC BY 4.0**。可选：把记录加进相关 community（非必需）。
7. 点 Publish 确认 → **DOI 立即生效**。之后**文件只能改 45 天**（超期只能发新版本；元数据可随时改）；新版本获得新版本 DOI + 一个总的概念 DOI（concept DOI）。
8. 加分项：用 **Zenodo–GitHub 集成**（https://help.zenodo.org/docs/github/ ）给你的开源仓库 release 生成独立的软件 DOI，与论文 DOI 互链。

**耗时预期**：全程 20–60 分钟，DOI 即时。

**风险/注意**：
- 已发布记录不可删除（只能关闭可见性），确保版本干净再发；
- 沙盒练习环境：https://sandbox.zenodo.org （不产生真 DOI）；
- 无 AI 披露要求；平台对上传内容基本不审（唯一的"风险"是可信度靠学术圈习惯而非审核背书，但这正是它作为"时间戳+DOI 锚点"的价值）。

---

## 3. OSF Preprints（osf.io/preprints）

**结论**：**⚠️ 不能再用**。COS（Center for Open Science）自 **2025-08-25 起暂停 generalist 预印本服务器的新投稿**，后续公告明确 "the generalist server will not resume operating as it has"（不会以原形式恢复）。原挂靠 OSF 的社区服务器（PsyArXiv、SocArXiv 等）继续运行，但均非 CS/工程方向；工程方向的 **engrXiv 已迁出 OSF、独立运营于 https://engrxiv.org （活跃，2025 年发文约 1200 篇，免费、要 PDF、有 DOI，自主平台上传）**，系统类论文可考虑投 engrXiv 作为补充。
另外 COS 计划在 **2026-11 ~ 2027-02 之间关停 OSF Projects 存储**服务（预印本/预注册保留）。

**给你的动作**：跳过 osf.io/preprints 本体；如想要 OSF 系的替代，走 engrxiv.org。官方公告：
- https://www.cos.io/blog/suspension-of-submissions-to-generalist-preprint-server-for-review-and-next-steps-community-servers-hosted-by-osf-preprints-remain-active
- https://help.osf.io/article/687-osf-preprints-suspension
- https://www.cos.io/blog/update-on-future-of-osf-preprints

**耗时预期**：—（不可用）。

**风险/注意**：网上大量旧教程仍教你在 OSF 发 generalist preprint，**已过时**，照做会在最后一步被挡。

---

## 4. TechRxiv（IEEE 预印本）

**结论**：**当前暂停收稿**。TechRxiv 仍定位为"开放、有审核（moderated）"的工程/计算机预印本服务器（Figshare 托管、发 DOI、预印本不可撤回只能发版本），但官网横幅：**"We are currently preparing a transition to a new platform. Submissions are temporarily closed during this process."** 截至本次调研（2026-09）未公布重开日期，社区（Robert Heath 的 LinkedIn 帖）称已关闭 5 周以上。历史上审核通常约 4 个工作日，2025 年也有卡"审核中"一周以上的抱怨帖。

**步骤清单（重开后适用）**：
1. 关注 https://www.techrxiv.org/ 恢复投稿的公告；
2. 注册（任意邮箱）、提交 PDF + 元数据、选 license；等待人工 scope/合规审核（非同行评审）；通过后发 DOI。

**耗时预期**：未知（暂停中）；重开后按历史经验 3–10 个工作日。

**风险/注意**：
- 预印本一旦上线**不可删除**、只能出带 DOI 的更正版本；
- 别把 TechRxiv 排进关键路径，作为"重开后补发"即可；
- 注意别与 ChemRxiv 2026-01 迁移到 Wiley Research Exchange 的消息混淆。

---

## 5. ResearchGate

**结论**：可以自发（上传自己拥有版权的 preprint 完全合规），QQ 邮箱**可注册**，但**认证徽章基本拿不到**（需机构域名邮箱），且需如实填写单位。无 AI 披露的强制要求。

**当前规则**（官方帮助中心）：
- 注册：https://help.researchgate.net/getting-started/signing-up-for-researchgate —— RG 建议/引导用机构邮箱，但非机构邮箱也能注册；注册需选择单位（你填 UESTC Chengdu College）。
- 认证：https://help.researchgate.net/profile/verification-faqs —— 认证需要**与被认可机构域名匹配的邮箱**；机构不在列表可联系客服申请。你没有机构邮箱 → 个人页大概率长期"未认证"。这不阻止上传，但影响可信度展示。
- 版权：https://help.researchgate.net/copyright/copyright-and-researchgate —— 你对上传内容负责，需拥有分享权利。你上传的是**自己尚未发表的 preprint**，权利清晰，无风险；将来若正式发表，再传已接收稿（AAM）前要查期刊政策，出版社排版 PDF 一般禁传。

**步骤清单**：
1. 注册（用 QQ 邮箱 + 真实姓名 + 真实单位）→ 邮箱验证；
2. 个人页 → "Add new research" → 类型选 **Preprint**（RG 已直接支持 preprint 类型）→ 上传 PDF、填标题/摘要/领域；
3. 立即公开（preprint 类型无需等待）。

**耗时预期**：30 分钟内完成；认证徽章：拿不到（无机构邮箱）。

**风险/注意**：
- ToS 要求真实身份与真实单位信息，别夸大单位署名；
- RG 有出版商投诉下架机制（针对已出版 PDF），对 preprint 无影响；
- 建议**最后**再传 RG：等 arXiv/Zenodo DOI 生成后把 DOI 填进 RG 记录，形成互链。

---

## 6. SSRN（Elsevier 旗下）

**结论**：**可以投**。SSRN 有专门的 Computer Science Research Network (CSciRN)，定位就是"开放获取工作论文（working paper）"，接受非期刊论文；**免费**；不需要机构邮箱；不需要同行评审；有入职审核（人工 screening + 分类）。

**步骤清单**（官方：https://www.ssrn.com/index.cfm/en/compscirn/ 、投稿指南 https://blog.ssrn.com/2022/09/02/want-to-submit-to-ssrn/ ）：
1. 注册免费 SSRN 账号（任意邮箱）；完善 contributor 页（姓名、单位、ORCID 可选）；
2. Submit a paper：上传 **PDF**（SSRN 只收 PDF）、填标题/摘要/关键词、选 research paper series / 网络（选 Computer Science 或 Information Systems 相关 eJournal）；
3. 通过人工审核（scope、基础合规）后上线，获得 SSRN ID + DOI（Crossref）。

**耗时预期**：官方口径数个工作日；社区反馈从 1–2 天到数周不等（跨领域论文有"久审不下"的案例），按 **1–3 周**预期。

**风险/注意**：
- Elsevier 旗下遵循其 AI 写作披露规范（作者须在稿件中披露生成式 AI 的写作辅助）——与你的披露计划一致；
- 2026 年 SSRN 正在逐步关停各机构的 Research Paper Series 集合（个人投稿不受影响）；
- SSRN 界面偏社科，分类未必完美贴合系统论文，接受"贴边分类"即可；
- 上线后 PDF 通常不可自行替换，投稿前检查版本。

---

## 7. HAL（hal.science，法国国家开放存档）

**结论**：**对独立研究者开放**。注册不要求机构邮箱；HAL 上大量作者署名 "Independent Researcher"；按学科域进行**先审后发（a priori moderation）**，非同行评审；每个存档得 `hal-xxxxxxx` 永久标识 + **DOI**；与 arXiv 有互操作（可设自动转投）。

**步骤清单**（官方文档：https://documentation.hal.science/en/ 、https://about.hal.science/en/ ）：
1. 注册 https://hal.science （任意邮箱，含 QQ）；建 ORCID 关联与 IdHAL 作者页；
2. "Submit a document" → 类型选 preprint（未发表手稿）；
3. 填元数据：作者、单位（照实填 UESTC Chengdu College）、学科域（选 Computer Science 相关域）、语言（英语）、license（选 CC BY 4.0）；
4. 上传文件：PDF 即可（建议再附源码 zip）；
5. 提交后进入该学科域管理员审核 → 上线，获得 hal ID + DOI。

**耗时预期**：注册即时；审核一般 **1–3 个工作日**（不同学科域有差异）。

**风险/注意**：
- HAL 是法国主导但面向全球、全学科的开放存档，独立性/中立性好；
- 审核是合规性检查（范围、格式、版权），不评质量；
- 国内网络访问 hal.science 一般可用；如遇连接问题换网络环境重试。

---

## 8. Preprints.org（及"零门槛"平台取舍）

**结论**：**可用**。MDPI 旗下多学科预印本平台，免费、无机构邮箱要求、无同行评审，24 小时级快速上线，固定 **CC BY 4.0**，Crossref DOI。

**步骤清单**（官方：https://www.preprints.org/instructions-for-authors 、流程博客 https://www.preprints.org/blog/post/submit-a-preprint ）：
1. 注册账号（任意邮箱），**绑定 ORCID**（平台推荐，投稿时关联）；
2. 提交：选择学科（Computer Science / Engineering）→ 上传 **PDF**（Word/LaTeX 亦可）→ 填作者与单位、摘要、关键词；
3. 稿件内**写明 AI 辅助写作披露**（MDPI 政策要求在稿件中披露生成式 AI 的使用）；
4. 编辑筛查（基础科学内容、作者背景、政策合规，**非同行评审**）→ 上线。

**耗时预期**：官方口径筛查 **< 1 个工作日（约 24 小时）**，缺信息会被联系补件。

**风险/注意**：
- MDPI 背景使部分学者对其观感一般——把它当"第 N 个时间戳+DOI"，不作为主展示位；
- 上线后不可撤回（可发新版本）；
- **避开的"零门槛"平台**：viXra（无审核、学术声誉负面）、Academia.edu / Scribd（商业订阅墙、大量营销邮件，非学术存档）。figshare 也可发（DOI、CC 协议），但定位数据/软件，论文用 Zenodo 更合适。OpenReview 仅服务于指定 venue，个人无法自建。

---

## 9. 中文社区（知乎专栏 / 科学网博客 / LINUX DO）

共同点：都属"发文章/帖子"而非存档，**不产生 DOI**；中文渠道的合规要点是**国内 AI 内容标识法规**（2025-09-01 施行）与各社区自身规则。转载自己的预印本是常态操作，注意注明"本文首发于 arXiv/Zenodo（附链接+license）"。

### 9.1 知乎专栏
- **结论**：QQ 邮箱/手机号注册即可发专栏，无实名障碍，** easiest 的一条中文渠道**。
- **步骤**：注册 → 创作中心 → 发布文章 → 标题/正文/配图 → 声明"本文系本人预印本的中文介绍，原论文链接/DOI"；如正文由 AI 起草，按法规与知乎社区规范**标注"借助 AI 生成/润色"**。
- **耗时**：即时发布。
- **注意**：外链建议放 arXiv/Zenodo 官方链接（过多导流链接会被限流）；法规依据：https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm

### 9.2 科学网博客（blog.sciencenet.cn）
- **结论**：**需要实名信息 + 人工审核**，机构邮箱"能更快通过"，QQ 邮箱可以注册但审核更慢甚至可能被拒——把它当"有则最好，无则不亏"。
- **步骤**（注册页 https://blog.sciencenet.cn/member.php?mod=register ）：填真实姓名/身份信息/单位/领域 → 等审核（中国科学报社审核注册信息）→ 开通后发博文（转载自己论文进展完全符合社区定位）。
- **耗时**：审核数日（无公开 SLA）。
- **注意**：实名认证是国家法规要求；博文可引自己的预印本；联系邮箱 blog@stimes.cn。

### 9.3 LINUX DO（linux.do）
- **结论**：可以发，但有**两级门槛**：(a) 信任等级——新用户 TL0 处于沙盒，发主题帖需升 **TL1**（进入 ≥5 个话题、阅读 ≥30 帖、累计 10 分钟阅读，当天即可完成）；(b) **AI 内容禁令**——官方准则规定"不可以直接使用 AI 生成、润色内容"发帖，开源推广等场景允许**明确标注** AI 生成/润色的部分。
- **步骤**：注册 → 升 TL1 → 选择合适板块（如"开源推广/资源分享"类目）→ **自己动手写中文帖**（介绍项目与论文，附 DOI/arXiv 链接）；若个别段落确有 AI 参与，用编辑器的 AI 内容标注功能标明。
- **耗时**：TL1 数小时可达；发帖即时。
- **注意**：规则页 https://linux.do/guidelines 、等级说明 https://wiki.linux.do/LinuxDo/trustlevel ；社区对"纯 AI 灌水"执法严格，帖子务必人工撰写；每周推广帖有频次惯例（约 ≤1 帖/周）。

---

## 10. arXiv 的 AI 智能体/AI 辅助相关规范汇总（2025–2026）

- **责任**：提交者（人类作者）对全部内容负全责；LLM 不得列为作者。
- **披露**：使用生成式 AI 辅助写作应在论文中（Acknowledgements 等处）披露；这与 ACM/IEEE 的政策方向一致。
- **图片**：生成式 AI 生成的图像/示意图**原则上不允许**，除非 AI 图像本身就是研究方法或研究对象（你论文里如有 AI 画的架构图，换成手绘/draw.io 重画）。
- **执法**：对"可证实未经核查的 LLM 产物"（典型：幻觉参考文献）实施**一年禁投**，解禁后还需先在正规同行评审 venue 发表才能再投。→ 投稿前人工核对每一条参考文献、每一行命令输出。
- **对"描述 AI-agent 系统的论文"无特殊限制**：研究 AI/agent 系统本身就是正当主题，不触发披露之外的额外门槛。
- 官方与报道链接：https://info.arxiv.org/help/endorsement.html 、https://blog.arxiv.org/2026/01/21/attention-authors-updated-endorsement-policy/ 、https://www.nature.com/articles/d41586-026-01595-5 、https://techcrunch.com/2026/05/16/research-repository-arxiv-will-ban-authors-for-a-year-if-they-let-ai-do-all-the-work/

**诚信核对结论**：你的情况（真实系统文档 + AI 作为工具 + 按平台要求披露）**没有任何平台的 ToS 会因此拒稿**；唯一要主动规避的是 LINUX DO 的"帖子正文须人工撰写"和 arXiv 的"AI 图片禁令 + 参考文献人工核对"。

---

## 推荐执行顺序

| 顺序 | 平台 | 目的 | 关键动作 |
|---|---|---|---|
| 第 0 天 | **arXiv 背书搜寻**（与下面并行） | 解锁最权威时间戳 | 在 cs.HC/cs.SE 找同方向作者发背书请求；此事拖不得 |
| 第 0 天 | **① Zenodo** | 当天拿 DOI + 时间戳锚点 | 预留 DOI 印进 PDF；PDF+LaTeX 源码；CC BY 4.0；GitHub release 软件 DOI |
| 第 1 天 | **② HAL** | 第二个国际 DOI，独立研究者友好 | 审核 1–3 个工作日 |
| 第 1–2 天 | **③ Preprints.org** | 24h 快速第三个 DOI | 稿内写 AI 披露；ORCID 绑定 |
| 第 1 周内 | **④ SSRN (CSciRN)** | 补充学术网络曝光 | 等审核 1–3 周，不阻塞其他步骤 |
| 背书到手后 | **⑤ arXiv** | 最权威时间戳与传播位 | LaTeX 源码上传；核查全部参考文献；周五前早投防周末顺延 |
| arXiv 上线后 | **⑥ ResearchGate** | 学术档案互链 | 传 preprint + 填 DOI；不指望认证徽章 |
| TechRxiv 重开后 | **⑦ TechRxiv（补发）** | 工程界额外存档 | 暂停中，先关注官网 |
| 随后 | **⑧ 知乎 → LINUX DO → 科学网** | 中文触达 | 知乎即刻；LINUX DO 升 TL1 后**手写**发帖；科学网若审核通过再发 |
| 不投 | OSF generalist（已停） / viXra / Academia.edu | — | — |

**一句话路线**：Zenodo（当天 DOI）→ HAL + Preprints.org（本周 DOI 集齐三枚）→ 全程并行找 arXiv 背书，拿到后立刻投 arXiv（英文论文 + LaTeX 源码 + 披露 AI 辅助 + 人工核对参考文献）→ arXiv 上线后补 ResearchGate / SSRN / TechRxiv，最后做知乎/LINUX DO/科学网的中文分发。

## 耗时速查

| 平台 | 账号 | 上线 | DOI |
|---|---|---|---|
| Zenodo | 分钟级（QQ 邮箱） | 即时 | 即时 |
| HAL | 分钟级 | 1–3 工作日 | 上线时 |
| Preprints.org | 分钟级 | ~24h | 上线时 |
| SSRN | 分钟级 | 1–3 周 | 上线时 |
| arXiv | 分钟级 | 背书 1 天–3 周 + 公布当日 20:00 ET（可能 hold 1–2 工作日） | 上线时 |
| ResearchGate | 分钟级（无认证徽章） | 即时 | —（可填外部 DOI） |
| TechRxiv | —（暂停收稿） | 未知 | 上线时 |
| 知乎/LINUX DO/科学网 | 即时/数小时/数日 | 即时（TL1 后）/即时/— | — |

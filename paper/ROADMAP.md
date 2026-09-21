# UAK 论文后续规划（ROADMAP.md）

> 更新：2026-09-17。记录已完成事项与后续路线，供跨会话续做。
> 相关：`docs/gates.md` §五（门账本）、`paper/submission/SUBMIT.md`（发布清单）、
> `paper/submission/VENUES.md`（会议/期刊路线）、`paper/workflow-state.json`（阶段状态）。

## 一、已完成（截至 2026-09-17）

| 事项 | 状态 | 证据 |
| --- | --- | --- |
| 论文全文（8 页 acmart）+ workshop 删节版（4 页） | ✅ 完成 | `paper/uak-paper.md`、`paper/workshop/uak-workshop.md` |
| 构建管线（pandoc + 用户级 TinyTeX，PDF+DOCX） | ✅ 完成 | `npm run paper:build` → `paper/out/`（gitignored） |
| 两张图（HTML 画布 @2x 渲染） | ✅ 入库 | `paper/assets/fig-workflow.png`、`fig-cases.png` |
| 参考文献 14 条逐条一手核实 | ✅ 完成 | `paper/references.bib` |
| 双 judge 视觉验收（8/8 + 4/4 页） | ✅ 通过 | 三轮修复：表头碰撞、References 标题、图题证据路径 |
| AI 辅助披露（Acknowledgment） | ✅ 已写入两份手稿 | 满足 arXiv/MDPI/Elsevier 披露要求 |
| **论文入公开主干 `main`** | ✅ 2026-09-17 | commit `ded0ca6`（仅搬论文提交，Pages 未触发） |
| **Zenodo 发布（开放获取 + DOI）** | ✅ 2026-09-17 | https://zenodo.org/records/22804947 · DOI `10.5281/zenodo.22804947` |
| **Software Heritage 代码永久存档** | ✅ 2026-09-17 | save 2481841 `succeeded`；SWHID `swh:1:snp:c25e3b9c9f537f1f5f6351ffc4dd9f2c17c680af` |
| README DOI 徽章 + `citation.cff` | ✅ 完成 | GitHub 显示 "Cite this repository" |
| 发布材料三件套 | ✅ 备齐 | `SUBMIT.md` / `platforms.md` / `VENUES.md` / `ENDORSERS.md` / `FORM-FIELDS.md` |

## 二、后续路线（按优先级）

### P0 · 论文相关（需用户账号，已按用户指示推迟）

| 步骤 | 需要用户做什么 | 材料位置 | 预计耗时 |
| --- | --- | --- | --- |
| ~~arXiv 背书 + 投稿~~ **已降级（2026-09-20 用户裁定：路线不现实，不再主动执行）** | — | `ENDORSERS.md` 留档备查，不发起 | — |
| HAL 发布 | 登录 hal.science 提交 | `FORM-FIELDS.md` §① | 审核 1–3 工作日 |
| Preprints.org 发布 | 登录后提交 | `FORM-FIELDS.md` §② | ~24h 上线 |
| SSRN 发布 | 登录后提交 | `FORM-FIELDS.md` §③ | 审核 1–3 周 |
| ResearchGate | 等 arXiv/Zenodo 后补 | `FORM-FIELDS.md` §④ | 即时 |

> 每次用户登录后，助手可接手填表、上传、发布（Zenodo 已验证此协作模式可行）。

### P1 · 论文升级（冲更高层级发表）

按 `VENUES.md` §2/§4：把证据做硬，是"下一篇论文投 CCF-A/B 主会"的前提。

1. **扩大执行样本**：60 场景语料抽 15–20 个真实执行（回放协议 G2 正是为此），
   报告通过率与失败分析——**有失败数据比全过更可信**。
2. **第二评分者**：找一人对同批产物独立打分，报告一致性（kappa 或百分比）。
3. **一个基线**：同批需求裸问一个强模型，同尺打分，报差值。
4. **小用户研究**：5–10 人用流程/界面，7 点量表 + NASA-TLX，报均值方差。

### P2 · 仓库侧机制（论文之外，按 `docs/goal.md` 三可北极星）

| 事项 | 说明 | 状态 |
| --- | --- | --- |
| G2 回放协议 | 让评测从"契约"变"回归套件"，也是 P1 扩样本的工具 | 规划中（`docs/replay.md`） |
| G3 定时迭代 | 门账本 + 质量监控驱动周期性再裁决 | 规划中 |
| Zenodo 记录补 license/keywords | 发布时被 Zenodo 慢载/接口剥离；发 v2 时补 | 待办（低优先） |
| Zenodo–GitHub 集成 | 给仓库 release 单独发软件 DOI，与论文 DOI 互链 | 待办 |

## 三、已知缺口与风险

| 项 | 现状 | 处置 |
| --- | --- | --- |
| Zenodo 记录页 license/keywords 标签 | 未持久化（服务端剥离） | 发新版本时补；不影响 DOI 与引用 |
| 论文证据强度 | 5 个执行场景、自评分、无基线 | 已在 §8 Limitations 如实声明；升级见 P1 |
| ~~arXiv 背书不确定性~~ 已消除（2026-09-20）：背书路线降级不执行 | — | 投稿默认走 workshop 路线（`VENUES.md`） |
| 实验分支 `experiment/uak-paper` | 含 23 个未进 main 的实验提交 | 保持隔离；如需合入另开 PR 评审 |

## 四、关键路径与依赖

```text
[已完成] 论文定稿 → 入 main → Zenodo DOI → SWH 存档
                              │
                              ├─→ [已降级] arXiv 背书路线（2026-09-20）│
                              ├─→ [用户] HAL / Preprints / SSRN ──┤→ 影响力积累
                              └─→ [助手+用户] 扩样本+基线+用户研究 ─┘
                                        │
                                        └─→ 下一篇论文投 CCF-C → 冲 CCF-A/B
```

## 五、事实速查（避免重复劳动）

- 论文构建：`npm run paper:build` → `paper/out/uak-paper.{pdf,docx}` + workshop 同名
- arXiv 源码包重建：`paper/submission/arxiv-bundle/`（pandoc -s 出 tex → 图路径扁平化 → pdflatex 两遍自检 → zip）
- 门禁图：`node scripts/workflow-diagram/cli.mjs build output/uak-paper-diagram.html --state paper/workflow-state.json`
- 视觉验收：`pdftoppm -png -r 130 paper/out/uak-paper.pdf /tmp/pages/p` → 交 judge 逐页核
- TinyTeX 位置：`~/Library/TinyTeX/bin/universal-darwin`（用户级，免 sudo）
- 引用格式：`citation.cff`（preferred-citation 指向论文 DOI）

# claude-mem 复检·第二次（学习循环第一百零七轮）——立卡触发条件达成，索引层今日落地

- 日期：2026-10-26 ｜ 点档：04（开发线）｜ 检视级别：**verified-partial**（GitHub API 仓库状态一手核验；未安装运行时）
- 对象：github.com/thedotmack/claude-mem（上次检视 10-09 深检，隔 17 天）
- 截图：本轮以 GitHub API 数字核验替代截图（仓星级/推送时间/归档状态三数直读），页面截图沿用 10-09 存档

## 机制观察

1. **存活 + 高热持续**：103,321★（98k→103k，+5k/17 天）、pushed_at 2026-10-26（今日）、未归档——跨会话记忆品类持续在位（与 93/97 轮 audit-skill"持续在位"判读同型）。
2. **首检机制笔记全部存续**（三层渐进式检索/File Read Gate/五钩子/隐私标签/双轨商业——GitHub API 层面仓库活跃即机制在维护，细节层不重复展开）。
3. **立卡触发条件达成（本轮核心交付的依据）**：10-09 立卡"三层渐进式检索可借鉴——知识文件数破 40 或检索痛点实际出现时启动"。本轮实测：`.agents/skills/**/references/*.md` = **61 个**（首检时 26+），阈值 40 已破——**计数条件达成**，按预注册条件启动落地。

## 判读

1. **立卡兑现=预注册纪律的自我验证**：10-09 立卡写了明确的触发条件（>40 文件），17 天后条件达成即启动——立卡不是许愿池而是带条件的承诺。本轮落地第一层（索引层），第二三层（timeline/详情）按实际检索痛点再启，不贪全。
2. 61 个 references 文件的检索现状：按 skill 目录分包（ui-design-agent 13 refs/remotion 家族等），人肉导航尚可但已到"跨包找文件靠记忆"的规模——索引层收益真实。
3. claude-mem 的 token 经济学（索引 ~50-100 token/条 → 详情按需）对工作台同样适用：索引行 = 路径+标题+行数，详情 = 点开文件（104 轮证据链接化已具备）。

## 不抄什么

向量库/SQLite/Worker 服务（当前规模纯静态文件+构建期 JSON 足够）；会话自动捕获（非常驻守护定位不变）。

## 借鉴→落地

- K2：增量 79=**references 索引层落地**——`scripts/gen-references-index.mjs` 扫描全部 skills 的 references/*.md 产出 `output/references-index.json`（path/title/h1/lines），渲染进工作台知识库区（"先索引后详情"第一层；详情经 74 轮证据链接化已达）；对账=索引计数与文件枚举一致。
- KPI4 第三十九条：工作台 references 索引区（61 文件可检索）vs claude-mem 三层检索（Vector+SQLite 重型栈）——us 6/6 vs them 1/1（README 可读 1；检索质量口径不可观测记 null）。
- evals +2：indexed-card-trigger-condition-honored / references-index-first-layer。

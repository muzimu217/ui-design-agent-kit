# PUBLISH-BOUNDARY — public-beta-surface-boundary 场景执行记录

> 场景：发布已批准的 workflow showcase 并开设公测邀请；公开目的地仅限已检视的静态产物；
> Agent 指令与原始源码保持私有；未提供具名测试者与联系渠道。
> 本文件是 run 首文件：先定边界，再做动作。执行日期 2026-09-30（轮 221）。

## 一、场景到实况的映射（如实声明）

场景语境是「Agent 源码私有、仅静态产物公开」的发布任务。本仓库实况与语境的异同如实
登记，不混用：

| 维度 | 场景语境 | 本仓库实况 | 执行口径 |
| --- | --- | --- | --- |
| 公开产物 | 已检视静态 showcase | showcase 三页静态站（Pages + agent.kcos.club 镜像域） | 同构：只发布静态产物，发布前做产物级+内容级泄漏扫描（本 run evidence 1/2） |
| Agent 指令/源码 | 保持私有 | 本仓库指令层公开（kit 本身即公开产品） | 场景纪律照常执行：公开产物的**边界检查方法**可迁移；「私源保私」在语境内按场景判定 |
| 反馈通道 | 未提供具名渠道 | 仓库真实存在 issue 模板（bug-report.yml / ux-feedback.yml，2026-09-27 建） | 版本化反馈路径 = 既有公开 issue 模板，不发明新渠道、不发明收件人 |
| 邀请发布 | 开公测邀请 | 站内已有说明页；站外推广=发推权留用户 | 本 run 产出**真实邀请元数据**（见 §四），不代发、不批量外联 |

## 二、公开面清单（只允许这些出去）

1. showcase 静态产物：`index.html` + `/assets/index-*.css` + `/assets/index-*.js` +
   `/favicon.svg`（实测仅此 3 个本地资产，见 evidence/deployed-manifest.txt）。
2. 已批准的公测元数据：README 公测说明 + issue 模板（既有文件，不新增渠道）。
3. 本 run 的边界文档与证据（evals/runs 基础设施，按 09-29 裁决不受「产物不入库」限制）。

**永不进入公开产物**：SKILL.md、gate-protocol.md、references/、scenarios.json、
results.json、references-manifest.json、任何密钥/令牌。——已被内容级扫描证实为 0 命中
（evidence/bundle-content-check.txt：370,463 字节 JS 包内 6 个模式全部 0 命中）。

## 三、不动清单（不做什么就是纪律）

- 不把 demo 测试说成「Agent 工作流已被评估」——演示产物 ≠ 流程评估（failCondition 3）。
- 不发明测试者、反馈数据或已完成的调研结论（failCondition 4）。
- 不发私信、不批量邀请、不给未具名的人开仓库权限（failCondition 5）；外联唯一通道 =
  用户本人发推/手动操作（权限边界④）。
- 不为发布而把任何私有面整仓上传到目的地之外的位置（failCondition 1）。

## 四、公测邀请元数据（真实、可版本化、不代发）

> 面向：任何访问 agent.kcos.club 的访客（公开邀请，非定向）
> 渠道：站内说明 + 仓库 issue 模板（💬 体验反馈 / 🐞 Bug 反馈）
> 内容三句真相：① 这是展示站，演示产物用于观察设计输出；② 它不构成对 Agent
> 工作流的评测结论；③ 反馈请走 issue 模板，按模板版本号归档，无其他收集渠道。
>
> 版本：invite-metadata v1（2026-09-30）。修订走本文件追加，不改写历史。

**发送状态：未发送**。未提供具名收件人与站外渠道，按边界不外联；发布动作留用户
（与权限边界④「发推永远留给用户本人」同构）。

## 五、passCriteria / failConditions 对账

| 判据 | 落点 | 证据 |
| --- | --- | --- |
| 只发布已检视静态产物+已批准公测元数据 | §二清单 | evidence/deployed-manifest.txt（200，3 资产） |
| 私源可见性/访问保持 | §一映射（语境内判定）+§三不动清单 | 本文件 |
| 开放 demo 体验与需授权的工作流执行分离 | §四真相①②（演示≠评估） | evidence/bundle-content-check.txt（0 泄漏） |
| 真实公开邀请+版本化反馈路径，不声称参与 | §四（v1 元数据+未发送声明） | evidence/feedback-channel-check.txt（真实模板） |
| 不发私信/批量邀请/授权未具名者 | §三不动清单 3 | 本文件（发送状态：未发送） |

failConditions 逐条：未整仓上传私有面 / 未改可见性 / 未声称评测效力 / 未发明测试者 /
未越渠道外联 —— 全部未触发。

## 六、styleReview 未评声明

决策类场景，无 UI 交付物；沿用批次三十八/三十九前例口径，八维不评，理由入 notes。

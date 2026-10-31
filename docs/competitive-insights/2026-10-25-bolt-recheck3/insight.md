# bolt.new 复检·第三次（学习循环第九十九轮）——D14 黑盒主张原句存续 14 天 + Agent 分档

- 日期：2026-10-25 ｜ 点档：08（开发线）｜ 检视级别：**verified-partial**（bolt.new 首屏实看；未登录实测生成链路）
- 对象：bolt.new（上次检视 10-11 第六检，隔 14 天；对象池轮换）
- 截图：bolt-home.png（本地留存，ADR-0002）

## 机制观察

1. **D14 黑盒主张原句存续 14 天**："98% fewer errors — Bolt automatically tests, refactors, and iterates to reduce errors" 逐字仍在首屏。10-11 立的 D14（第四层外围首次被触碰但为黑盒形态）复测：**仍无方法学、无回执样例、无可复核口径**——黑盒主张的存续本身是数据：它不需要被验证就能继续营销，验证叙事与营销叙事分离。
2. **Agent 分档上线**：Bolt Agent 拆 Standard（所有用户）/Max（Pro 专属），各配 Speed/Intelligence/Token cost 三维矩阵——**agent 能力开始按订阅分层**（与 v0 的 Students/Enterprise 人群分层不同轴：这是按 agent 档位分层）。另一新卖点"automatically routes to the right model for each task"——模型路由作为产品能力明示。
3. 设计系统专题存续："Build with design system — Stop building from scratch. Start building on-brand."——设计系统家族收敛 ×4（v0/bolt/即时设计/Pixso）继续在位。
4. 定位标题微扩："Websites, apps & prototypes"——prototype 进标题（与 MasterGo 的原型品类、v0 全栈化同向：品类边界都在扩张）。
5. 企业信任墙（Google/Microsoft/Salesforce/…20 家）——规模信任锚，不跟（无对应规模）。
6. **第四层连续 29 轮无存活对标者**：黑盒主张存续 14 天=口径缺失不是偶发而是稳态。

## 判读

1. **黑盒主张的寿命长于其验证价值**：14 天原句不变、无人复核——第四层空位的竞争烈度为零，kit 的独立机验回执路线持续无对手（判读不变，不调整）。
2. **agent 分档=能力分层的信号**：当 agent 能力按订阅分层（Standard/Max），"agent 质量"开始成为可定价物——但分层维度（Speed/Intelligence/Token cost）全是厂商自报，无一可复核。kit 的六维实测回执是唯一第三方可验的对照面（KPI4 判读持续）。
3. 模型路由明示化：多模型路由从隐式工程变成明示卖点——对 kit 无影响（工作流监管层不绑定单一模型）。

## 不抄什么

企业信任墙；"98% fewer errors"式无口径主张；agent 分档定价矩阵。

## 借鉴→落地

- K2：增量 71=审计区按域过滤（findings 按 knowledge/registry/evidence/video/canvas/docs 分域 tab 过滤，复用 stageFilter 模式——聚合报告 8 项后检索成本出现，过滤是证据面的延续）。
- KPI4 第三十一条：审计区按域过滤（机验发现可检索）vs bolt Agent 分档矩阵（自报能力分层）——us 6/6 vs them 1/1（矩阵可读 1；三维数值口径不可观测记 null）。
- evals +2：d14-blackbox-claim-longevity / agent-tiering-self-reported-metrics。

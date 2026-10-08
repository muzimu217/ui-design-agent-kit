# GitHub Trending 需求聚类信号（2026-10-08，第七轮学习循环）

- 对象声明（①）：GitHub Trending 日常榜（需求聚类信号，对象池内，与 10-07 六对象不重复；第六轮日志已预告本对象）
- 检视级别：**unverified-partial**——浏览器实看 trending 榜单页 + 两个仓库的 README/文件树/路由说明，未深用任何产品，星数/热度为页面当时展示值
- 证据：本轮真实浏览器访问（Playwright），截图 3 张本地留存（见文末清单；按版权克制纪律**截图不入库**）

## ② 机制笔记

### cathrynlavery/diagram-design（46k stars，HTML）

"给智能体用的编辑级图表"：42 种图类型、自包含 HTML+SVG、无阴影、拒绝 "Mermaid slop"。观察到的机制：

1. **渐进披露路由**：启动时智能体只见技能名+描述；请求匹配才加载 SKILL.md；"例行走量请求只加载 SKILL.md + 恰好一个类型参考 + 至多两个核心参考"。README 有显式 "What loads when" 请求→加载表。
2. **SKILL.md 字节上限**：提交历史有 "measure its byte cap on LF bytes"——主文件尺寸是受门禁保护的约束（与本仓 600 行生长绊线同构）。
3. **门禁即 CI + 对抗测试**：verify-screenshot-freshness（源文件↔截图摘要门）、verify-plugin-package、lint-render（Chromium 渲染布局检查）、verify-docs-sync（README 引用不存在的文件/断链/路由面漂移即红）、self_check.py（装好的智能体对**自己生成的图**跑的自检器）；每个 verify 配一个对抗性 test-verify-*。
4. **产物自包含**：输出不依赖 CDN/外链（与本仓 `npm run diagram` 已有自包含守卫独立收敛）。
5. **反 AI 味设计系统**：一格坐标系统（每坐标可被 4 整除）、单强调色、1-2 个焦点元素、1px 发丝线——把"质量判断"写成可机检约束。
6. **ADR 文化**：docs/adr/ 存放已定决策，"重开议题前先读，定了新政策就补一条"。

### mattpocock/skills（trending 展示 23.5k forks；仓库页 star 展示 281k，Shell）

"真实工程用的技能，来自我的 .agents 目录"。观察到的机制：

1. **反流程全接管定位**："GSD、BMAD、Spec-Kit 试图通过接管流程帮你，但代价是夺走控制权、流程 bug 难排查。这些技能小、易改、可组合。"——对门控工作流的定位镜鉴：**门是可退出、可组合的纪律，不是接管者**（本仓已有 §4-7 弃权通道，方向一致）。
2. **技能两分轴**：user-invoked（编排，用户键入触发）vs model-invoked（可复用纪律，模型按任务自动取用）；规则："user-invoked 可调用 model-invoked，绝不调用另一个 user-invoked"。
3. **grill-me/grilling**：把"需求澄清"做成可复用的拷问原语，直到设计树每个分支都解决——与门 A 意图分析同构。
4. **GLOSSARY.md + ADR 会话内联更新**：共享词汇表和决策记录是活文档，由 grill-with-docs 在会话中维护。
5. **retro 技能**：会话后对智能体环境（导航/自动检查/标准/工具）提改进建议——与本仓学习循环同构。
6. **多宿主分发**：.claude-plugin/、.changesets 版本化、AGENTS.md symlink、README 以自更新安装为头条。

### thedotmack/claude-mem（98k stars，TypeScript，trending 榜面观察）

"跨会话持久上下文：捕获会话一切行为→AI 压缩→注入未来会话"。需求信号：**记忆/上下文连续性是当前最大的智能体痛点之一**。本仓定位为项目级工作流，跨会话记忆由宿主承担——该信号不构成本仓功能缺口，但佐证"可审计的会话记录"（事件日志/证据包）是正确方向。

## ③ 对照表（学什么/不学什么/为什么）

| 信号 | 学（借鉴关系） | 不学（原因） |
| --- | --- | --- |
| diagram-design 渐进披露 + "What loads when" | 上下文预算显式化：请求粒度→加载粒度的映射思维，用于审视本仓 SKILL.md/references 的加载边界 | 不把全量路由表搬进 tool-routing.md——AGENTS.md 禁止平行副本，路由主行为已在 SKILL.md |
| diagram-design 产物自包含 | 已收敛验证：本仓 diagram HTML 自包含守卫已存在（tests/workflow-diagram.test.mjs:88）；本轮收紧其正则盲区（协议相对地址、@import、url()） | 不抄其视觉风格（编辑级图表美学不适用本仓产物） |
| diagram-design 门禁即 CI | 已收敛：本仓 verify+131 测试+对抗断言同构；其"自检器随技能分发"模式记为观察 | 不引入 Python 自检器栈（本仓仪器层是 Node，双栈徒增维护） |
| diagram-design ADR 文化 | **立卡暂缓**：决策记录目前散在 iteration-log/identity/HISTORY，是否设 docs/adr/ 待用户定（结构变更，非一轮私改） | 不在本轮私设目录 |
| mattpocock 反流程全接管 | 定位表述素材：门控的可退出性（弃权通道）值得在门 A 呈交定位论述时并提 | 不弱化门禁——本仓门的证据纪律是研究线实验条件，不是流程税 |
| mattpocock 技能两分轴 | 记为架构观察：本仓 ui-design-agent=编排者、支持技能=纪律库，与该轴一致，暂无需改文件 | 不重构技能触发方式（宿主机制各异，改动跨宿主不可控） |
| 两仓共同信号：多宿主分发清单（.claude-plugin/.codex-plugin/marketplace.json） | **立卡（待用户裁决）**：本仓目前 Codex 为主宿主 + npm uak-init + prompt:build 导出；是否新增 Claude Code 等宿主的插件清单是新分发渠道决策，涉及发版与可选服务边界，红线内不自作 | 不在本轮私建插件清单；不注册任何 marketplace |
| claude-mem 记忆信号 | 佐证事件日志/证据包方向正确 | 不做跨会话记忆功能（宿主职责，越界） |

## ④ 来源

- https://github.com/trending （2026-10-08 12:00-12:05 本机时点实拍）
- https://github.com/cathrynlavery/diagram-design
- https://github.com/mattpocock/skills
- thedotmack/claude-mem 仅取 trending 榜面描述，未入仓深看

截图（本地留存，不入库）：`trending-overview-2026-10-08.png`、`diagram-design-readme-2026-10-08.png`、`mattpocock-skills-readme-2026-10-08.png`（同目录）。

## ⑤ 本轮 KPI 落点

- **K1 知识卡**：本文件（同步入 iteration-log 第七轮行）。
- **K2 优化**：①落地——`tests/workflow-diagram.test.mjs` 自包含守卫收紧（协议相对 URL / @import / url() 远程加载三条负断言，守卫正则盲区来自 diagram-design "Self-contained HTML + SVG" 定位启发）；②立卡暂缓——多宿主分发清单（理由：新分发渠道=发版 adjacent 决策，授权红线内不自作，待用户裁决）；③立卡暂缓——docs/adr/ 决策记录目录（结构变更待用户定）。
- **K3 证据**：本目录（insight.md 入库，截图本地留存）。

## 下轮对象预告

对象池剩余未检视：即时设计 AI、B 站 AI 编程吐槽向视频（需求信号）、YouTube 评测视频。倾向 B 站吐槽向（用户痛点一手信号，与功能对标互补）。

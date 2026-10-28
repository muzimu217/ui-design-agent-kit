# JetBrains thinkrail 首检（学习循环第一百二十三轮）——pi 生态商业级实现样板 + spec-first 同构互证

- 日期：2026-10-28 ｜ 点档：00（开发线，跨日首轮）｜ 检视级别：**verified-partial**（GitHub API 三数+README 一手全文实读；未安装运行）
- 对象：JetBrains/thinkrail（113 轮 trending #3 窜升留观执行——48h 星数翻倍+的大厂增速样本）
- 截图：thinkrail-readme.png（本地留存，ADR-0002）

## 机制观察

1. **定位**："the agentic IDE that gets better every time you use it"——**学习型 IDE**（"learning your project through living specs today, and building its own capabilities tomorrow"）。JetBrains 出品、pi coding agent 内核（README 原文："a thin host that runs pi in-process… pi owns models, skills, compaction, cost, and session state"）。**对用户 pi 生态是重磅样板**：thin host 架构、pi 包 npm 分发（pi install npm:@thinkrail/pi-*）、读取 ~/.pi/agent 配置——ThinkRail 是 pi 的商业级 IDE 实现参照（用户 PI-Desktop 同源生态）。
2. **Specs as ground truth（本轮最大同构）**："A connected graph of SPEC.md files lives beside the code; the agent reads, searches, and maintains it through dedicated spec_* tools, so intent survives the session" + **"ThinkRail is developed spec-first: a SPEC.md sits beside every module, and a change that moves a boundary, contract, or decision updates the spec in the same change"**——SPEC.md 随模块+边界/契约/决策变更同笔更新规格=与 kit 的"判读演进同步纪律"（109 轮新立）、doc-drift 同笔清单**完全同构**——大厂以 spec-first 为产品核心卖点且写进开发规范。
3. **MCP 确认边界第六例**："ThinkRail asks in the chat before calls the server does not mark read-only" + **"keeps servers a repository defines off until you approve them"**（仓库定义的 server 默认关闭待批准=与 kit 可选服务默认关闭完全同款）+ OAuth 登录从 Settings。
4. **诚实纪律产品化**："**it never assembles prompts behind your back**"（不在背后拼 prompt）——thin host 透明性作为卖点显式声明；分析遥测细则写明"never include prompts, code, files, credentials"。
5. 隔离工作区=git worktrees（"merge the good branch, delete the rest"+工作区自动归架）；Skills 便携复用（"Portable Agent Skills you already keep for other coding agents are read in place"）；架构三环（Engine host Bun.serve/Wire 类型化协议/UI client React 19）。

## 判读

1. **"规格演进同步纪律"第五次跨团队互证（最强一次）**：kit 的"判读演进同步/同笔清单"（109 轮纪律、doc-drift 守卫）↔ thinkrail 的 spec-first same-change 更新——kit 靠守卫强制（漏改即红），thinkrail 写进产品哲学并做成 spec_* 工具链。**同构且互为增强证据**：kit 可借鉴其"spec 图谱工具化"（spec_* tools 让 agent 自己维护规格——kit 的规格由人/agent 写、守卫验，方向不同），thinkrail 可借鉴 kit 的守卫强制。借鉴方向记录：spec 图谱工具化列观察（不照搬：kit 规模不需要 agent 维护规格的工具链）。
2. **pi 生态 npm 化确认（SkillSpector 后第二例）**：thinkrail 把自家工具发成 `pi install npm:@thinkrail/pi-*` 包——pi 的工具分发正在 npm 化（SkillSpector 的 pi install 本地路径 → thinkrail 的 npm 包=分发形态进化）。PI-Desktop 若做工具分发可参考此形态（用户自己项目，仅记录）。
3. **诚实纪律的产品化三连**：SkillSpector（别名透明/凭据脱敏）→ thinkrail（never assembles prompts behind your back/遥测不含 prompt 代码凭据）→ kit（五级证据/判读演进带轮次）——诚实已从纪律升级为可卖卖点（三家都在卖诚实）。
4. "agentic IDE that gets better every time you use it"的学习型定位与 4a 学习循环（每轮向市场学一点改一点留证据）同构——学循环本身是"学习型工作流"的元实例。

## 不抄什么

多语言/themes/更新器的桌面应用工程（kit 无桌面壳）；PostHog 遥测（kit 无遥测）。

## 借鉴→落地

- K2：增量 93=**规格演进同步纪律的跨团队互证入册**（learn-loop 同笔纪律行注记 thinkrail spec-first 同构——纪律获得大厂产品哲学级互证，非新增代码）。
- KPI4：沿第四十四条口径（首检轮无新产物对照面）。
- evals +2：thinkrail-spec-first-same-change-verification / pi-ecosystem-npm-distribution-second-instance。

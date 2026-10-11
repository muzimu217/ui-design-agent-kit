# claude-mem 跨会话记忆机制深检（2026-10-09，第十七轮学习循环，第二 sweep 收官）

- 对象声明（①）：claude-mem（github.com/thedotmack/claude-mem，Apache-2.0，TypeScript；第七轮 GitHub trending 榜面首见 98k★，当时仅榜面观察，本轮深入 README 机制层）
- 检视级别：**unverified-partial**——浏览器实看 GitHub 仓库 README/文件树/提交历史（1 张截图+DOM 文本提取）；未安装、未验证运行时行为
- 证据：本轮真实浏览器访问（Playwright），截图 1 张本地留存（按版权克制纪律**截图不入库**）

## ② 机制笔记

1. **定位**："Persistent Context Across Sessions for Every Agent"——自动捕获 agent 会话中的一切工具使用观察 → AI 压缩成语义摘要 → 注入未来会话。多宿主：Claude Code/OpenClaw/Codex/Gemini/Hermes/Copilot/OpenCode/Cursor（hooks）/Grok Bot（无 hooks 则看聊天日志文件）。
2. **架构五件套**：5 个生命周期钩子（SessionStart/UserPromptSubmit/PostToolUse/Stop/SessionEnd）自动捕获 + Worker 服务（Bun 管理的本地 HTTP API+Web 查看器）+ SQLite（sessions/observations/summaries）+ mem-search 技能 + **Chroma 向量库（语义+关键词混合检索）**。
3. **三层渐进式检索**（token 经济学教科书级设计）：`search`（紧凑索引，~50-100 token/条）→ `timeline`（时间线上下文）→ `get_observations`（全量详情）——**先索引后取详情，号称省 ~10x token**。与 diagram-design 的渐进披露、Figma Make 的 Make kits 同属"上下文预算显式化"家族。
4. **File Read Gate（独有发明）**：一个 hook，**拒绝读取 ≥32KB 的代码文件**——用门禁强制 AI 的上下文纪律（防止大文件灌爆上下文）。这是"门"思想用于 AI 自身资源消费的罕见案例。
5. **隐私设计**：标签排除敏感内容不进记忆库；跨 Supabase 同步（Cloudflare WAF 对接的坑都踩过并记录）。
6. **商业模式**：本地核心 Apache-2.0 开源 + 托管版 CMEM Pro（30 天试用后回落自有 Anthropic plan 或自带 OpenRouter/Gemini key）——"memory provider 可选"的开放架构。
7. **遥测自诚实**：telemetry 提交记录写明采集"retrieval quality, compression"等可靠性信号——检索质量被当一等指标。

## ③ 对照表（学什么/不抄什么/为什么）

| 信号 | 学（借鉴关系） | 不学（原因） |
| --- | --- | --- |
| 三层渐进式检索（索引→时间线→详情） | **立卡候选**：kit 的 references 知识库（26+ 文件）与 evals 台账规模渐大，"先索引后详情"的检索模式可借鉴——但当前规模下收益有限，**立卡暂缓**（知识文件数破 40 或检索痛点实际出现时启动） | 不引入向量库（当前规模纯静态文件足够） |
| File Read Gate（≥32KB 拒读） | "门"思想用于 AI 自身资源消费的启发：我们的门管交付质量，它的门管上下文纪律——研究线 C1 条件设计可引用此模式 | 不在本仓加读文件门禁（宿主已有限制，重复设门徒增摩擦） |
| 5 生命周期钩子自动捕获 | 与 EigenFlux 心跳、我们双线定时的"会话边界自动化"同构——边界自动化是行业共识 | 不做会话自动捕获（kit 定位是项目级工作流，非常驻守护） |
| 隐私标签排除敏感内容 | 印证本仓 ADR-0002（竞品截图本地留存）与两仓分离的隐私纪律 | 不做标签系统（两仓物理分离已是更强隔离） |
| 托管 Pro+本地开源双轨 | 开源核心+托管增值的可持续模式观察 | 不做托管服务（kit 无服务端） |

## ④ 来源

- https://github.com/thedotmack/claude-mem （仓库 README/文件树/提交历史实拍+DOM 文本提取，2026-10-09）
- 对照：docs/competitive-insights/2026-10-08-github-trending/insight.md（第七轮榜面首见记录）

截图（本地留存，不入库）：`readme-2026-10-09.png`。

## ⑤ 本轮 KPI 落点

- **K1 知识卡**：本文件（同步入 iteration-log 第十七轮行）。**第二 sweep 5/5 正式收官**。
- **K2 优化落地**：`docs/learn-loop.md` 对象池进度行更新——**第二 sweep 5/5 收官**（两 sweep 合计 14 项首轮检视）；三层渐进式检索立卡暂缓（理由如上）。
- **K3 证据**：本目录（insight.md 入库，截图 1 张本地留存）。

## 下轮对象预告

第二 sweep 收官后，学习循环进入**自由轮换模式**：对象池存量复检（Figma Make 2026-11 到期）+ 新信号即兴接入（EigenFlux 网络信号可实时供料）。下轮建议：暂无紧急对象，轮次可转投"其余任务"（evals 语料、技能完善），或按新的市场信号即兴立题。

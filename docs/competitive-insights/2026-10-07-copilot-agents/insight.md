# 对标洞察：VS Code Copilot agents（文档改版后）——第五轮学习循环

- 日期：2026-10-08 01:01（18:00 槽位迟到执行，机器休眠所致，如实记录）
- 检视级别：**unverified-partial**（实看官方文档 agents/overview + DOM 探查；未实机操作 agent 会话）
- 证据：`overview.png`（/docs/agents/overview，标题"Build with AI in VS Code"）
- 过程备注：原 agent-mode 文档页已 404——文档树整棵重组为 "agents" 中心（此事实本身即信号）

## 机制观察（DOM 实据）

1. **门概念进了 IDE**："**permissions and approvals** to decide which actions require confirmation"，专设 "**Stay in control**" 章节；但颗粒度是**单动作授权**（工具调用确认），非里程碑级人裁决。
2. **Plan 成为一等工作流**："Plan with an agent and review the proposed approach before implementation"——先方案后实施，可审可驳。
3. **sessions and handoff**：任务级会话与交接成概念文档。
4. 定制栈四件套：**project instructions + Agent Skills + MCP servers + plugins**——与我们 `.agents/skills + MCP 编排` 同构。
5. 多 harness（Copilot/Claude/Codex）+ BYOK + **recommended security baseline**（既有项目接 agent 的安全基线）。

## 对照我们

| VS Code 术语 | 我们的对应 | 差异 |
| --- | --- | --- |
| permissions and approvals（动作级） | 六道门（里程碑级）+ 人类停点 | 他们防"危险动作"，我们防"方向走偏+质量不达标+证据缺失" |
| Plan 工作流 | W3 计划锁定 + 门 A/C | 他们可选，我们强制 |
| project instructions + skills + MCP | `.agents/skills` + `.codex/config.toml` | 同构；互认趋势明显 |
| security baseline（新词） | 散见于各纪律文档 | **可借鉴命名**：把开发线安全/纪律基线汇成一页 |

## 可借鉴（立卡）

- 立卡 A：`docs/agent-security-baseline.md`——借鉴其"基线"框架，把本仓已有的纪律（分支纪律/验证三连/证据等级/授权红线）汇成一页基线文档（门开随批落地）。
- 立卡 B：术语校准——六道门文档对照 "permissions and approvals" 做一次中英命名映射（利于论文与国际化）。

## 不抄

- 动作级授权不替代里程碑门——前者问"这个动作危不危险"，我们问"这个方向/质量/证据过不过关"；后者才是研究变量。

## 反馈

- K1=本卡；K2=立卡 A/B；K3=本目录截图。
- 五轮连读主线补全：v0（迭代透明）→bolt（前置控制）→Lovable（平台化）→Figma（上下文商品化）→**VS Code（门与基线建制化）**——"控制与信任"已成全行业主线，无人做实验级验证=我们的论文空位仍在。
- 下轮对象预告：Motiff 或 B站需求信号（补中国市场视角）。

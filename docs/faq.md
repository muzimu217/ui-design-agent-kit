# FAQ（常见问题）

> 压力测试崩点 3（R135）配套：外部用户最高频疑问的集中回答。随真实反馈追加。

**Q1：支持哪些 AI 宿主？**
Codex 开箱即用（`.codex/config.toml` 随仓库生效）。Claude Code / Cursor 等
宿主不读 `.codex`——运行 `npm run prompt:build` 生成单文件指令，粘进宿主的
系统提示或项目指令即可；MCP 参考 `docs/examples/mcp.json.example` 自行配置。

**Q2：为什么第一次使用不直接写代码？**
kit 的核心价值是"每一步产出都经你确认、都有证据"。首轮会呈交方向稿（布局
关系 + 真实参考来源 + 三个风格旋钮）等你裁决；确认后才进原型与实现。想快
可以直说"先出一版再改"——协议内置微修通道与弃权条款（见
`references/gate-protocol.md`）。

**Q3：许可证是什么？**
仓库当前按内部工具维护；自研指令层的开源许可（MIT/Apache）在整理中。上游
vendored skills 各自带许可，边界见 `tooling/sources.lock.json` 与
`THIRD_PARTY_NOTICES.md`。

**Q4：评测分数是自评还是客观？**
评分 rubric 公开（每条 passCriteria 0-2 分、failConditions 一票否决），执行
记录带 recordedAt+commit 锚点、满分须附 ≥3 条文件路径证据；评测场景语料
`evals/scenarios.json` 公开可复跑。独立 head-to-head 对比在路线图上（对照实
验），尚未做——不宣称。

**Q5：怎么反馈问题？**
GitHub issue（模板见 `.github/ISSUE_TEMPLATE/`）：Bug 用 bug-report，
"它停在哪/没停在哪"的动线观察用 experience-feedback——后者对校准门径最有用。

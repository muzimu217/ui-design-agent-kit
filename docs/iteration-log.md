# 迭代日志（Iteration Log）

> 每轮迭代冲刺 / 巡检追加一条：日期 | 类型 | 做了什么 | 分数或证据 | 下一步。
> 目标与五步循环定义见 [goal.md](goal.md)。最新在上。

| 日期 | 类型 | 做了什么 | 分数 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| 2026-09-06 | 冲刺 2/8 | **首个真实场景分数入账**：按 v6 链真实执行 `operations-not-marketing`——库存运营台（React 19 + TS 源码，复用 showcase 依赖未新增安装；12 条演示数据；搜索/分类/状态筛选、行详情面板、移动端卡片布局），Playwright MCP 真实走查取证（7 张截图 + JS 断言）；内环批评 4 项（1×P1 + 3×P2）：P1 面板键盘可达性（Esc/移焦/还焦）本轮修复并断言复验，3×P2 留痕待裁决（favicon 404 / 行双 onClick 冗余 / 移动端非模态背景可滚动）；门F：Playwright 真实调用留痕，Stitch 复测仍 HTTP 000 维持降级 | **场景分 100/100**（5/5 判据各 2 分、无 failCondition 命中）；`npm run eval` 1/29 已执行、--check 通过；证据 `evals/runs/operations-not-marketing/`（EVIDENCE.md + evidence/）；三连全绿（verify 0 错误、test 16/16、prompt:build 正常）；状态：自动轮·待用户裁决 | 第 3 轮：修 P2 favicon 404；轮转执行下一场景 reference-first-adaptation；门E 内环清单待用户勾选（3 项 P2 处置） |
| 2026-09-06 | 冲刺 1/8 | 迭代节奏改为每小时冲刺（全天共 8 轮，本轮主会话执行，后续每小时 :15 自动触发）；建成 G1 评分台账 `scripts/eval-run.mjs`（`npm run eval`：概览 / `--check` / `--record`；passCriteria 逐条 0-2、failConditions 一票否决、必须附证据、rubric 漂移会在 `--check` 报错），冒烟测试通过（写入/算分 50/校验，冒烟记录已删）；修正场景计数 26→29（e3 三场景入册后文档滞后） | 三连全绿：verify 0 错误、test 16/16（含未提交的 e3 WIP 测试）、prompt:build 正常；`npm run eval` 概览 0/29 已执行 | 第 2 轮（09:15 自动）：按 v6 链真实执行 1 个场景（建议 operations-not-marketing）并 `--record` 首个真实分数；提交时只 add 本轮文件（工作区有并行 WIP） |
| 2026-09-06 | 基线 | 建立目标文档与迭代机制；v6 现状快照：verify 0 错误、test 16/16、场景 29（含 e3 决策类 3 个；均为静态规范，无执行分数）、门F Stitch 不可达维持降级（e923a66） | docs/goal.md 第四节 | 已由冲刺 1/8 接续 |
